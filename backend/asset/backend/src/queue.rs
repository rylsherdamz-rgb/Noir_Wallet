use crate::models::PaymentTransaction;
use tokio::sync::mpsc;

pub struct TransactionQueue {
    tx: mpsc::Sender<PaymentTransaction>,
}

impl TransactionQueue {
    pub fn new(buffer_size: usize) -> (Self, mpsc::Receiver<PaymentTransaction>) {
        let (tx, rx) = mpsc::channel(buffer_size);
        (TransactionQueue { tx }, rx)
    }

    pub async fn enqueue(&self, tx: PaymentTransaction) -> crate::errors::Result<()> {
        self.tx
            .send(tx)
            .await
            .map_err(|_| crate::errors::PaymentError::InternalError)
    }
}
