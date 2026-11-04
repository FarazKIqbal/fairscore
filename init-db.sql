-- FairScore Database Initialization Script
-- Run this in Supabase SQL Editor or local PostgreSQL

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('borrower', 'lender')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower table
CREATE TABLE IF NOT EXISTS borrower (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    dob DATE NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone_no VARCHAR(50) NOT NULL,
    employment_profile VARCHAR(100),
    occupation VARCHAR(100),
    income DECIMAL(15,2) CHECK (income >= 0),
    credit_history_length INTEGER CHECK (credit_history_length >= 0),
    loan_no INTEGER CHECK (loan_no >= 0),
    asset_value DECIMAL(15,2) CHECK (asset_value >= 0),
    ltv_ratio DECIMAL(5,2) CHECK (ltv_ratio >= 0 AND ltv_ratio <= 100),
    existing_customer VARCHAR(10) NOT NULL CHECK (existing_customer IN ('yes', 'no')),
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lender table
CREATE TABLE IF NOT EXISTS lender (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('individual', 'financial_institution')),
    capacity DECIMAL(15,2) CHECK (capacity >= 0),
    loan_amount_from DECIMAL(15,2) CHECK (loan_amount_from >= 0),
    loan_amount_to DECIMAL(15,2),
    interest DECIMAL(5,2) CHECK (interest >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower loan details table
CREATE TABLE IF NOT EXISTS borrower_loan_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES borrower(id) ON DELETE CASCADE,
    loan_amount DECIMAL(15,2) NOT NULL CHECK (loan_amount > 0),
    loan_tenure INTEGER NOT NULL CHECK (loan_tenure > 0),
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower credit info table
CREATE TABLE IF NOT EXISTS borrower_credit_info (
    id UUID PRIMARY KEY REFERENCES borrower(id) ON DELETE CASCADE,
    credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 900),
    risk VARCHAR(20) NOT NULL CHECK (risk IN ('low', 'medium', 'high')),
    credit_line DECIMAL(15,2) CHECK (credit_line >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create loan table
CREATE TABLE IF NOT EXISTS loan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID NOT NULL REFERENCES borrower(id) ON DELETE CASCADE,
    lender_id UUID NOT NULL REFERENCES lender(id) ON DELETE CASCADE,
    date_and_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'approved', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower score insights cache
CREATE TABLE IF NOT EXISTS borrower_score_insights_cache (
    user_id UUID PRIMARY KEY REFERENCES borrower(id) ON DELETE CASCADE,
    profile_fingerprint VARCHAR(255) NOT NULL,
    reasons_payload JSONB,
    advice_payload JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_borrower_credit_info_id ON borrower_credit_info(id);
CREATE INDEX IF NOT EXISTS idx_loan_status ON loan(status);
CREATE INDEX IF NOT EXISTS idx_loan_borrower ON loan(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loan_lender ON loan(lender_id);
CREATE INDEX IF NOT EXISTS idx_loan_pending_pair
    ON loan(lender_id, borrower_id)
    WHERE status = 'requested';

-- Atomic approval function used by the lender approval flow.
-- Safe to run again in an existing Supabase project.
CREATE OR REPLACE FUNCTION public.approve_loan_request(
    p_lender_id UUID,
    p_borrower_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    pending_loan_id UUID;
BEGIN
    IF p_lender_id IS NULL OR p_borrower_id IS NULL THEN
        RAISE EXCEPTION 'Lender and borrower IDs are required';
    END IF;

    -- Lock the request row so two approvals cannot process it at once.
    SELECT id
    INTO pending_loan_id
    FROM public.loan
    WHERE lender_id = p_lender_id
      AND borrower_id = p_borrower_id
      AND status = 'requested'
    ORDER BY created_at
    LIMIT 1
    FOR UPDATE;

    IF pending_loan_id IS NULL THEN
        RAISE EXCEPTION 'No pending request found for this lender and borrower';
    END IF;

    UPDATE public.loan
    SET status = 'approved',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = pending_loan_id;

    UPDATE public.loan
    SET status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
    WHERE borrower_id = p_borrower_id
      AND lender_id != p_lender_id
      AND status = 'requested';
END;
$$;

REVOKE ALL ON FUNCTION public.approve_loan_request(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_loan_request(UUID, UUID) TO service_role;
