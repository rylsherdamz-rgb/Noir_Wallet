-- Non-custodial flow: the client signs the inner payment transaction with the
-- user's wallet and submits the signed XDR. The backend stores it here and the
-- submission worker wraps it in a channel-signed fee-bump before submitting to
-- Horizon. NULL for legacy rows.
ALTER TABLE payment_transactions
    ADD COLUMN IF NOT EXISTS signed_envelope_xdr TEXT;
