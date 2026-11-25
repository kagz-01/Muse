import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  await executeDB(
    "ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[]",
  );
  console.log("Added 'tags' column to 'journal_entries'.");

  // Also add to stream migration record
  await executeDB(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT",
  );
  console.log("'avatar_url' on users confirmed.");

  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
