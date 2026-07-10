use crate::errors::{PaymentError, Result};
use base64::{engine::general_purpose::STANDARD, Engine};

#[allow(dead_code)]
const TESTNET_NETWORK_ID: &[u8; 32] = b"Test SDF Network ; June 2015\x00\x00\x00\x00";
#[allow(dead_code)]
const PUBNET_NETWORK_ID: &[u8; 32] = b"Public Global Stellar Network\x00\x00\x00";
const BASE_FEE_STROOPS: u32 = 200;

pub struct TransactionBuilder {
    #[allow(dead_code)]
    network: String,
}

impl TransactionBuilder {
    pub fn new(network: String) -> Self {
        TransactionBuilder { network }
    }

    #[allow(dead_code)]
    fn get_network_id(&self) -> &'static [u8; 32] {
        if self.network == "testnet" {
            TESTNET_NETWORK_ID
        } else {
            PUBNET_NETWORK_ID
        }
    }

    pub fn build_payment_envelope(
        &self,
        source: &str,
        destination: &str,
        amount_stroops: i64,
        sequence: u64,
        _memo: Option<String>,
        _signing_key: &str,
    ) -> Result<String> {
        if amount_stroops <= 0 {
            return Err(PaymentError::InvalidPayload(
                "Amount must be positive".to_string(),
            ));
        }

        if source == destination {
            return Err(PaymentError::InvalidPayload(
                "Source and destination cannot be the same".to_string(),
            ));
        }

        if sequence == 0 {
            return Err(PaymentError::InvalidPayload(
                "Sequence number must be greater than 0".to_string(),
            ));
        }

        self.create_envelope_xdr(source, destination, amount_stroops, sequence)
    }

    fn create_envelope_xdr(
        &self,
        source: &str,
        destination: &str,
        amount_stroops: i64,
        sequence: u64,
    ) -> Result<String> {
        let mut xdr_bytes = Vec::new();

        xdr_bytes.extend_from_slice(&[0, 0, 0, 2]);

        self.write_transaction_envelope(
            &mut xdr_bytes,
            source,
            destination,
            amount_stroops,
            sequence,
        )?;

        let encoded = STANDARD.encode(&xdr_bytes);
        Ok(encoded)
    }

    fn write_transaction_envelope(
        &self,
        buf: &mut Vec<u8>,
        source: &str,
        destination: &str,
        amount_stroops: i64,
        sequence: u64,
    ) -> Result<()> {
        self.write_account_id(buf, source)?;
        self.write_uint32(buf, BASE_FEE_STROOPS);
        self.write_uint64(buf, sequence);

        self.write_uint32(buf, 0);
        self.write_string(buf, "")?;

        self.write_uint32(buf, 1);
        self.write_payment_operation(buf, destination, amount_stroops)?;

        self.write_uint32(buf, 0);

        Ok(())
    }

    fn write_payment_operation(
        &self,
        buf: &mut Vec<u8>,
        destination: &str,
        amount: i64,
    ) -> Result<()> {
        self.write_account_id(buf, "")?;
        self.write_uint32(buf, 1);
        self.write_account_id(buf, destination)?;
        self.write_int64(buf, amount);
        Ok(())
    }

    fn write_account_id(&self, buf: &mut Vec<u8>, account: &str) -> Result<()> {
        self.write_uint32(buf, 0);

        let decoded = if account.is_empty() {
            vec![0u8; 32]
        } else {
            decode_stellar_account(account)?
        };

        buf.extend_from_slice(&decoded);
        Ok(())
    }

    fn write_uint32(&self, buf: &mut Vec<u8>, value: u32) {
        buf.extend_from_slice(&value.to_be_bytes());
    }

    fn write_uint64(&self, buf: &mut Vec<u8>, value: u64) {
        buf.extend_from_slice(&value.to_be_bytes());
    }

    fn write_int64(&self, buf: &mut Vec<u8>, value: i64) {
        buf.extend_from_slice(&value.to_be_bytes());
    }

    fn write_string(&self, buf: &mut Vec<u8>, s: &str) -> Result<()> {
        let bytes = s.as_bytes();
        self.write_uint32(buf, bytes.len() as u32);
        buf.extend_from_slice(bytes);

        let padding = (4 - (bytes.len() % 4)) % 4;
        for _ in 0..padding {
            buf.push(0);
        }

        Ok(())
    }
}

