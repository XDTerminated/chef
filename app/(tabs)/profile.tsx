import { useAuthContext } from "@/lib/auth/AuthProvider";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const { user, dbUser, isLoading, signOut, refreshUser } = useAuthContext();
    const router = useRouter();

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: () => signOut(),
            },
        ]);
    };

    const handleEditProfile = () => {
        router.push("/preferences");
    };

    // Refresh user data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshUser();
        }, [refreshUser])
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>No user found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    {user.imageUrl && <Image source={{ uri: user.imageUrl }} style={styles.avatar} />}
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{user.name || "Anonymous User"}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                        <Text style={styles.joinDate}>Member since {new Date(user.createdAt!).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Your Stats</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>12</Text>
                            <Text style={styles.statLabel}>Recipes Created</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>47</Text>
                            <Text style={styles.statLabel}>Recipes Saved</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>23</Text>
                            <Text style={styles.statLabel}>Recipes Cooked</Text>
                        </View>
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.preferencesSection}>
                    <Text style={styles.sectionTitle}>Your Preferences</Text>
                    <View style={styles.preferencesGrid}>
                        <View style={styles.preferenceItem}>
                            <Text style={styles.preferenceLabel}>Dietary</Text>
                            <Text style={styles.preferenceValue}>{dbUser?.dietaryRestrictions && dbUser.dietaryRestrictions.length > 0 ? dbUser.dietaryRestrictions.join(", ") : "Not set"}</Text>
                        </View>
                        <View style={styles.preferenceItem}>
                            <Text style={styles.preferenceLabel}>Cuisines</Text>
                            <Text style={styles.preferenceValue}>{dbUser?.preferences && dbUser.preferences.length > 0 ? dbUser.preferences.join(", ") : "Not set"}</Text>
                        </View>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <Pressable style={styles.settingItem} onPress={handleEditProfile}>
                        <Text style={styles.settingText}>Edit Profile</Text>
                        <Text style={styles.settingArrow}>›</Text>
                    </Pressable>
                    <Pressable style={styles.settingItem}>
                        <Text style={styles.settingText}>Notification Settings</Text>
                        <Text style={styles.settingArrow}>›</Text>
                    </Pressable>
                    <Pressable style={styles.settingItem}>
                        <Text style={styles.settingText}>Privacy Settings</Text>
                        <Text style={styles.settingArrow}>›</Text>
                    </Pressable>
                    <Pressable style={styles.settingItem}>
                        <Text style={styles.settingText}>Help & Support</Text>
                        <Text style={styles.settingArrow}>›</Text>
                    </Pressable>
                </View>

                {/* Sign Out Button */}
                <View style={styles.actionsSection}>
                    <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.signOutButtonText}>Sign Out</Text>
                    </Pressable>
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
    header: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#333",
        textAlign: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginTop: 50,
    },
    errorText: {
        fontSize: 16,
        color: "#ff4444",
        textAlign: "center",
        marginTop: 50,
    },
    profileSection: {
        alignItems: "center",
        marginBottom: 30,
        backgroundColor: "#f9f9f9",
        borderRadius: 16,
        padding: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    userInfo: {
        alignItems: "center",
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    joinDate: {
        fontSize: 12,
        color: "#999",
    },
    statsSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 20,
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FF8C00",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    preferencesSection: {
        marginBottom: 30,
    },
    preferencesGrid: {
        gap: 12,
    },
    preferenceItem: {
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
    },
    preferenceLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    preferenceValue: {
        fontSize: 14,
        color: "#666",
    },
    settingsSection: {
        marginBottom: 30,
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    settingText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    settingArrow: {
        fontSize: 20,
        color: "#999",
    },
    actionsSection: {
        marginBottom: 40,
    },
    signOutButton: {
        backgroundColor: "#ff4444",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    signOutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
