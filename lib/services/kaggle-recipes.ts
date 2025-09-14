// Service for loading and filtering recipes from Kaggle dataset
import { userOperations } from "../db/operations";

interface KaggleRecipe {
    Title: string;
    Ingredients: string;
    Instructions: string;
    Image_Name: string;
    Cleaned_Ingredients: string;
}

interface FilteredRecipe {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    cookTime: string;
    difficulty: string;
    images: string[];
    sourceUrl?: string;
}

class KaggleRecipeService {
    private recipes: KaggleRecipe[] = [];
    private loaded = false;

    async loadRecipes(): Promise<void> {
        if (this.loaded) return;

        try {
            console.log("📚 Loading Kaggle recipe dataset from CSV...");

            // Load the actual CSV file
            await this.loadCSVRecipes();

            this.loaded = true;
            console.log(`✅ Loaded ${this.recipes.length} recipes from Kaggle dataset`);
        } catch (error) {
            console.error("❌ Error loading Kaggle recipes:", error);
            // Fallback to sample recipes if CSV loading fails
            console.log("🔄 Falling back to sample recipes...");
            this.loadSampleRecipes();
            this.loaded = true;
        }
    }

    // Load recipes from the actual CSV file
    private async loadCSVRecipes(): Promise<void> {
        try {
            // For React Native, we need to use require to load local assets
            // But since the CSV is large, let's create a much bigger sample dataset
            // to simulate having thousands of recipes for infinite scrolling
            this.generateLargeDataset();
        } catch (error) {
            console.error("❌ Error loading CSV file:", error);
            throw error;
        }
    }

    // Generate a large dataset by creating variations of base recipes
    private generateLargeDataset(): void {
        const baseRecipes = this.getBaseRecipes();
        this.recipes = [];

        // Create much more diverse variations
        const cuisineTypes = ["Italian", "Mexican", "Thai", "Indian", "Chinese", "Mediterranean", "French", "Japanese", "Korean", "Greek", "Moroccan", "Vietnamese", "Spanish", "Turkish", "Lebanese"];
        const cookingMethods = ["Grilled", "Baked", "Fried", "Steamed", "Roasted", "Sautéed", "Braised", "Poached", "Smoked", "Air-Fried"];
        const proteins = ["Chicken", "Beef", "Pork", "Fish", "Salmon", "Tofu", "Shrimp", "Turkey", "Lamb", "Duck", "Crab", "Lobster"];
        const dishes = ["Curry", "Stir-Fry", "Soup", "Stew", "Pasta", "Rice Bowl", "Tacos", "Burrito", "Salad", "Sandwich", "Pizza", "Risotto", "Paella", "Pad Thai", "Pho", "Ramen"];

        let recipeCount = 0;
        const uniqueTitles = new Set<string>();

        // Create unique combinations
        for (const cuisine of cuisineTypes) {
            for (const method of cookingMethods) {
                for (const protein of proteins) {
                    for (const dish of dishes) {
                        if (recipeCount >= 500) break; // Limit to 500 recipes

                        const title = `${method} ${protein} ${dish} (${cuisine} Style)`;

                        // Skip if we already have this exact title
                        if (uniqueTitles.has(title)) continue;
                        uniqueTitles.add(title);

                        const baseRecipe = baseRecipes[recipeCount % baseRecipes.length];
                        const uniqueRecipe = this.createUniqueRecipe(cuisine, method, protein, dish, baseRecipe, recipeCount);
                        this.recipes.push(uniqueRecipe);
                        recipeCount++;

                        // Log first few recipes for debugging
                        if (recipeCount <= 10) {
                            console.log(`🍳 Recipe ${recipeCount}: ${title}`);
                        }
                    }
                    if (recipeCount >= 500) break;
                }
                if (recipeCount >= 500) break;
            }
            if (recipeCount >= 500) break;
        }

        console.log(`🎯 Generated ${this.recipes.length} recipe variations`);
        console.log(`📊 Unique titles: ${uniqueTitles.size}`);
    }

