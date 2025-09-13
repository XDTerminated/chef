import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateRecipeScreen() {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your recipe has been saved as a draft.');
  };

  const handlePublish = () => {
    if (!recipeName.trim() || !ingredients.trim() || !instructions.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    Alert.alert('Recipe Published', 'Your recipe has been published successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Recipe</Text>
          <Text style={styles.subtitle}>Share your culinary creations</Text>
        </View>

        {/* Recipe Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Recipe Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter recipe name"
            value={recipeName}
            onChangeText={setRecipeName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your recipe..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.label}>Ingredients *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="List ingredients (one per line)"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            numberOfLines={6}
            placeholderTextColor="#999"
          />
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.label}>Instructions *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Step-by-step cooking instructions"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={8}
            placeholderTextColor="#999"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.label}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>📷 Add Photo</Text>
            </Pressable>
            <Pressable style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>⏱️ Set Time</Text>
            </Pressable>
            <Pressable style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>👥 Servings</Text>
            </Pressable>
            <Pressable style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>🏷️ Add Tags</Text>
            </Pressable>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.draftButton} onPress={handleSaveDraft}>
            <Text style={styles.draftButtonText}>Save Draft</Text>
          </Pressable>
          <Pressable style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishButtonText}>Publish Recipe</Text>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  draftButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  draftButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 12,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});