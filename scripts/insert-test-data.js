const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function insertTestData() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  
  try {
    console.log('Inserting test data into Neon...');
    
    // Insert a test user
    const testUser = await client`
      INSERT INTO "users" (
        "clerk_id", 
        "email", 
        "first_name", 
        "last_name", 
        "preferences", 
        "dietary_restrictions", 
        "image_url"
      ) VALUES (
        'test_user_123',
        'test@example.com',
        'Test',
        'User',
        '["Italian", "Mexican"]'::json,
        '["Vegetarian", "Gluten Free"]'::json,
        'https://example.com/avatar.jpg'
      ) RETURNING *;
    `;
    
    console.log('✅ Test user created:', testUser[0]);
    
    // Insert a test recipe
    const testRecipe = await client`
      INSERT INTO "recipes" (
        "title",
        "description", 
        "ingredients",
        "instructions",
        "cooking_time",
        "difficulty",
        "user_id"
      ) VALUES (
        'Spaghetti Carbonara',
        'Classic Italian pasta dish',
        'Spaghetti, eggs, pancetta, parmesan, black pepper',
        '1. Cook pasta 2. Fry pancetta 3. Mix eggs and cheese 4. Combine everything',
        '20 minutes',
        'Medium',
        ${testUser[0].id}
      ) RETURNING *;
    `;
    
    console.log('✅ Test recipe created:', testRecipe[0]);
    
    // Check all data
    const users = await client`SELECT * FROM "users";`;
    const recipes = await client`SELECT * FROM "recipes";`;
    
    console.log('\n📊 Current data in Neon:');
    console.log(`Users: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
    });
    
    console.log(`Recipes: ${recipes.length}`);
    recipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (${recipe.difficulty})`);
    });
    
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  } finally {
    await client.end();
  }
}

insertTestData();