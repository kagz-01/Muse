import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  const queries = [
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS emoji TEXT",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS category TEXT",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS size TEXT",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS mood TEXT",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS custom_theme_hex TEXT",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS cover_image TEXT",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS semantic_tags TEXT[] DEFAULT ARRAY[]::TEXT[]",
    'ALTER TABLE rooms ADD COLUMN IF NOT EXISTS resonance_metrics JSONB DEFAULT \'{"views": 0, "wovenCount": 0}\'::jsonb',
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS custom_styling JSONB",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_vault BOOLEAN DEFAULT false",
    "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS item_count INT DEFAULT 0",
  ];

  for (const q of queries) {
    try {
      await executeDB(q);
      console.log(`✓ ${q}`);
    } catch (e) {
      console.error(`✗ ${q}:`, e);
    }
  }

  console.log("\nRooms schema migration complete.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
