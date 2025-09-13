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
    
    // First, let's see what data exists
    const existingUsers = await client`SELECT * FROM "users";`;
    console.log(`Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length > 0) {
      // Update existing users with placeholder clerk_id
      for (let i = 0; i < existingUsers.length; i++) {
        const userId = existingUsers[i].id;
        const placeholderClerkId = `placeholder_${userId}_${Date.now()}`;
        
        await client`
          UPDATE "users" 
          SET "clerk_id" = ${placeholderClerkId}
          WHERE "id" = ${userId}
        `;
        console.log(`✅ Updated user ${userId} with placeholder clerk_id`);
      }
    }
    
    // Now make clerk_id NOT NULL
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
    
    // Show current data
    const finalUsers = await client`SELECT * FROM "users";`;
    console.log('\n📊 Current users in database:');
    finalUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Clerk ID: ${user.clerk_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error);
  } finally {
    await client.end();
  }
}

fixUsersTable();