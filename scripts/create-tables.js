const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('Creating tables in Neon...');
    
    // Create users table
    await client`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "clerk_id" VARCHAR(256) UNIQUE NOT NULL,
        "email" VARCHAR(256) UNIQUE NOT NULL,
        "first_name" VARCHAR(100),
        "last_name" VARCHAR(100),
        "preferences" JSON DEFAULT '[]'::json,
        "dietary_restrictions" JSON DEFAULT '[]'::json,
        "image_url" VARCHAR(512),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log('✅ Users table created successfully!');
    
    // Create recipes table
    await client`
      CREATE TABLE IF NOT EXISTS "recipes" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(256) NOT NULL,
        "description" TEXT,
        "ingredients" TEXT NOT NULL,
        "instructions" TEXT NOT NULL,
        "cooking_time" VARCHAR(50),
        "difficulty" VARCHAR(20),
        "user_id" INTEGER REFERENCES "users"("id"),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log('✅ Recipes table created successfully!');
    
    // Check if tables exist
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'recipes');
    `;
    
    console.log('\n📋 Tables in your Neon database:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await client.end();
  }
}

createTables();