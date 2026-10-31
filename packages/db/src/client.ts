import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from root or current directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL || 'postgresql://brightloop:brightloop_dev_pass@localhost:5433/brightloop_db';

const client = postgres(connectionString, {
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 20,
  idle_timeout: 30,
  connect_timeout: 10
});

export const db = drizzle(client, { schema });
export { client };
