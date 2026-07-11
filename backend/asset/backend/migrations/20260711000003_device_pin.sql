-- Optional per-card PIN (SHA-256 hex of the PIN). When set, the backend
-- requires a matching PIN on tap payments above a threshold amount — a second
-- factor for a cloneable passive UID. NULL means no PIN configured.
ALTER TABLE devices
    ADD COLUMN IF NOT EXISTS pin_hash TEXT;
