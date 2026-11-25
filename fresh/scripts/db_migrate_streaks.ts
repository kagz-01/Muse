import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  const queries = [
    `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
    `CREATE TABLE IF NOT EXISTS streak_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      contribution_type TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      destination TEXT DEFAULT 'journal',
      weight NUMERIC DEFAULT 1,
      summary TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS streak_sparks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id UUID REFERENCES streak_events(id) ON DELETE CASCADE,
      spark_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      destination TEXT DEFAULT 'journal',
      visibility TEXT DEFAULT 'private',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS streak_entanglements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'active',
      current_streak INT DEFAULT 0,
      longest_streak INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_a, user_b)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_streak_events_user_created ON streak_events(user_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_streak_sparks_user_created ON streak_sparks(user_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_streak_entanglements_user_a ON streak_entanglements(user_a)`,
    `CREATE INDEX IF NOT EXISTS idx_streak_entanglements_user_b ON streak_entanglements(user_b)`,
  ];

  for (const q of queries) {
    try {
      await executeDB(q);
      console.log(`✓ ${q.slice(0, 80).replace(/\n/g, " ")}...`);
    } catch (e) {
      console.error(`✗ Error:`, (e as Error).message);
    }
  }

  console.log("Streak schema migration complete.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
