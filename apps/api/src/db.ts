import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

function missingDatabaseUrlError() {
  return new Error("DATABASE_URL is not defined");
}

export const pool: Pool = connectionString
  ? new Pool({
      connectionString,
      max: 1, // Vercel serverless: use minimal connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : ({
      query: async () => {
        throw missingDatabaseUrlError();
      },
      on: () => undefined,
    } as unknown as Pool);

if (connectionString) {
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
  });
} else {
  console.warn("DATABASE_URL is not defined. DB-backed routes will return 500.");
}
