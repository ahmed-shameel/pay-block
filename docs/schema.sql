-- PayBlock – Initial schema migration
-- Run this against a fresh PostgreSQL database.
-- TypeORM will manage subsequent migrations automatically (with synchronize:false in production).

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL,
    password_hash TEXT         NOT NULL,
    display_name  VARCHAR(255),
    verified      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── Payments ────────────────────────────────────────────────────
CREATE TYPE payment_method AS ENUM ('stripe', 'crypto');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS payments (
    id                     UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount                 BIGINT         NOT NULL,
    currency               VARCHAR(10)    NOT NULL,
    method                 payment_method NOT NULL DEFAULT 'stripe',
    status                 payment_status NOT NULL DEFAULT 'pending',
    provider_tx_id         TEXT,
    blockchain_tx_hash     TEXT,
    blockchain_block_number INT,
    metadata               JSONB,
    created_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id       ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx_id ON payments (provider_tx_id);
CREATE INDEX IF NOT EXISTS idx_payments_status         ON payments (status);

-- ── Payment contracts ─────────────────────────────────────────
CREATE TYPE contract_type   AS ENUM ('escrow', 'milestone', 'subscription');
CREATE TYPE contract_status AS ENUM ('draft', 'active', 'completed', 'cancelled', 'disputed');

CREATE TABLE IF NOT EXISTS payment_contracts (
    id               UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id       UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    beneficiary_ref  VARCHAR(255)    NOT NULL,
    type             contract_type   NOT NULL,
    status           contract_status NOT NULL DEFAULT 'draft',
    amount           BIGINT          NOT NULL,
    currency         VARCHAR(10)     NOT NULL,
    config           JSONB,
    on_chain_address TEXT,
    deploy_tx_hash   TEXT,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_creator_id ON payment_contracts (creator_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status     ON payment_contracts (status);

-- ── updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_payment_contracts
  BEFORE UPDATE ON payment_contracts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
