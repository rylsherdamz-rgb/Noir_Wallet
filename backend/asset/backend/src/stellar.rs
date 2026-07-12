use crate::errors::{PaymentError, Result};
use crate::transaction_builder::TransactionBuilder;
use crate::transaction_signer::TransactionSigner;
use reqwest::Client;
use serde_json::{json, Value};
use std::sync::Arc;

/// Soroban RPC client for account lookups + transaction submission.
///
/// Uses JSON-RPC 2.0 against the Soroban RPC endpoint. Classic payments
/// and fee-bumps are submitted via `sendTransaction` — Soroban RPC accepts
/// all Stellar transaction types.
#[derive(Clone)]
#[allow(dead_code)]
pub struct StellarClient {
    http_client: Arc<Client>,
    rpc_url: String,
    network: String,
    pub master_account: String,
    pub master_key: String,
}

impl StellarClient {
    pub fn new(rpc_url: String, network: String) -> Self {
        StellarClient {
            http_client: Arc::new(Client::new()),
            rpc_url,
            network,
            master_account: String::new(),
            master_key: String::new(),
        }
    }

    pub fn with_master_account(mut self, account: String, key: String) -> Self {
        self.master_account = account;
        self.master_key = key;
        self
    }

    async fn rpc_call(&self, method: &str, params: Value) -> Result<Value> {
        let body = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params,
        });

        let resp = self
            .http_client
            .post(&self.rpc_url)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                PaymentError::StellarRpcError(format!("RPC request failed ({method}): {e}"))
            })?;

        let json: Value = resp.json().await.map_err(|e| {
            PaymentError::StellarRpcError(format!("RPC response parse failed ({method}): {e}"))
        })?;

        if let Some(err) = json.get("error") {
            return Err(PaymentError::StellarRpcError(format!(
                "RPC error ({method}): {}",
                err.get("message").and_then(|m| m.as_str()).unwrap_or("unknown")
            )));
        }

        json.get("result")
            .cloned()
            .ok_or_else(|| PaymentError::StellarRpcError(format!("RPC returned no result ({method})")))
    }

    /// Fund an account on testnet via Friendbot. No-op error on mainnet.
    pub async fn fund_testnet(&self, address: &str) -> Result<()> {
        if !matches!(self.network.as_str(), "testnet" | "") {
            return Err(PaymentError::ConfigError(
                "Friendbot funding is only available on testnet".to_string(),
            ));
        }
        let url = format!("https://friendbot-testnet.stellar.org/?addr={address}");
        let resp = self
            .http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| PaymentError::StellarRpcError(format!("Friendbot request failed: {e}")))?;
        if !resp.status().is_success() {
            let body = resp.text().await.unwrap_or_default();
            if body.contains("already") || body.contains("exist") {
                return Ok(());
            }
            return Err(PaymentError::StellarRpcError(format!(
                "Friendbot funding failed: {body}"
            )));
        }
        Ok(())
    }

    /// Current sequence number of an account (from RPC).
    pub async fn get_account_sequence(&self, address: &str) -> Result<u64> {
        let result = self.rpc_call("getAccount", json!({ "publicKey": address })).await?;
        let seq_str = result
            .get("sequence")
            .and_then(|s| s.as_str())
            .ok_or_else(|| PaymentError::StellarRpcError("No sequence in RPC response".to_string()))?;
        seq_str.parse::<u64>().map_err(|_| {
            PaymentError::StellarRpcError("Invalid sequence number format".to_string())
        })
    }

    /// Get native XLM balance in stroops from RPC.
    pub async fn get_account_balance(&self, address: &str) -> Result<i64> {
        let result = self.rpc_call("getAccount", json!({ "publicKey": address })).await?;
        let balance_str = result
            .get("balance")
            .and_then(|b| b.as_str())
            .ok_or_else(|| PaymentError::StellarRpcError("No balance in RPC response".to_string()))?;
        balance_str.parse::<i64>().map_err(|e| {
            PaymentError::StellarRpcError(format!("Invalid balance format: {e}"))
        })
    }

    /// Submit a base64 transaction envelope to the Soroban RPC. Returns the tx hash.
    pub async fn submit_transaction(&self, envelope_xdr: &str) -> Result<String> {
        let result = self
            .rpc_call("sendTransaction", json!({ "transaction": envelope_xdr }))
            .await?;

        let status = result
            .get("status")
            .and_then(|s| s.as_str())
            .unwrap_or("ERROR");

        if status == "ERROR" {
            let err_msg = result
                .get("errorResult")
                .and_then(|e| e.get("resultString"))
                .and_then(|s| s.as_str())
                .unwrap_or("Transaction rejected");
            return Err(PaymentError::SubmissionFailed(err_msg.to_string()));
        }

        result
            .get("hash")
            .and_then(|h| h.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| PaymentError::SubmissionFailed("No transaction hash in RPC response".to_string()))
    }

    pub async fn get_transaction_status(&self, tx_hash: &str) -> Result<String> {
        let result = self
            .rpc_call("getTransaction", json!({ "hash": tx_hash }))
            .await?;

        match result
            .get("status")
            .and_then(|s| s.as_str())
            .unwrap_or("NOT_FOUND")
        {
            "SUCCESS" => Ok("confirmed".to_string()),
            "FAILED" => Ok("failed".to_string()),
            _ => Ok("pending".to_string()),
        }
    }

    /// Top up a channel from the configured master account with a real signed
    /// payment. Requires `master_account`/`master_key` to be set.
    pub async fn transfer_to_channel(&self, channel_address: &str, amount: i64) -> Result<String> {
        if self.master_account.is_empty() || self.master_key.is_empty() {
            return Err(PaymentError::ConfigError(
                "Master account not configured for channel top-up".to_string(),
            ));
        }

        let signer = TransactionSigner::from_secret(&self.master_key)?;
        let next_seq = self.get_account_sequence(&self.master_account).await? + 1;

        let builder = TransactionBuilder::for_network(&self.network);
        let envelope_xdr = builder.build_signed_payment(
            &signer,
            channel_address,
            amount,
            next_seq as i64,
            Some("channel-topup".to_string()),
        )?;

        self.submit_transaction(&envelope_xdr).await
    }
}
