use crate::errors::{PaymentError, Result};
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use base64::{engine::general_purpose::STANDARD, Engine};
use sha2::{Digest, Sha256};

const NONCE_LEN: usize = 12;

/// Hardware-backed key management abstraction. Sensitive at-rest fields
/// (merchant config, wallet entropy seeds) are never encrypted directly
/// with a static application key — instead a fresh 256-bit data-encryption
/// key (DEK) is generated per field and wrapped by whatever sits behind
/// this trait (AWS KMS, GCP Cloud KMS, HashiCorp Vault Transit, an HSM).
/// Only the wrapped DEK is persisted; the plaintext DEK never leaves this
/// module. Swapping providers means implementing this trait — no call
/// site in db.rs or models.rs changes.
pub trait KeyManager: Send + Sync {
    /// Returns (plaintext_dek, wrapped_dek). The wrapped form is what gets
    /// stored alongside the ciphertext it protects.
    fn generate_data_key(&self) -> Result<(Vec<u8>, Vec<u8>)>;

    /// Reverses `generate_data_key`'s wrapping step.
    fn unwrap_data_key(&self, wrapped: &[u8]) -> Result<Vec<u8>>;

    /// Identifies which master key produced a wrapped DEK, so rotation
    /// doesn't invalidate previously encrypted rows (see
    /// `config_key_version` / `seed_key_version` columns).
    fn key_version(&self) -> i32;
}

/// Dev/test stand-in for a real KMS/HSM: wraps DEKs with an in-process
/// master key instead of hardware-backed key material. Never use this in
/// production — implement `KeyManager` against an actual KMS instead.
pub struct LocalKeyManager {
    master_key: [u8; 32],
    version: i32,
}

impl LocalKeyManager {
    pub fn new(master_key_b64: &str, version: i32) -> Result<Self> {
        let bytes = STANDARD.decode(master_key_b64).map_err(|e| {
            PaymentError::EncryptionError(format!("Invalid master key encoding: {}", e))
        })?;
        if bytes.len() != 32 {
            return Err(PaymentError::EncryptionError(
                "Master key must decode to exactly 32 bytes".to_string(),
            ));
        }
        let mut master_key = [0u8; 32];
        master_key.copy_from_slice(&bytes);
        Ok(LocalKeyManager {
            master_key,
            version,
        })
    }

    fn cipher(&self) -> Aes256Gcm {
        Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.master_key))
    }
}

impl KeyManager for LocalKeyManager {
    fn generate_data_key(&self) -> Result<(Vec<u8>, Vec<u8>)> {
        let dek = Aes256Gcm::generate_key(&mut OsRng);
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
        let ciphertext = self.cipher().encrypt(&nonce, dek.as_slice()).map_err(|e| {
            PaymentError::EncryptionError(format!("Failed to wrap data key: {}", e))
        })?;

        let mut wrapped = nonce.to_vec();
        wrapped.extend_from_slice(&ciphertext);

        Ok((dek.to_vec(), wrapped))
    }

    fn unwrap_data_key(&self, wrapped: &[u8]) -> Result<Vec<u8>> {
        if wrapped.len() < NONCE_LEN {
            return Err(PaymentError::EncryptionError(
                "Wrapped key too short".to_string(),
            ));
        }
        let (nonce_bytes, ciphertext) = wrapped.split_at(NONCE_LEN);

        self.cipher()
            .decrypt(Nonce::from_slice(nonce_bytes), ciphertext)
            .map_err(|e| PaymentError::EncryptionError(format!("Failed to unwrap data key: {}", e)))
    }

    fn key_version(&self) -> i32 {
        self.version
    }
}

/// Wire format for an envelope-encrypted at-rest field:
/// `[4-byte wrapped_dek length][wrapped_dek][12-byte nonce][ciphertext]`.
struct EncryptedPayload {
    wrapped_dek: Vec<u8>,
    nonce: Vec<u8>,
    ciphertext: Vec<u8>,
}

impl EncryptedPayload {
    fn to_bytes(&self) -> Vec<u8> {
        let mut out = Vec::with_capacity(
            4 + self.wrapped_dek.len() + self.nonce.len() + self.ciphertext.len(),
        );
        out.extend_from_slice(&(self.wrapped_dek.len() as u32).to_be_bytes());
        out.extend_from_slice(&self.wrapped_dek);
        out.extend_from_slice(&self.nonce);
        out.extend_from_slice(&self.ciphertext);
        out
    }

    fn from_bytes(bytes: &[u8]) -> Result<Self> {
        if bytes.len() < 4 {
            return Err(PaymentError::EncryptionError(
                "Encrypted payload truncated".to_string(),
            ));
        }
        let wrapped_len = u32::from_be_bytes(bytes[0..4].try_into().unwrap()) as usize;
        let rest = &bytes[4..];
        if rest.len() < wrapped_len + NONCE_LEN {
            return Err(PaymentError::EncryptionError(
                "Encrypted payload truncated".to_string(),
            ));
        }

        Ok(EncryptedPayload {
            wrapped_dek: rest[..wrapped_len].to_vec(),
            nonce: rest[wrapped_len..wrapped_len + NONCE_LEN].to_vec(),
            ciphertext: rest[wrapped_len + NONCE_LEN..].to_vec(),
        })
    }
}

