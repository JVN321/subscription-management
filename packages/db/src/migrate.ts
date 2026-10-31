import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './client';
import * as path from 'path';

async function runMigrations() {
  console.log('🔄 Running Drizzle database migrations...');
  try {
    await migrate(db, { migrationsFolder: path.resolve(__dirname, '../migrations') });
    console.log('✅ Migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
