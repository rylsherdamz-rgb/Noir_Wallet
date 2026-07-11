//! Real Stellar ed25519 signing.
//!
//! Previously this module returned a 64-byte zero placeholder instead of a
//! signature, so nothing it produced could ever be accepted by the network.
//! It now wraps `ed25519-dalek` and `stellar-strkey` to produce genuine
//! signatures over the 32-byte transaction signature hash, and to expose the
//! `DecoratedSignature` hint the way Stellar expects.

use crate::errors::{PaymentError, Result};
use ed25519_dalek::{Signer as _, SigningKey};
use stellar_strkey::ed25519 as strkey_ed25519;

/// A Stellar ed25519 keypair capable of producing real signatures.
pub struct TransactionSigner {
    signing_key: SigningKey,
}

impl TransactionSigner {
    /// Build a signer from a Stellar secret seed (`S...`).
    pub fn new(secret_key: String) -> Result<Self> {
        Self::from_secret(&secret_key)
    }

    /// Build a signer from a Stellar secret seed (`S...`).
    pub fn from_secret(secret: &str) -> Result<Self> {
        if secret.is_empty() {
            return Err(PaymentError::ConfigError(
                "Secret key cannot be empty".to_string(),
            ));
        }
        let sk = strkey_ed25519::PrivateKey::from_string(secret).map_err(|e| {
            PaymentError::InvalidPayload(format!("Invalid Stellar secret key: {e}"))
        })?;
        let signing_key = SigningKey::from_bytes(&sk.0);
        Ok(Self { signing_key })
    }

    /// 32-byte ed25519 public key.
    pub fn public_key_bytes(&self) -> [u8; 32] {
        self.signing_key.verifying_key().to_bytes()
    }

    /// Stellar public address (`G...`).
    pub fn public_strkey(&self) -> String {
        strkey_ed25519::PublicKey(self.public_key_bytes())
            .to_string()
            .as_str()
            .to_owned()
    }

    /// The `DecoratedSignature` hint: the last 4 bytes of the public key.
    pub fn signature_hint(&self) -> [u8; 4] {
        let pk = self.public_key_bytes();
        [pk[28], pk[29], pk[30], pk[31]]
    }

    /// Produce a real 64-byte ed25519 signature over `message`
    /// (for Stellar, `message` is the 32-byte SHA-256 signature hash).
    pub fn sign(&self, message: &[u8]) -> [u8; 64] {
        self.signing_key.sign(message).to_bytes()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signature, Verifier, VerifyingKey};

    fn test_secret() -> String {
        // Derive a guaranteed-valid Stellar secret (S...) from a fixed seed.
        // PrivateKey encoding is behind `Unredacted` (secret-redaction safety).
        stellar_strkey::Unredacted(&strkey_ed25519::PrivateKey([7u8; 32]))
            .to_string()
            .as_str()
            .to_owned()
    }

    #[test]
    fn rejects_empty_secret() {
        assert!(TransactionSigner::new(String::new()).is_err());
    }

    #[test]
    fn rejects_non_stellar_secret() {
        assert!(TransactionSigner::new("not-a-key".to_string()).is_err());
    }

    #[test]
    fn derives_public_key_and_signs_verifiably() {
        let signer = TransactionSigner::from_secret(&test_secret()).expect("valid secret");

        // Public address round-trips to a valid G-address.
        let pk = signer.public_strkey();
        assert!(pk.starts_with('G'), "expected G-address, got {pk}");

        // A real signature must verify under the derived public key.
        let msg = b"noir-wallet fee-bump signature test vector";
        let sig_bytes = signer.sign(msg);
        let vk = VerifyingKey::from_bytes(&signer.public_key_bytes()).unwrap();
        let sig = Signature::from_bytes(&sig_bytes);
        assert!(vk.verify(msg, &sig).is_ok(), "signature must verify");

        // Hint is the last 4 bytes of the public key.
        let pk_bytes = signer.public_key_bytes();
        assert_eq!(signer.signature_hint(), [pk_bytes[28], pk_bytes[29], pk_bytes[30], pk_bytes[31]]);
    }
}
