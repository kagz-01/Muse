-- ==========================================
-- MUSE OS: CORE DATABASE SCHEMA
-- Hybrid Structure: Relational + JSONB Unstructured
-- Target Engine: PostgreSQL / CockroachDB
-- ==========================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
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

-- 2. Streak system
CREATE TABLE IF NOT EXISTS streak_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_type TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    destination TEXT DEFAULT 'journal',
    weight NUMERIC DEFAULT 1,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS streak_sparks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES streak_events(id) ON DELETE CASCADE,
    spark_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    destination TEXT DEFAULT 'journal',
    visibility TEXT DEFAULT 'private',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS streak_entanglements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active',
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_a, user_b)
);

CREATE INDEX IF NOT EXISTS idx_streak_events_user_created ON streak_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streak_sparks_user_created ON streak_sparks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streak_entanglements_user_a ON streak_entanglements(user_a);
CREATE INDEX IF NOT EXISTS idx_streak_entanglements_user_b ON streak_entanglements(user_b);

-- 3. Rooms
CREATE TABLE IF NOT EXISTS rooms (
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

-- 4. Items and annotations
CREATE TABLE IF NOT EXISTS items (
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

CREATE TABLE IF NOT EXISTS item_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    annotation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Threads and journal
CREATE TABLE IF NOT EXISTS threads (
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

CREATE TABLE IF NOT EXISTS journal_entries (
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
    nlp_analysis JSONB DEFAULT '{}'::jsonb,
    nlp_confidence NUMERIC(3,2),
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Artifacts and social graph
CREATE TABLE IF NOT EXISTS artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    source_url TEXT,
    unstructured_data JSONB,
    nlp_analysis JSONB DEFAULT '{}'::jsonb,
    nlp_confidence NUMERIC(3,2),
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Circles (community groups)
CREATE TABLE IF NOT EXISTS circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    theme TEXT DEFAULT 'default',
    member_count INT DEFAULT 0,
    recent_activity JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, followee_id)
);

-- Circle membership mapping table
CREATE TABLE IF NOT EXISTS circle_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS entanglements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS spark_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

CREATE TABLE IF NOT EXISTS spark_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- 7. NLP Metadata and Intelligence
CREATE TABLE IF NOT EXISTS artifact_nlp_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE,
    journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    themes TEXT[] DEFAULT ARRAY[]::TEXT[],
    sentiment_score NUMERIC(3,2),
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    confidence NUMERIC(3,2) NOT NULL,
    analysis_method TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (artifact_id IS NOT NULL OR journal_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_items_room_id ON items(room_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_item_annotations_item_id ON item_annotations(item_id);
CREATE INDEX IF NOT EXISTS idx_threads_room_id ON threads(room_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_partner_id ON threads(partner_id);
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_room_id ON artifacts(room_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_unstructured ON artifacts USING GIN (unstructured_data);
CREATE INDEX IF NOT EXISTS idx_entanglements_requester ON entanglements(requester_id);
CREATE INDEX IF NOT EXISTS idx_entanglements_addressee ON entanglements(addressee_id);
CREATE INDEX IF NOT EXISTS idx_spark_reactions_item ON spark_reactions(item_id);
CREATE INDEX IF NOT EXISTS idx_spark_comments_item ON spark_comments(item_id);
CREATE INDEX IF NOT EXISTS idx_room_collaborators_room ON room_collaborators(room_id);
CREATE INDEX IF NOT EXISTS idx_room_collaborators_user ON room_collaborators(user_id);

-- NLP Metadata Indexes
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_artifact_id ON artifact_nlp_metadata(artifact_id);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_journal_id ON artifact_nlp_metadata(journal_id);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_confidence ON artifact_nlp_metadata(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_timestamp ON artifact_nlp_metadata(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_method ON artifact_nlp_metadata(analysis_method);
CREATE INDEX IF NOT EXISTS idx_artifacts_nlp_confidence ON artifacts(nlp_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_analyzed_at ON artifacts(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_nlp_confidence ON journal_entries(nlp_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_journal_analyzed_at ON journal_entries(analyzed_at DESC);
