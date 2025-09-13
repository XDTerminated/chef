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
     * Fetch recipes based on user input/query
     */
    async getRecipes(query: string): Promise<RecipeResponse> {
        try {
            const body: RecipeRequest = {
                message: query,
            };

            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    // Use default error message if parsing fails
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Parse the actual API response structure
            const recipes = this.parseApiResponse(data);

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
     * Parse the actual API response structure
     */
    private parseApiResponse(apiResponse: any): Recipe[] {
        try {
            let recipesArray: any[] = [];

            // Handle different response formats
            if (apiResponse && apiResponse.value && Array.isArray(apiResponse.value)) {
                // Response format: { value: [recipes], Count: number }
                recipesArray = apiResponse.value;
            } else if (Array.isArray(apiResponse)) {
                // Direct array response: [recipes]
                recipesArray = apiResponse;
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
                name: recipe.title || "Untitled Recipe",
                ingredients: recipe.ingredients || [],
                instructions: recipe.instructions || [],
                imageUrl: recipe.image_url,
                calories: recipe.calories,
                dietaryInfo: recipe.dietary_info,
                tags: recipe.dietary_info ? [recipe.dietary_info] : [],
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
