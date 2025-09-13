const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function checkAllUsers() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('📊 All users in your Neon database:');
    
    const allUsers = await client`SELECT * FROM "users" ORDER BY "created_at" DESC;`;
    
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.id}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Clerk ID: ${user.clerk_id}`);
      console.log(`   Preferences: ${JSON.stringify(user.preferences)}`);
      console.log(`   Dietary Restrictions: ${JSON.stringify(user.dietary_restrictions)}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Updated: ${user.updated_at}`);
    });
    
    console.log(`\n📈 Total users: ${allUsers.length}`);
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await client.end();
  }
}

checkAllUsers();