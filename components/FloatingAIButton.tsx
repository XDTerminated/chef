import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: string;
  difficulty: string;
  images: string[] | ImageSourcePropType[];
  sourceUrl?: string;
}

interface FloatingAIButtonProps {
  recipe?: Recipe;
}

export default function FloatingAIButton({ recipe }: FloatingAIButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (recipe) {
      // Navigate with recipe context
      router.push({
        pathname: '/ai-chat',
        params: {
          recipeContext: JSON.stringify({
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookTime: recipe.cookTime,
            difficulty: recipe.difficulty,
          })
        }
      });
    } else {
      // Navigate without context (fallback)
      router.push('/ai-chat');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handlePress}>
        <Ionicons name="sparkles" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});