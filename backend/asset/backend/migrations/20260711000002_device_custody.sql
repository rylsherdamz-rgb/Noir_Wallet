-- Custodial card wallets: each passive NFC card's UID maps to a Stellar wallet
-- whose secret is envelope-encrypted at rest (never stored in plaintext). The
-- backend decrypts it in-memory to sign UID-authorized tap payments, bounded by
-- the device's daily spend limit.
ALTER TABLE devices
    ADD COLUMN IF NOT EXISTS wallet_secret_encrypted BYTEA,
    ADD COLUMN IF NOT EXISTS seed_key_version INTEGER NOT NULL DEFAULT 0;
