import { IconSymbol } from "@/components/ui/icon-symbol";
import { userAPI } from "@/lib/api/users";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DIETARY_OPTIONS = [
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Low-Carb", "Nut-Free",
    "Halal", "Kosher", "Low-Sodium", "Sugar-Free", "Raw Food", "Whole30", "FODMAP", "Anti-Inflammatory"
];

const CUISINE_PREFERENCES = [
    "Italian", "Indian", "Mexican", "Chinese", "Mediterranean", "Thai", "Japanese", "American", 
    "French", "Korean", "Spanish", "Greek", "Lebanese", "Vietnamese", "Brazilian", "Ethiopian"
];

const COOKING_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const TIME_PREFERENCES = ["Quick (15-30 min)", "Moderate (30-60 min)", "Long (1+ hours)", "All Day"];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Desserts", "Appetizers", "Beverages"];

const FLAVOR_PROFILES = ["Sweet", "Savory", "Spicy", "Tangy", "Bitter", "Umami", "Mild", "Bold"];

const COMMON_INGREDIENTS = [
    "Chicken", "Beef", "Fish", "Shrimp", "Tofu", "Eggs", "Cheese", "Milk", "Butter", "Olive Oil",
    "Garlic", "Onion", "Tomato", "Potato", "Rice", "Pasta", "Bread", "Lettuce", "Carrot", "Bell Pepper"
];

