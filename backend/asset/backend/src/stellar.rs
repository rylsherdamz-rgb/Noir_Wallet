use crate::errors::{PaymentError, Result};
use crate::transaction_builder::TransactionBuilder;
use crate::transaction_signer::TransactionSigner;
use reqwest::Client;
use std::sync::Arc;

/// Thin Horizon client for account lookups + transaction submission.
///
/// Submission uses Horizon's `POST /transactions` (form-encoded `tx=`), which
/// is the correct endpoint for classic payments and fee-bumps — not the
/// Soroban JSON-RPC. `rpc_url` (Soroban) is retained for contract calls.
#[derive(Clone)]
#[allow(dead_code)]
pub struct StellarClient {
    http_client: Arc<Client>,
    rpc_url: String,
    horizon_url: String,
    network: String,
    pub master_account: String,
    pub master_key: String,
}

#[derive(serde::Deserialize, Debug)]
struct AccountResponse {
    sequence: String,
    balances: Vec<BalanceInfo>,
}

#[derive(serde::Deserialize, Debug)]
struct BalanceInfo {
    balance: String,
    #[serde(rename = "asset_type")]
    asset_type: String,
}

impl StellarClient {
    pub fn new(rpc_url: String, network: String) -> Self {
        let horizon_url = match network.as_str() {
            "public" | "pubnet" | "mainnet" => "https://horizon.stellar.org".to_string(),
            _ => "https://horizon-testnet.stellar.org".to_string(),
        };
        Self::with_horizon(rpc_url, horizon_url, network)
    }

    pub fn with_horizon(rpc_url: String, horizon_url: String, network: String) -> Self {
        StellarClient {
            http_client: Arc::new(Client::new()),
            rpc_url,
            horizon_url,
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

    /// Fund an account on testnet via Friendbot. No-op error on mainnet.
    pub async fn fund_testnet(&self, address: &str) -> Result<()> {
        if !matches!(self.network.as_str(), "testnet" | "" ) {
            return Err(PaymentError::ConfigError(
                "Friendbot funding is only available on testnet".to_string(),
            ));
        }
        let url = format!("https://friendbot.stellar.org/?addr={address}");
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

    /// Current sequence number of an account (from Horizon).
    pub async fn get_account_sequence(&self, address: &str) -> Result<u64> {
        let account = self.load_account(address).await?;
        account.sequence.parse::<u64>().map_err(|_| {
            PaymentError::StellarRpcError("Invalid sequence number format".to_string())
        })
    }

    async fn load_account(&self, address: &str) -> Result<AccountResponse> {
        let url = format!("{}/accounts/{}", self.horizon_url, address);
        let response = self
            .http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| PaymentError::StellarRpcError(format!("Failed to fetch account: {e}")))?;

        if !response.status().is_success() {
            return Err(PaymentError::StellarRpcError(format!(
                "Account {address} not found on {}",
                self.network
            )));
        }

        response.json::<AccountResponse>().await.map_err(|e| {
            PaymentError::StellarRpcError(format!("Failed to parse account response: {e}"))
        })
    }

    /// Submit a base64 transaction envelope to Horizon. Returns the tx hash.
    pub async fn submit_transaction(&self, envelope_xdr: &str) -> Result<String> {
        let url = format!("{}/transactions", self.horizon_url);

        let response = self
            .http_client
            .post(&url)
            .form(&[("tx", envelope_xdr)])
            .send()
            .await
            .map_err(|e| {
                PaymentError::StellarRpcError(format!("Failed to submit transaction: {e}"))
            })?;

        let status = response.status();
        let body: serde_json::Value = response.json().await.map_err(|e| {
            PaymentError::StellarRpcError(format!("Failed to parse submit response: {e}"))
        })?;

        if status.is_success() {
            return body
                .get("hash")
                .and_then(|h| h.as_str())
                .map(|s| s.to_string())
                .ok_or_else(|| {
                    PaymentError::SubmissionFailed("No transaction hash in response".to_string())
                });
        }

        // Horizon problem+json: surface the transaction/operation result codes.
        let codes = body
            .get("extras")
            .and_then(|e| e.get("result_codes"))
            .map(|c| c.to_string())
            .unwrap_or_else(|| body.to_string());
        Err(PaymentError::SubmissionFailed(format!(
            "Horizon rejected submission ({status}): {codes}"
        )))
    }

    pub async fn get_transaction_status(&self, tx_hash: &str) -> Result<String> {
        let url = format!("{}/transactions/{}", self.horizon_url, tx_hash);

        let response = self.http_client.get(&url).send().await.map_err(|e| {
            PaymentError::StellarRpcError(format!("Failed to fetch transaction: {e}"))
        })?;

        match response.status().as_u16() {
            200 => {
                let body: serde_json::Value = response.json().await.map_err(|e| {
                    PaymentError::StellarRpcError(format!("Failed to parse tx response: {e}"))
                })?;
                if body.get("successful").and_then(|s| s.as_bool()).unwrap_or(false) {
                    Ok("confirmed".to_string())
                } else {
                    Ok("failed".to_string())
                }
            }
            404 => Ok("pending".to_string()),
            _ => Err(PaymentError::StellarRpcError(
                "Failed to check transaction status".to_string(),
            )),
        }
    }

    pub async fn get_account_balance(&self, address: &str) -> Result<i64> {
        let account = self.load_account(address).await?;
        let native = account
            .balances
            .iter()
            .find(|b| b.asset_type == "native")
            .ok_or_else(|| PaymentError::StellarRpcError("No native balance found".to_string()))?;
        let xlm = native
            .balance
            .parse::<f64>()
            .map_err(|e| PaymentError::StellarRpcError(format!("Invalid balance format: {e}")))?;
        Ok((xlm * 10_000_000.0) as i64)
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
