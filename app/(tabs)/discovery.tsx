import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingAIButton from "../../components/FloatingAIButton";
import { IconSymbol } from "../../components/ui/icon-symbol";
import { csvRecipeService } from "../../lib/services/csv-recipe-service";
import { searchRecipes } from "../../lib/services/recipe-search";

// For CSV recipes with local assets
interface CSVRecipe {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    cookTime: string;
    difficulty: string;
    images: ImageSourcePropType[];
    sourceUrl?: string;
}

// For search recipes with URL images
interface SearchRecipe {
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

// Union type for all recipes
type Recipe = CSVRecipe | SearchRecipe;

// Helper function to check if recipe is CSVRecipe
function isCSVRecipe(recipe: Recipe): recipe is CSVRecipe {
    return recipe.images.length > 0 && typeof recipe.images[0] !== 'string';
}

// Helper function to get proper image source
function getImageSource(recipe: Recipe) {
    if (isCSVRecipe(recipe)) {
        return recipe.images[0]; // Already ImageSourcePropType
    } else {
        return { uri: recipe.images[0] }; // String URL, wrap in uri object
    }
}

export default function DiscoveryScreen() {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [forYouRecipes, setForYouRecipes] = useState<Recipe[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingForYou, setIsLoadingForYou] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [hasMoreRecipes, setHasMoreRecipes] = useState(true);
    const [searchProgress, setSearchProgress] = useState(0);

    // Load personalized recipes on component mount
    useEffect(() => {
        const loadForYouRecipes = async () => {
            if (!user?.id) return;

            try {
                setIsLoadingForYou(true);
                console.log("🎯 Loading personalized recipes for user:", user.id);
                const personalizedRecipes = await csvRecipeService.getForYouRecipes(user.id, 4);
                setForYouRecipes(
                    personalizedRecipes.map((recipe: any) => ({
                        ...recipe,
                        images: recipe.images ?? [],
                    }))
                );
                setHasMoreRecipes(personalizedRecipes.length === 4); // If we got 4, there might be more
                console.log("✅ Loaded", personalizedRecipes.length, "personalized recipes");
            } catch (error) {
                console.error("❌ Error loading personalized recipes:", error);
                // Fallback to empty array
                setForYouRecipes([]);
            } finally {
                setIsLoadingForYou(false);
            }
        };

        loadForYouRecipes();
    }, [user?.id]);

    // Animate search progress bar
    useEffect(() => {
        if (isSearching) {
            setSearchProgress(0);
            const interval = setInterval(() => {
                setSearchProgress((prev) => {
                    if (prev >= 90) return prev; // Stop at 90% until search completes
                    return prev + Math.random() * 15; // Random increment
                });
            }, 200);
            
            return () => clearInterval(interval);
        } else {
            setSearchProgress(100); // Complete when search is done
            setTimeout(() => setSearchProgress(0), 500); // Reset after a delay
        }
    }, [isSearching]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        console.warn("🔍 Discovery: Starting search for:", searchQuery);
        setIsSearching(true);
        setHasSearched(true);

        try {
            console.warn("🚀 Discovery: Calling searchRecipes function...");
            const results = await searchRecipes(searchQuery.trim());
            
            // The searchRecipes function should handle getting 3 results with HF API
            let finalResults = results;
            
            // Limit to exactly 3 results
            finalResults = finalResults.slice(0, 3);
            
            setSearchResults(finalResults);
            console.warn("✅ Discovery: Search completed, found", finalResults.length, "recipes");
        } catch (error) {
            console.error("❌ Discovery: Search failed:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
            console.warn("🏁 Discovery: Search process finished");
        }
    };

    const loadMoreRecipes = async () => {
        console.log("🔄 loadMoreRecipes called with:", {
            userId: user?.id,
            isLoadingMore,
            hasMoreRecipes,
            currentCount: forYouRecipes.length,
        });

        if (!user?.id || isLoadingMore || !hasMoreRecipes) {
            console.log("❌ loadMoreRecipes blocked:", {
                noUser: !user?.id,
                isLoadingMore,
                noMoreRecipes: !hasMoreRecipes,
            });
            return;
        }

        try {
            setIsLoadingMore(true);
            console.log("📚 Loading more recipes... Currently have:", forYouRecipes.length);

            // Load 4 more recipes starting from current count (offset)
            const moreRecipes = await csvRecipeService.getForYouRecipes(user.id, 4, forYouRecipes.length);
            console.log("📥 Received more recipes:", moreRecipes.length);

            if (moreRecipes.length > 0) {
                // Filter out any duplicates (though unlikely with proper service implementation)
                const newRecipes = moreRecipes.filter((newRecipe: any) => !forYouRecipes.some((existingRecipe: any) => existingRecipe.id === newRecipe.id));
                console.log("🔍 After filtering duplicates:", newRecipes.length);

                if (newRecipes.length > 0) {
                    setForYouRecipes((prev) => [
                        ...prev,
                        ...newRecipes.map((recipe: any) => ({
                            ...recipe,
                            images: recipe.images ?? [],
                        })),
                    ]);
                    console.log("✅ Loaded", newRecipes.length, "more recipes. Total:", forYouRecipes.length + newRecipes.length);
                }

                // If we got fewer than 4 new recipes, we might have reached the end
                setHasMoreRecipes(moreRecipes.length === 4);
            } else {
                setHasMoreRecipes(false);
                console.log("🏁 No more recipes available");
            }
        } catch (error) {
            console.error("❌ Error loading more recipes:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

        // Check if user is close to the bottom (within 100 pixels)
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;

        console.log("📱 Scroll Debug:", {
            layoutHeight: layoutMeasurement.height,
            scrollOffset: contentOffset.y,
            contentSize: contentSize.height,
            isCloseToBottom,
            isLoadingMore,
            hasMoreRecipes,
            hasSearched,
        });

        if (isCloseToBottom && !isLoadingMore && hasMoreRecipes && !hasSearched) {
            console.log("🚀 Triggering loadMoreRecipes!");
            loadMoreRecipes();
        }
    };

    if (selectedRecipe) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.detailContainer}>
                    {/* Header with back button */}
                    <View style={styles.detailHeader}>
                        <Pressable style={styles.backButton} onPress={() => setSelectedRecipe(null)}>
                            <IconSymbol name="chevron.left" size={24} color="#333" />
                            <Text style={styles.backText}>Back</Text>
                        </Pressable>
                    </View>

                    {/* Recipe Image */}
                    {selectedRecipe.images && selectedRecipe.images.length > 0 && <Image source={getImageSource(selectedRecipe)} style={styles.detailImage} resizeMode="cover" />}

                    {/* Recipe Title and Info */}
                    <View style={styles.detailContent}>
                        <Text style={styles.detailTitle}>{selectedRecipe.title}</Text>

                        <View style={styles.recipeInfo}>
                            <Text style={styles.infoText}>🕒 {selectedRecipe.cookTime}</Text>
                            <Text style={styles.infoText}>📊 {selectedRecipe.difficulty}</Text>
                        </View>

                        <Text style={styles.detailDescription}>{selectedRecipe.description}</Text>

                        {/* Ingredients Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ingredients</Text>
                            {selectedRecipe.ingredients.map((ingredient, index) => (
                                <View key={index} style={styles.ingredientItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.ingredientText}>{ingredient}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Instructions Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Instructions</Text>
                            {selectedRecipe.instructions.map((instruction, index) => (
                                <View key={index} style={styles.instructionItem}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.instructionText}>{instruction}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
                <FloatingAIButton recipe={selectedRecipe} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} onScroll={handleScroll} scrollEventThrottle={16}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Discover Recipes</Text>
                    <Text style={styles.subtitle}>Find your next favorite dish</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search recipes, ingredients, or cuisines..." placeholderTextColor="#999" returnKeyType="search" onSubmitEditing={handleSearch} />
                        <Pressable style={styles.searchButton} onPress={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                            {isSearching ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.searchButtonText}>Search</Text>}
                        </Pressable>
                    </View>
                </View>

                {/* Active Search Filter Display */}
                {searchQuery && (
                    <View style={styles.filtersContainer}>
                        <View style={styles.activeFilters}>
                            <View style={styles.filterTag}>
                                <Text style={styles.filterTagText}>Searching: &ldquo;{searchQuery}&rdquo;</Text>
                            </View>
                            <Pressable 
                                style={styles.clearSearchButton} 
                                onPress={() => {
                                    setSearchQuery("");
                                    setHasSearched(false);
                                    setSearchResults([]);
                                }}
                            >
                                <Text style={styles.clearSearchText}>Clear</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Search Loading */}
                {isSearching && (
                    <View style={styles.searchLoadingContainer}>
                        <ActivityIndicator size="large" color="#FF8C00" />
                        <Text style={styles.searchLoadingText}>Finding delicious recipes...</Text>
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${searchProgress}%` }]} />
                        </View>
                    </View>
                )}

                {/* Search Results */}
                {hasSearched && !isSearching && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{searchResults.length > 0 ? `Search Results (${searchResults.length})` : "No recipes found"}</Text>
                        {searchResults.length > 0 && (
                            <View style={styles.searchResultsGrid}>
                                {searchResults.map((recipe) => (
                                    <Pressable key={recipe.id} style={styles.searchResultCard} onPress={() => setSelectedRecipe(recipe)}>
                                        {recipe.images && recipe.images.length > 0 ? (
                                            <Image source={getImageSource(recipe)} style={styles.searchResultImage} resizeMode="cover" />
                                        ) : (
                                            <View style={styles.searchResultImagePlaceholder}>
                                                <Text style={styles.searchResultImageText}>🍳</Text>
                                            </View>
                                        )}
                                        <View style={styles.searchResultContent}>
                                            <Text style={styles.searchResultTitle} numberOfLines={2}>
                                                {recipe.title}
                                            </Text>
                                            <Text style={styles.searchResultSubtitle} numberOfLines={2}>
                                                {recipe.description}
                                            </Text>
                                            <View style={styles.searchResultMeta}>
                                                <Text style={styles.searchResultTime}>⏱️ {recipe.cookTime}</Text>
                                                <Text style={styles.searchResultDifficulty}>📊 {recipe.difficulty}</Text>
                                            </View>
                                            <Text style={styles.searchResultIngredients} numberOfLines={1}>
                                                🥗 {recipe.ingredients.slice(0, 3).join(", ")}
                                                {recipe.ingredients.length > 3 && "..."}
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* For You - Personalized recommendations based on user preferences */}
                {!hasSearched && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>For You</Text>
                        {isLoadingForYou ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#FF8C00" />
                                <Text style={styles.loadingText}>Loading personalized recipes...</Text>
                            </View>
                        ) : (
                            <View style={styles.recipesGrid}>
                                {forYouRecipes.map((recipe) => (
                                    <Pressable key={recipe.id} style={styles.recipeCard} onPress={() => setSelectedRecipe(recipe)}>
                                        {recipe.images && recipe.images.length > 0 ? (
                                            <Image source={getImageSource(recipe)} style={styles.recipeImage} resizeMode="cover" />
                                        ) : (
                                            <View style={styles.recipeImagePlaceholder}>
                                                <Text style={styles.recipeImageText}>🍳</Text>
                                            </View>
                                        )}
                                        <View style={styles.recipeContent}>
                                            <Text style={styles.recipeTitle} numberOfLines={2}>
                                                {recipe.title}
                                            </Text>
                                            <Text style={styles.recipeSubtitle}>
                                                {recipe.cookTime} • {recipe.difficulty}
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {/* Loading more recipes indicator */}
                        {isLoadingMore && (
                            <View style={styles.loadingMoreContainer}>
                                <ActivityIndicator size="small" color="#FF8C00" />
                                <Text style={styles.loadingMoreText}>Loading more recipes...</Text>
                            </View>
                        )}

                        {/* End of recipes indicator */}
                        {!hasMoreRecipes && forYouRecipes.length > 4 && (
                            <View style={styles.endContainer}>
                                <Text style={styles.endText}>You&apos;ve reached the end! 🍽️</Text>
                                <Text style={styles.endSubtext}>Check back later for more delicious recipes</Text>
                            </View>
                        )}

                        {/* Add padding at the bottom to ensure scrollability */}
                        <View style={styles.bottomPadding} />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#333",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    searchContainer: {
        marginBottom: 25,
        paddingHorizontal: 4,
    },
    searchBar: {
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchInput: {
        fontSize: 16,
        color: "#333",
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    searchButton: {
        backgroundColor: "#FF8C00",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 80,
    },
    searchButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#333",
        marginBottom: 16,
    },
    filtersContainer: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    activeFilters: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterTag: {
        backgroundColor: "#fff5e6",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#ffe0b3",
    },
    filterTagText: {
        fontSize: 13,
        color: "#FF8C00",
        fontWeight: "500",
    },
    recipesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    recipeCard: {
        width: "48%",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
    },
    recipeImagePlaceholder: {
        height: 120,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
    },
    recipeImageText: {
        fontSize: 32,
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        padding: 12,
        paddingBottom: 4,
    },
    recipeSubtitle: {
        fontSize: 12,
        color: "#666",
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    trendingList: {
        gap: 12,
    },
    trendingItem: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
    },
    trendingImagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: "#e0e0e0",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    trendingImageText: {
        fontSize: 24,
    },
    trendingContent: {
        flex: 1,
    },
    trendingTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    trendingSubtitle: {
        fontSize: 12,
        color: "#666",
    },
    // Search result styles
    searchResultsGrid: {
        gap: 16,
    },
    searchResultCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchResultImage: {
        width: "100%",
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    searchResultImagePlaceholder: {
        width: "100%",
        height: 150,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    searchResultImageText: {
        fontSize: 32,
    },
    searchResultContent: {
        gap: 6,
    },
    searchResultTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },
    searchResultSubtitle: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    searchResultMeta: {
        flexDirection: "row",
        gap: 16,
        marginVertical: 4,
    },
    searchResultTime: {
        fontSize: 12,
        color: "#666",
    },
    searchResultDifficulty: {
        fontSize: 12,
        color: "#666",
    },
    searchResultIngredients: {
        fontSize: 12,
        color: "#888",
        fontStyle: "italic",
    },
    // Detail view styles
    detailContainer: {
        flex: 1,
    },
    detailHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: "#fff",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "600",
    },
    detailImage: {
        width: "100%",
        height: 250,
    },
    detailContent: {
        padding: 20,
    },
    detailTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#333",
        marginBottom: 12,
        lineHeight: 34,
    },
    recipeInfo: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    detailDescription: {
        fontSize: 16,
        color: "#555",
        lineHeight: 24,
        marginBottom: 24,
    },
    ingredientItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
        paddingRight: 16,
    },
    bullet: {
        fontSize: 16,
        color: "#FF8C00",
        marginRight: 12,
        marginTop: 2,
        fontWeight: "bold",
    },
    ingredientText: {
        fontSize: 16,
        color: "#333",
        lineHeight: 24,
        flex: 1,
    },
    instructionItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
        paddingRight: 16,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#FF8C00",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "700",
    },
    instructionText: {
        fontSize: 16,
        color: "#333",
        lineHeight: 24,
        flex: 1,
    },
    // Loading styles
    loadingContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    loadingMoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    debugButton: {
        backgroundColor: "#FF8C00",
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center",
    },
    debugButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    bottomPadding: {
        height: 200,
    },
    // End of content styles
    endContainer: {
        alignItems: "center",
        paddingVertical: 30,
        gap: 8,
    },
    endText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        textAlign: "center",
    },
    endSubtext: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
    // Recipe card styles
    recipeImage: {
        width: "100%",
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    recipeContent: {
        gap: 4,
    },
    // Search loading styles
    searchLoadingContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        gap: 16,
    },
    searchLoadingText: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
        fontWeight: "500",
    },
    progressBarContainer: {
        width: "80%",
        height: 4,
        backgroundColor: "#f0f0f0",
        borderRadius: 2,
        overflow: "hidden",
        marginTop: 8,
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#FF8C00",
        borderRadius: 2,
    },
    // Clear search styles
    clearSearchButton: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginLeft: 8,
    },
    clearSearchText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
});
