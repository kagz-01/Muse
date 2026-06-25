-- ==========================================
-- MUSE SOCIAL GRAPH MIGRATION: ROOM COLLABORATORS
-- ==========================================

-- Allows multiple users to co-create in the same room (Entangled Collections)
CREATE TABLE IF NOT EXISTS room_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor', -- 'editor' | 'viewer'
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_collaborators_room ON room_collaborators(room_id);
CREATE INDEX IF NOT EXISTS idx_room_collaborators_user ON room_collaborators(user_id);
