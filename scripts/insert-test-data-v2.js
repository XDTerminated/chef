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
    
    // Insert a test user with proper clerk_id
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
        'test_user_456',
        'testuser@example.com',
        'Test',
        'User',
        '["Italian", "Mexican"]'::json,
        '["Vegetarian", "Gluten Free"]'::json,
        'https://example.com/avatar.jpg'
      ) RETURNING *;
    `;
    
    console.log('✅ Test user created:', {
      id: testUser[0].id,
      email: testUser[0].email,
      name: `${testUser[0].first_name} ${testUser[0].last_name}`,
      clerkId: testUser[0].clerk_id
    });
    
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
        'Classic Italian pasta dish with eggs and pancetta',
        'Spaghetti, eggs, pancetta, parmesan cheese, black pepper, salt',
        '1. Cook pasta according to package directions. 2. Fry pancetta until crispy. 3. Beat eggs with parmesan and pepper. 4. Combine hot pasta with pancetta, then add egg mixture. 5. Serve immediately.',
        '20 minutes',
        'Medium',
        ${testUser[0].id}
      ) RETURNING *;
    `;
    
    console.log('✅ Test recipe created:', {
      id: testRecipe[0].id,
      title: testRecipe[0].title,
      difficulty: testRecipe[0].difficulty,
      cookingTime: testRecipe[0].cooking_time
    });
    
    // Insert another recipe
    const testRecipe2 = await client`
      INSERT INTO "recipes" (
        "title",
        "description", 
        "ingredients",
        "instructions",
        "cooking_time",
        "difficulty",
        "user_id"
      ) VALUES (
        'Chicken Tacos',
        'Delicious Mexican-style chicken tacos',
        'Chicken breast, taco seasoning, tortillas, lettuce, tomato, cheese, sour cream',
        '1. Season and cook chicken. 2. Warm tortillas. 3. Shred chicken. 4. Assemble tacos with toppings.',
        '25 minutes',
        'Easy',
        ${testUser[0].id}
      ) RETURNING *;
    `;
    
    console.log('✅ Second test recipe created:', {
      id: testRecipe2[0].id,
      title: testRecipe2[0].title,
      difficulty: testRecipe2[0].difficulty
    });
    
    // Check all data
    const users = await client`SELECT * FROM "users" ORDER BY "id";`;
    const recipes = await client`SELECT * FROM "recipes" ORDER BY "id";`;
    
    console.log('\n📊 Final data in Neon:');
    console.log(`\n👥 Users (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id} | ${user.first_name} ${user.last_name} | ${user.email} | Clerk: ${user.clerk_id}`);
      console.log(`    Preferences: ${JSON.stringify(user.preferences)}`);
      console.log(`    Dietary: ${JSON.stringify(user.dietary_restrictions)}`);
    });
    
    console.log(`\n🍳 Recipes (${recipes.length}):`);
    recipes.forEach(recipe => {
      console.log(`  - ID: ${recipe.id} | ${recipe.title} | ${recipe.difficulty} | ${recipe.cooking_time}`);
    });
    
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  } finally {
    await client.end();
  }
}

insertTestData();