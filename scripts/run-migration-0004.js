const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = postgres(connectionString, {
  prepare: false // Disable prepared statements to avoid caching issues
});

async function runMigration() {
  try {
    console.log('Running migration 0004: Update recipes table...');
    
    // Drop old columns if they exist
    await client`ALTER TABLE "recipes" DROP COLUMN IF EXISTS "ingredients"`;
    await client`ALTER TABLE "recipes" DROP COLUMN IF EXISTS "instructions"`;
    console.log('✅ Dropped old columns');
    
    // Add new columns
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "ingredients" json DEFAULT '[]'::json`;
    console.log('✅ Added ingredients column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "instructions" json DEFAULT '[]'::json`;
    console.log('✅ Added instructions column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "prep_time" varchar(50)`;
    console.log('✅ Added prep_time column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "cook_time" varchar(50)`;
    console.log('✅ Added cook_time column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "servings" varchar(20)`;
    console.log('✅ Added servings column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "image_url" varchar(512)`;
    console.log('✅ Added image_url column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "calories" varchar(20)`;
    console.log('✅ Added calories column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "dietary_info" varchar(100)`;
    console.log('✅ Added dietary_info column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "tags" json DEFAULT '[]'::json`;
    console.log('✅ Added tags column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "cuisine" varchar(100)`;
    console.log('✅ Added cuisine column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "meal_type" varchar(50)`;
    console.log('✅ Added meal_type column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "flavor_profile" varchar(50)`;
    console.log('✅ Added flavor_profile column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "is_personalized" boolean DEFAULT false`;
    console.log('✅ Added is_personalized column');
    
    await client`ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "personalized_reason" varchar(256)`;
    console.log('✅ Added personalized_reason column');
    
    console.log('🎉 Migration 0004 completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();