import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface Tag {
  id: string;
  label: string;
  selected: boolean;
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<Tag[]>([
    { id: 'dairy-free', label: 'Dairy Free', selected: false },
    { id: 'gluten-free', label: 'Gluten Free', selected: false },
    { id: 'halal', label: 'Halal', selected: false },
    { id: 'keto', label: 'Keto', selected: false },
    { id: 'kosher', label: 'Kosher', selected: false },
    { id: 'low-carb', label: 'Low Carb', selected: false },
    { id: 'low-sodium', label: 'Low Sodium', selected: false },
    { id: 'nut-free', label: 'Nut Free', selected: false },
    { id: 'paleo', label: 'Paleo', selected: false },
    { id: 'vegan', label: 'Vegan', selected: false },
    { id: 'vegetarian', label: 'Vegetarian', selected: false },
  ]);
  
  const [favoriteCuisines, setFavoriteCuisines] = useState<Tag[]>([
    { id: 'american', label: 'American', selected: false },
    { id: 'chinese', label: 'Chinese', selected: false },
    { id: 'french', label: 'French', selected: false },
    { id: 'greek', label: 'Greek', selected: false },
    { id: 'indian', label: 'Indian', selected: false },
    { id: 'italian', label: 'Italian', selected: false },
    { id: 'japanese', label: 'Japanese', selected: false },
    { id: 'korean', label: 'Korean', selected: false },
    { id: 'mediterranean', label: 'Mediterranean', selected: false },
    { id: 'mexican', label: 'Mexican', selected: false },
    { id: 'spanish', label: 'Spanish', selected: false },
    { id: 'thai', label: 'Thai', selected: false },
  ]);

  const toggleTag = (tagId: string, type: 'dietary' | 'cuisine') => {
    if (type === 'dietary') {
      setDietaryPreferences(prev => 
        prev.map(tag => 
          tag.id === tagId ? { ...tag, selected: !tag.selected } : tag
        )
      );
    } else {
      setFavoriteCuisines(prev => 
        prev.map(tag => 
          tag.id === tagId ? { ...tag, selected: !tag.selected } : tag
        )
      );
    }
  };

  const handleComplete = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Required Fields', 'Please enter your first and last name.');
      return;
    }

    // Log the collected data for now
    console.log('Profile Setup Complete!');
    console.log('Name:', firstName.trim(), lastName.trim());
    console.log('Dietary Preferences:', dietaryPreferences.filter(tag => tag.selected).map(tag => tag.label));
    console.log('Favorite Cuisines:', favoriteCuisines.filter(tag => tag.selected).map(tag => tag.label));
    
    // Navigate to the main app - discovery tab
    router.replace('/(tabs)/discovery');
  };

  const renderTag = (tag: Tag, type: 'dietary' | 'cuisine') => (
    <Pressable
      key={tag.id}
      style={[
        styles.tag,
        tag.selected && styles.tagSelected
      ]}
      onPress={() => toggleTag(tag.id, type)}
    >
      <Text style={[
        styles.tagText,
        tag.selected && styles.tagTextSelected
      ]}>
        {tag.label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us personalize your cooking experience
        </Text>

        {/* Name Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.nameRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Select any dietary restrictions or preferences
          </Text>
          <View style={styles.tagsContainer}>
            {dietaryPreferences.map(tag => renderTag(tag, 'dietary'))}
          </View>
        </View>

        {/* Favorite Cuisines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the cuisines you enjoy most
          </Text>
          <View style={styles.tagsContainer}>
            {favoriteCuisines.map(tag => renderTag(tag, 'cuisine'))}
          </View>
        </View>

        {/* Complete Button */}
        <Pressable style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  halfInput: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  tagSelected: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});