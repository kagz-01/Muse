import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  const queries = [
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Thread'",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS mood TEXT DEFAULT 'focus'",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS format TEXT",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS depth TEXT",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS theme TEXT",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS thesis TEXT",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS cover_image TEXT",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_favorited BOOLEAN DEFAULT false",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_vault BOOLEAN DEFAULT false",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS synthesis_score INT DEFAULT 0",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS source_room_ids UUID[] DEFAULT ARRAY[]::UUID[]",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS dialogue_layers JSONB DEFAULT '[]'::jsonb",
    'ALTER TABLE threads ADD COLUMN IF NOT EXISTS resonance_metrics JSONB DEFAULT \'{"views": 0, "connections": 0}\'::jsonb',
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS custom_styling JSONB",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS synthesis JSONB",
    "ALTER TABLE threads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
  ];

  for (const q of queries) {
    try {
      await executeDB(q);
      console.log(`✓ ${q.slice(0, 80)}...`);
    } catch (e) {
      console.error(`✗ Error:`, (e as Error).message);
    }
  }

  console.log("\nThreads schema migration complete.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
