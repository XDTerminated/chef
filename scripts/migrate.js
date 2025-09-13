const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('Running migration...');
    
    // Add new columns one by one
    console.log('Adding first_name column...');
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar(100);`;
    
    console.log('Adding last_name column...');
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar(100);`;
    
    console.log('Adding preferences column...');
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferences" json DEFAULT '[]'::json;`;
    
    console.log('Adding dietary_restrictions column...');
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dietary_restrictions" json DEFAULT '[]'::json;`;
    
    console.log('Making email required...');
    await client`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;`;
    
    console.log('Dropping old name column...');
    await client`ALTER TABLE "users" DROP COLUMN IF EXISTS "name";`;
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

migrate();