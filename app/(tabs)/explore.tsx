import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { recipeOperations } from "@/lib/db/operations";
import type { Recipe } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

export default function RecipesScreen() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

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
            </ThemedView>

            {recipes.length === 0 ? (
                <ThemedView style={styles.emptyContainer}>
                    <IconSymbol size={64} name="book" color="#999" />
                    <ThemedText style={styles.emptyTitle}>No Recipes Yet</ThemedText>
                    <ThemedText style={styles.emptyDescription}>Be the first to create a recipe! Tap the + button to get started.</ThemedText>
                </ThemedView>
            ) : (
                <FlatList data={recipes} renderItem={renderRecipeItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.recipesList} showsVerticalScrollIndicator={false} />
            )}
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
        gap: 8,
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
});