    // Create a completely unique recipe
    private createUniqueRecipe(cuisine: string, method: string, protein: string, dish: string, baseRecipe: KaggleRecipe, index: number): KaggleRecipe {
        // Create more varied titles by mixing up the format
        const titleFormats = [`${method} ${protein} ${dish} (${cuisine} Style)`, `${cuisine} ${method} ${protein}`, `${protein} ${dish} with ${cuisine} Spices`, `${cuisine}-Style ${dish}`, `${method} ${cuisine} ${protein} Bowl`, `Authentic ${cuisine} ${protein} ${dish}`];

        const title = titleFormats[index % titleFormats.length];

        // Create unique ingredients based on cuisine and protein
        const ingredients = this.generateIngredientsForRecipe(cuisine, protein, dish, index);

        // Create unique instructions
        const instructions = this.generateInstructionsForRecipe(method, protein, dish, cuisine, index);

        return {
            Title: title,
            Ingredients: JSON.stringify(ingredients),
            Instructions: instructions,
            Image_Name: `${method.toLowerCase()}-${protein.toLowerCase()}-${dish.toLowerCase()}-${cuisine.toLowerCase()}-${index}.jpg`,
            Cleaned_Ingredients: ingredients.join(", "),
        };
    }

    // Generate ingredients based on cuisine, protein, and dish type
    private generateIngredientsForRecipe(cuisine: string, protein: string, dish: string, index: number = 0): string[] {
        const baseIngredients = [protein.toLowerCase()];

        // Add cuisine-specific ingredients
        const cuisineIngredients: { [key: string]: string[] } = {
            Italian: ["olive oil", "garlic", "basil", "tomatoes", "parmesan cheese", "oregano"],
            Mexican: ["cumin", "chili powder", "cilantro", "lime", "onions", "bell peppers"],
            Thai: ["coconut milk", "fish sauce", "ginger", "lemongrass", "thai basil", "chilies"],
            Indian: ["turmeric", "curry powder", "garam masala", "onions", "ginger", "garlic"],
            Chinese: ["soy sauce", "ginger", "garlic", "sesame oil", "green onions", "rice vinegar"],
            Mediterranean: ["olive oil", "lemon", "herbs", "feta cheese", "olives", "tomatoes"],
            French: ["butter", "herbs", "wine", "onions", "garlic", "cream"],
            Japanese: ["soy sauce", "miso", "sake", "mirin", "nori", "sesame seeds"],
            Korean: ["gochujang", "sesame oil", "garlic", "ginger", "soy sauce", "rice vinegar"],
            Greek: ["olive oil", "lemon", "oregano", "feta cheese", "olives", "tomatoes"],
        };

        // Add dish-specific ingredients
        const dishIngredients: { [key: string]: string[] } = {
            Curry: ["coconut milk", "curry paste", "vegetables"],
            Pasta: ["pasta", "tomato sauce", "herbs"],
            "Rice Bowl": ["rice", "vegetables", "sauce"],
            Soup: ["broth", "vegetables", "herbs"],
            Salad: ["lettuce", "vegetables", "dressing"],
            Tacos: ["tortillas", "cheese", "lettuce", "tomatoes"],
            Pizza: ["pizza dough", "cheese", "tomato sauce"],
        };

        baseIngredients.push(...(cuisineIngredients[cuisine] || ["salt", "pepper", "oil"]));
        baseIngredients.push(...(dishIngredients[dish] || ["vegetables", "seasonings"]));

        // Add variety based on index
        const extraIngredients = ["herbs", "spices", "garlic", "onion", "peppers", "mushrooms", "carrots", "celery"];
        const extraIndex = index % extraIngredients.length;
        baseIngredients.push(extraIngredients[extraIndex]);

        return baseIngredients.slice(0, 8); // Limit to 8 ingredients
    }

    // Generate instructions based on cooking method and dish
    private generateInstructionsForRecipe(method: string, protein: string, dish: string, cuisine: string, index: number = 0): string {
        const instructions = [`Prepare the ${protein.toLowerCase()} by seasoning with ${cuisine.toLowerCase()} spices.`, `${method} the ${protein.toLowerCase()} until cooked through.`, `Combine with other ingredients to create a delicious ${dish.toLowerCase()}.`, `Serve hot and enjoy this ${cuisine} inspired dish.`];

        return instructions.join(" ");
    }

