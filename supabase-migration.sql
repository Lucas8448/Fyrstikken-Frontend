-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    verification_code TEXT,
    code_expiry BIGINT,
    contestant_voted INTEGER DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all data
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage tokens" ON tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Functions to create tables (for compatibility with the app)
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Table already exists, this is just for compatibility
    NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_tokens_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Table already exists, this is just for compatibility
    NULL;
END;
$$ LANGUAGE plpgsql;
