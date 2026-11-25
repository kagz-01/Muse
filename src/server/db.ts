import "dotenv/config";
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import process from "node:process";

let pool: Pool | undefined;

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set to access the Muse database");
  }

  pool ??= new Pool({
    connectionString,
    max: 3,
  });
  return pool;
}

export async function queryDB<T extends QueryResultRow = QueryResultRow>(
  query: string,
  ...values: unknown[]
): Promise<T[]> {
  const result = await getPool().query<T>(query, values);
  return result.rows;
}

export async function executeDB(
  query: string,
  ...values: unknown[]
): Promise<QueryResult> {
  return await getPool().query(query, values);
}

export async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Database transaction rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}
