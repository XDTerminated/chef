const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('Checking database schema...');
    
    // Check users table structure
    const userColumns = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Users table columns:');
    userColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check recipes table structure
    const recipeColumns = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'recipes' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Recipes table columns:');
    recipeColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await client.end();
  }
}

checkSchema();