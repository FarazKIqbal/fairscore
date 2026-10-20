-- FairScore Database Initialization Script
-- Run this in Supabase SQL Editor or local PostgreSQL

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('borrower', 'lender')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower table
CREATE TABLE IF NOT EXISTS borrower (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    state VARCHAR(100),
    city VARCHAR(100),
    occupation VARCHAR(100),
    employer VARCHAR(200),
    income DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lender table
CREATE TABLE IF NOT EXISTS lender (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    lending_capacity DECIMAL(15,2),
    interest_rate_min DECIMAL(5,2),
    interest_rate_max DECIMAL(5,2),
    loan_amount_from DECIMAL(15,2),
    loan_amount_to DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower credit info table
CREATE TABLE IF NOT EXISTS borrower_credit_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES borrower(id) ON DELETE CASCADE,
    credit_score INTEGER,
    risk_bucket VARCHAR(20),
    estimated_credit_line DECIMAL(15,2),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower loan details table
CREATE TABLE IF NOT EXISTS borrower_loan_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES borrower(id) ON DELETE CASCADE,
    loan_amount DECIMAL(15,2),
    loan_tenure INTEGER,
    asset_value DECIMAL(15,2),
    ltv_ratio DECIMAL(5,2),
    applied_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create loan table
CREATE TABLE IF NOT EXISTS loan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES borrower(id) ON DELETE CASCADE,
    lender_id UUID REFERENCES lender(id) ON DELETE CASCADE,
    loan_amount DECIMAL(15,2),
    interest_rate DECIMAL(5,2),
    tenure_months INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create borrower score insights cache
CREATE TABLE IF NOT EXISTS borrower_score_insights_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES borrower(id) ON DELETE CASCADE,
    prediction_fingerprint VARCHAR(255),
    reasons_payload JSONB,
    advice_payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(borrower_id, prediction_fingerprint)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_borrower_user_id ON borrower(user_id);
CREATE INDEX IF NOT EXISTS idx_lender_user_id ON lender(user_id);
CREATE INDEX IF NOT EXISTS idx_borrower_credit_info_borrower_id ON borrower_credit_info(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loan_status ON loan(status);
CREATE INDEX IF NOT EXISTS idx_borrower_score_insights_cache_borrower ON borrower_score_insights_cache(borrower_id);
