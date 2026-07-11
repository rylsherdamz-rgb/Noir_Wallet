//! Real Stellar transaction construction using `stellar-xdr`.
//!
//! Replaces the previous hand-rolled XDR (wrong network id, malformed
//! envelopes, zero signatures) with the maintained `stellar-xdr` types.
//!
//! Two builders:
//!   * `build_fee_bump` — the non-custodial core: wraps a client-signed inner
//!     transaction in a fee-bump whose fee source is a channel account, signed
//!     by the channel. The user's wallet remains the payment source; the
//!     backend never holds user secrets.
//!   * `build_signed_payment` — a genuine server-side payment (used for
//!     channel top-ups from a funded source), signed with real ed25519.

use crate::errors::{PaymentError, Result};
use crate::transaction_signer::TransactionSigner;
use sha2::{Digest, Sha256};
use stellar_strkey::ed25519 as strkey_ed25519;
use stellar_xdr::{
    Asset, DecoratedSignature, FeeBumpTransaction, FeeBumpTransactionEnvelope,
    FeeBumpTransactionExt, FeeBumpTransactionInnerTx, Limits, Memo, MuxedAccount, Operation,
    OperationBody, PaymentOp, Preconditions, ReadXdr, SequenceNumber, Signature, SignatureHint,
    StringM, Transaction, TransactionEnvelope, TransactionExt, TransactionV1Envelope, Uint256,
    VecM, WriteXdr,
};

/// Minimum base fee per operation, in stroops.
const BASE_FEE_STROOPS: i64 = 200;

pub struct TransactionBuilder {
    network_id: [u8; 32],
}

impl TransactionBuilder {
    pub fn new(network: String) -> Self {
        Self::for_network(&network)
    }

    pub fn for_network(network: &str) -> Self {
        let passphrase = match network {
            "public" | "pubnet" | "mainnet" => "Public Global Stellar Network ; September 2015",
            _ => "Test SDF Network ; September 2015",
        };
        let network_id: [u8; 32] = Sha256::digest(passphrase.as_bytes()).into();
        Self { network_id }
    }

    /// SHA-256 network id (exposed for tests / diagnostics).
    pub fn network_id(&self) -> [u8; 32] {
        self.network_id
    }

    /// Wrap a client-signed inner transaction (base64 XDR) in a fee-bump whose
    /// fee source is the channel account, signed by the channel. Returns
    /// base64 XDR ready for Horizon submission.
    pub fn build_fee_bump(
        &self,
        signed_inner_xdr: &str,
        channel_signer: &TransactionSigner,
    ) -> Result<String> {
        let inner = TransactionEnvelope::from_xdr_base64(signed_inner_xdr, Limits::none())
            .map_err(|e| PaymentError::InvalidPayload(format!("Invalid inner tx XDR: {e}")))?;

        let inner_v1: TransactionV1Envelope = match inner {
            TransactionEnvelope::Tx(v1) => v1,
            _ => {
                return Err(PaymentError::InvalidPayload(
                    "Inner transaction must be a v1 (ENVELOPE_TYPE_TX) envelope".to_string(),
                ))
            }
        };

        // Non-custodial invariant: the inner tx must already be user-signed.
        if inner_v1.signatures.is_empty() {
            return Err(PaymentError::InvalidPayload(
                "Inner transaction carries no user signature".to_string(),
            ));
        }

        let num_ops = inner_v1.tx.operations.len() as i64;
        let inner_fee = i64::from(inner_v1.tx.fee);
        // Fee-bump fee must cover (inner ops + 1) * base fee and exceed inner fee.
        let fee = ((num_ops + 1) * BASE_FEE_STROOPS).max(inner_fee + BASE_FEE_STROOPS);

        let fee_bump = FeeBumpTransaction {
            fee_source: muxed_from_g(&channel_signer.public_strkey())?,
            fee,
            inner_tx: FeeBumpTransactionInnerTx::Tx(inner_v1),
            ext: FeeBumpTransactionExt::V0,
        };

        let hash = fee_bump
            .hash(self.network_id)
            .map_err(|e| PaymentError::SubmissionFailed(format!("fee-bump hash error: {e}")))?;

        let decorated = decorated_signature(channel_signer, &hash)?;
        let signatures: VecM<DecoratedSignature, 20> = vec![decorated]
            .try_into()
            .map_err(|_| PaymentError::SubmissionFailed("signature vec overflow".into()))?;

        let envelope = TransactionEnvelope::TxFeeBump(FeeBumpTransactionEnvelope {
            tx: fee_bump,
            signatures,
        });

        envelope
            .to_xdr_base64(Limits::none())
            .map_err(|e| PaymentError::SubmissionFailed(format!("xdr encode error: {e}")))
    }