export default function PreferencesScreen() {
    const { user, dbUser, refreshUser } = useAuthContext();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState(dbUser?.firstName || user?.firstName || "");
    const [lastName, setLastName] = useState(dbUser?.lastName || user?.lastName || "");
    const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [customIngredients, setCustomIngredients] = useState<string[]>([]);
    const [customCuisines, setCustomCuisines] = useState<string[]>([]);
    const [customDietary, setCustomDietary] = useState<string[]>([]);
    const [skillLevel, setSkillLevel] = useState<string>("");
    const [timePreference, setTimePreference] = useState<string>("");
    const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
    const [selectedFlavorProfiles, setSelectedFlavorProfiles] = useState<string[]>([]);
    
    // Custom input states
    const [newCustomIngredient, setNewCustomIngredient] = useState("");
    const [newCustomCuisine, setNewCustomCuisine] = useState("");
    const [newCustomDietary, setNewCustomDietary] = useState("");

    useEffect(() => {
        // Initialize form with current user data if available
        if (dbUser) {
            setFirstName(dbUser.firstName || "");
            setLastName(dbUser.lastName || "");
            setSelectedDietary(dbUser.dietaryRestrictions || []);
            setSelectedCuisines(dbUser.preferences || []);
            setSelectedIngredients(dbUser.ingredients || []);
            setCustomIngredients(dbUser.customIngredients || []);
            setCustomCuisines(dbUser.customCuisines || []);
            setCustomDietary(dbUser.customDietary || []);
            setSkillLevel(dbUser.skillLevel || "");
            setTimePreference(dbUser.timePreference || "");
            setSelectedMealTypes(dbUser.mealTypes || []);
            setSelectedFlavorProfiles(dbUser.flavorProfiles || []);
        } else if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            // Set some default preferences if no database user
            setSelectedDietary([]);
            setSelectedCuisines([]);
            setSelectedIngredients([]);
            setCustomIngredients([]);
            setCustomCuisines([]);
            setCustomDietary([]);
            setSkillLevel("");
            setTimePreference("");
            setSelectedMealTypes([]);
            setSelectedFlavorProfiles([]);
        }
    }, [user, dbUser]);

    const toggleDietaryRestriction = (option: string) => {
        setSelectedDietary((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
    };

    const toggleCuisinePreference = (option: string) => {
        setSelectedCuisines((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
    };

    const toggleIngredient = (option: string) => {
        setSelectedIngredients((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
    };

    const toggleMealType = (option: string) => {
        setSelectedMealTypes((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
    };

    const toggleFlavorProfile = (option: string) => {
        setSelectedFlavorProfiles((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
    };

    const addCustomIngredient = () => {
        if (newCustomIngredient.trim() && !customIngredients.includes(newCustomIngredient.trim())) {
            setCustomIngredients(prev => [...prev, newCustomIngredient.trim()]);
            setNewCustomIngredient("");
        }
    };

    const addCustomCuisine = () => {
        if (newCustomCuisine.trim() && !customCuisines.includes(newCustomCuisine.trim())) {
            setCustomCuisines(prev => [...prev, newCustomCuisine.trim()]);
            setNewCustomCuisine("");
        }
    };

    const addCustomDietary = () => {
        if (newCustomDietary.trim() && !customDietary.includes(newCustomDietary.trim())) {
            setCustomDietary(prev => [...prev, newCustomDietary.trim()]);
            setNewCustomDietary("");
        }
    };

    const removeCustomItem = (type: 'ingredient' | 'cuisine' | 'dietary', item: string) => {
        switch (type) {
            case 'ingredient':
                setCustomIngredients(prev => prev.filter(i => i !== item));
                break;
            case 'cuisine':
                setCustomCuisines(prev => prev.filter(i => i !== item));
                break;
            case 'dietary':
                setCustomDietary(prev => prev.filter(i => i !== item));
                break;
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            // First, update the user's basic information
            await userAPI.createOrUpdateUser({
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                imageUrl: user.imageUrl,
            });

            // Then update all the preferences
            await userAPI.updateUserProfile(user.id, {
                preferences: selectedCuisines,
                dietaryRestrictions: selectedDietary,
                ingredients: selectedIngredients,
                customIngredients: customIngredients,
                customCuisines: customCuisines,
                customDietary: customDietary,
                skillLevel: skillLevel,
                timePreference: timePreference,
                mealTypes: selectedMealTypes,
                flavorProfiles: selectedFlavorProfiles,
            });

            // Refresh the user data in context
            await refreshUser();

            Alert.alert("Success", "Your preferences have been saved successfully!", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error) {
            console.error("Error saving preferences:", error);
            Alert.alert("Error", "Failed to save your preferences. Please try again.", [{ text: "OK" }]);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        Alert.alert("Discard Changes", "Are you sure you want to discard your changes?", [
            { text: "Keep Editing", style: "cancel" },
            { text: "Discard", style: "destructive", onPress: () => router.back() },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleCancel}>
                    <IconSymbol name="chevron.left" size={24} color="#333" />
                    <Text style={styles.backText}>Cancel</Text>
                </Pressable>
                <Text style={styles.title}>Edit Profile</Text>
                <Pressable style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={handleSave} disabled={isSaving}>
                    <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>{isSaving ? "Saving..." : "Save"}</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content}>
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <TextInput style={styles.textInput} value={firstName} onChangeText={setFirstName} placeholder="Enter your first name" autoCapitalize="words" />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <TextInput style={styles.textInput} value={lastName} onChangeText={setLastName} placeholder="Enter your last name" autoCapitalize="words" />
                    </View>
                </View>

                {/* Cooking Level */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cooking Level</Text>
                    <View style={styles.optionsContainer}>
                        {COOKING_LEVELS.map((level) => (
                            <View key={level} style={styles.optionRow}>
                                <Text style={styles.optionText}>{level}</Text>
                                <Switch value={skillLevel === level} onValueChange={() => setSkillLevel(skillLevel === level ? "" : level)} trackColor={{ false: "#e0e0e0", true: "#FF8C00" }} thumbColor={skillLevel === level ? "#fff" : "#f4f3f4"} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Time Preference */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Time Preference</Text>
                    <View style={styles.optionsContainer}>
                        {TIME_PREFERENCES.map((time) => (
                            <View key={time} style={styles.optionRow}>
                                <Text style={styles.optionText}>{time}</Text>
                                <Switch value={timePreference === time} onValueChange={() => setTimePreference(timePreference === time ? "" : time)} trackColor={{ false: "#e0e0e0", true: "#FF8C00" }} thumbColor={timePreference === time ? "#fff" : "#f4f3f4"} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Dietary Restrictions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
                    <Text style={styles.sectionSubtitle}>Select all that apply to you</Text>

                    <View style={styles.optionsContainer}>
                        {DIETARY_OPTIONS.map((option) => (
                            <View key={option} style={styles.optionRow}>
                                <Text style={styles.optionText}>{option}</Text>
                                <Switch value={selectedDietary.includes(option)} onValueChange={() => toggleDietaryRestriction(option)} trackColor={{ false: "#e0e0e0", true: "#FF8C00" }} thumbColor={selectedDietary.includes(option) ? "#fff" : "#f4f3f4"} />
                            </View>
                        ))}
                    </View>

                    {/* Custom Dietary */}
                    <View style={styles.customInputContainer}>
                        <Text style={styles.inputLabel}>Add Custom Dietary Restriction</Text>
                        <View style={styles.customInputRow}>
                            <TextInput 
                                style={[styles.textInput, styles.customInput]} 
                                value={newCustomDietary} 
                                onChangeText={setNewCustomDietary} 
                                placeholder="e.g., Low FODMAP" 
                                autoCapitalize="words" 
                            />
                            <Pressable style={styles.addButton} onPress={addCustomDietary}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </Pressable>
                        </View>
                        {customDietary.length > 0 && (
                            <View style={styles.customTagsContainer}>
                                {customDietary.map((item) => (
                                    <View key={item} style={styles.customTag}>
                                        <Text style={styles.customTagText}>{item}</Text>
                                        <Pressable onPress={() => removeCustomItem('dietary', item)}>
                                            <Text style={styles.removeTagText}>×</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Cuisine Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cuisine Preferences</Text>
                    <Text style={styles.sectionSubtitle}>Choose your favorite cuisines</Text>

                    <View style={styles.optionsContainer}>
                        {CUISINE_PREFERENCES.map((option) => (
                            <View key={option} style={styles.optionRow}>
                                <Text style={styles.optionText}>{option}</Text>
                                <Switch value={selectedCuisines.includes(option)} onValueChange={() => toggleCuisinePreference(option)} trackColor={{ false: "#e0e0e0", true: "#FF8C00" }} thumbColor={selectedCuisines.includes(option) ? "#fff" : "#f4f3f4"} />
                            </View>
                        ))}
                    </View>

                    {/* Custom Cuisines */}
                    <View style={styles.customInputContainer}>
                        <Text style={styles.inputLabel}>Add Custom Cuisine</Text>
                        <View style={styles.customInputRow}>
                            <TextInput 
                                style={[styles.textInput, styles.customInput]} 
                                value={newCustomCuisine} 
                                onChangeText={setNewCustomCuisine} 
                                placeholder="e.g., Peruvian" 
                                autoCapitalize="words" 
                            />
                            <Pressable style={styles.addButton} onPress={addCustomCuisine}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </Pressable>
                        </View>
                        {customCuisines.length > 0 && (
                            <View style={styles.customTagsContainer}>
                                {customCuisines.map((item) => (
                                    <View key={item} style={styles.customTag}>
                                        <Text style={styles.customTagText}>{item}</Text>
                                        <Pressable onPress={() => removeCustomItem('cuisine', item)}>
                                            <Text style={styles.removeTagText}>×</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Preferred Ingredients */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferred Ingredients</Text>
                    <Text style={styles.sectionSubtitle}>Select ingredients you love to cook with</Text>

                    <View style={styles.optionsContainer}>
                        {COMMON_INGREDIENTS.map((option) => (
                            <View key={option} style={styles.optionRow}>
                                <Text style={styles.optionText}>{option}</Text>
                                <Switch value={selectedIngredients.includes(option)} onValueChange={() => toggleIngredient(option)} trackColor={{ false: "#e0e0e0", true: "#FF8C00" }} thumbColor={selectedIngredients.includes(option) ? "#fff" : "#f4f3f4"} />
                            </View>
                        ))}
                    </View>

                    {/* Custom Ingredients */}
                    <View style={styles.customInputContainer}>
                        <Text style={styles.inputLabel}>Add Custom Ingredient</Text>
                        <View style={styles.customInputRow}>
                            <TextInput 
                                style={[styles.textInput, styles.customInput]} 
                                value={newCustomIngredient} 
                                onChangeText={setNewCustomIngredient} 
                                placeholder="e.g., Truffle Oil" 
                                autoCapitalize="words" 
                            />
                            <Pressable style={styles.addButton} onPress={addCustomIngredient}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </Pressable>
                        </View>
                        {customIngredients.length > 0 && (
                            <View style={styles.customTagsContainer}>
                                {customIngredients.map((item) => (
                                    <View key={item} style={styles.customTag}>
                                        <Text style={styles.customTagText}>{item}</Text>
                                        <Pressable onPress={() => removeCustomItem('ingredient', item)}>
                                            <Text style={styles.removeTagText}>×</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Meal Types */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferred Meal Types</Text>
                    <View style={styles.optionsContainer}>
                        {MEAL_TYPES.map((option) => (
                            <View key={option} style={styles.optionRow}>
                                <Text style={styles.optionText}>{option}</Text>
                                <Switch value={selectedMealTypes.includes(option)} onValueChange={() => toggleMealType(option)} trackColor={{ false: "#e0e0e0", true: "#FF8C00" }} thumbColor={selectedMealTypes.includes(option) ? "#fff" : "#f4f3f4"} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Flavor Profiles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Flavor Preferences</Text>
                    <View style={styles.optionsContainer}>
                        {FLAVOR_PROFILES.map((option) => (
                            <View key={option} style={styles.optionRow}>
                                <Text style={styles.optionText}>{option}</Text>
                                <Switch value={selectedFlavorProfiles.includes(option)} onValueChange={() => toggleFlavorProfile(option)} trackColor={{ false: "#e0e0e0", true: "#FF8C00" }} thumbColor={selectedFlavorProfiles.includes(option) ? "#fff" : "#f4f3f4"} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            <Text style={styles.summaryLabel}>Name: </Text>
                            {firstName} {lastName}
                        </Text>
                        {skillLevel && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Cooking Level: </Text>
                                {skillLevel}
                            </Text>
                        )}
                        {timePreference && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Time Preference: </Text>
                                {timePreference}
                            </Text>
                        )}
                        {selectedDietary.length > 0 && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Dietary: </Text>
                                {[...selectedDietary, ...customDietary].join(", ")}
                            </Text>
                        )}
                        {selectedCuisines.length > 0 && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Cuisines: </Text>
                                {[...selectedCuisines, ...customCuisines].join(", ")}
                            </Text>
                        )}
                        {selectedIngredients.length > 0 && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Ingredients: </Text>
                                {[...selectedIngredients, ...customIngredients].join(", ")}
                            </Text>
                        )}
                        {selectedMealTypes.length > 0 && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Meal Types: </Text>
                                {selectedMealTypes.join(", ")}
                            </Text>
                        )}
                        {selectedFlavorProfiles.length > 0 && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Flavors: </Text>
                                {selectedFlavorProfiles.join(", ")}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        fontSize: 16,
        color: "#333",
        marginLeft: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    saveButton: {
        backgroundColor: "#FF8C00",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        backgroundColor: "#ccc",
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    saveTextDisabled: {
        color: "#999",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    optionsContainer: {
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 4,
    },
    optionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    summaryContainer: {
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
    },
    summaryText: {
        fontSize: 14,
        color: "#333",
        marginBottom: 8,
    },
    summaryLabel: {
        fontWeight: "600",
    },
    customInputContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    customInputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    customInput: {
        flex: 1,
    },
    addButton: {
        backgroundColor: "#FF8C00",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    customTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    customTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FF8C00",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    customTagText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
    },
    removeTagText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
