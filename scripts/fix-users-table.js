const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function fixUsersTable() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('Fixing users table...');
    
    // Add missing clerk_id column
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_id" VARCHAR(256) UNIQUE;`;
    console.log('✅ Added clerk_id column');
    
    // Add missing image_url column
    await client`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image_url" VARCHAR(512);`;
    console.log('✅ Added image_url column');
    
    // Make clerk_id NOT NULL after adding it
    await client`ALTER TABLE "users" ALTER COLUMN "clerk_id" SET NOT NULL;`;
    console.log('✅ Made clerk_id NOT NULL');
    
    // Check final schema
    const userColumns = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Updated users table columns:');
    userColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error);
  } finally {
    await client.end();
  }
}

fixUsersTable();