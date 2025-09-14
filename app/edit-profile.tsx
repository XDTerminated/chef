import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userOperations } from "../lib/db/operations";
import { User } from "../lib/db/schema";

interface Tag {
    id: string;
    label: string;
    selected: boolean;
}

export default function EditProfileScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dbUser, setDbUser] = useState<User | null>(null);
    
    const [dietaryPreferences, setDietaryPreferences] = useState<Tag[]>([
        { id: "dairy-free", label: "Dairy Free", selected: false },
        { id: "gluten-free", label: "Gluten Free", selected: false },
        { id: "halal", label: "Halal", selected: false },
        { id: "keto", label: "Keto", selected: false },
        { id: "kosher", label: "Kosher", selected: false },
        { id: "low-carb", label: "Low Carb", selected: false },
        { id: "low-sodium", label: "Low Sodium", selected: false },
        { id: "nut-free", label: "Nut Free", selected: false },
        { id: "paleo", label: "Paleo", selected: false },
        { id: "vegan", label: "Vegan", selected: false },
        { id: "vegetarian", label: "Vegetarian", selected: false },
    ]);

    const [favoriteCuisines, setFavoriteCuisines] = useState<Tag[]>([
        { id: "american", label: "American", selected: false },
        { id: "chinese", label: "Chinese", selected: false },
        { id: "french", label: "French", selected: false },
        { id: "greek", label: "Greek", selected: false },
        { id: "indian", label: "Indian", selected: false },
        { id: "italian", label: "Italian", selected: false },
        { id: "japanese", label: "Japanese", selected: false },
        { id: "korean", label: "Korean", selected: false },
        { id: "mediterranean", label: "Mediterranean", selected: false },
        { id: "mexican", label: "Mexican", selected: false },
        { id: "spanish", label: "Spanish", selected: false },
        { id: "thai", label: "Thai", selected: false },
    ]);

    // Load current user preferences
    useEffect(() => {
        const loadUserData = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                console.log("Loading user data for editing:", user.id);
                const existingUser = await userOperations.getUserByClerkId(user.id);

                if (existingUser) {
                    console.log("User data loaded:", existingUser);
                    setDbUser(existingUser);

                    // Set existing dietary preferences
                    const existingDietary = existingUser.dietaryRestrictions || [];
                    setDietaryPreferences(prev => 
                        prev.map(tag => ({
                            ...tag,
                            selected: existingDietary.includes(tag.label)
                        }))
                    );

                    // Set existing cuisine preferences
                    const existingCuisines = existingUser.preferences || [];
                    setFavoriteCuisines(prev => 
                        prev.map(tag => ({
                            ...tag,
                            selected: existingCuisines.includes(tag.label)
                        }))
                    );
                } else {
                    console.warn("User not found in database");
                    Alert.alert("Error", "User profile not found. Please contact support.");
                    router.back();
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                Alert.alert("Error", "Failed to load profile data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user, router]);

    const toggleTag = (tagId: string, type: "dietary" | "cuisine") => {
        if (type === "dietary") {
            setDietaryPreferences((prev) => 
                prev.map((tag) => 
                    tag.id === tagId ? { ...tag, selected: !tag.selected } : tag
                )
            );
        } else {
            setFavoriteCuisines((prev) => 
                prev.map((tag) => 
                    tag.id === tagId ? { ...tag, selected: !tag.selected } : tag
                )
            );
        }
    };

    const handleSave = async () => {
        if (!user || !dbUser) {
            Alert.alert("Error", "User data not available. Please try again.");
            return;
        }

        const selectedDietary = dietaryPreferences
            .filter((tag) => tag.selected)
            .map((tag) => tag.label);

        const selectedCuisines = favoriteCuisines
            .filter((tag) => tag.selected)
            .map((tag) => tag.label);

        // Validation: Ensure at least one selection in each section
        if (selectedDietary.length === 0) {
            Alert.alert("Validation Error", "Please select at least one dietary preference.");
            return;
        }

        if (selectedCuisines.length === 0) {
            Alert.alert("Validation Error", "Please select at least one cuisine preference.");
            return;
        }

        setIsSaving(true);

        try {
            console.log("Updating user preferences:", {
                dietary: selectedDietary,
                cuisines: selectedCuisines,
            });

      // Update user preferences
      const updatedUser = await userOperations.updateUser(dbUser.clerkId, {
        preferences: selectedCuisines,
        dietaryRestrictions: selectedDietary
      });            if (updatedUser) {
                console.log("✅ User preferences updated successfully");
                Alert.alert(
                    "Success!",
                    "Your preferences have been updated.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error("Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user preferences:", error);
            Alert.alert("Error", "Failed to update preferences. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF8C00" />
                    <Text style={styles.loadingText}>Loading your preferences...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={handleCancel}>
                        <Text style={styles.backButtonText}>Cancel</Text>
                    </Pressable>
                    <Text style={styles.title}>Edit Preferences</Text>
                    <Pressable 
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </Pressable>
                </View>

                {/* Dietary Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
                    <Text style={styles.sectionSubtitle}>Select any dietary restrictions you have (at least one required)</Text>
                    <View style={styles.tagContainer}>
                        {dietaryPreferences.map((tag) => (
                            <Pressable
                                key={tag.id}
                                style={[styles.tag, tag.selected && styles.selectedTag]}
                                onPress={() => toggleTag(tag.id, "dietary")}
                            >
                                <Text style={[styles.tagText, tag.selected && styles.selectedTagText]}>
                                    {tag.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Favorite Cuisines */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
                    <Text style={styles.sectionSubtitle}>What types of cuisine do you enjoy? (at least one required)</Text>
                    <View style={styles.tagContainer}>
                        {favoriteCuisines.map((tag) => (
                            <Pressable
                                key={tag.id}
                                style={[styles.tag, tag.selected && styles.selectedTag]}
                                onPress={() => toggleTag(tag.id, "cuisine")}
                            >
                                <Text style={[styles.tagText, tag.selected && styles.selectedTagText]}>
                                    {tag.label}
                                </Text>
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
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: "#FF8C00",
        fontWeight: "500",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    saveButton: {
        backgroundColor: "#FF8C00",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 60,
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    selectedTag: {
        backgroundColor: "#FF8C00",
        borderColor: "#FF8C00",
    },
    tagText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    selectedTagText: {
        color: "#fff",
    },
});
