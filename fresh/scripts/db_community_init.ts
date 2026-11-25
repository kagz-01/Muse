import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function initDB() {
  console.log("Initializing Community DB schemas...");

  // Circles Table
  await executeDB(`
    CREATE TABLE IF NOT EXISTS circles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      theme TEXT NOT NULL,
      member_count INT DEFAULT 0,
      recent_activity TEXT,
      created_at TIMESTAMP DEFAULT now(),
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      required_streak INT DEFAULT 0,
      required_intelligence_profile TEXT
    )
  `);
  console.log("Created 'circles' table.");

  // Circle Members Table
  await executeDB(`
    CREATE TABLE IF NOT EXISTS circle_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT now(),
      UNIQUE(circle_id, user_id)
    )
  `);
  console.log("Created 'circle_members' table.");

  console.log("Community DB schema initialization complete.");
  Deno.exit(0);
}

initDB().catch((err) => {
  console.error("DB Init failed:", err);
  Deno.exit(1);
});
