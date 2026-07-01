use sha2::{Sha256, Digest};
use crate::errors::{PaymentError, Result};

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
}
