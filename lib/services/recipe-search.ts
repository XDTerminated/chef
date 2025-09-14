import { extractImages } from "./image-extraction";

interface Recipe {
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

interface ToolhouseRecipe {
    recipe_name: string;
    source?: string;
    ingredients: string[];
    instructions: string[];
    nutritional_info?: string;
    cooking_time: string;
    difficulty: string;
}

function convertToolhouseToRecipe(toolhouseRecipe: ToolhouseRecipe, query: string): Recipe {
    console.warn("🔄 Converting Toolhouse recipe:", toolhouseRecipe.recipe_name);

    return {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: toolhouseRecipe.recipe_name || `${query} Recipe`,
        description: toolhouseRecipe.nutritional_info || `A delicious ${query} recipe`,
        ingredients: toolhouseRecipe.ingredients || [],
        instructions: toolhouseRecipe.instructions || [],
        cookTime: toolhouseRecipe.cooking_time || "30 minutes",
        difficulty: toolhouseRecipe.difficulty || "Medium",
        images: [],
        sourceUrl: toolhouseRecipe.source,
    };
}

async function searchRecipes(query: string): Promise<Recipe[]> {
    try {
        console.warn("🔍 Starting recipe search with query:", query);
        console.warn("🚀 RECIPE SEARCH FUNCTION CALLED - YOUR IMAGE API WILL BE USED!");
        console.warn("📝 About to call Toolhouse, then extract images with:", "https://hackez-name-extraction.hf.space/extract");

        const requestPayload = {
            message: `Find 10 different recipes for: ${query}. Please provide detailed recipes with ingredients, instructions, cooking time, and difficulty level. IMPORTANT: Please include the source URL from allrecipes.com for each recipe in the 'source' field. I need exactly 10 unique recipes.`,
        };

        console.warn("📤 Sending Toolhouse request:");
        console.warn("URL:", "https://agents.toolhouse.ai/02f770d6-c8ad-4428-8e41-f4af24ae39c3");
        console.warn("Method: POST");
        console.warn("Headers:", { "Content-Type": "application/json" });
        console.warn("Body:", JSON.stringify(requestPayload, null, 2));

        // Call Toolhouse AI API
        const response = await fetch("https://agents.toolhouse.ai/02f770d6-c8ad-4428-8e41-f4af24ae39c3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestPayload),
        });

        console.warn("📥 Toolhouse response status:", response.status, response.statusText);
        console.warn("📥 Toolhouse response headers:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawResponseText = await response.text();
        console.warn("📄 Raw Toolhouse response text:");
        console.warn("=====================================");
        console.warn(rawResponseText);
        console.warn("=====================================");

        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(rawResponseText);
            console.warn("✅ Parsed Toolhouse response as JSON:");
            console.warn(JSON.stringify(parsedResponse, null, 2));
        } catch {
            console.warn("❌ Failed to parse as JSON, treating as plain text");
            parsedResponse = { message: rawResponseText };
        }

        console.warn("Toolhouse response:", parsedResponse);

        // Extract recipes from response
        let recipes: Recipe[] = [];

        console.warn("🔍 Analyzing Toolhouse response for recipes...");

        // Check if the response is directly an array of recipes
        if (Array.isArray(parsedResponse)) {
            console.warn("✅ Found direct array of recipes:", parsedResponse.length, "recipes");
            recipes = parsedResponse.map((item: any) => convertToolhouseToRecipe(item, query));
        } else if (parsedResponse.recipes) {
            console.warn("✅ Found recipes array in response:", parsedResponse.recipes.length, "recipes");
            recipes = parsedResponse.recipes.map((item: any) => convertToolhouseToRecipe(item, query));
        } else if (parsedResponse.message) {
            console.warn("📝 No recipes array found, parsing from message text...");
            console.warn("Message to parse:", parsedResponse.message);
            // Parse recipes from message if they're in text format
            recipes = parseRecipesFromText(parsedResponse.message, query);
            console.warn("✅ Parsed", recipes.length, "recipes from text");
        } else {
            console.warn("❌ No recipes or message found in response");
        }

        // Log parsed recipes before image extraction
        recipes.forEach((recipe, index) => {
            console.warn(`📋 Recipe ${index + 1}:`, {
                title: recipe.title,
                description: recipe.description?.substring(0, 50) + "...",
                ingredients: recipe.ingredients.length + " ingredients",
                instructions: recipe.instructions.length + " steps",
                cookTime: recipe.cookTime,
                difficulty: recipe.difficulty,
                sourceUrl: recipe.sourceUrl || "❌ NO SOURCE URL",
            });

            // Log the full sourceUrl for debugging
            if (recipe.sourceUrl) {
                console.warn(`🔗 Full sourceUrl for "${recipe.title}": ${recipe.sourceUrl}`);
                if (recipe.sourceUrl.includes("allrecipes.com")) {
                    console.warn(`✅ AllRecipes URL detected - will extract images`);
                } else {
                    console.warn(`⚠️ Non-AllRecipes URL - may not extract images properly`);
                }
            } else {
                console.warn(`❌ No sourceUrl found for "${recipe.title}" - will use placeholders`);
            }
        });

        // Extract images for each recipe
        console.warn(`🖼️ Found ${recipes.length} recipes, extracting images...`);

        const recipesWithImages = await Promise.all(
            recipes.map(async (recipe, index) => {
                console.warn(`\n🖼️ Processing images for Recipe ${index + 1}: ${recipe.title}`);

                try {
                    // Try to extract images from source URL if available and if it's an AllRecipes URL
                    let images: string[] = [];
                    if (recipe.sourceUrl && recipe.sourceUrl.includes("allrecipes.com")) {
                        console.warn(`📡 AllRecipes URL found for "${recipe.title}": ${recipe.sourceUrl}`);
                        console.warn(`🚀 Calling YOUR HF API: https://hackez-name-extraction.hf.space/extract with URL: ${recipe.sourceUrl}`);
                        images = await extractImages(recipe.sourceUrl, 3);
                        console.warn(`✅ YOUR HF API returned ${images.length} images for "${recipe.title}"`);
                        if (images.length > 0) {
                            console.warn(`📸 First image URL from YOUR API: ${images[0].substring(0, 80)}...`);
                        }
                    } else if (recipe.sourceUrl) {
                        console.warn(`⚠️ Non-AllRecipes URL found: ${recipe.sourceUrl} - skipping image extraction`);
                    } else {
                        console.warn(`❌ No source URL available for recipe: ${recipe.title} - skipping image extraction`);
                    }

                    // If no images found, use placeholder images
                    if (images.length === 0) {
                        console.warn(`🖼️ No images extracted, using placeholder images for: ${recipe.title}`);
                        // Generate different placeholder images for each recipe
                        const placeholderImages = [`https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&auto=format&sig=${index * 7}`, `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop&auto=format&sig=${index * 11}`, `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop&auto=format&sig=${index * 13}`, `https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&h=200&fit=crop&auto=format&sig=${index * 17}`, `https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop&auto=format&sig=${index * 19}`, `https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=200&fit=crop&auto=format&sig=${index * 23}`];
                        // Use the recipe index to pick different images
                        const startIndex = index % 3;
                        images = placeholderImages.slice(startIndex, startIndex + 2);
                    }

                    console.warn(`✅ Final image count for "${recipe.title}": ${images.length} images`);

                    return {
                        ...recipe,
                        images: images,
                    };
                } catch (error) {
                    console.error("Error extracting images for recipe:", recipe.title, error);
                    return {
                        ...recipe,
                        images: [],
                    };
                }
            })
        );

        console.warn(`Recipe search complete. Found ${recipesWithImages.length} recipes with images.`);
        return recipesWithImages;
    } catch (error) {
        console.error("Error searching recipes:", error);
        throw error;
    }
}

