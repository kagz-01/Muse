-- ==========================================
-- MUSE SOCIAL GRAPH MIGRATION: PARALLEL THREADS
-- ==========================================

-- 1. Make room_id nullable on threads (since a thread can now be user-to-user instead of just room-based)
ALTER TABLE threads ALTER COLUMN room_id DROP NOT NULL;

-- 2. Add user_id to explicitly own the thread if it's not strictly tied to a room
ALTER TABLE threads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 3. Add partner_id for Parallel Synthesis threads
ALTER TABLE threads ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 4. Add index for quick lookups of parallel threads
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_partner_id ON threads(partner_id);
