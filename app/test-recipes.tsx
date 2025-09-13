import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Recipe, toolhouseAPI } from "../lib/services/toolhouse-api";

export default function TestRecipesAPI() {
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("give me recipes with pasta that is gluten free");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [result, setResult] = useState<string>("");

    const testConnection = async () => {
        setIsLoading(true);
        setResult("");
        setRecipes([]);

        try {
            const connectionTest = await toolhouseAPI.testConnection();

            if (connectionTest) {
                setResult("✅ Connection successful!");
                Alert.alert("Success", "Successfully connected to Toolhouse API");
            } else {
                setResult("❌ Connection failed");
                Alert.alert("Error", "Failed to connect to Toolhouse API");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult(`❌ Connection Error: ${errorMessage}`);
            Alert.alert("Connection Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecipes = async () => {
        if (!query.trim()) {
            Alert.alert("Input Required", "Please enter a recipe query");
            return;
        }

        setIsLoading(true);
        setResult("");
        setRecipes([]);

        try {
            const response = await toolhouseAPI.getRecipes(query.trim());

            setRecipes(response.recipes);
            setResult(`✅ Found ${response.recipes.length} recipe(s) for: "${response.query}"`);

            if (response.recipes.length === 0) {
                Alert.alert("No Recipes", "No recipes found for your query. Try a different search term.");
            } else {
                Alert.alert("Success", `Found ${response.recipes.length} recipe(s)!`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult(`❌ Recipe Fetch Error: ${errorMessage}`);
            Alert.alert("Recipe Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const testSampleQueries = async () => {
        const sampleQueries = ["vegetarian pasta recipes", "quick chicken dinner", "gluten free desserts"];

        setIsLoading(true);
        setResult("Testing sample queries...");
        setRecipes([]);

        try {
            for (const sampleQuery of sampleQueries) {
                setResult(`Testing: "${sampleQuery}"`);
                const response = await toolhouseAPI.getRecipes(sampleQuery);

                if (response.recipes.length > 0) {
                    setRecipes((prev) => [...prev, ...response.recipes]);
                }

                // Small delay between requests
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setResult(`✅ Sample queries completed! Found ${recipes.length} total recipes.`);
            Alert.alert("Sample Test Complete", `Successfully tested ${sampleQueries.length} queries`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult(`❌ Sample Query Error: ${errorMessage}`);
            Alert.alert("Sample Query Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderRecipe = (recipe: Recipe, index: number) => (
        <View key={index} style={styles.recipeCard}>
            <Text style={styles.recipeName}>{recipe.name}</Text>

            {recipe.calories && <Text style={styles.recipeDetail}>🔥 {recipe.calories}</Text>}
            {recipe.dietaryInfo && <Text style={styles.recipeDetail}>🥗 {recipe.dietaryInfo}</Text>}
            {recipe.prepTime && <Text style={styles.recipeDetail}>⏱️ Prep: {recipe.prepTime}</Text>}
            {recipe.cookTime && <Text style={styles.recipeDetail}>🍳 Cook: {recipe.cookTime}</Text>}
            {recipe.servings && <Text style={styles.recipeDetail}>👥 Serves: {recipe.servings}</Text>}
            {recipe.difficulty && <Text style={styles.recipeDetail}>📊 Difficulty: {recipe.difficulty}</Text>}

            {recipe.ingredients.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredients:</Text>
                    {recipe.ingredients.map((ingredient, idx) => (
                        <Text key={idx} style={styles.listItem}>
                            • {ingredient}
                        </Text>
                    ))}
                </View>
            )}

            {recipe.instructions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions:</Text>
                    {recipe.instructions.map((instruction, idx) => (
                        <Text key={idx} style={styles.listItem}>
                            {idx + 1}. {instruction.trim()}
                        </Text>
                    ))}
                </View>
            )}

            {recipe.tags && recipe.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {recipe.tags.map((tag, idx) => (
                        <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            {recipe.imageUrl && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Image:</Text>
                    <Text style={styles.imageUrl} numberOfLines={2}>
                        {recipe.imageUrl}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Toolhouse Recipes API Test</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Recipe Query:</Text>
                <TextInput style={styles.textInput} value={query} onChangeText={setQuery} placeholder="Enter your recipe request..." multiline editable={!isLoading} />
            </View>

            <TouchableOpacity style={[styles.button, isLoading && styles.disabledButton]} onPress={testConnection} disabled={isLoading}>
                <Text style={styles.buttonText}>Test Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]} onPress={fetchRecipes} disabled={isLoading}>
                <Text style={styles.buttonText}>🔍 Get Recipes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, isLoading && styles.disabledButton]} onPress={testSampleQueries} disabled={isLoading}>
                <Text style={styles.buttonText}>Test Sample Queries</Text>
            </TouchableOpacity>

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Fetching recipes...</Text>
                </View>
            )}

            {result ? (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            ) : null}

            {recipes.length > 0 && (
                <View style={styles.recipesContainer}>
                    <Text style={styles.recipesTitle}>Recipes ({recipes.length}):</Text>
                    {recipes.map(renderRecipe)}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
        color: "#333",
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "white",
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: "top",
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: "#4CAF50",
    },
    disabledButton: {
        backgroundColor: "#ccc",
        opacity: 0.6,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    resultText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    recipesContainer: {
        marginTop: 20,
    },
    recipesTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    recipeCard: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    recipeDetail: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    section: {
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
    },
    listItem: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4,
        lineHeight: 18,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 6,
    },
    tag: {
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        color: "#1976D2",
    },
    imageUrl: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
    },
});
