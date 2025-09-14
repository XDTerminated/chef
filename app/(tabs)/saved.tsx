import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SavedRecipesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'recent', label: 'Recent' },
    { id: 'cooking', label: 'Cooking' },
  ];

  const savedRecipes = [
    {
      id: 1,
      title: 'Classic Spaghetti Carbonara',
      category: 'Italian',
      time: '25 min',
      rating: 4.8,
      isFavorite: true,
      lastCooked: '2 days ago',
    },
    {
      id: 2,
      title: 'Chicken Tikka Masala',
      category: 'Indian',
      time: '45 min',
      rating: 4.9,
      isFavorite: true,
      lastCooked: '1 week ago',
    },
    {
      id: 3,
      title: 'Mediterranean Quinoa Bowl',
      category: 'Mediterranean',
      time: '20 min',
      rating: 4.6,
      isFavorite: false,
      lastCooked: '3 days ago',
    },
    {
      id: 4,
      title: 'Beef Stir Fry',
      category: 'Asian',
      time: '15 min',
      rating: 4.7,
      isFavorite: true,
      lastCooked: '5 days ago',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Saved Recipes</Text>
          <Text style={styles.subtitle}>Your personal recipe collection</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {filters.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Recipe Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{savedRecipes.length}</Text>
            <Text style={styles.statLabel}>Total Recipes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{savedRecipes.filter(r => r.isFavorite).length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Cooked This Week</Text>
          </View>
        </View>

        {/* Recipe List */}
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>Your Recipes</Text>
          {savedRecipes.map((recipe) => (
            <Pressable key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeImagePlaceholder}>
                <Text style={styles.recipeImageText}>🍽️</Text>
              </View>
              <View style={styles.recipeContent}>
                <View style={styles.recipeHeader}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Pressable style={styles.favoriteButton}>
                    <Text style={styles.favoriteIcon}>
                      {recipe.isFavorite ? '❤️' : '🤍'}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.recipeCategory}>{recipe.category}</Text>
                <View style={styles.recipeMeta}>
                  <Text style={styles.recipeTime}>⏱️ {recipe.time}</Text>
                  <Text style={styles.recipeRating}>⭐ {recipe.rating}</Text>
                </View>
                <Text style={styles.lastCooked}>Last cooked: {recipe.lastCooked}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>📋 Create Shopping List</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>📊 View Cooking Stats</Text>
          </Pressable>
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
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF8C00',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  recipesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  recipeImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeImageText: {
    fontSize: 24,
  },
  recipeContent: {
    flex: 1,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '500',
    marginBottom: 4,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  recipeTime: {
    fontSize: 12,
    color: '#666',
  },
  recipeRating: {
    fontSize: 12,
    color: '#666',
  },
  lastCooked: {
    fontSize: 11,
    color: '#999',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});