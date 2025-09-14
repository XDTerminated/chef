import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import { userOperations } from "@/lib/db/operations";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Low-Carb", "Nut-Free"];

const CUISINE_PREFERENCES = ["Italian", "Indian", "Mexican", "Chinese", "Mediterranean", "Thai", "Japanese", "American", "French", "Korean"];

export default function PreferencesScreen() {
    const { user, dbUser, refreshUser } = useAuthContext();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState(dbUser?.firstName || user?.firstName || "");
    const [lastName, setLastName] = useState(dbUser?.lastName || user?.lastName || "");
    const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

    useEffect(() => {
        // Initialize form with current user data if available
        if (dbUser) {
            setFirstName(dbUser.firstName || "");
            setLastName(dbUser.lastName || "");
            setSelectedDietary(dbUser.dietaryRestrictions || []);
            setSelectedCuisines(dbUser.preferences || []);
        } else if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            // Set some default preferences if no database user
            setSelectedDietary([]);
            setSelectedCuisines([]);
        }
    }, [user, dbUser]);

    const toggleDietaryRestriction = (option: string) => {
        setSelectedDietary((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
    };

    const toggleCuisinePreference = (option: string) => {
        setSelectedCuisines((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            // Update user in database using Clerk ID
            await userOperations.updateUser(user.id, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dietaryRestrictions: selectedDietary,
                preferences: selectedCuisines,
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
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            <Text style={styles.summaryLabel}>Name: </Text>
                            {firstName} {lastName}
                        </Text>
                        {selectedDietary.length > 0 && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Dietary: </Text>
                                {selectedDietary.join(", ")}
                            </Text>
                        )}
                        {selectedCuisines.length > 0 && (
                            <Text style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>Cuisines: </Text>
                                {selectedCuisines.join(", ")}
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
});
