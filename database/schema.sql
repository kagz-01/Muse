-- ==========================================
-- MUSE OS: CORE DATABASE SCHEMA
-- Hybrid Structure: Relational + JSONB Unstructured
-- Target Engine: PostgreSQL / CockroachDB
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    username VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255) UNIQUE,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"theme": "dark", "emailNotifications": true}'::jsonb,
    resonance_score INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_journal_days INT DEFAULT 0,
    last_entry_date TEXT DEFAULT '',
    streak_level TEXT DEFAULT 'Spark',
    freeze_count INT DEFAULT 2,
    milestones_unlocked INT[] DEFAULT ARRAY[]::INT[],
    reset_token_hash TEXT,
    reset_token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROOMS TABLE
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    theme_color VARCHAR(50) DEFAULT '#ffffff',
    tags VARCHAR(255)[],
    is_public BOOLEAN DEFAULT false,
    count INT DEFAULT 0,
    semantic_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_settings JSONB DEFAULT '{}'::jsonb,
    resonance_metrics JSONB DEFAULT '{"views": 0, "wovenCount": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. ITEMS TABLE (Scraped metadata and links)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_url TEXT DEFAULT '',
    note TEXT,
    is_public BOOLEAN DEFAULT false,
    stored_content TEXT,
    local_media_path TEXT,
    data_provenance JSONB DEFAULT '{"platform": "Web", "integrityHash": ""}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. THREADS TABLE (AI Synthesis)
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Thread',
    description TEXT DEFAULT '',
    mood TEXT DEFAULT 'focus',
    format TEXT,
    depth TEXT,
    theme TEXT,
    thesis TEXT,
    cover_image TEXT,
    is_public BOOLEAN DEFAULT false,
    is_favorited BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_vault BOOLEAN DEFAULT false,
    synthesis_score INT DEFAULT 0,
    artifact_ids UUID[] DEFAULT ARRAY[]::UUID[],
    source_room_ids UUID[] DEFAULT ARRAY[]::UUID[],
    dialogue_layers JSONB DEFAULT '[]'::jsonb,
    resonance_metrics JSONB DEFAULT '{"views": 0, "connections": 0}'::jsonb,
    custom_styling JSONB,
    synthesis JSONB,
    ai_blueprint JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. JOURNAL ENTRIES TABLE (Raw thoughts)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
    raw_thought TEXT NOT NULL,
    mood TEXT,
    tags TEXT[],
    linked_item_ids UUID[] DEFAULT ARRAY[]::UUID[],
    is_public BOOLEAN DEFAULT false,
    is_favorited BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    synthesized_context JSONB,
    blockchain_hash VARCHAR(255),
    is_broadcasted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. LEGACY ARTIFACTS TABLE
CREATE TABLE artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    source_url TEXT,
    unstructured_data JSONB, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_items_room_id ON items(room_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_threads_room_id ON threads(room_id);
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_partner_id ON threads(partner_id);
CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_artifacts_room_id ON artifacts(room_id);
CREATE INDEX idx_artifacts_unstructured ON artifacts USING GIN (unstructured_data);

-- 7. ENTANGLEMENTS (Streak partnerships / friend connections)
CREATE TABLE entanglements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- 8. SPARK REACTIONS (Emoji reactions on public items/sparks)
CREATE TABLE spark_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

-- 9. SPARK COMMENTS (Replies on public sparks)
CREATE TABLE spark_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional indexes for social tables
CREATE INDEX idx_entanglements_requester ON entanglements(requester_id);
CREATE INDEX idx_entanglements_addressee ON entanglements(addressee_id);
CREATE INDEX idx_spark_reactions_item ON spark_reactions(item_id);
CREATE INDEX idx_spark_comments_item ON spark_comments(item_id);

-- 10. ROOM COLLABORATORS (Shared Entangled Collections)
CREATE TABLE room_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor', -- 'editor' | 'viewer'
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);
CREATE INDEX idx_room_collaborators_room ON room_collaborators(room_id);
CREATE INDEX idx_room_collaborators_user ON room_collaborators(user_id);
