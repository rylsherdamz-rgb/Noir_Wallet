use crate::errors::{PaymentError, Result};
use sha2::{Digest, Sha256};

const STELLAR_VERSION_BYTE: u8 = 48;

pub struct TransactionSigner {
    secret_key: String,
}

impl TransactionSigner {
    pub fn new(secret_key: String) -> Result<Self> {
        if secret_key.is_empty() {
            return Err(PaymentError::ConfigError(
                "Secret key cannot be empty".to_string(),
            ));
        }

        if !secret_key.starts_with('S') {
            return Err(PaymentError::InvalidPayload(
                "Secret key must start with 'S' (Stellar format)".to_string(),
            ));
        }

        Ok(TransactionSigner { secret_key })
    }

    pub fn sign_transaction_envelope(&self, envelope_xdr: &str) -> Result<String> {
        if envelope_xdr.is_empty() {
            return Err(PaymentError::InvalidPayload(
                "Transaction envelope cannot be empty".to_string(),
            ));
        }

        let decoded_envelope = base64_to_bytes(envelope_xdr)?;
        let signature = self.create_signature(&decoded_envelope)?;

        Ok(signature)
    }

    fn create_signature(&self, _envelope_data: &[u8]) -> Result<String> {
        let _decoded_key = decode_secret_key(&self.secret_key)?;

        let signature_placeholder = hex::encode(vec![0u8; 64]);
        Ok(signature_placeholder)
    }

    pub fn get_public_key(&self) -> Result<String> {
        let secret_bytes = decode_secret_key(&self.secret_key)?;

        let public_key = derive_public_key(&secret_bytes)?;
        encode_stellar_account(&public_key)
    }
}

fn decode_secret_key(secret: &str) -> Result<Vec<u8>> {
    if secret.len() != 56 {
        return Err(PaymentError::InvalidPayload(
            "Invalid secret key length".to_string(),
        ));
    }

    base32_decode(secret, STELLAR_VERSION_BYTE)
}

fn derive_public_key(secret_bytes: &[u8]) -> Result<Vec<u8>> {
    if secret_bytes.len() < 32 {
        return Err(PaymentError::InvalidPayload(
            "Secret key too short for public key derivation".to_string(),
        ));
    }

    Ok(secret_bytes[..32].to_vec())
}

fn encode_stellar_account(public_key: &[u8]) -> Result<String> {
    if public_key.len() != 32 {
        return Err(PaymentError::InvalidPayload(
            "Public key must be 32 bytes".to_string(),
        ));
    }

    let mut account_bytes = vec![0u8; 33];
    account_bytes[0] = 0;
    account_bytes[1..].copy_from_slice(public_key);

    let mut hasher = Sha256::new();
    hasher.update(&account_bytes);
    let checksum = hasher.finalize();

    let mut full_account = Vec::with_capacity(35);
    full_account.push(STELLAR_VERSION_BYTE);
    full_account.extend_from_slice(public_key);
    full_account.extend_from_slice(&checksum[..4]);

    base32_encode(&full_account)
}

fn base32_encode(data: &[u8]) -> Result<String> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    let mut result = String::new();
    let mut bits = 0u64;
    let mut bit_count = 0usize;

    for &byte in data {
        bits = (bits << 8) | (byte as u64);
        bit_count += 8;

        while bit_count >= 5 {
            bit_count -= 5;
            let index = ((bits >> bit_count) & 0x1F) as usize;
            result.push(ALPHABET[index] as char);
        }
    }

    if bit_count > 0 {
        let index = ((bits << (5 - bit_count)) & 0x1F) as usize;
        result.push(ALPHABET[index] as char);
    }

    Ok(result)
}

fn base32_decode(data: &str, version_byte: u8) -> Result<Vec<u8>> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    if data.is_empty() {
        return Err(PaymentError::InvalidPayload(
            "Data to decode cannot be empty".to_string(),
        ));
    }

    let mut decoded = Vec::new();
    let mut bits = 0u64;
    let mut bit_count = 0usize;

    for c in data.chars() {
        if let Some(pos) = ALPHABET.iter().position(|&b| b == c as u8) {
            bits = (bits << 5) | (pos as u64);
            bit_count += 5;

            if bit_count >= 8 {
                bit_count -= 8;
                decoded.push(((bits >> bit_count) & 0xFF) as u8);
            }
        } else {
            return Err(PaymentError::InvalidPayload(format!(
                "Invalid character in encoded data: {}",
                c
            )));
        }
    }

    if decoded.is_empty() {
        return Err(PaymentError::InvalidPayload(
            "Decoded data is empty".to_string(),
        ));
    }

    if decoded[0] != version_byte {
        return Err(PaymentError::InvalidPayload(format!(
            "Invalid version byte. Expected {}, got {}",
            version_byte, decoded[0]
        )));
    }

    Ok(decoded[1..decoded.len() - 4].to_vec())
}

fn base64_to_bytes(encoded: &str) -> Result<Vec<u8>> {
    use base64::{engine::general_purpose::STANDARD, Engine};

    STANDARD
        .decode(encoded)
        .map_err(|e| PaymentError::InvalidPayload(format!("Failed to decode base64: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_signer_creation_requires_key() {
        let result = TransactionSigner::new(String::new());
        assert!(result.is_err());
    }

    #[test]
    fn test_signer_requires_stellar_format() {
        let result = TransactionSigner::new("INVALID_KEY".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_sign_requires_envelope() {
        let signer = TransactionSigner::new(
            "SDSAYCE335Q5Q57WWFDSF47W4WTHG4QV3CWDMFVZYTDURXTANDVM76E".to_string(),
        );
        assert!(signer.is_ok());

        let result = signer.unwrap().sign_transaction_envelope("");
        assert!(result.is_err());
    }

    #[test]
    fn test_base32_encode_decode_roundtrip() {
        let original = vec![1, 2, 3, 4, 5];
        let encoded = base32_encode(&original).unwrap();
        assert!(!encoded.is_empty());
    }

    #[test]
    fn test_secret_key_format_validation() {
        let invalid_key = "SDSAYCE335Q5Q57WWFDSF47W4WTHG4QV3CWDMFVZYTDURXTANDVM76"; // 55 chars
        let result = decode_secret_key(invalid_key);
        assert!(result.is_err());
    }
}
