-- ==========================================
-- MUSE OS: CORE DATABASE SCHEMA
-- Hybrid Structure: Relational + JSONB Unstructured
-- Target Engine: PostgreSQL
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Structured data representing identity and global metrics.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL, -- Standard Web2 Email Login
    google_id VARCHAR(255) UNIQUE,      -- For Google OAuth Login
    password_hash VARCHAR(255),         -- Nullable if they use Google
    username VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255) UNIQUE, -- Added later when we attach the blockchain
    resonance_score INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROOMS TABLE
-- Sovereign spaces for knowledge organization.
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ARTIFACTS TABLE (The Hybrid Layer)
-- Stores the metadata, but dumps massive scraped text/data into JSONB.
CREATE TABLE artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'pdf', 'url', 'youtube', 'text'
    source_url TEXT,
    
    -- unstructured_data holds the raw scraped output.
    -- Example format: { "raw_text": "...", "author": "...", "reading_time": 10, "images": [...] }
    unstructured_data JSONB, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a GIN index on unstructured_data to allow extremely fast search inside the JSON.
CREATE INDEX idx_artifacts_unstructured ON artifacts USING GIN (unstructured_data);

-- 4. THREADS TABLE
-- AI-generated blueprints and themes extracted from artifacts.
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    
    -- Array of artifact IDs that this thread synthesized.
    artifact_ids UUID[] NOT NULL,
    
    -- ai_blueprint holds unstructured AI JSON outputs.
    -- Example format: { "theme": "...", "socratic_questions": [...], "summary": "..." }
    ai_blueprint JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. JOURNAL ENTRIES TABLE
-- The raw, captured thoughts of the user. Links off-chain data to on-chain proof.
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES threads(id) ON DELETE SET NULL, -- Context for the thought
    
    raw_thought TEXT NOT NULL,
    
    -- Cryptographic hash of the raw_thought that will be pushed to the blockchain ledger.
    blockchain_hash VARCHAR(255), 
    is_broadcasted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_artifacts_room_id ON artifacts(room_id);
CREATE INDEX idx_threads_room_id ON threads(room_id);
CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
