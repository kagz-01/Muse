import "https://deno.land/std@0.216.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  try {
    const schemaSql = await Deno.readTextFile("../database/schema.sql");
    console.log("Read schema.sql successfully.");

    // Split the schema by semicolon and execute each statement to avoid driver issues with multiple statements
    const statements = schemaSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing:\n${statement.substring(0, 50)}...`);
      await executeDB(statement);
    }

    console.log("Schema executed successfully!");
  } catch (error) {
    console.error("Error executing schema:", error);
  } finally {
    Deno.exit(0);
  }
}

run();
