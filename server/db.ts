import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Only connect to database if connection string is provided via environment variable
const connectionString = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  });

  db = drizzle(pool, { schema });

  // Simple connection test
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Database connection failed:', err.message);
    } else {
      console.log('✅ Database connected successfully');
      release();
    }
  });

  pool.on('error', (err) => {
    console.error('Database pool error:', err);
  });
} else {
  console.warn('⚠️ DATABASE_URL not set - database features disabled');
}

export { pool, db };
