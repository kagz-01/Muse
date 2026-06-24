import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function migrateDB() {
  console.log("Running DB migration to add missing columns...");

  try {
    await executeDB(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
    console.log("Added 'avatar_url' to 'users'.");
  } catch (err) {
    console.error("Failed to add 'avatar_url':", err);
  }

  try {
    await executeDB(`ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false`);
    console.log("Added 'is_public' to 'journal_entries'.");
  } catch (err) {
    console.error("Failed to add 'is_public':", err);
  }

  console.log("Migration complete.");
  Deno.exit(0);
}

migrateDB().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
