import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  const queries = [
    "ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS mood TEXT DEFAULT 'reflective'",
    "ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_favorited BOOLEAN DEFAULT false",
    "ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false",
    "ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false",
    "ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS synthesized_context JSONB",
  ];

  for (const q of queries) {
    try {
      await executeDB(q);
      console.log(`Executed: ${q}`);
    } catch (e) {
      console.error(`Error executing ${q}:`, e);
    }
  }

  console.log("Journal entries table columns verified/added.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
