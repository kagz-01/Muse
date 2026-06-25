import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  const queries = [
    // Create items table
    `CREATE TABLE IF NOT EXISTS items (
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
    )`,
    // Add streak columns to users table (already has current_streak and resonance_score)
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS total_journal_days INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_entry_date TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_level TEXT DEFAULT 'Spark'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS freeze_count INT DEFAULT 2",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS milestones_unlocked INT[] DEFAULT ARRAY[]::INT[]",
  ];

  for (const q of queries) {
    try {
      await executeDB(q);
      console.log(`✓ ${q.slice(0, 80).replace(/\n/g, " ")}...`);
    } catch (e) {
      console.error(`✗ Error:`, (e as Error).message);
    }
  }

  console.log("\nItems + Streaks schema migration complete.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
