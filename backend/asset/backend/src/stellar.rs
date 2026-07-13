use crate::errors::{PaymentError, Result};
use crate::transaction_builder::TransactionBuilder;
use crate::transaction_signer::TransactionSigner;
use reqwest::Client;
use serde_json::{json, Value};
use std::sync::Arc;

/// Stellar client using Horizon REST for account lookups (reliable for all
/// account types) and Soroban RPC for transaction submission.
///
/// Horizon and Soroban RPC ingest the ledger independently — Horizon indexes
/// accounts seconds before RPC does. For `get_account_sequence` and
/// `get_account_balance` we use Horizon REST directly to avoid "account not
/// found" errors on classic accounts that the RPC hasn't picked up yet.
///
/// Transaction submission goes through Soroban RPC's `sendTransaction`, which
/// accepts all Stellar transaction types including classic payments and fee-bumps.
#[derive(Clone)]
#[allow(dead_code)]
pub struct StellarClient {
    http_client: Arc<Client>,
    horizon_url: String,
    rpc_url: String,
    network: String,
    pub master_account: String,
    pub master_key: String,
}

impl StellarClient {
    pub fn new(horizon_url: String, rpc_url: String, network: String) -> Self {
        StellarClient {
            http_client: Arc::new(Client::new()),
            horizon_url,
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

    /// Fetch a raw Horizon account response. Returns `None` on 404, errors on
    /// other HTTP failures.
    async fn horizon_get_account(&self, address: &str) -> Result<Option<Value>> {
        let url = format!("{}/accounts/{}", self.horizon_url.trim_end_matches('/'), address);
        let resp = self.http_client.get(&url).send().await.map_err(|e| {
            PaymentError::StellarRpcError(format!("Horizon request failed: {e}"))
        })?;
        match resp.status() {
            reqwest::StatusCode::OK => {
                let json: Value = resp.json().await.map_err(|e| {
                    PaymentError::StellarRpcError(format!("Horizon parse failed: {e}"))
                })?;
                Ok(Some(json))
            }
            reqwest::StatusCode::NOT_FOUND => Ok(None),
            status => {
                let body = resp.text().await.unwrap_or_default();
                Err(PaymentError::StellarRpcError(format!(
                    "Horizon error ({}): {body}",
                    status.as_u16()
                )))
            }
        }
    }

    /// Current sequence number of an account from Horizon REST.
    /// Uses Horizon because Soroban RPC does not reliably index classic accounts.
    pub async fn get_account_sequence(&self, address: &str) -> Result<u64> {
        let account = self.horizon_get_account(address).await?
            .ok_or_else(|| PaymentError::StellarRpcError(format!(
                "Account {address} not found on Horizon"
            )))?;
        let seq_str = account
            .get("sequence")
            .and_then(|s| s.as_str())
            .ok_or_else(|| PaymentError::StellarRpcError("No sequence in Horizon response".to_string()))?;
        seq_str.parse::<u64>().map_err(|_| {
            PaymentError::StellarRpcError("Invalid sequence number format".to_string())
        })
    }

    /// Get native XLM balance in stroops from Horizon REST.
    /// Uses Horizon for the same reason as `get_account_sequence`.
    pub async fn get_account_balance(&self, address: &str) -> Result<i64> {
        let account = self.horizon_get_account(address).await?
            .ok_or_else(|| PaymentError::StellarRpcError(format!(
                "Account {address} not found on Horizon"
            )))?;
        let balances = account
            .get("balances")
            .and_then(|b| b.as_array())
            .ok_or_else(|| PaymentError::StellarRpcError("No balances in Horizon response".to_string()))?;
        let native = balances
            .iter()
            .find(|b| b.get("asset_type").and_then(|t| t.as_str()) == Some("native"))
            .ok_or_else(|| PaymentError::StellarRpcError("No native balance".to_string()))?;
        let balance_str = native
            .get("balance")
            .and_then(|b| b.as_str())
            .ok_or_else(|| PaymentError::StellarRpcError("No balance field".to_string()))?;
        // Horizon returns XLM as a decimal string; convert to stroops.
        let xlm: f64 = balance_str.parse().map_err(|e| {
            PaymentError::StellarRpcError(format!("Invalid XLM balance: {e}"))
        })?;
        Ok((xlm * 10_000_000.0) as i64)
    }

    /// Poll Horizon until the account is visible or timeout. Returns Ok(()) once
    /// the account appears, Err if timeout expires. Uses 1s intervals.
    pub async fn wait_for_account(&self, address: &str, max_attempts: u32) -> Result<()> {
        for i in 0..max_attempts {
            if self.horizon_get_account(address).await?.is_some() {
                return Ok(());
            }
            if i < max_attempts - 1 {
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
        }
        Err(PaymentError::StellarRpcError(format!(
            "Account {address} not found on Horizon after {max_attempts}s"
        )))
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
