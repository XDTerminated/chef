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

const sampleRecipes = [
  // Italian Recipes
  {
    title: "Classic Spaghetti Carbonara",
    description: "A traditional Italian pasta dish with eggs, cheese, and pancetta",
    ingredients: ["400g spaghetti", "200g pancetta", "4 large eggs", "100g Pecorino Romano cheese", "Black pepper", "Salt"],
    instructions: [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions",
      "Cut pancetta into small cubes and cook in a large pan until crispy",
      "In a bowl, whisk together eggs, grated cheese, and black pepper",
      "Drain pasta, reserving 1 cup of pasta water",
      "Add hot pasta to the pan with pancetta, remove from heat",
      "Quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce",
      "Serve immediately with extra cheese and black pepper"
    ],
    prepTime: "10 minutes",
    cookTime: "15 minutes",
    servings: "4",
    difficulty: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500",
    calories: "520",
    dietaryInfo: "Contains eggs, dairy",
    tags: ["Italian", "Pasta", "Comfort Food"],
    cuisine: "Italian",
    mealType: "Dinner",
    flavorProfile: "Savory"
  },
  {
    title: "Margherita Pizza",
    description: "Simple and delicious Neapolitan-style pizza with fresh ingredients",
    ingredients: ["500g pizza dough", "400g canned tomatoes", "250g fresh mozzarella", "Fresh basil leaves", "Extra virgin olive oil", "Salt"],
    instructions: [
      "Preheat oven to 500°F (260°C) with a pizza stone if available",
      "Roll out pizza dough on a floured surface",
      "Crush tomatoes and season with salt",
      "Spread tomato sauce on dough, leaving a border",
      "Tear mozzarella into pieces and distribute over sauce",
      "Drizzle with olive oil and bake for 10-12 minutes until crust is golden",
      "Remove from oven, add fresh basil leaves, and serve immediately"
    ],
    prepTime: "20 minutes",
    cookTime: "12 minutes",
    servings: "4",
    difficulty: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
    calories: "320",
    dietaryInfo: "Vegetarian",
    tags: ["Italian", "Pizza", "Vegetarian"],
    cuisine: "Italian",
    mealType: "Dinner",
    flavorProfile: "Savory"
  },

  // Mexican Recipes
  {
    title: "Chicken Tacos",
    description: "Flavorful Mexican chicken tacos with fresh toppings",
    ingredients: ["500g chicken breast", "2 tbsp taco seasoning", "8 corn tortillas", "1 avocado", "1 tomato", "1/2 red onion", "Fresh cilantro", "Lime", "Sour cream"],
    instructions: [
      "Cut chicken into small pieces and season with taco seasoning",
      "Cook chicken in a pan over medium heat until cooked through",
      "Warm tortillas in a dry pan or microwave",
      "Dice avocado, tomato, and red onion",
      "Assemble tacos with chicken, vegetables, and cilantro",
      "Serve with lime wedges and sour cream"
    ],
    prepTime: "15 minutes",
    cookTime: "10 minutes",
    servings: "4",
    difficulty: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500",
    calories: "380",
    dietaryInfo: "Gluten-free option",
    tags: ["Mexican", "Tacos", "Quick"],
    cuisine: "Mexican",
    mealType: "Dinner",
    flavorProfile: "Spicy"
  },
  {
    title: "Guacamole",
    description: "Fresh and creamy Mexican guacamole dip",
    ingredients: ["3 ripe avocados", "1 lime", "1/2 red onion", "2 tomatoes", "1 jalapeño", "Fresh cilantro", "Salt", "Garlic powder"],
    instructions: [
      "Cut avocados in half and remove pits",
      "Scoop avocado flesh into a bowl and mash with a fork",
      "Dice red onion, tomatoes, and jalapeño",
      "Add vegetables to mashed avocado",
      "Squeeze lime juice over mixture",
      "Add chopped cilantro, salt, and garlic powder",
      "Mix gently and serve immediately"
    ],
    prepTime: "10 minutes",
    cookTime: "0 minutes",
    servings: "6",
    difficulty: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=500",
    calories: "160",
    dietaryInfo: "Vegan, Gluten-free",
    tags: ["Mexican", "Dip", "Vegan"],
    cuisine: "Mexican",
    mealType: "Appetizer",
    flavorProfile: "Fresh"
  },

  // Thai Recipes
  {
    title: "Pad Thai",
    description: "Classic Thai stir-fried noodles with shrimp and vegetables",
    ingredients: ["200g rice noodles", "200g shrimp", "2 eggs", "100g bean sprouts", "3 spring onions", "2 tbsp fish sauce", "2 tbsp tamarind paste", "1 tbsp sugar", "Crushed peanuts", "Lime"],
    instructions: [
      "Soak rice noodles in warm water for 20 minutes",
      "Heat oil in a wok or large pan",
      "Add shrimp and cook until pink, then push to one side",
      "Crack eggs into the pan and scramble",
      "Add drained noodles and stir-fry for 2 minutes",
      "Add fish sauce, tamarind paste, and sugar",
      "Add bean sprouts and spring onions, stir-fry for 1 minute",
      "Serve with crushed peanuts and lime wedges"
    ],
    prepTime: "25 minutes",
    cookTime: "10 minutes",
    servings: "2",
    difficulty: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1559314809-0f31657f673f?w=500",
    calories: "450",
    dietaryInfo: "Contains shellfish, eggs",
    tags: ["Thai", "Noodles", "Stir-fry"],
    cuisine: "Thai",
    mealType: "Dinner",
    flavorProfile: "Spicy"
  },

  // Vegetarian Recipes
  {
    title: "Vegetarian Buddha Bowl",
    description: "Nutritious and colorful bowl with quinoa, roasted vegetables, and tahini dressing",
    ingredients: ["1 cup quinoa", "1 sweet potato", "1 bell pepper", "1 zucchini", "1 can chickpeas", "2 cups spinach", "2 tbsp tahini", "1 lemon", "Olive oil", "Salt", "Cumin"],
    instructions: [
      "Cook quinoa according to package directions",
      "Preheat oven to 400°F (200°C)",
      "Cut vegetables into bite-sized pieces",
      "Toss vegetables with olive oil, salt, and cumin",
      "Roast vegetables for 25-30 minutes until tender",
      "Drain and rinse chickpeas",
      "Make tahini dressing by mixing tahini, lemon juice, and water",
      "Assemble bowls with quinoa, vegetables, chickpeas, and spinach",
      "Drizzle with tahini dressing"
    ],
    prepTime: "15 minutes",
    cookTime: "30 minutes",
    servings: "4",
    difficulty: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    calories: "420",
    dietaryInfo: "Vegan, Gluten-free",
    tags: ["Vegetarian", "Healthy", "Bowl"],
    cuisine: "Mediterranean",
    mealType: "Lunch",
    flavorProfile: "Fresh"
  },

  // Quick & Easy Recipes
  {
    title: "5-Minute Avocado Toast",
    description: "Simple and satisfying breakfast or snack",
    ingredients: ["2 slices whole grain bread", "1 ripe avocado", "1 lime", "Salt", "Red pepper flakes", "Everything bagel seasoning"],
    instructions: [
      "Toast bread slices until golden",
      "Cut avocado in half and remove pit",
      "Mash avocado with lime juice and salt",
      "Spread mashed avocado on toast",
      "Sprinkle with red pepper flakes and everything seasoning",
      "Serve immediately"
    ],
    prepTime: "5 minutes",
    cookTime: "2 minutes",
    servings: "1",
    difficulty: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500",
    calories: "280",
    dietaryInfo: "Vegetarian, Vegan option",
    tags: ["Quick", "Breakfast", "Healthy"],
    cuisine: "American",
    mealType: "Breakfast",
    flavorProfile: "Fresh"
  }
];

