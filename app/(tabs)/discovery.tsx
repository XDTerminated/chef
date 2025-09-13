import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiscoveryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = ['Italian', 'Indian', 'Mediterranean', 'Asian', 'Mexican', 'American'];

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
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search recipes, ingredients, or cuisines..."
              placeholderTextColor="#999"
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <Pressable 
              key="all" 
              style={[
                styles.categoryCard, 
                selectedCategory === null && styles.categoryCardSelected
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === null && styles.categoryTextSelected
              ]}>
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable 
                key={category} 
                style={[
                  styles.categoryCard,
                  selectedCategory === category && styles.categoryCardSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected
                ]}>
                  {category}
                </Text>
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
                  <Text style={styles.filterTagText}>Search: "{searchQuery}"</Text>
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

        {/* For You */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    marginBottom: 30,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryCard: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryCardSelected: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  categoryText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  filtersContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    backgroundColor: '#fff5e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffe0b3',
  },
  filterTagText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '500',
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  recipeImagePlaceholder: {
    height: 120,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeImageText: {
    fontSize: 32,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 12,
    paddingBottom: 4,
  },
  recipeSubtitle: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  trendingList: {
    gap: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  trendingImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trendingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});