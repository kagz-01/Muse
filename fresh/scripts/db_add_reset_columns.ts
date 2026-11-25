import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  await executeDB(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_hash TEXT",
  );
  await executeDB(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP",
  );
  console.log("Added reset token columns to 'users' table.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