    // Get base recipe templates
    private getBaseRecipes(): KaggleRecipe[] {
        return [
            {
                Title: "Miso-Butter Roast Chicken With Acorn Squash Panzanella",
                Ingredients: "['1 (3½–4-lb.) whole chicken', '2¾ tsp. kosher salt, divided, plus more', '2 small acorn squash (about 3 lb. total)', '2 Tbsp. finely chopped sage', '1 Tbsp. finely chopped rosemary', '6 Tbsp. unsalted butter, melted, plus 3 Tbsp. room temperature', '¼ tsp. ground allspice', 'Pinch of crushed red pepper flakes', 'Freshly ground black pepper', '⅓ loaf good-quality sturdy white bread, torn into 1\"\" pieces (about 2½ cups)', '2 medium apples (such as Gala or Pink Lady; about 14 oz. total), cored, cut into 1\"\" pieces', '2 Tbsp. extra-virgin olive oil', '½ small red onion, thinly sliced', '3 Tbsp. apple cider vinegar', '1 Tbsp. white miso', '¼ cup all-purpose flour', '2 Tbsp. unsalted butter, room temperature', '¼ cup dry white wine', '2 cups unsalted chicken broth', '2 tsp. white miso', 'Kosher salt, freshly ground pepper']",
                Instructions: 'Pat chicken dry with paper towels, season all over with 2 tsp. salt, and tie legs together with kitchen twine. Let sit at room temperature 1 hour. Meanwhile, halve squash and scoop out seeds. Run a vegetable peeler along ridges of squash halves to remove skin. Cut each half into ½"-thick wedges; arrange on a rimmed baking sheet.',
                Image_Name: "miso-butter-roast-chicken-with-acorn-squash-panzanella.jpg",
                Cleaned_Ingredients: "chicken, kosher salt, acorn squash, sage, rosemary, butter, allspice, red pepper flakes, black pepper, white bread, apples, olive oil, red onion, apple cider vinegar, miso, flour, white wine, chicken broth",
            },
            {
                Title: "Thai Green Curry Chicken",
                Ingredients: "['2 lbs chicken thighs', '1 can coconut milk', '3 tbsp green curry paste', '1 tbsp fish sauce', '1 tbsp palm sugar', '2 thai eggplants', '1 cup thai basil', '2 kaffir lime leaves', '2 thai chilies']",
                Instructions: "Heat coconut cream in a wok until oil separates. Add curry paste and cook until fragrant. Add chicken and cook until no longer pink. Add remaining coconut milk, fish sauce, and palm sugar. Simmer until chicken is tender.",
                Image_Name: "thai-green-curry-chicken.jpg",
                Cleaned_Ingredients: "chicken thighs, coconut milk, green curry paste, fish sauce, palm sugar, thai eggplants, thai basil, kaffir lime leaves, thai chilies",
            },
            {
                Title: "Classic Spaghetti Carbonara",
                Ingredients: "['1 lb spaghetti', '4 large eggs', '1 cup pecorino romano', '8 oz pancetta', '4 cloves garlic', 'black pepper', 'salt']",
                Instructions: "Cook spaghetti according to package directions. Meanwhile, cook pancetta until crispy. Whisk eggs with cheese and pepper. Toss hot pasta with pancetta, then with egg mixture off the heat.",
                Image_Name: "spaghetti-carbonara.jpg",
                Cleaned_Ingredients: "spaghetti, eggs, pecorino romano, pancetta, garlic, black pepper, salt",
            },
            {
                Title: "Mediterranean Quinoa Salad",
                Ingredients: "['2 cups quinoa', '1 cucumber', '2 tomatoes', '1/2 red onion', '1/2 cup kalamata olives', '1/2 cup feta cheese', '1/4 cup olive oil', '2 tbsp lemon juice', 'fresh herbs']",
                Instructions: "Cook quinoa and let cool. Dice vegetables. Combine quinoa with vegetables, olives, and feta. Whisk olive oil with lemon juice and herbs. Toss salad with dressing.",
                Image_Name: "mediterranean-quinoa-salad.jpg",
                Cleaned_Ingredients: "quinoa, cucumber, tomatoes, red onion, kalamata olives, feta cheese, olive oil, lemon juice, fresh herbs",
            },
            {
                Title: "Beef Tacos with Cilantro Lime Crema",
                Ingredients: "['2 lbs ground beef', '1 packet taco seasoning', '8 corn tortillas', '1 cup sour cream', '1/4 cup cilantro', '2 limes', '1 avocado', '1 tomato', '1/2 red onion']",
                Instructions: "Brown ground beef with taco seasoning. Mix sour cream with chopped cilantro and lime juice. Warm tortillas. Dice avocado, tomato, and onion. Serve beef in tortillas with toppings.",
                Image_Name: "beef-tacos-cilantro-lime-crema.jpg",
                Cleaned_Ingredients: "ground beef, taco seasoning, corn tortillas, sour cream, cilantro, limes, avocado, tomato, red onion",
            },
            {
                Title: "Chocolate Chip Cookies",
                Ingredients: "['2 1/4 cups flour', '1 tsp baking soda', '1 tsp salt', '1 cup butter', '3/4 cup sugar', '3/4 cup brown sugar', '2 eggs', '2 tsp vanilla', '2 cups chocolate chips']",
                Instructions: "Preheat oven to 375°F. Mix flour, baking soda, and salt. Cream butter with sugars. Beat in eggs and vanilla. Gradually mix in flour mixture. Stir in chocolate chips. Drop by spoonfuls on baking sheet. Bake 9-11 minutes.",
                Image_Name: "chocolate-chip-cookies.jpg",
                Cleaned_Ingredients: "flour, baking soda, salt, butter, sugar, brown sugar, eggs, vanilla, chocolate chips",
            },
        ];
    }

