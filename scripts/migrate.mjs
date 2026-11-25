import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set before running migrations");
}

const projectRoot = resolve(import.meta.dirname, "..");
const schemaPath = resolve(projectRoot, "database/schema.sql");
const migrationsPath = resolve(projectRoot, "database/migrations");
const migrations = (await readdir(migrationsPath))
  .filter((name) => name.endsWith(".sql"))
  .sort();

const pool = new Pool({ connectionString, max: 1 });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  await client.query(await readFile(schemaPath, "utf8"));

  for (const migration of migrations) {
    await client.query(
      await readFile(resolve(migrationsPath, migration), "utf8"),
    );
    console.log(`Applied ${migration}`);
  }

  await client.query("COMMIT");
  console.log("Muse database schema and SQL migrations are up to date.");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Database migration failed:", error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
