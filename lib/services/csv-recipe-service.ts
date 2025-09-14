import recipesData from '../data/recipes.json';
import { userOperations } from "../db/operations";

interface CSVRecipe {
    Title: string;
    Ingredients: string;
    Instructions: string;
    Image_Name: string;
    Cleaned_Ingredients: string;
}

interface ProcessedRecipe {
    id: string;
    title: string;
    description: string;
    prepTime: string;
    cookTime: string;
    servings: number;
    difficulty: string;
    image: string;
    images: string[];
    ingredients: string[];
    instructions: string[];
    nutrition: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
    };
    tags: string[];
    cuisine: string;
    rating: number;
    reviews: number;
    rawIngredients: string;
    rawInstructions: string;
}

class CSVRecipeService {
    private recipes: ProcessedRecipe[] = [];
    private initialized = false;
    private csvContent: string | null = null;

    constructor() {
        this.initializeRecipes();
    }

    private async initializeRecipes(): Promise<void> {
        if (this.initialized) return;

        try {
            console.log("🍳 Loading recipes from JSON data...");
            
            // Load recipes directly from the converted JSON
            const csvRecipes = recipesData as CSVRecipe[];
            
            this.recipes = csvRecipes.map((recipe, index) => {
                const ingredients = this.parseIngredients(recipe.Ingredients);
                const instructions = this.parseInstructions(recipe.Instructions);
                const cuisine = this.detectCuisine(recipe.Title, ingredients);
                const difficulty = this.determineDifficulty(ingredients, instructions);
                
                // Use the actual image from the CSV data
                const imagePath = recipe.Image_Name ? 
                    `../../../data/food/food/${recipe.Image_Name}.jpg` : 
                    require('../../assets/images/chef-logo.png');
                
                return {
                    id: `csv-${index}`,
                    title: recipe.Title || `Recipe ${index + 1}`,
                    description: this.generateDescription(recipe.Title, ingredients),
                    prepTime: this.estimatePrepTime(ingredients.length),
                    cookTime: this.estimateCookTime(instructions.length),
                    servings: this.estimateServings(ingredients),
                    difficulty,
                    image: imagePath,
                    images: [imagePath],
                    ingredients,
                    instructions,
                    nutrition: this.estimateNutrition(ingredients),
                    tags: this.generateTags(recipe.Title, ingredients, cuisine),
                    cuisine,
                    rating: Math.round((Math.random() * 2 + 3.5) * 10) / 10, // 3.5-5.0
                    reviews: Math.floor(Math.random() * 500) + 50,
                    rawIngredients: recipe.Ingredients,
                    rawInstructions: recipe.Instructions
                };
            }).filter(recipe => recipe.title && recipe.ingredients.length > 0);

            this.initialized = true;
            console.log(`✅ Loaded ${this.recipes.length} recipes from JSON data`);
        } catch (error) {
            console.error("❌ Error loading recipes:", error);
            // Fallback to empty array
            this.recipes = [];
            this.initialized = true;
        }
    }