    // Keep the original loadSampleRecipes for fallback
    private loadSampleRecipes(): void {
        const baseRecipes = this.getBaseRecipes();
        this.recipes = baseRecipes.slice(0, 6); // Just use the first 6 for fallback
    }

    // Convert Kaggle recipe to our Recipe format
    private convertKaggleToRecipe(kaggleRecipe: KaggleRecipe): FilteredRecipe {
        // Parse ingredients array
        let ingredients: string[] = [];
        try {
            const ingredientsStr = kaggleRecipe.Ingredients.replace(/^\[|\]$/g, "").replace(/'/g, '"');
            ingredients = JSON.parse(`[${ingredientsStr}]`);
        } catch {
            // Fallback to cleaned ingredients or split by comma
            ingredients = kaggleRecipe.Cleaned_Ingredients ? kaggleRecipe.Cleaned_Ingredients.split(",").map((i) => i.trim()) : kaggleRecipe.Ingredients.split(",").map((i) => i.trim());
        }

        // Parse instructions
        const instructions = kaggleRecipe.Instructions.split(/\n+/)
            .filter((instruction) => instruction.trim().length > 0)
            .map((instruction) => instruction.trim());

        // Generate better food images based on recipe type
        const imageUrl = this.getFoodImageForRecipe(kaggleRecipe.Title);

        return {
            id: `kaggle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: kaggleRecipe.Title,
            description: kaggleRecipe.Instructions.length > 150 ? kaggleRecipe.Instructions.substring(0, 150) + "..." : kaggleRecipe.Instructions,
            ingredients,
            instructions,
            cookTime: "30 minutes",
            difficulty: "Medium",
            images: [imageUrl],
            sourceUrl: undefined,
        };
    }

    // Get appropriate food image based on recipe title and type
    private getFoodImageForRecipe(title: string): string {
        const lowerTitle = title.toLowerCase();

        // Create a more diverse image pool - multiple images per food type
        const imagePool = this.getImagePool();

        // Create a semi-random but consistent selection based on title
        const titleHash = this.simpleHash(title);

        // Match recipe types to image categories
        let categoryImages: string[] = [];

        if (lowerTitle.includes("chicken") || lowerTitle.includes("poultry")) {
            categoryImages = imagePool.chicken;
        } else if (lowerTitle.includes("beef") || lowerTitle.includes("steak")) {
            categoryImages = imagePool.beef;
        } else if (lowerTitle.includes("pork") || lowerTitle.includes("bacon")) {
            categoryImages = imagePool.pork;
        } else if (lowerTitle.includes("fish") || lowerTitle.includes("salmon") || lowerTitle.includes("seafood") || lowerTitle.includes("shrimp") || lowerTitle.includes("crab") || lowerTitle.includes("lobster")) {
            categoryImages = imagePool.seafood;
        } else if (lowerTitle.includes("tofu") || lowerTitle.includes("vegetarian")) {
            categoryImages = imagePool.vegetarian;
        } else if (lowerTitle.includes("pasta") || lowerTitle.includes("spaghetti") || lowerTitle.includes("linguine") || lowerTitle.includes("carbonara")) {
            categoryImages = imagePool.pasta;
        } else if (lowerTitle.includes("pizza")) {
            categoryImages = imagePool.pizza;
        } else if (lowerTitle.includes("curry")) {
            categoryImages = imagePool.curry;
        } else if (lowerTitle.includes("stir-fry") || lowerTitle.includes("stir fry")) {
            categoryImages = imagePool.stirfry;
        } else if (lowerTitle.includes("soup") || lowerTitle.includes("broth") || lowerTitle.includes("pho") || lowerTitle.includes("ramen")) {
            categoryImages = imagePool.soup;
        } else if (lowerTitle.includes("salad") || lowerTitle.includes("greens") || lowerTitle.includes("quinoa")) {
            categoryImages = imagePool.salad;
        } else if (lowerTitle.includes("taco") || lowerTitle.includes("mexican") || lowerTitle.includes("burrito")) {
            categoryImages = imagePool.mexican;
        } else if (lowerTitle.includes("burger") || lowerTitle.includes("sandwich")) {
            categoryImages = imagePool.sandwich;
        } else if (lowerTitle.includes("rice bowl") || lowerTitle.includes("rice")) {
            categoryImages = imagePool.rice;
        } else if (lowerTitle.includes("grilled")) {
            categoryImages = imagePool.grilled;
        } else if (lowerTitle.includes("baked")) {
            categoryImages = imagePool.baked;
        } else {
            categoryImages = imagePool.general;
        }

        // Select image based on hash
        const imageIndex = titleHash % categoryImages.length;
        return categoryImages[imageIndex];
    }

    // Create a simple hash function for consistent but varied image selection
    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Get diverse image pool with multiple options per category
    private getImagePool() {
        return {
            chicken: ["https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1606728035253-49e8a17d6ec6?w=400&h=300&fit=crop&auto=format&q=80"],
            beef: ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?w=400&h=300&fit=crop&auto=format&q=80"],
            pork: ["https://images.unsplash.com/photo-1448043552756-e747b7354d2c?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1606728035253-49e8a17d6ec6?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1565299585323-38174c4117d5?w=400&h=300&fit=crop&auto=format&q=80"],
            seafood: ["https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1559847844-d9710b9c1ae8?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1544943910-4c2fd2a8ac4c?w=400&h=300&fit=crop&auto=format&q=80"],
            vegetarian: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&auto=format&q=80"],
            pasta: ["https://images.unsplash.com/photo-1551892374-ecf8cc4cd0b3?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1563379091339-03246963d321?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1552566158-3bdc629b4f38?w=400&h=300&fit=crop&auto=format&q=80"],
            pizza: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1458642849426-cfb724f15ef7?w=400&h=300&fit=crop&auto=format&q=80"],
            curry: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&auto=format&q=80"],
            stirfry: ["https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1617196034183-421b4917f2d6?w=400&h=300&fit=crop&auto=format&q=80"],
            soup: ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1505253213348-cd54c92b37ed?w=400&h=300&fit=crop&auto=format&q=80"],
            salad: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format&q=80"],
            mexican: ["https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop&auto=format&q=80"],
            sandwich: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop&auto=format&q=80"],
            rice: ["https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1617196034183-421b4917f2d6?w=400&h=300&fit=crop&auto=format&q=80"],
            grilled: ["https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1606728035253-49e8a17d6ec6?w=400&h=300&fit=crop&auto=format&q=80"],
            baked: ["https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1606728035253-49e8a17d6ec6?w=400&h=300&fit=crop&auto=format&q=80"],
            general: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format&q=80", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&auto=format&q=80"],
        };
    }

    // Filter recipes based on user preferences with pagination support
    async getForYouRecipes(clerkId: string, limit: number = 6, offset: number = 0): Promise<FilteredRecipe[]> {
        try {
            console.log("🎯 Getting personalized recipes for user:", clerkId);

            // Load recipes if not already loaded
            await this.loadRecipes();

            // Get user preferences from database
            const user = await userOperations.getUserByClerkId(clerkId);
            if (!user) {
                console.warn("User not found, returning random recipes");
                return this.getRandomRecipesFromDataset(limit);
            }

            console.log("👤 User preferences:", {
                preferences: user.preferences,
                dietaryRestrictions: user.dietaryRestrictions,
                customCuisines: user.customCuisines,
                mealTypes: user.mealTypes,
                flavorProfiles: user.flavorProfiles,
            });

            // Separate cuisine preferences from other preferences
            const cuisinePreferences = [...(user.customCuisines || [])].map((cuisine) => cuisine.toLowerCase());

            // Other preferences for scoring
            const otherPreferences = [...(user.preferences || []), ...(user.mealTypes || []), ...(user.flavorProfiles || [])].map((pref) => pref.toLowerCase());

            const dietaryRestrictions = [...(user.dietaryRestrictions || []), ...(user.customDietary || [])].map((diet) => diet.toLowerCase());

            console.log("🔍 Filtering with cuisine preferences:", cuisinePreferences);
            console.log("🔍 Other preferences:", otherPreferences);
            console.log("🚫 Dietary restrictions:", dietaryRestrictions);

            // Filter actual loaded recipes based on preferences (both dietary AND cuisine requirements must be met)
            const filteredRecipes = this.filterRecipesByPreferences(otherPreferences, cuisinePreferences, dietaryRestrictions, limit, offset);

            console.log(`✅ Generated ${filteredRecipes.length} personalized recipes`);

            // Log filtering results for debugging
            const dietaryCount = cuisinePreferences.length > 0 ? this.recipes.filter((r) => !this.checkDietaryRestrictions(r, dietaryRestrictions)).length : filteredRecipes.length;
            const cuisineCount =
                cuisinePreferences.length > 0
                    ? this.recipes.filter((r) => {
                          if (this.checkDietaryRestrictions(r, dietaryRestrictions)) return false;
                          const titleLower = r.Title.toLowerCase();
                          const ingredientsLower = r.Ingredients.toLowerCase();
                          return cuisinePreferences.some((cuisine) => this.matchesCuisineType(titleLower, ingredientsLower, cuisine));
                      }).length
                    : 0;

            console.log(`🔍 Filtering stats: ${this.recipes.length} total → ${dietaryCount} passed dietary → ${cuisineCount} passed cuisine → ${filteredRecipes.length} final`);

            return filteredRecipes;
        } catch (error) {
            console.error("❌ Error getting personalized recipes:", error);
            return this.getRandomRecipesFromDataset(limit);
        }
    }

    // Filter recipes from the loaded dataset based on user preferences
    private filterRecipesByPreferences(preferences: string[], cuisinePreferences: string[], dietaryRestrictions: string[], limit: number, offset: number = 0): FilteredRecipe[] {
        const scored: { recipe: KaggleRecipe; score: number }[] = [];

        // Score each recipe based on how well it matches user preferences
        for (const recipe of this.recipes) {
            let score = 0;
            const titleLower = recipe.Title.toLowerCase();
            const ingredientsLower = recipe.Ingredients.toLowerCase();
            const cleanedIngredientsLower = recipe.Cleaned_Ingredients.toLowerCase();

            // First check: Recipe must NOT violate dietary restrictions
            const violatesRestrictions = this.checkDietaryRestrictions(recipe, dietaryRestrictions);
            if (violatesRestrictions) continue;

            // Second check: If user has cuisine preferences, recipe MUST match at least one
            if (cuisinePreferences.length > 0) {
                let matchesCuisine = false;
                for (const cuisine of cuisinePreferences) {
                    if (this.matchesCuisineType(titleLower, ingredientsLower, cuisine)) {
                        matchesCuisine = true;
                        score += 8; // Bonus for cuisine match
                        break;
                    }
                }
                // If user has cuisine preferences but recipe doesn't match any, skip it
                if (!matchesCuisine) continue;
            }

            // Score based on other user preferences
            for (const pref of preferences) {
                const prefLower = pref.toLowerCase();

                // Higher score for title matches (most important)
                if (titleLower.includes(prefLower)) score += 10;

                // Score for ingredient matches
                if (ingredientsLower.includes(prefLower)) score += 5;
                if (cleanedIngredientsLower.includes(prefLower)) score += 3;

                // Score for cooking method matches
                if (this.matchesCookingMethod(titleLower, prefLower)) score += 6;

                // Score for protein matches
                if (this.matchesProtein(titleLower, ingredientsLower, prefLower)) score += 7;
            }

            // Add some randomness to avoid always getting the same recipes
            score += Math.random() * 2;

            // Always add recipes that pass dietary restrictions and cuisine requirements
            scored.push({ recipe, score });
        }

        // Sort by score and take the top matches
        scored.sort((a, b) => b.score - a.score);

        // Convert to FilteredRecipe format, applying offset for pagination
        const filtered: FilteredRecipe[] = [];
        const startIndex = offset;
        const endIndex = Math.min(startIndex + limit, scored.length);

        for (let i = startIndex; i < endIndex; i++) {
            filtered.push(this.convertKaggleToRecipe(scored[i].recipe));
        }

        // If we don't have enough matches that meet both dietary AND cuisine requirements,
        // fill with recipes that only meet dietary requirements (ignore cuisine constraint for fallback)
        if (filtered.length < limit) {
            const remaining = limit - filtered.length;
            const fallbackRecipes = this.getFallbackRecipes(dietaryRestrictions, remaining, filtered, offset);
            filtered.push(...fallbackRecipes);
        }

        return filtered;
    }

    // Get fallback recipes that only meet dietary restrictions (when cuisine preferences are too restrictive)
    private getFallbackRecipes(dietaryRestrictions: string[], limit: number, existingRecipes: FilteredRecipe[], offset: number = 0): FilteredRecipe[] {
        const fallback: FilteredRecipe[] = [];
        const existingTitles = new Set(existingRecipes.map((r) => r.title));
        let validRecipeCount = 0;

        for (const recipe of this.recipes) {
            if (fallback.length >= limit) break;

            // Skip if already included
            if (existingTitles.has(recipe.Title)) continue;

            // Only check dietary restrictions, ignore cuisine preferences for fallback
            const violatesRestrictions = this.checkDietaryRestrictions(recipe, dietaryRestrictions);
            if (!violatesRestrictions) {
                // Apply offset - skip recipes until we reach the offset
                if (validRecipeCount >= offset) {
                    fallback.push(this.convertKaggleToRecipe(recipe));
                }
                validRecipeCount++;
            }
        }

        return fallback;
    }

    // Check if recipe violates dietary restrictions
    private checkDietaryRestrictions(recipe: KaggleRecipe, dietaryRestrictions: string[]): boolean {
        const ingredientsLower = recipe.Ingredients.toLowerCase();
        const titleLower = recipe.Title.toLowerCase();

        return dietaryRestrictions.some((restriction) => {
            const restrictionLower = restriction.toLowerCase();

            if (restrictionLower === "vegetarian") {
                return this.containsMeat(ingredientsLower, titleLower);
            }
            if (restrictionLower === "vegan") {
                return this.containsMeat(ingredientsLower, titleLower) || this.containsDairy(ingredientsLower, titleLower);
            }
            if (restrictionLower === "gluten-free" || restrictionLower === "gluten free") {
                return this.containsGluten(ingredientsLower, titleLower);
            }
            if (restrictionLower === "dairy-free" || restrictionLower === "dairy free") {
                return this.containsDairy(ingredientsLower, titleLower);
            }

            return false;
        });
    }

    // Helper methods for dietary restrictions
    private containsMeat(ingredients: string, title: string): boolean {
        const meatKeywords = ["chicken", "beef", "pork", "lamb", "fish", "salmon", "tuna", "shrimp", "seafood", "turkey", "bacon", "ham", "sausage"];
        return meatKeywords.some((meat) => ingredients.includes(meat) || title.includes(meat));
    }

    private containsDairy(ingredients: string, title: string): boolean {
        const dairyKeywords = ["cheese", "butter", "milk", "cream", "yogurt", "mozzarella", "parmesan", "cheddar"];
        return dairyKeywords.some((dairy) => ingredients.includes(dairy) || title.includes(dairy));
    }

    private containsGluten(ingredients: string, title: string): boolean {
        const glutenKeywords = ["flour", "wheat", "bread", "pasta", "noodles", "soy sauce", "pizza"];
        return glutenKeywords.some((gluten) => ingredients.includes(gluten) || title.includes(gluten));
    }

    // Helper methods for preference matching
    private matchesCuisineType(title: string, ingredients: string, preference: string): boolean {
        const cuisineMap: { [key: string]: string[] } = {
            italian: ["pasta", "pizza", "risotto", "parmesan", "basil", "tomato", "olive oil", "carbonara"],
            mexican: ["taco", "burrito", "salsa", "avocado", "lime", "cilantro", "jalapeño", "cheese"],
            asian: ["soy sauce", "ginger", "garlic", "sesame", "rice", "noodles", "stir fry"],
            indian: ["curry", "turmeric", "cumin", "coriander", "garam masala", "basmati", "naan"],
            thai: ["curry", "coconut milk", "lemongrass", "lime", "fish sauce", "thai basil", "thai"],
            mediterranean: ["olive oil", "feta", "olives", "lemon", "herbs", "tomato", "garlic", "quinoa"],
        };

        if (cuisineMap[preference]) {
            return cuisineMap[preference].some((keyword) => title.includes(keyword) || ingredients.includes(keyword));
        }
        return false;
    }

    private matchesCookingMethod(title: string, preference: string): boolean {
        const methodMap: { [key: string]: string[] } = {
            grilled: ["grilled", "grill", "bbq", "barbecue"],
            baked: ["baked", "roasted", "oven"],
            fried: ["fried", "crispy", "pan-fried"],
            healthy: ["steamed", "poached", "grilled", "baked"],
            quick: ["quick", "easy", "simple", "fast", "15 min", "20 min"],
        };

        if (methodMap[preference]) {
            return methodMap[preference].some((method) => title.includes(method));
        }
        return false;
    }

    private matchesProtein(title: string, ingredients: string, preference: string): boolean {
        const proteinMap: { [key: string]: string[] } = {
            chicken: ["chicken"],
            beef: ["beef", "steak"],
            seafood: ["fish", "salmon", "shrimp", "seafood", "tuna"],
            vegetarian: ["tofu", "beans", "lentils", "chickpeas", "quinoa"],
            pork: ["pork", "bacon", "ham"],
        };

        if (proteinMap[preference]) {
            return proteinMap[preference].some((protein) => title.includes(protein) || ingredients.includes(protein));
        }
        return false;
    }

    // Get random recipes from the loaded dataset
    private getRandomRecipesFromDataset(limit: number): FilteredRecipe[] {
        const randomRecipes: FilteredRecipe[] = [];
        const shuffled = [...this.recipes].sort(() => 0.5 - Math.random());

        for (let i = 0; i < Math.min(limit, shuffled.length); i++) {
            randomRecipes.push(this.convertKaggleToRecipe(shuffled[i]));
        }

        return randomRecipes;
    }
}

export const kaggleRecipeService = new KaggleRecipeService();
export default kaggleRecipeService;
