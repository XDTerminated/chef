export interface RecipeRequest {
    message: string;
}

export interface Recipe {
    name: string;
    ingredients: string[];
    instructions: string[];
    prepTime?: string;
    cookTime?: string;
    servings?: string;
    difficulty?: string;
    tags?: string[];
    imageUrl?: string;
    calories?: string;
    dietaryInfo?: string;
}

export interface RecipeResponse {
    recipes: Recipe[];
    query: string;
    timestamp: number;
    count: number;
}

export interface ToolhouseAPIError {
    error: string;
    message: string;
    status: number;
}

class ToolhouseAPIService {
    private readonly endpoint = "https://agents.toolhouse.ai/ebdeae70-cec1-462c-b0fc-69aed839671f";

    /**
     * Fetch recipes based on user input/query (original method)
     */
    async getRecipes(query: string): Promise<RecipeResponse> {
        try {
            const body: RecipeRequest = {
                message: `Please provide 15-20 detailed ${query} recipes. For each recipe, include: title, ingredients list, step-by-step instructions, cooking time, servings, difficulty level, dietary information, and a high-quality recipe image URL. Make sure the image URLs are valid and accessible.`,
            };

            console.log("Making API request to:", this.endpoint);
            console.log("Request body:", JSON.stringify(body));

            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            console.log("API response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.log("API error response:", errorText);
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    // Use default error message if parsing fails
                }

                throw new Error(errorMessage);
            }

            // Better JSON parsing with error handling
            let data;
            try {
                const responseText = await response.text();
                console.log("Raw API response:", responseText.substring(0, 500) + "...");

                // Check if response looks like HTML (common API error response)
                if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
                    throw new Error("API returned HTML instead of JSON - likely a server error");
                }

                data = JSON.parse(responseText);
                console.log("Parsed API response data:", data);
            } catch (jsonError) {
                console.error("JSON parsing error:", jsonError);
                console.error("Response was not valid JSON");
                throw new Error(`Invalid JSON response from API: ${jsonError instanceof Error ? jsonError.message : "Unknown JSON error"}`);
            }

            // Parse the actual API response structure
            const recipes = this.parseApiResponse(data);
            console.log("Parsed recipes:", recipes);

