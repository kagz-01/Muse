import { Pool } from "postgres";

// We read from Deno Deploy environment variables or a local .env file.
const DATABASE_URL = Deno.env.get("DATABASE_URL") ||
  "postgres://user:password@localhost:5432/muse";

// Create a connection pool with 3 concurrent connections max to fit within free-tier limits.
const pool = new Pool(DATABASE_URL, 3, true);

export async function queryDB(query: string, ...args: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.queryObject(query, args);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function executeDB(query: string, ...args: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.queryObject(query, args);
    return result;
  } finally {
    client.release();
  }
}
