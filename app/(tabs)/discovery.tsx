import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { searchRecipes } from "../../lib/services/recipe-search";

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

export default function DiscoveryScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const categories = ["Italian", "Indian", "Mediterranean", "Asian", "Mexican", "American"];

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        console.warn("🔍 Discovery: Starting search for:", searchQuery);
        setIsSearching(true);
        setHasSearched(true);

        try {
            console.warn("🚀 Discovery: Calling searchRecipes function...");
            const results = await searchRecipes(searchQuery.trim());
            setSearchResults(results);
            console.warn("✅ Discovery: Search completed, found", results.length, "recipes");
        } catch (error) {
            console.error("❌ Discovery: Search failed:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
            console.warn("🏁 Discovery: Search process finished");
        }
    };

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
                        <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search recipes, ingredients, or cuisines..." placeholderTextColor="#999" returnKeyType="search" onSubmitEditing={handleSearch} />
                        <Pressable style={styles.searchButton} onPress={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                            {isSearching ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.searchButtonText}>🔍</Text>}
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
                                    <Text style={styles.filterTagText}>Search: &ldquo;{searchQuery}&rdquo;</Text>
                                </View>
                            )}
                            {selectedCategory && (
                                <View style={styles.filterTag}>
                                    <Text style={styles.filterTagText}>Category: {selectedCategory}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Search Results */}
                {hasSearched && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{searchResults.length > 0 ? `Search Results (${searchResults.length})` : "No recipes found"}</Text>
                        {searchResults.length > 0 && (
                            <View style={styles.searchResultsGrid}>
                                {searchResults.map((recipe) => (
                                    <Pressable key={recipe.id} style={styles.searchResultCard}>
                                        {recipe.images && recipe.images.length > 0 ? (
                                            <Image source={{ uri: recipe.images[0] }} style={styles.searchResultImage} resizeMode="cover" />
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

                {/* For You - Only show if no search results */}
                {(!hasSearched || searchResults.length === 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>For You</Text>
                        <View style={styles.recipesGrid}>
                            {[1, 2, 3, 4].map((item) => (
                                <Pressable key={item} style={styles.recipeCard}>
                                    <View style={styles.recipeImagePlaceholder}>
                                        <Text style={styles.recipeImageText}>🍳</Text>
                                    </View>
                                    <Text style={styles.recipeTitle}>Recipe {item}</Text>
                                    <Text style={styles.recipeSubtitle}>30 min • 4.5 ⭐</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Featured Recipes - Only show if no search results */}
                {(!hasSearched || searchResults.length === 0) && (
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
        marginBottom: 30,
    },
    searchBar: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        fontSize: 16,
        color: "#333",
        flex: 1,
        padding: 16,
    },
    searchButton: {
        backgroundColor: "#FF8C00",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 8,
        minWidth: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    searchButtonText: {
        fontSize: 18,
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
});