/// Envelope-encrypts `plaintext` for storage in an at-rest column
/// (`merchants.config_encrypted`, `app_users.entropy_seed_encrypted`).
/// A fresh DEK is generated per call via `key_manager`; only the wrapped
/// DEK and ciphertext are returned for persistence.
pub fn encrypt_at_rest(key_manager: &dyn KeyManager, plaintext: &[u8]) -> Result<Vec<u8>> {
    let (dek, wrapped_dek) = key_manager.generate_data_key()?;
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&dek));
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher
        .encrypt(&nonce, plaintext)
        .map_err(|e| PaymentError::EncryptionError(format!("Encryption failed: {}", e)))?;

    Ok(EncryptedPayload {
        wrapped_dek,
        nonce: nonce.to_vec(),
        ciphertext,
    }
    .to_bytes())
}

/// Reverses `encrypt_at_rest`. `key_manager` must be able to unwrap the DEK
/// (i.e. correspond to the key version the row was encrypted under).
pub fn decrypt_at_rest(key_manager: &dyn KeyManager, blob: &[u8]) -> Result<Vec<u8>> {
    let payload = EncryptedPayload::from_bytes(blob)?;
    let dek = key_manager.unwrap_data_key(&payload.wrapped_dek)?;
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&dek));

    cipher
        .decrypt(
            Nonce::from_slice(&payload.nonce),
            payload.ciphertext.as_slice(),
        )
        .map_err(|e| PaymentError::EncryptionError(format!("Decryption failed: {}", e)))
}

pub fn hash_device_serial(serial: &str) -> Result<String> {
    if serial.is_empty() {
        return Err(PaymentError::InvalidPayload(
            "Device serial cannot be empty".to_string(),
        ));
    }

    let mut hasher = Sha256::new();
    hasher.update(serial.as_bytes());
    let result = hasher.finalize();

    Ok(hex::encode(result))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_consistency() {
        let serial = "DEVICE_SN_12345";
        let hash1 = hash_device_serial(serial).unwrap();
        let hash2 = hash_device_serial(serial).unwrap();
        assert_eq!(hash1, hash2);
    }

    #[test]
    fn test_hash_length() {
        let serial = "DEVICE_SN_12345";
        let hash = hash_device_serial(serial).unwrap();
        assert_eq!(hash.len(), 64); // SHA256 produces 64 hex characters
    }

    #[test]
    fn test_empty_serial_error() {
        let result = hash_device_serial("");
        assert!(result.is_err());
    }

    #[test]
    fn test_different_serials_different_hashes() {
        let hash1 = hash_device_serial("DEVICE_SN_001").unwrap();
        let hash2 = hash_device_serial("DEVICE_SN_002").unwrap();
        assert_ne!(hash1, hash2);
    }

    fn test_key_manager() -> LocalKeyManager {
        // 32 zero bytes, base64-encoded — fine for tests, never for prod.
        LocalKeyManager::new("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", 1).unwrap()
    }

    #[test]
    fn test_key_manager_rejects_wrong_length_key() {
        let result = LocalKeyManager::new("AAAA", 1);
        assert!(result.is_err());
    }

    #[test]
    fn test_data_key_wrap_unwrap_roundtrip() {
        let km = test_key_manager();
        let (plaintext_dek, wrapped) = km.generate_data_key().unwrap();
        let unwrapped = km.unwrap_data_key(&wrapped).unwrap();
        assert_eq!(plaintext_dek, unwrapped);
    }

    #[test]
    fn test_encrypt_decrypt_at_rest_roundtrip() {
        let km = test_key_manager();
        let plaintext = b"super-secret wallet entropy seed";

        let blob = encrypt_at_rest(&km, plaintext).unwrap();
        assert_ne!(blob, plaintext.to_vec());

        let decrypted = decrypt_at_rest(&km, &blob).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_decrypt_fails_with_wrong_key_manager() {
        let km = test_key_manager();
        let other_km =
            LocalKeyManager::new("//////////////////////////////////////////8=", 1).unwrap();
        let blob = encrypt_at_rest(&km, b"payload").unwrap();

        assert!(decrypt_at_rest(&other_km, &blob).is_err());
    }

    #[test]
    fn test_encrypted_blobs_are_not_deterministic() {
        let km = test_key_manager();
        let plaintext = b"same plaintext twice";

        let blob1 = encrypt_at_rest(&km, plaintext).unwrap();
        let blob2 = encrypt_at_rest(&km, plaintext).unwrap();

        // Fresh DEK + nonce per call, so ciphertexts must differ even for
        // identical plaintext (semantic security).
        assert_ne!(blob1, blob2);
        assert_eq!(decrypt_at_rest(&km, &blob1).unwrap(), plaintext);
        assert_eq!(decrypt_at_rest(&km, &blob2).unwrap(), plaintext);
    }
}