    /// Build and sign a native-XLM payment from `source_signer` to
    /// `destination`. `sequence` must be the source account's next sequence
    /// number (current + 1). Returns base64 XDR.
    pub fn build_signed_payment(
        &self,
        source_signer: &TransactionSigner,
        destination: &str,
        amount_stroops: i64,
        sequence: i64,
        memo: Option<String>,
    ) -> Result<String> {
        if amount_stroops <= 0 {
            return Err(PaymentError::InvalidPayload(
                "Amount must be positive".to_string(),
            ));
        }

        let memo = match memo {
            Some(t) if !t.is_empty() => {
                let m: StringM<28> = t.into_bytes().try_into().map_err(|_| {
                    PaymentError::InvalidPayload("memo too long (max 28 bytes)".to_string())
                })?;
                Memo::Text(m)
            }
            _ => Memo::None,
        };

        let op = Operation {
            source_account: None,
            body: OperationBody::Payment(PaymentOp {
                destination: muxed_from_g(destination)?,
                asset: Asset::Native,
                amount: amount_stroops,
            }),
        };
        let operations: VecM<Operation, 100> = vec![op]
            .try_into()
            .map_err(|_| PaymentError::InvalidPayload("too many operations".into()))?;

        let tx = Transaction {
            source_account: muxed_from_g(&source_signer.public_strkey())?,
            fee: BASE_FEE_STROOPS as u32,
            seq_num: SequenceNumber(sequence),
            cond: Preconditions::None,
            memo,
            operations,
            ext: TransactionExt::V0,
        };

        let hash = tx
            .hash(self.network_id)
            .map_err(|e| PaymentError::SubmissionFailed(format!("tx hash error: {e}")))?;

        let decorated = decorated_signature(source_signer, &hash)?;
        let signatures: VecM<DecoratedSignature, 20> = vec![decorated]
            .try_into()
            .map_err(|_| PaymentError::SubmissionFailed("signature vec overflow".into()))?;

        let envelope = TransactionEnvelope::Tx(TransactionV1Envelope { tx, signatures });

        envelope
            .to_xdr_base64(Limits::none())
            .map_err(|e| PaymentError::SubmissionFailed(format!("xdr encode error: {e}")))
    }
}

fn muxed_from_g(g_addr: &str) -> Result<MuxedAccount> {
    let pk = strkey_ed25519::PublicKey::from_string(g_addr)
        .map_err(|e| PaymentError::InvalidPayload(format!("Invalid account {g_addr}: {e}")))?;
    Ok(MuxedAccount::Ed25519(Uint256(pk.0)))
}

fn decorated_signature(signer: &TransactionSigner, hash: &[u8; 32]) -> Result<DecoratedSignature> {
    let sig = signer.sign(hash);
    Ok(DecoratedSignature {
        hint: SignatureHint(signer.signature_hint()),
        signature: Signature(
            sig.to_vec()
                .try_into()
                .map_err(|_| PaymentError::SubmissionFailed("bad signature length".into()))?,
        ),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn signer_from_seed(seed: [u8; 32]) -> TransactionSigner {
        let secret = stellar_strkey::Unredacted(&strkey_ed25519::PrivateKey(seed))
            .to_string()
            .as_str()
            .to_owned();
        TransactionSigner::from_secret(&secret).unwrap()
    }

    #[test]
    fn signed_payment_roundtrips_and_is_signed() {
        let builder = TransactionBuilder::for_network("testnet");
        let source = signer_from_seed([3u8; 32]);
        let dest = signer_from_seed([9u8; 32]).public_strkey();

        let xdr = builder
            .build_signed_payment(&source, &dest, 1_000_000, 42, Some("hi".into()))
            .expect("payment builds");

        let env = TransactionEnvelope::from_xdr_base64(&xdr, Limits::none()).unwrap();
        match env {
            TransactionEnvelope::Tx(v1) => {
                assert_eq!(v1.signatures.len(), 1);
                assert_eq!(v1.tx.seq_num, SequenceNumber(42));
            }
            _ => panic!("expected v1 tx envelope"),
        }
    }

    #[test]
    fn fee_bump_wraps_user_signed_inner() {
        let builder = TransactionBuilder::for_network("testnet");
        let user = signer_from_seed([1u8; 32]);
        let dest = signer_from_seed([2u8; 32]).public_strkey();
        let channel = signer_from_seed([5u8; 32]);

        let inner_xdr = builder
            .build_signed_payment(&user, &dest, 500_000, 7, None)
            .unwrap();

        let fb_xdr = builder.build_fee_bump(&inner_xdr, &channel).unwrap();

        let env = TransactionEnvelope::from_xdr_base64(&fb_xdr, Limits::none()).unwrap();
        match env {
            TransactionEnvelope::TxFeeBump(fb) => {
                assert_eq!(fb.signatures.len(), 1);
                match fb.tx.fee_source {
                    MuxedAccount::Ed25519(Uint256(bytes)) => {
                        assert_eq!(bytes, channel.public_key_bytes());
                    }
                    _ => panic!("unexpected fee source type"),
                }
                let hash = fb.tx.hash(builder.network_id()).unwrap();
                use ed25519_dalek::{Signature as Ed, Verifier, VerifyingKey};
                let vk = VerifyingKey::from_bytes(&channel.public_key_bytes()).unwrap();
                let sig_bytes: [u8; 64] =
                    fb.signatures[0].signature.0.to_vec().try_into().unwrap();
                assert!(vk.verify(&hash, &Ed::from_bytes(&sig_bytes)).is_ok());
            }
            _ => panic!("expected fee-bump envelope"),
        }
    }

    #[test]
    fn rejects_unsigned_inner() {
        let builder = TransactionBuilder::for_network("testnet");
        let channel = signer_from_seed([5u8; 32]);
        let user = signer_from_seed([1u8; 32]);
        let dest = signer_from_seed([2u8; 32]).public_strkey();
        let signed = builder
            .build_signed_payment(&user, &dest, 500_000, 7, None)
            .unwrap();
        let env = TransactionEnvelope::from_xdr_base64(&signed, Limits::none()).unwrap();
        if let TransactionEnvelope::Tx(mut v1) = env {
            v1.signatures = vec![].try_into().unwrap();
            let unsigned = TransactionEnvelope::Tx(v1)
                .to_xdr_base64(Limits::none())
                .unwrap();
            assert!(builder.build_fee_bump(&unsigned, &channel).is_err());
        } else {
            panic!("expected v1");
        }
    }
}