    private parseIngredients(ingredientsStr: string): string[] {
        try {
            // Handle the array-like string format from CSV
            if (ingredientsStr.startsWith('[') && ingredientsStr.endsWith(']')) {
                // Remove brackets and split by comma, then clean up
                const cleaned = ingredientsStr.slice(1, -1);
                return cleaned.split("', '")
                    .map(ing => ing.replace(/^['"]|['"]$/g, '').trim())
                    .filter(ing => ing.length > 0);
            }
            // If it's a simple comma-separated string
            return ingredientsStr.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
        } catch {
            return [ingredientsStr]; // Fallback to original string
        }
    }

    private parseInstructions(instructionsStr: string): string[] {
        if (!instructionsStr) return [];
        
        // Split by periods or line breaks and filter meaningful sentences
        return instructionsStr
            .split(/\. |\n/)
            .map(inst => inst.trim())
            .filter(inst => inst.length > 10) // Only keep substantial instructions
            .map(inst => inst.endsWith('.') ? inst : inst + '.');
    }

    private detectCuisine(title: string, ingredients: string[]): string {
        const titleLower = title.toLowerCase();
        const ingredientsStr = ingredients.join(' ').toLowerCase();
        
        const cuisineKeywords = {
            'Italian': ['pasta', 'pizza', 'parmesan', 'basil', 'oregano', 'mozzarella', 'prosciutto'],
            'Asian': ['soy sauce', 'sesame', 'ginger', 'garlic', 'rice', 'noodles', 'bok choy'],
            'Mexican': ['tortilla', 'avocado', 'lime', 'cilantro', 'pepper', 'salsa', 'cumin'],
            'French': ['wine', 'butter', 'cream', 'herbs', 'bourguignon', 'confit'],
            'Indian': ['curry', 'turmeric', 'garam masala', 'cumin', 'coriander', 'ginger'],
            'Mediterranean': ['olive oil', 'feta', 'olives', 'tomatoes', 'herbs', 'lemon'],
            'Thai': ['coconut milk', 'thai basil', 'lime', 'fish sauce', 'curry paste'],
            'American': ['bbq', 'burger', 'fries', 'bacon', 'cheese', 'chicken']
        };

        for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
            const matches = keywords.filter(keyword => 
                titleLower.includes(keyword) || ingredientsStr.includes(keyword)
            );
            if (matches.length >= 2) return cuisine;
        }

        return 'International';
    }

    private determineDifficulty(ingredients: string[], instructions: string[]): string {
        const score = ingredients.length + instructions.length;
        if (score < 8) return 'Easy';
        if (score < 15) return 'Medium';
        return 'Hard';
    }

    private generateDescription(title: string, ingredients: string[]): string {
        const mainIngredients = ingredients.slice(0, 3);
        return `Delicious ${title.toLowerCase()} featuring ${mainIngredients.join(', ')} and more.`;
    }

    private estimatePrepTime(ingredientCount: number): string {
        const minutes = Math.max(5, ingredientCount * 2);
        return `${minutes} mins`;
    }

    private estimateCookTime(instructionCount: number): string {
        const minutes = Math.max(10, instructionCount * 8);
        return `${minutes} mins`;
    }

    private estimateServings(ingredients: string[]): number {
        // Look for serving indicators in ingredients
        const servingKeywords = ingredients.join(' ').toLowerCase();
        if (servingKeywords.includes('lb') || servingKeywords.includes('pound')) return 6;
        if (servingKeywords.includes('cups') && servingKeywords.match(/\d+\s+cups/)) return 4;
        return 4; // Default
    }

    private estimateNutrition(ingredients: string[]): { calories: number; protein: string; carbs: string; fat: string } {
        // Basic estimation based on ingredients
        let calories = 200 + (ingredients.length * 50);
        calories = Math.min(800, Math.max(150, calories));
        
        return {
            calories,
            protein: `${Math.floor(calories * 0.15 / 4)}g`,
            carbs: `${Math.floor(calories * 0.5 / 4)}g`,
            fat: `${Math.floor(calories * 0.35 / 9)}g`
        };
    }

    private generateTags(title: string, ingredients: string[], cuisine: string): string[] {
        const tags = [cuisine.toLowerCase()];
        const titleLower = title.toLowerCase();
        const ingredientsStr = ingredients.join(' ').toLowerCase();

        // Add dietary tags
        if (ingredientsStr.includes('chicken') || ingredientsStr.includes('beef') || 
            ingredientsStr.includes('pork') || ingredientsStr.includes('fish')) {
            // Contains meat
        } else {
            tags.push('vegetarian');
        }

        if (!ingredientsStr.includes('dairy') && !ingredientsStr.includes('cheese') && 
            !ingredientsStr.includes('butter') && !ingredientsStr.includes('cream')) {
            tags.push('dairy-free');
        }

        // Add cooking method tags
        if (titleLower.includes('grilled') || ingredientsStr.includes('grill')) tags.push('grilled');
        if (titleLower.includes('roast') || titleLower.includes('baked')) tags.push('roasted');
        if (titleLower.includes('soup') || titleLower.includes('stew')) tags.push('comfort food');

        return tags;
    }

    private matchesUserPreferences(recipe: ProcessedRecipe, userPreferences: string[], dietaryRestrictions: string[]): boolean {
        // Check dietary restrictions (must match all)
        for (const restriction of dietaryRestrictions) {
            const restrictionLower = restriction.toLowerCase();
            
            // Check if recipe violates any dietary restrictions
            if (restrictionLower.includes('vegetarian')) {
                const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'seafood', 'meat'];
                const containsMeat = meatKeywords.some(keyword => 
                    recipe.rawIngredients.toLowerCase().includes(keyword) ||
                    recipe.title.toLowerCase().includes(keyword)
                );
                if (containsMeat) return false;
            }
            
            if (restrictionLower.includes('vegan')) {
                const animalProducts = ['chicken', 'beef', 'pork', 'fish', 'seafood', 'meat', 'cheese', 'butter', 'cream', 'milk', 'egg'];
                const containsAnimalProducts = animalProducts.some(keyword => 
                    recipe.rawIngredients.toLowerCase().includes(keyword)
                );
                if (containsAnimalProducts) return false;
            }
            
            if (restrictionLower.includes('dairy-free')) {
                const dairyKeywords = ['cheese', 'butter', 'cream', 'milk', 'yogurt'];
                const containsDairy = dairyKeywords.some(keyword => 
                    recipe.rawIngredients.toLowerCase().includes(keyword)
                );
                if (containsDairy) return false;
            }
            
            if (restrictionLower.includes('gluten-free')) {
                const glutenKeywords = ['wheat', 'flour', 'bread', 'pasta', 'noodles'];
                const containsGluten = glutenKeywords.some(keyword => 
                    recipe.rawIngredients.toLowerCase().includes(keyword) ||
                    recipe.title.toLowerCase().includes(keyword)
                );
                if (containsGluten) return false;
            }
        }

        // Check cuisine preferences (at least one should match)
        if (userPreferences.length === 0) return true;
        
        return userPreferences.some(preference => {
            const prefLower = preference.toLowerCase();
            return recipe.cuisine.toLowerCase().includes(prefLower) ||
                   recipe.title.toLowerCase().includes(prefLower) ||
                   recipe.tags.some(tag => tag.toLowerCase().includes(prefLower));
        });
    }

    public async getForYouRecipes(userId: string, count: number = 10, offset: number = 0): Promise<ProcessedRecipe[]> {
        await this.initializeRecipes();

        try {
            console.log(`🍳 Getting personalized recipes for user ${userId}`);
            
            // Get user preferences from database
            const userData = await userOperations.getUserByClerkId(userId);
            if (!userData) {
                console.log("No user data found, returning random recipes");
                return this.getRandomRecipes(count);
            }

            const userPreferences = userData.preferences || [];
            const dietaryRestrictions = userData.dietaryRestrictions || [];
            
            console.log("User preferences:", userPreferences);
            console.log("Dietary restrictions:", dietaryRestrictions);

            // Get filtered recipes based on user preferences
            let filteredRecipes = this.recipes.filter(recipe => 
                this.matchesUserPreferences(recipe, userPreferences, dietaryRestrictions)
            );

            console.log(`Found ${filteredRecipes.length} recipes matching preferences`);

            // If no matches, fall back to all recipes
            if (filteredRecipes.length === 0) {
                filteredRecipes = this.recipes;
                console.log("No preference matches, using all recipes");
            }

            // Shuffle and return requested count with offset
            const shuffled = [...filteredRecipes].sort(() => Math.random() - 0.5);
            const result = shuffled.slice(offset, offset + count);
            
            console.log(`Returning ${result.length} personalized recipes`);
            return result;
        } catch (error) {
            console.error("Error getting personalized recipes:", error);
            return this.getRandomRecipes(count);
        }
    }

    private getRandomRecipes(count: number): ProcessedRecipe[] {
        const shuffled = [...this.recipes].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    public async searchRecipes(query: string, count: number = 10): Promise<ProcessedRecipe[]> {
        await this.initializeRecipes();

        const queryLower = query.toLowerCase();
        const results = this.recipes.filter(recipe => 
            recipe.title.toLowerCase().includes(queryLower) ||
            recipe.cuisine.toLowerCase().includes(queryLower) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(queryLower)) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(queryLower))
        );

        return results.slice(0, count);
    }

    public async getRecipeById(id: string): Promise<ProcessedRecipe | null> {
        await this.initializeRecipes();
        return this.recipes.find(recipe => recipe.id === id) || null;
    }

    public async getRecipesByCategory(category: string, count: number = 10): Promise<ProcessedRecipe[]> {
        await this.initializeRecipes();

        const categoryLower = category.toLowerCase();
        const results = this.recipes.filter(recipe => 
            recipe.cuisine.toLowerCase() === categoryLower ||
            recipe.tags.some(tag => tag.toLowerCase() === categoryLower)
        );

        return results.slice(0, count);
    }
}

export const csvRecipeService = new CSVRecipeService();