async function seedRecipes() {
  try {
    console.log('🌱 Seeding database with sample recipes...');
    
    // Clear existing recipes
    await client`DELETE FROM "recipes"`;
    console.log('✅ Cleared existing recipes');
    
    // Insert sample recipes
    for (const recipe of sampleRecipes) {
      await client`
        INSERT INTO "recipes" (
          "title", "description", "ingredients", "instructions", "prep_time", "cook_time",
          "servings", "difficulty", "image_url", "calories", "dietary_info", "tags",
          "cuisine", "meal_type", "flavor_profile", "is_personalized"
        ) VALUES (
          ${recipe.title}, ${recipe.description}, ${JSON.stringify(recipe.ingredients)}::json, ${JSON.stringify(recipe.instructions)}::json,
          ${recipe.prepTime}, ${recipe.cookTime}, ${recipe.servings}, ${recipe.difficulty},
          ${recipe.imageUrl}, ${recipe.calories}, ${recipe.dietaryInfo}, ${JSON.stringify(recipe.tags)}::json,
          ${recipe.cuisine}, ${recipe.mealType}, ${recipe.flavorProfile}, false
        )
      `;
    }
    
    console.log(`✅ Inserted ${sampleRecipes.length} sample recipes`);
    console.log('🎉 Recipe seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Recipe seeding failed:', error);
  } finally {
    await client.end();
  }
}

seedRecipes();