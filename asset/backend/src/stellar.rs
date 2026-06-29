use crate::errors::{PaymentError, Result};
use crate::transaction_builder::TransactionBuilder;
use reqwest::Client;
use serde_json::json;
use std::sync::Arc;

#[derive(Clone)]
#[allow(dead_code)]
pub struct StellarClient {
    http_client: Arc<Client>,
    rpc_url: String,
    network: String,
    master_account: String,
    master_key: String,
}

#[derive(serde::Deserialize, Debug)]
struct AccountResponse {
    account: AccountInfo,
}

#[derive(serde::Deserialize, Debug)]
struct AccountInfo {
    #[serde(rename = "sequenceNumber")]
    sequence_number: String,
}

#[derive(serde::Deserialize, Debug)]
struct SubmitResponse {
    hash: Option<String>,
    error_result: Option<ErrorResult>,
}

#[derive(serde::Deserialize, Debug)]
struct ErrorResult {
    result_code: String,
}

#[derive(serde::Deserialize, Debug)]
#[allow(dead_code)]
struct TransactionResponse {
    successful: bool,
    #[serde(default)]
    ledger: Option<u32>,
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

    pub async fn get_account_sequence(&self, address: &str) -> Result<u64> {
        let url = format!("{}/accounts/{}", self.rpc_url, address);

        let response = self.http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| PaymentError::StellarRpcError(format!("Failed to fetch account: {}", e)))?;

        if !response.status().is_success() {
            return Err(PaymentError::StellarRpcError("Account not found on network".to_string()));
        }

        let account: AccountResponse = response
            .json()
            .await
            .map_err(|e| PaymentError::StellarRpcError(format!("Failed to parse account response: {}", e)))?;

        account.account.sequence_number
            .parse::<u64>()
            .map_err(|_| PaymentError::StellarRpcError("Invalid sequence number format".to_string()))
    }

    pub async fn submit_transaction(&self, envelope_xdr: &str) -> Result<String> {
        let url = format!("{}/transactions", self.rpc_url);

        let body = json!({
            "tx": envelope_xdr,
        });

        let response = self.http_client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| PaymentError::StellarRpcError(format!("Failed to submit transaction: {}", e)))?;

        let submit: SubmitResponse = response
            .json()
            .await
            .map_err(|e| PaymentError::StellarRpcError(format!("Failed to parse submit response: {}", e)))?;

        if let Some(error) = submit.error_result {
            return Err(PaymentError::SubmissionFailed(format!(
                "Stellar rejected submission: {}",
                error.result_code
            )));
        }

        submit.hash
            .ok_or_else(|| PaymentError::SubmissionFailed("No transaction hash in response".to_string()))
    }

    pub async fn get_transaction_status(&self, tx_hash: &str) -> Result<String> {
        let url = format!("{}/transactions/{}", self.rpc_url, tx_hash);

        let response = self.http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| PaymentError::StellarRpcError(format!("Failed to fetch transaction: {}", e)))?;

        match response.status().as_u16() {
            200 => {
                let tx: TransactionResponse = response
                    .json()
                    .await
                    .map_err(|e| PaymentError::StellarRpcError(format!("Failed to parse tx response: {}", e)))?;

                if tx.successful {
                    Ok("confirmed".to_string())
                } else {
                    Ok("failed".to_string())
                }
            }
            404 => Ok("pending".to_string()),
            _ => Err(PaymentError::StellarRpcError("Failed to check transaction status".to_string())),
        }
    }

    pub async fn get_account_balance(&self, address: &str) -> Result<i64> {
        let sequence = self.get_account_sequence(address).await?;
        Ok(sequence as i64 * 1_000_000)
    }

    pub async fn transfer_to_channel(&self, channel_address: &str, amount: i64) -> Result<String> {
        if self.master_account.is_empty() || self.master_key.is_empty() {
            return Err(PaymentError::ConfigError(
                "Master account not configured".to_string(),
            ));
        }

        let sequence = self.get_account_sequence(&self.master_account).await?;
        let builder = TransactionBuilder::new(self.network.clone());

        let envelope_xdr = builder.build_payment_envelope(
            &self.master_account,
            channel_address,
            amount,
            sequence,
            Some(format!("Channel topup: {}", channel_address)),
            &self.master_key,
        )?;

        self.submit_transaction(&envelope_xdr).await
    }
}
