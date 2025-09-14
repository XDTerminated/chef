const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function insertRealUser() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('Inserting your real user data into Neon...');
    
    // Your actual user data from the app logs
    const realUser = await client`
      INSERT INTO "users" (
        "clerk_id", 
        "email", 
        "first_name", 
        "last_name", 
        "preferences", 
        "dietary_restrictions", 
        "image_url"
      ) VALUES (
        'user_32elj9lcE5trZp9TJtWY1RuXHa9',
        'shivenpatel101@gmail.com',
        'Shiven',
        'Kk',
        '["American", "Chinese"]'::json,
        '["Dairy Free"]'::json,
        'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMmVsajlSaGgybUhSSDZ4UENtanlpZDlKdnIifQ'
      ) RETURNING *;
    `;
    
    console.log('✅ Your real user data inserted:', {
      id: realUser[0].id,
      email: realUser[0].email,
      name: `${realUser[0].first_name} ${realUser[0].last_name}`,
      clerkId: realUser[0].clerk_id,
      preferences: realUser[0].preferences,
      dietaryRestrictions: realUser[0].dietary_restrictions
    });
    
    // Check all users in database
    const allUsers = await client`SELECT * FROM "users" ORDER BY "id";`;
    
    console.log('\n📊 All users in your Neon database:');
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id} | ${user.first_name} ${user.last_name} | ${user.email}`);
      console.log(`    Clerk ID: ${user.clerk_id}`);
      console.log(`    Preferences: ${JSON.stringify(user.preferences)}`);
      console.log(`    Dietary: ${JSON.stringify(user.dietary_restrictions)}`);
      console.log(`    Created: ${user.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️  User already exists in database (duplicate clerk_id)');
      console.log('Updating existing user instead...');
      
      // Update existing user
      const updatedUser = await client`
        UPDATE "users" 
        SET 
          "first_name" = 'Shiven',
          "last_name" = 'Kk',
          "preferences" = '["American", "Chinese"]'::json,
          "dietary_restrictions" = '["Dairy Free"]'::json,
          "image_url" = 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMmVsajlSaGgybUhSSDZ4UENtanlpZDlKdnIifQ',
          "updated_at" = NOW()
        WHERE "clerk_id" = 'user_32elj9lcE5trZp9TJtWY1RuXHa9'
        RETURNING *;
      `;
      
      console.log('✅ Your user data updated:', {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        name: `${updatedUser[0].first_name} ${updatedUser[0].last_name}`,
        preferences: updatedUser[0].preferences,
        dietaryRestrictions: updatedUser[0].dietary_restrictions
      });
    } else {
      console.error('❌ Error inserting user data:', error);
    }
  } finally {
    await client.end();
  }
}

insertRealUser();