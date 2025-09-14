// Comprehensive ingredients list organized by categories
export const INGREDIENT_CATEGORIES = {
  vegetables: [
    'Tomatoes', 'Onions', 'Garlic', 'Bell Peppers', 'Carrots', 'Potatoes', 'Broccoli', 
    'Spinach', 'Lettuce', 'Cucumber', 'Zucchini', 'Eggplant', 'Mushrooms', 'Corn',
    'Green Beans', 'Asparagus', 'Cauliflower', 'Cabbage', 'Celery', 'Radish'
  ],
  proteins: [
    'Chicken Breast', 'Ground Beef', 'Salmon', 'Shrimp', 'Tofu', 'Eggs', 'Turkey',
    'Pork Chops', 'Lamb', 'Crab', 'Lobster', 'Duck', 'Bacon', 'Sausage', 'Ham',
    'Tempeh', 'Seitan', 'Chickpeas', 'Black Beans', 'Lentils'
  ],
  grains: [
    'Rice', 'Pasta', 'Bread', 'Quinoa', 'Oats', 'Barley', 'Wheat Flour', 'Cornmeal',
    'Buckwheat', 'Millet', 'Rye', 'Spelt', 'Couscous', 'Bulgur', 'Farro', 'Polenta',
    'Tortillas', 'Noodles', 'Crackers', 'Cereal'
  ],
  dairy: [
    'Milk', 'Cheese', 'Butter', 'Yogurt', 'Cream', 'Sour Cream', 'Cottage Cheese',
    'Ricotta', 'Mozzarella', 'Cheddar', 'Parmesan', 'Feta', 'Goat Cheese', 'Brie',
    'Cream Cheese', 'Buttermilk', 'Heavy Cream', 'Half and Half', 'Greek Yogurt', 'Kefir'
  ],
  herbs_spices: [
    'Basil', 'Oregano', 'Thyme', 'Rosemary', 'Parsley', 'Cilantro', 'Dill', 'Mint',
    'Sage', 'Bay Leaves', 'Black Pepper', 'Salt', 'Paprika', 'Cumin', 'Coriander',
    'Turmeric', 'Ginger', 'Cinnamon', 'Nutmeg', 'Vanilla'
  ],
  fruits: [
    'Apples', 'Bananas', 'Oranges', 'Lemons', 'Limes', 'Strawberries', 'Blueberries',
    'Grapes', 'Peaches', 'Pears', 'Pineapple', 'Mango', 'Avocado', 'Coconut',
    'Cherries', 'Raspberries', 'Blackberries', 'Kiwi', 'Watermelon', 'Cantaloupe'
  ],
  nuts_seeds: [
    'Almonds', 'Walnuts', 'Pecans', 'Cashews', 'Pistachios', 'Hazelnuts', 'Pine Nuts',
    'Peanuts', 'Sunflower Seeds', 'Pumpkin Seeds', 'Chia Seeds', 'Flax Seeds',
    'Sesame Seeds', 'Poppy Seeds', 'Macadamia Nuts', 'Brazil Nuts', 'Hemp Seeds',
    'Tahini', 'Almond Butter', 'Peanut Butter'
  ],
  oils_vinegars: [
    'Olive Oil', 'Vegetable Oil', 'Coconut Oil', 'Sesame Oil', 'Avocado Oil',
    'Balsamic Vinegar', 'White Vinegar', 'Apple Cider Vinegar', 'Red Wine Vinegar',
    'Rice Vinegar', 'Lemon Juice', 'Lime Juice', 'Soy Sauce', 'Worcestershire Sauce',
    'Hot Sauce', 'Mustard', 'Mayonnaise', 'Ketchup', 'Barbecue Sauce', 'Teriyaki Sauce'
  ],
  baking: [
    'All-Purpose Flour', 'Baking Powder', 'Baking Soda', 'Sugar', 'Brown Sugar',
    'Powdered Sugar', 'Honey', 'Maple Syrup', 'Molasses', 'Cocoa Powder',
    'Chocolate Chips', 'Vanilla Extract', 'Almond Extract', 'Yeast', 'Cornstarch',
    'Coconut Flour', 'Almond Flour', 'Oat Flour', 'Cake Flour', 'Bread Flour'
  ],
  canned_preserved: [
    'Canned Tomatoes', 'Tomato Paste', 'Coconut Milk', 'Beans (Canned)', 'Corn (Canned)',
    'Tuna', 'Salmon (Canned)', 'Olives', 'Pickles', 'Artichoke Hearts', 'Sun-Dried Tomatoes',
    'Capers', 'Anchovies', 'Sardines', 'Chicken Broth', 'Beef Broth', 'Vegetable Broth',
    'Coconut Cream', 'Pumpkin Puree', 'Chipotle Peppers', 'Roasted Red Peppers'
  ]
};

// Popular cuisines
export const CUISINES = [
  'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai', 'French', 'Mediterranean',
  'American', 'Korean', 'Vietnamese', 'Greek', 'Spanish', 'Middle Eastern', 'German',
  'British', 'Brazilian', 'Caribbean', 'Ethiopian', 'Moroccan', 'Peruvian', 'Turkish',
  'Lebanese', 'Russian', 'Polish', 'Hungarian', 'Cajun', 'Soul Food', 'Tex-Mex', 'Fusion'
];

// Dietary restrictions and preferences
export const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Paleo',
  'Low-Carb', 'High-Protein', 'Low-Sodium', 'Diabetic-Friendly', 'Heart-Healthy',
  'Mediterranean Diet', 'Whole30', 'Raw Food', 'Pescatarian', 'Flexitarian',
  'Halal', 'Kosher', 'Low-FODMAP', 'Anti-Inflammatory', 'Macrobiotic'
];

// Cooking skill levels
export const SKILL_LEVELS = [
  'Beginner', 'Intermediate', 'Advanced', 'Professional'
];

// Cooking time preferences
export const TIME_PREFERENCES = [
  'Quick (15-30 min)', 'Medium (30-60 min)', 'Long (1+ hours)', 'Any'
];

// Meal types
export const MEAL_TYPES = [
  'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Appetizers', 'Beverages'
];

// Flavor profiles
export const FLAVOR_PROFILES = [
  'Sweet', 'Savory', 'Spicy', 'Mild', 'Tangy', 'Bitter', 'Umami', 'Smoky', 'Fresh', 'Rich'
];

// Export all ingredients as a flat array for easy searching
export const ALL_INGREDIENTS = Object.values(INGREDIENT_CATEGORIES).flat();

// Helper function to get ingredients by category
export const getIngredientsByCategory = (category: keyof typeof INGREDIENT_CATEGORIES) => {
  return INGREDIENT_CATEGORIES[category] || [];
};

// Helper function to search ingredients
export const searchIngredients = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return ALL_INGREDIENTS.filter(ingredient => 
    ingredient.toLowerCase().includes(lowercaseQuery)
  );
};