const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await client`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful!');
    console.log('Current time:', result[0].current_time);
    
    // Test users table structure
    const tableInfo = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Users table structure:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await client.end();
  }
}

testDatabase();