function parseRecipesFromText(text: string, query: string): Recipe[] {
    // Simple parser to extract recipes from text response
    // This is a basic implementation - you might need to adjust based on Toolhouse response format

    console.warn("🔍 Starting text parsing for recipes...");
    console.warn("📄 Text length:", text.length, "characters");

    try {
        // Try to find recipe-like structures in the text
        const recipes: Recipe[] = [];

        console.warn("📝 Splitting text into sections...");
        // Split by common recipe separators
        const sections = text.split(/(?:\n\s*\n|Recipe \d+:|Recipe:|---)/i);
        console.warn("📋 Found", sections.length, "sections to analyze");

        sections.forEach((section, sectionIndex) => {
            console.warn(`\n🔍 Analyzing section ${sectionIndex + 1}:`);
            console.warn("Section preview:", section.substring(0, 100) + "...");

            if (section.trim().length < 50) {
                console.warn("❌ Section too short, skipping");
                return; // Skip short sections
            }

            const lines = section.trim().split("\n");
            let title = `${query} Recipe ${sectionIndex + 1}`;
            let description = "";
            let ingredients: string[] = [];
            let instructions: string[] = [];
            let cookTime = "30 minutes";
            let difficulty = "Medium";

            console.warn("🏷️ Default title:", title);

            // Extract title (usually the first line or contains keywords)
            const titleLine = lines.find((line) => line.includes("Title:") || line.includes("Recipe:") || (sectionIndex === 0 && line.length < 100 && line.length > 10));
            if (titleLine) {
                title = titleLine.replace(/^(Title:|Recipe:)\s*/i, "").trim();
                console.warn("✅ Found title:", title);
            }

            // Extract ingredients
            const ingredientStart = lines.findIndex((line) => /ingredients?:/i.test(line) || /what you need:/i.test(line));
            if (ingredientStart >= 0) {
                for (let i = ingredientStart + 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line || /instructions?:|directions?:|method:/i.test(line)) break;
                    if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
                        ingredients.push(line.replace(/^[-•*]\s*|\d+\.\s*/, ""));
                    }
                }
            }

            // Extract instructions
            const instructionStart = lines.findIndex((line) => /instructions?:|directions?:|method:|steps?:/i.test(line));
            if (instructionStart >= 0) {
                for (let i = instructionStart + 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
                        instructions.push(line.replace(/^[-•*]\s*|\d+\.\s*/, ""));
                    } else if (line.length > 20) {
                        instructions.push(line);
                    }
                }
            }

            // Extract cooking time and difficulty if mentioned
            const cookTimeLine = lines.find((line) => /cook time|prep time|total time/i.test(line));
            if (cookTimeLine) {
                const timeMatch = cookTimeLine.match(/(\d+)\s*(minutes?|hours?|mins?)/i);
                if (timeMatch) {
                    cookTime = timeMatch[0];
                }
            }

            const difficultyLine = lines.find((line) => /difficulty|level/i.test(line));
            if (difficultyLine) {
                if (/easy|simple|beginner/i.test(difficultyLine)) difficulty = "Easy";
                else if (/hard|advanced|expert/i.test(difficultyLine)) difficulty = "Hard";
            }

            if (ingredients.length > 0 || instructions.length > 0) {
                recipes.push({
                    id: `recipe-${Date.now()}-${sectionIndex}`,
                    title,
                    description: description || `A delicious ${query} recipe`,
                    ingredients,
                    instructions,
                    cookTime,
                    difficulty,
                    images: [],
                });

                console.warn("✅ Recipe created:", {
                    title,
                    ingredientsCount: ingredients.length,
                    instructionsCount: instructions.length,
                    cookTime,
                    difficulty,
                });
            } else {
                console.warn("❌ No ingredients or instructions found, skipping recipe");
            }
        });

        console.warn("✅ Text parsing complete!");
        console.warn("📊 Final results:", recipes.length, "recipes parsed");
        recipes.forEach((recipe, index) => {
            console.warn(`Recipe ${index + 1}: "${recipe.title}" - ${recipe.ingredients.length} ingredients, ${recipe.instructions.length} steps`);
        });

        return recipes;
    } catch (error) {
        console.error("❌ Error parsing recipes from text:", error);
        return [];
    }
}

export { searchRecipes };
export default searchRecipes;
