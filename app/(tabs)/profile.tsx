import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import React from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
    const { user, isLoading, signOut } = useAuthContext();

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

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading...</ThemedText>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>No user found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Profile
                </ThemedText>
            </View>

            <View style={styles.profileSection}>
                {user.imageUrl && <Image source={{ uri: user.imageUrl }} style={styles.avatar} />}

                <View style={styles.userInfo}>
                    <ThemedText type="subtitle" style={styles.name}>
                        {user.name || "Anonymous User"}
                    </ThemedText>
                    <ThemedText style={styles.email}>{user.email}</ThemedText>
                    <ThemedText style={styles.joinDate}>Member since {new Date(user.createdAt!).toLocaleDateString()}</ThemedText>
                </View>
            </View>

            <View style={styles.statsSection}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Your Stats
                </ThemedText>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <ThemedText type="title" style={styles.statNumber}>
                            0
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Recipes Created</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                        <ThemedText type="title" style={styles.statNumber}>
                            0
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Recipes Saved</ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.actionsSection}>
                <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                    <ThemedText style={styles.signOutButtonText}>Sign Out</ThemedText>
                </Pressable>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        paddingTop: 20,
    },
    title: {
        textAlign: "center",
    },
    profileSection: {
        alignItems: "center",
        marginBottom: 40,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    userInfo: {
        alignItems: "center",
    },
    name: {
        marginBottom: 4,
    },
    email: {
        opacity: 0.7,
        marginBottom: 8,
    },
    joinDate: {
        opacity: 0.5,
        fontSize: 12,
    },
    statsSection: {
        marginBottom: 40,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 24,
        marginBottom: 4,
    },
    statLabel: {
        opacity: 0.7,
        fontSize: 12,
    },
    actionsSection: {
        marginTop: "auto",
    },
    signOutButton: {
        backgroundColor: "#ff4444",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    signOutButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
});
