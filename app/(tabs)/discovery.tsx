import { IconSymbol } from "@/components/ui/icon-symbol";
import { Recipe, toolhouseAPI } from "@/lib/services/toolhouse-api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Recipe Card Component
const RecipeCard = ({ recipe, index, onPress }: { recipe: Recipe; index: number; onPress: () => void }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <Pressable style={styles.recipeCard} onPress={onPress}>
            <View style={styles.recipeImageContainer}>
                {recipe.imageUrl && !imageError ? (
                    <Image
                        source={{ uri: recipe.imageUrl }}
                        style={styles.recipeImage}
                        onError={(error) => {
                            console.log("Failed to load image:", recipe.imageUrl, error.nativeEvent.error);
                            setImageError(true);
                        }}
                        onLoad={() => setImageError(false)}
                    />
                ) : (
                    <View style={styles.recipeImagePlaceholder}>
                        <Text style={styles.recipeImageText}>🍳</Text>
                    </View>
                )}
            </View>
            <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                    {recipe.name}
                </Text>
                <Text style={styles.recipeSubtitle}>
                    {recipe.prepTime ? `${recipe.prepTime}` : "Time varies"}
                    {recipe.servings ? ` • ${recipe.servings} servings` : ""}
                    {recipe.difficulty ? ` • ${recipe.difficulty}` : ""}
                </Text>
                {recipe.tags && recipe.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {recipe.tags.slice(0, 3).map((tag, tagIndex) => (
                            <View key={tagIndex} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </Pressable>
    );
};

export default function DiscoveryScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const categories = ["Italian", "Indian", "Mediterranean", "Asian", "Mexican", "American"];

    const performSearch = async () => {
        if (!searchQuery.trim()) {
            Alert.alert("Search Required", "Please enter a search query to find recipes.");
            return;
        }

        console.log("Starting search for:", searchQuery);
        setIsSearching(true);
        setSearchResults([]);

        try {
            // Build search query with category filter if selected
            let query = searchQuery.trim();
            if (selectedCategory) {
                query = `${selectedCategory} ${query}`;
            }

            console.log("Sending parallel API requests with query:", query);
            const response = await toolhouseAPI.getRecipesParallel(query);
            console.log("API response:", response);

            setSearchResults(response.recipes);
            setHasSearched(true);

            if (response.recipes.length === 0) {
                Alert.alert("No Results", "No recipes found for your search. Try different keywords.");
            } else {
                console.log(`Found ${response.recipes.length} recipes`);
            }
        } catch (error) {
            console.error("Search error:", error);
            Alert.alert("Search Error", `Failed to search for recipes: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchResults([]);
        setHasSearched(false);
        setSearchQuery("");
        setSelectedCategory(null);
    };

    const openRecipeModal = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setModalVisible(true);
    };

    const closeRecipeModal = () => {
        setModalVisible(false);
        setSelectedRecipe(null);
    };

    const renderRecipeCard = (recipe: Recipe, index: number) => <RecipeCard key={`recipe-${index}-${recipe.name}`} recipe={recipe} index={index} onPress={() => openRecipeModal(recipe)} />;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Discover Recipes</Text>
                    <Text style={styles.subtitle}>Find your next favorite dish</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search recipes, ingredients, or cuisines..." placeholderTextColor="#999" returnKeyType="search" onSubmitEditing={performSearch} />
                        <Pressable style={styles.searchButton} onPress={performSearch} disabled={isSearching}>
                            {isSearching ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <View style={styles.searchButtonContent}>
                                    <IconSymbol name="magnifyingglass" size={16} color="#fff" />
                                    <Text style={styles.searchButtonText}>Search</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                        <Pressable key="all" style={[styles.categoryCard, selectedCategory === null && styles.categoryCardSelected]} onPress={() => setSelectedCategory(null)}>
                            <Text style={[styles.categoryText, selectedCategory === null && styles.categoryTextSelected]}>All</Text>
                        </Pressable>
                        {categories.map((category) => (
                            <Pressable key={category} style={[styles.categoryCard, selectedCategory === category && styles.categoryCardSelected]} onPress={() => setSelectedCategory(category)}>
                                <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextSelected]}>{category}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Active Filters Display */}
                {(searchQuery || selectedCategory) && (
                    <View style={styles.filtersContainer}>
                        <Text style={styles.filtersTitle}>Active Filters:</Text>
                        <View style={styles.activeFilters}>
                            {searchQuery && (
                                <View style={styles.filterTag}>
                                    <Text style={styles.filterTagText}>Search: &quot;{searchQuery}&quot;</Text>
                                </View>
                            )}
                            {selectedCategory && (
                                <View style={styles.filterTag}>
                                    <Text style={styles.filterTagText}>Category: {selectedCategory}</Text>
                                </View>
                            )}
                            {hasSearched && (
                                <Pressable style={styles.clearButton} onPress={clearSearch}>
                                    <Text style={styles.clearButtonText}>Clear Search</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                )}

                {/* Search Results Section */}
                {hasSearched && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Search Results ({searchResults.length})</Text>
                        {searchResults.length > 0 ? (
                            <View style={styles.recipesGrid}>{searchResults.map((recipe, index) => renderRecipeCard(recipe, index))}</View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No recipes found</Text>
                                <Text style={styles.emptyStateSubtext}>Try different keywords or categories</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Show default content only when no search has been performed */}
                {!hasSearched && (
                    <>
                        {/* For You */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>For You</Text>
                            <View style={styles.recipesGrid}>
                                {[1, 2, 3, 4].map((item) => (
                                    <Pressable key={item} style={styles.recipeCard}>
                                        <View style={styles.recipeImagePlaceholder}>
                                            <Text style={styles.recipeImageText}>🍳</Text>
                                        </View>
                                        <View style={styles.recipeInfo}>
                                            <Text style={styles.recipeTitle}>Recipe {item}</Text>
                                            <Text style={styles.recipeSubtitle}>30 min • 4.5 ⭐</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Featured Recipes */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Featured Recipes</Text>
                            <View style={styles.trendingList}>
                                {[1, 2, 3].map((item) => (
                                    <Pressable key={item} style={styles.trendingItem}>
                                        <View style={styles.trendingImagePlaceholder}>
                                            <Text style={styles.trendingImageText}>🔥</Text>
                                        </View>
                                        <View style={styles.trendingContent}>
                                            <Text style={styles.trendingTitle}>Trending Recipe {item}</Text>
                                            <Text style={styles.trendingSubtitle}>Quick & Easy • 25 min</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Recipe Detail Modal */}
            <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={closeRecipeModal}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Pressable style={styles.modalCloseButton} onPress={closeRecipeModal}>
                            <IconSymbol name="xmark" size={24} color="#333" />
                        </Pressable>
                        <Text style={styles.modalTitle}>Recipe Details</Text>
                        <Pressable style={styles.aiChatButton} onPress={() => router.push('/ai-chat')}>
                            <IconSymbol name="sparkles" size={20} color="#fff" />
                        </Pressable>
                    </View>

                    {selectedRecipe && (
                        <ScrollView style={styles.modalContent}>
                            {/* Recipe Image */}
                            <View style={styles.modalImageContainer}>
                                {selectedRecipe.imageUrl ? (
                                    <Image source={{ uri: selectedRecipe.imageUrl }} style={styles.modalImage} onError={() => console.log("Failed to load modal image:", selectedRecipe.imageUrl)} />
                                ) : (
                                    <View style={styles.modalImagePlaceholder}>
                                        <Text style={styles.modalImageText}>🍳</Text>
                                    </View>
                                )}
                            </View>

                            {/* Recipe Info */}
                            <View style={styles.modalInfo}>
                                <Text style={styles.modalRecipeTitle}>{selectedRecipe.name}</Text>

                                {/* Recipe Meta */}
                                <View style={styles.recipeMeta}>
                                    {selectedRecipe.prepTime && (
                                        <View style={styles.metaItem}>
                                            <IconSymbol name="clock" size={16} color="#666" />
                                            <Text style={styles.metaText}>{selectedRecipe.prepTime}</Text>
                                        </View>
                                    )}
                                    {selectedRecipe.servings && (
                                        <View style={styles.metaItem}>
                                            <IconSymbol name="person.2" size={16} color="#666" />
                                            <Text style={styles.metaText}>{selectedRecipe.servings}</Text>
                                        </View>
                                    )}
                                    {selectedRecipe.difficulty && (
                                        <View style={styles.metaItem}>
                                            <IconSymbol name="chart.bar" size={16} color="#666" />
                                            <Text style={styles.metaText}>{selectedRecipe.difficulty}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Tags */}
                                {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                                    <View style={styles.modalTagsContainer}>
                                        {selectedRecipe.tags.map((tag, index) => (
                                            <View key={index} style={styles.modalTag}>
                                                <Text style={styles.modalTagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Ingredients */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Ingredients</Text>
                                    <View style={styles.ingredientsContainer}>
                                        {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                                            selectedRecipe.ingredients.map((ingredient, index) => (
                                                <View key={index} style={styles.ingredientCard}>
                                                    <View style={styles.ingredientIcon}>
                                                        <Text style={styles.ingredientIconText}>🥄</Text>
                                                    </View>
                                                    <Text style={styles.ingredientText}>{ingredient}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.noDataText}>No ingredients listed</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Instructions */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Instructions</Text>
                                    <View style={styles.instructionsContainer}>
                                        {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 ? (
                                            selectedRecipe.instructions.map((instruction, index) => (
                                                <View key={index} style={styles.instructionCard}>
                                                    <View style={styles.stepNumber}>
                                                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                                                    </View>
                                                    <View style={styles.instructionContent}>
                                                        <Text style={styles.instructionText}>{instruction}</Text>
                                                    </View>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.noDataText}>No instructions listed</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal>
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
        marginBottom: 30,
    },
    searchBar: {
        flexDirection: "row",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        padding: 16,
    },
    searchButton: {
        backgroundColor: "#FF8C00",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    searchButtonContent: {
        flexDirection: "row",
        alignItems: "center",
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
    categoriesContainer: {
        marginBottom: 10,
    },
    categoryCard: {
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    categoryCardSelected: {
        backgroundColor: "#FF8C00",
        borderColor: "#FF8C00",
    },
    categoryText: {
        color: "#666",
        fontWeight: "600",
        fontSize: 14,
    },
    categoryTextSelected: {
        color: "#fff",
    },
    filtersContainer: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    filtersTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    activeFilters: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterTag: {
        backgroundColor: "#fff5e6",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#ffe0b3",
    },
    filterTagText: {
        fontSize: 12,
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
    // New styles for search functionality
    recipeImageContainer: {
        height: 120,
        overflow: "hidden",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    recipeImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    recipeInfo: {
        padding: 12,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 6,
        gap: 4,
    },
    tag: {
        backgroundColor: "#fff5e6",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        color: "#FF8C00",
        fontWeight: "500",
    },
    clearButton: {
        backgroundColor: "#ff4444",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    clearButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 24,
        paddingTop: 32,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalCloseButton: {
        padding: 12,
        borderRadius: 24,
        backgroundColor: "#f5f5f5",
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },
    placeholder: {
        width: 40,
    },
    aiChatButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#FF8C00",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    modalContent: {
        flex: 1,
    },
    modalImageContainer: {
        width: "100%",
        height: 250,
        backgroundColor: "#f5f5f5",
    },
    modalImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    modalImagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    modalImageText: {
        fontSize: 40,
    },
    modalInfo: {
        padding: 20,
    },
    modalRecipeTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#333",
        marginBottom: 16,
    },
    recipeMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    modalTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    modalTag: {
        backgroundColor: "#fff5e6",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    modalTagText: {
        fontSize: 12,
        color: "#FF8C00",
        fontWeight: "600",
    },
    modalSectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 12,
    },
    modalSection: {
        marginBottom: 24,
    },
    ingredientsContainer: {
        gap: 8,
    },
    ingredientCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#FF8C00",
    },
    ingredientIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fff5e6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    ingredientIconText: {
        fontSize: 16,
    },
    ingredientText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        flex: 1,
    },
    instructionsContainer: {
        gap: 12,
    },
    instructionCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#FF8C00",
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#FF8C00",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        marginTop: 2,
    },
    stepNumberText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    instructionContent: {
        flex: 1,
    },
    instructionText: {
        fontSize: 15,
        color: "#333",
        lineHeight: 24,
        fontWeight: "400",
    },
    noDataText: {
        fontSize: 14,
        color: "#999",
        fontStyle: "italic",
        textAlign: "center",
        padding: 20,
    },
});
