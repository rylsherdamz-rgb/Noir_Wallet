use std::sync::Arc;
use crate::db::DeviceRepository;
use crate::errors::{PaymentError, Result};
use crate::models::PaymentRequest;

pub struct DeviceValidator {
    db: Arc<DeviceRepository>,
}

impl DeviceValidator {
    pub fn new(db: Arc<DeviceRepository>) -> Self {
        DeviceValidator { db }
    }

    pub async fn validate_device_active(&self, hash: &str) -> Result<()> {
        let device = self.db.get_device_by_hash(hash).await?;
        
        if device.status != "active" {
            return Err(PaymentError::DeviceNotActive);
        }
        
        Ok(())
    }

    pub async fn validate_spend_limit(&self, hash: &str, amount: i64) -> Result<bool> {
        self.db.check_daily_limit(hash, amount).await
    }

    pub fn validate_request_payload(&self, payload: &PaymentRequest) -> Result<()> {
        if payload.device_serial.is_empty() {
            return Err(PaymentError::InvalidPayload(
                "device_serial is required".to_string(),
            ));
        }

        if payload.destination_wallet.is_empty() {
            return Err(PaymentError::InvalidPayload(
                "destination_wallet is required".to_string(),
            ));
        }

        if payload.amount_stroops == 0 {
            return Err(PaymentError::InvalidPayload(
                "amount_stroops must be greater than 0".to_string(),
            ));
        }

        if payload.idempotency_key.is_empty() {
            return Err(PaymentError::InvalidPayload(
                "idempotency_key is required".to_string(),
            ));
        }

        Ok(())
    }
}
