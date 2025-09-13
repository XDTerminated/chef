import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAIRecipes } from "@/hooks/use-ai-recipes";
import { recipeOperations } from "@/lib/db/operations";
import type { Recipe } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";

export default function RecipesScreen() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const { generateRecipe, isLoading: aiLoading, error: aiError } = useAIRecipes();

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        try {
            const allRecipes = await recipeOperations.getAll();
            setRecipes(allRecipes);
        } catch (error) {
            console.error("Failed to load recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRecipe = async () => {
        if (!aiPrompt.trim()) {
            Alert.alert("Error", "Please enter a recipe request");
            return;
        }

        try {
            const recipe = await generateRecipe(aiPrompt);
            if (recipe) {
                // Convert AI recipe to database recipe format
                const dbRecipe = await recipeOperations.create({
                    title: recipe.title,
                    description: recipe.description,
                    ingredients: JSON.stringify(recipe.ingredients), // Convert array to JSON string
                    instructions: JSON.stringify(recipe.instructions), // Convert array to JSON string
                    cookingTime: `${recipe.cookingTime} minutes`, // Convert number to string
                    difficulty: recipe.difficulty,
                    userId: 1, // Mock user ID - in real app, use actual user ID
                });

                setRecipes((prev) => [dbRecipe, ...prev]);
                setShowAIModal(false);
                setAiPrompt("");

                Alert.alert("Success", `Generated recipe: "${recipe.title}"`);
            } else {
                Alert.alert("Error", aiError || "Failed to generate recipe");
            }
        } catch (error) {
            console.error("Recipe generation failed:", error);
            Alert.alert("Error", "Failed to generate recipe");
        }
    };

    const renderRecipeItem = ({ item }: { item: Recipe }) => (
        <Pressable style={styles.recipeCard}>
            <ThemedView style={styles.recipeContent}>
                <ThemedText type="subtitle" style={styles.recipeTitle}>
                    {item.title}
                </ThemedText>
                <ThemedText style={styles.recipeDescription} numberOfLines={2}>
                    {item.description || "No description available"}
                </ThemedText>
                <ThemedView style={styles.recipeMetadata}>
                    <ThemedText style={styles.metadataText}>{item.cookingTime && `⏱️ ${item.cookingTime}`}</ThemedText>
                    <ThemedText style={styles.metadataText}>{item.difficulty && `📊 ${item.difficulty}`}</ThemedText>
                </ThemedView>
            </ThemedView>
        </Pressable>
    );

    if (loading) {
        return (
            <ParallaxScrollView headerBackgroundColor={{ light: "#FF6B35", dark: "#FF4500" }} headerImage={<IconSymbol size={310} color="#FFF" name="book.fill" style={styles.headerImage} />}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Recipes</ThemedText>
                </ThemedView>
                <ThemedView style={styles.container}>
                    <ThemedText>Loading recipes...</ThemedText>
                </ThemedView>
            </ParallaxScrollView>
        );
    }

    return (
        <ParallaxScrollView headerBackgroundColor={{ light: "#FF6B35", dark: "#FF4500" }} headerImage={<IconSymbol size={310} color="#FFF" name="book.fill" style={styles.headerImage} />}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Recipes</ThemedText>
                <Pressable style={styles.aiButton} onPress={() => setShowAIModal(true)}>
                    <IconSymbol size={20} name="sparkles" color="#FFF" />
                    <ThemedText style={styles.aiButtonText}>AI Generate</ThemedText>
                </Pressable>
            </ThemedView>

            {recipes.length === 0 ? (
                <ThemedView style={styles.emptyContainer}>
                    <IconSymbol size={64} name="book" color="#999" />
                    <ThemedText style={styles.emptyTitle}>No Recipes Yet</ThemedText>
                    <ThemedText style={styles.emptyDescription}>Generate your first recipe with AI! Tap the &ldquo;AI Generate&rdquo; button to get started.</ThemedText>
                </ThemedView>
            ) : (
                <FlatList data={recipes} renderItem={renderRecipeItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.recipesList} showsVerticalScrollIndicator={false} />
            )}

            {/* AI Recipe Generation Modal */}
            <Modal visible={showAIModal} animationType="slide" presentationStyle="pageSheet">
                <ThemedView style={styles.modalContainer}>
                    <ThemedView style={styles.modalHeader}>
                        <ThemedText type="subtitle">Generate Recipe with AI</ThemedText>
                        <Pressable onPress={() => setShowAIModal(false)}>
                            <IconSymbol size={24} name="xmark" color="#666" />
                        </Pressable>
                    </ThemedView>

                    <ScrollView style={styles.modalContent}>
                        <ThemedText style={styles.modalDescription}>Describe what kind of recipe you&apos;d like to create. Be specific about ingredients, cuisine type, dietary restrictions, etc.</ThemedText>

                        <TextInput style={styles.aiInput} value={aiPrompt} onChangeText={setAiPrompt} placeholder="e.g., 'Vegan pasta with mushrooms and spinach' or 'Quick 30-minute chicken dinner'" multiline numberOfLines={4} maxLength={300} />

                        <ThemedView style={styles.modalButtons}>
                            <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setShowAIModal(false)}>
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </Pressable>

                            <Pressable style={[styles.button, styles.generateButton, aiLoading && styles.disabledButton]} onPress={handleGenerateRecipe} disabled={aiLoading || !aiPrompt.trim()}>
                                {aiLoading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <IconSymbol size={16} name="sparkles" color="#FFF" />
                                        <ThemedText style={styles.generateButtonText}>Generate Recipe</ThemedText>
                                    </>
                                )}
                            </Pressable>
                        </ThemedView>
                    </ScrollView>
                </ThemedView>
            </Modal>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: "#FFF",
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    aiButton: {
        backgroundColor: "#007AFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    aiButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        textAlign: "center",
        opacity: 0.7,
    },
    recipesList: {
        padding: 16,
    },
    recipeCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    recipeContent: {
        padding: 16,
    },
    recipeTitle: {
        marginBottom: 8,
    },
    recipeDescription: {
        opacity: 0.7,
        marginBottom: 12,
    },
    recipeMetadata: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    metadataText: {
        fontSize: 12,
        opacity: 0.6,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalDescription: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 20,
        lineHeight: 22,
    },
    aiInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: "top",
        backgroundColor: "#f9f9f9",
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
    },
    cancelButton: {
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#d0d0d0",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
    generateButton: {
        backgroundColor: "#007AFF",
    },
    generateButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledButton: {
        backgroundColor: "#ccc",
        opacity: 0.6,
    },
});
