import { useCallback, useState } from "react";
import { cerebrasAPI } from "../lib/services/cerebras-api";

export interface Recipe {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    cookingTime: number;
    servings: number;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
}

export const useAIRecipes = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateRecipe = useCallback(async (prompt: string): Promise<Recipe | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const systemPrompt = `You are a professional chef assistant. Generate a detailed recipe based on the user's request. 
      Return ONLY a JSON object with this exact structure:
      {
        "title": "Recipe Title",
        "description": "Brief description of the dish",
        "ingredients": ["ingredient 1", "ingredient 2", ...],
        "instructions": ["step 1", "step 2", ...],
        "cookingTime": 30,
        "servings": 4,
        "difficulty": "Easy",
        "tags": ["tag1", "tag2", ...]
      }
      
      Make sure:
      - All ingredients include quantities and measurements
      - Instructions are clear and step-by-step
      - cookingTime is in minutes
      - difficulty is one of: Easy, Medium, Hard
      - tags include cuisine type, meal type, dietary restrictions if applicable
      - JSON is valid and properly formatted`;

            const chatRequest = cerebrasAPI.createChatRequest(prompt, systemPrompt, {
                temperature: 0.7,
                max_completion_tokens: 1000,
            });

            const response = await cerebrasAPI.chatCompletion(chatRequest);

            if (response.choices && response.choices.length > 0) {
                const content = response.choices[0].message.content.trim();

                // Try to extract JSON from the response
                let jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    // If no JSON found, try to find it within code blocks
                    jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                    if (jsonMatch) {
                        jsonMatch[0] = jsonMatch[1];
                    }
                }

                if (jsonMatch) {
                    const recipeData = JSON.parse(jsonMatch[0]);

                    // Generate a unique ID
                    const recipe: Recipe = {
                        id: Date.now().toString(),
                        ...recipeData,
                    };

                    return recipe;
                } else {
                    throw new Error("Could not parse recipe from AI response");
                }
            } else {
                throw new Error("No response from AI");
            }
        } catch (error) {
            console.error("Recipe generation error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to generate recipe";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const suggestSubstitutions = useCallback(async (ingredient: string): Promise<string[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const prompt = `Suggest 5 good substitutions for "${ingredient}" in cooking. 
      Return ONLY a JSON array of strings: ["substitute 1", "substitute 2", ...]`;

            const chatRequest = cerebrasAPI.createChatRequest(prompt, "You are a culinary expert. Provide practical ingredient substitutions.", {
                temperature: 0.5,
                max_completion_tokens: 200,
            });

            const response = await cerebrasAPI.chatCompletion(chatRequest);

            if (response.choices && response.choices.length > 0) {
                const content = response.choices[0].message.content.trim();

                // Try to extract JSON array
                let jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const substitutions = JSON.parse(jsonMatch[0]);
                    return Array.isArray(substitutions) ? substitutions : [];
                }
            }

            return [];
        } catch (error) {
            console.error("Substitution error:", error);
            setError("Failed to get substitutions");
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getCookingTips = useCallback(async (recipeOrTechnique: string): Promise<string[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const prompt = `Give me 5 practical cooking tips for "${recipeOrTechnique}". 
      Return ONLY a JSON array of strings: ["tip 1", "tip 2", ...]`;

            const chatRequest = cerebrasAPI.createChatRequest(prompt, "You are a professional chef. Provide expert cooking tips and techniques.", {
                temperature: 0.6,
                max_completion_tokens: 300,
            });

            const response = await cerebrasAPI.chatCompletion(chatRequest);

            if (response.choices && response.choices.length > 0) {
                const content = response.choices[0].message.content.trim();

                // Try to extract JSON array
                let jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const tips = JSON.parse(jsonMatch[0]);
                    return Array.isArray(tips) ? tips : [];
                }
            }

            return [];
        } catch (error) {
            console.error("Cooking tips error:", error);
            setError("Failed to get cooking tips");
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        generateRecipe,
        suggestSubstitutions,
        getCookingTips,
        isLoading,
        error,
        clearError: () => setError(null),
    };
};