fn decode_stellar_account(account: &str) -> Result<Vec<u8>> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    if !account.starts_with('G') || account.len() < 55 || account.len() > 56 {
        return Err(PaymentError::InvalidPayload(format!(
            "Invalid Stellar account ID format: {} (len={})",
            account,
            account.len()
        )));
    }

    let mut decoded = [0u8; 35];
    let mut bit_pos = 0usize;

    for c in account.chars() {
        if let Some(pos) = ALPHABET.iter().position(|&b| b == c as u8) {
            let val = pos as u8;

            for i in 0..5 {
                let bit = (val >> (4 - i)) & 1;
                let byte_idx = bit_pos / 8;
                let bit_idx = 7 - (bit_pos % 8);

                if byte_idx < decoded.len() {
                    decoded[byte_idx] |= bit << bit_idx;
                }

                bit_pos += 1;
            }
        } else {
            return Err(PaymentError::InvalidPayload(format!(
                "Invalid character in account ID: {}",
                c
            )));
        }
    }

    Ok(decoded[0..32].to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zero_amount_fails() {
        let builder = TransactionBuilder::new("testnet".to_string());
        let result = builder.build_payment_envelope(
            "GBRPYHIL2CI3WHPSKKRPQ5TSG64IJLC3B7VCLIY63XMJD5FYXHAIBOP",
            "GBQKFPHDMZNXWVXQFBFWWWQSDK3HYEHUVA7YHXC7QKCYJF5MZBWPPQTA",
            0,
            1,
            None,
            "SDSAYCE335Q5Q57WWFDSF47W4WTHG4QV3CWDMFVZYTDURXTANDVM76E",
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_same_source_destination_fails() {
        let builder = TransactionBuilder::new("testnet".to_string());
        let result = builder.build_payment_envelope(
            "GBRPYHIL2CI3WHPSKKRPQ5TSG64IJLC3B7VCLIY63XMJD5FYXHAIBOP",
            "GBRPYHIL2CI3WHPSKKRPQ5TSG64IJLC3B7VCLIY63XMJD5FYXHAIBOP",
            1000,
            1,
            None,
            "SDSAYCE335Q5Q57WWFDSF47W4WTHG4QV3CWDMFVZYTDURXTANDVM76E",
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_zero_sequence_fails() {
        let builder = TransactionBuilder::new("testnet".to_string());
        let result = builder.build_payment_envelope(
            "GBRPYHIL2CI3WHPSKKRPQ5TSG64IJLC3B7VCLIY63XMJD5FYXHAIBOP",
            "GBQKFPHDMZNXWVXQFBFWWWQSDK3HYEHUVA7YHXC7QKCYJF5MZBWPPQTA",
            1000,
            0,
            None,
            "SDSAYCE335Q5Q57WWFDSF47W4WTHG4QV3CWDMFVZYTDURXTANDVM76E",
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_valid_envelope_creation() {
        let builder = TransactionBuilder::new("testnet".to_string());
        let result = builder.build_payment_envelope(
            "GBRPYHIL2CI3WHPSKKRPQ5TSG64IJLC3B7VCLIY63XMJD5FYXHAIBOP",
            "GBQKFPHDMZNXWVXQFBFWWWQSDK3HYEHUVA7YHXC7QKCYJF5MZBWPPQTA",
            1000000,
            5,
            None,
            "SDSAYCE335Q5Q57WWFDSF47W4WTHG4QV3CWDMFVZYTDURXTANDVM76E",
        );
        assert!(result.is_ok());

        let xdr = result.unwrap();
        assert!(!xdr.is_empty());
    }
}
