CREATE TABLE IF NOT EXISTS otp_requests (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Password Reset Tokens Table (issued after OTP verification in the forgot-password flow)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Backfill the UNIQUE constraint on otp_requests.email for databases that already
-- had this table created before this constraint was added to schema.sql above.
-- (CREATE TABLE IF NOT EXISTS won't retroactively add it to an existing table.)
-- Safe to run repeatedly: only acts if the constraint is missing. OTP rows are
-- short-lived/ephemeral, so we first drop older duplicate rows per email
-- (keeping only the most recent) to avoid the ADD CONSTRAINT failing on
-- pre-existing duplicates from before this fix.
DO '
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = ''otp_requests_email_key''
    ) THEN
        DELETE FROM otp_requests a USING otp_requests b
        WHERE a.email = b.email AND a.id < b.id;

        ALTER TABLE otp_requests ADD CONSTRAINT otp_requests_email_key UNIQUE (email);
    END IF;
END ';