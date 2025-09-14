import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import AIChat from '../components/AIChat';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: string;
  difficulty: string;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { recipeContext } = useLocalSearchParams();

  // Parse recipe context if provided
  let recipe: Recipe | undefined;
  if (recipeContext && typeof recipeContext === 'string') {
    try {
      recipe = JSON.parse(recipeContext);
    } catch (error) {
      console.warn('Failed to parse recipe context:', error);
    }
  }

  const handleClose = () => {
    console.log('Back button pressed - navigating back to main app');
    // Navigate back to the main app tabs - use replace to ensure we go to discovery
    router.replace('/(tabs)/discovery');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AIChat 
        onClose={handleClose} 
        isFullScreen={true} 
        showBackButton={true} 
        recipeContext={recipe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});