            return {
                recipes: recipes,
                query: query,
                timestamp: Date.now(),
                count: recipes.length,
            };
        } catch (error) {
            console.error("Error fetching recipes from Toolhouse API:", error);
            throw error;
        }
    }

    /**
     * Fetch recipes using parallel API calls for faster loading
     * Makes multiple smaller requests simultaneously to get diverse results faster
     */
    async getRecipesParallel(query: string): Promise<RecipeResponse> {
        try {
            console.log("Making parallel API requests for:", query);

            // Create different query variations to get diverse results
            const queryVariations = [`Give me 4-5 popular ${query} recipes with ingredients and instructions`, `Show me 4-5 quick and easy ${query} recipes with cooking times`, `Provide 4-5 authentic ${query} recipes with detailed steps`, `List 4-5 healthy ${query} recipes with nutritional info`];

            // Make all API calls in parallel
            const apiPromises = queryVariations.map(async (variation, index) => {
                try {
                    const body: RecipeRequest = { message: variation };

                    console.log(`Making parallel request ${index + 1}/4:`, variation);

                    const response = await fetch(this.endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(body),
                    });

                    if (!response.ok) {
                        console.warn(`Request ${index + 1} failed with status:`, response.status);
                        return [];
                    }

                    // Better JSON parsing for parallel requests
                    let data;
                    try {
                        const responseText = await response.text();
                        console.log(`Parallel request ${index + 1} raw response:`, responseText.substring(0, 200) + "...");

                        // Check if response looks like HTML
                        if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
                            console.warn(`Request ${index + 1} returned HTML instead of JSON`);
                            return [];
                        }

                        data = JSON.parse(responseText);
                    } catch (jsonError) {
                        console.warn(`Request ${index + 1} JSON parsing failed:`, jsonError);
                        return [];
                    }

                    return this.parseApiResponse(data);
                } catch (error) {
                    console.warn(`Request ${index + 1} failed:`, error);
                    return [];
                }
            });

            // Wait for all requests to complete
            const allResults = await Promise.all(apiPromises);
            console.log("All parallel requests completed");

            // Combine and deduplicate results
            const allRecipes = allResults.flat();
            const uniqueRecipes = this.deduplicateRecipes(allRecipes);

            console.log(`Combined ${allRecipes.length} recipes, ${uniqueRecipes.length} unique recipes after deduplication`);

            return {
                recipes: uniqueRecipes,
                query: query,
                timestamp: Date.now(),
                count: uniqueRecipes.length,
            };
        } catch (error) {
            console.error("Error in parallel recipe fetch:", error);
            // Fallback to single request if parallel fails
            console.log("Falling back to single API request");
            return this.getRecipes(query);
        }
    }

    /**
     * Remove duplicate recipes based on name similarity
     */
    private deduplicateRecipes(recipes: Recipe[]): Recipe[] {
        const unique: Recipe[] = [];
        const seenNames = new Set<string>();

        for (const recipe of recipes) {
            // Normalize recipe name for comparison
            const normalizedName = recipe.name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "") // Remove special characters
                .replace(/\s+/g, " ") // Normalize spaces
                .trim();

            // Check if we've seen a very similar name
            let isDuplicate = false;
            for (const seenName of seenNames) {
                if (this.isSimilarName(normalizedName, seenName)) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                seenNames.add(normalizedName);
                unique.push(recipe);
            }
        }

        return unique;
    }

    /**
     * Check if two recipe names are similar (potential duplicates)
     */
    private isSimilarName(name1: string, name2: string): boolean {
        // Exact match
        if (name1 === name2) return true;

        // Check if one name contains the other (with length consideration)
        const shorter = name1.length < name2.length ? name1 : name2;
        const longer = name1.length < name2.length ? name2 : name1;

        if (longer.includes(shorter) && shorter.length > 5) return true;

        // Split into words and check for significant overlap
        const words1 = name1.split(" ").filter((word) => word.length > 2);
        const words2 = name2.split(" ").filter((word) => word.length > 2);

        if (words1.length === 0 || words2.length === 0) return false;

        const commonWords = words1.filter((word) => words2.includes(word));
        const overlapRatio = commonWords.length / Math.max(words1.length, words2.length);

        return overlapRatio > 0.7; // 70% word overlap threshold
    }

    /**
     * Parse the actual API response structure
     */
    private parseApiResponse(apiResponse: any): Recipe[] {
        try {
            let recipesArray: any[] = [];

            // Handle different response formats
            if (Array.isArray(apiResponse)) {
                // Direct array response: [recipes]
                recipesArray = apiResponse;
            } else if (apiResponse && apiResponse.value && Array.isArray(apiResponse.value)) {
                // Response format: { value: [recipes], Count: number }
                recipesArray = apiResponse.value;
            } else {
                console.warn("Unexpected API response format:", apiResponse);
                return [
                    {
                        name: "API Response",
                        ingredients: [],
                        instructions: [JSON.stringify(apiResponse, null, 2)],
                        tags: ["raw-response"],
                    },
                ];
            }

            return recipesArray.map((recipe: any) => ({
                name: recipe.title || recipe.name || "Untitled Recipe",
                ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : typeof recipe.ingredients === "string" ? [recipe.ingredients] : [],
                instructions: Array.isArray(recipe.instructions) ? recipe.instructions : typeof recipe.instructions === "string" ? [recipe.instructions] : [],
                prepTime: recipe.prep_time || recipe.prepTime || recipe.preparation_time,
                cookTime: recipe.cook_time || recipe.cookTime || recipe.cooking_time,
                servings: recipe.servings || recipe.serves,
                difficulty: recipe.difficulty || recipe.difficulty_level,
                imageUrl: recipe.image_url || recipe.imageUrl || recipe.image,
                calories: recipe.calories,
                dietaryInfo: recipe.dietary_info || recipe.dietaryInfo || recipe.diet,
                tags: [...(recipe.tags || []), ...(recipe.dietary_info ? [recipe.dietary_info] : []), ...(recipe.difficulty ? [recipe.difficulty] : []), ...(recipe.cuisine ? [recipe.cuisine] : [])].filter(Boolean),
            }));
        } catch (error) {
            console.error("Error parsing API response:", error);
            return [
                {
                    name: "Parse Error",
                    ingredients: [],
                    instructions: [`Error parsing response: ${error}`],
                    tags: ["error"],
                },
            ];
        }
    }

    /**
     * Test the API connection
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.getRecipes("test connection");
            return true;
        } catch (error) {
            console.error("API connection test failed:", error);
            return false;
        }
    }
}

// Export singleton instance
export const toolhouseAPI = new ToolhouseAPIService();
export default toolhouseAPI;
