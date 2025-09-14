import { useAuthContext } from "@/lib/auth/AuthProvider";
import { userOperations } from "@/lib/db/operations";
import { User } from "@/lib/db/schema";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const { user: clerkUser, isLoading: authLoading, signOut } = useAuthContext();
    const { user: currentClerkUser } = useUser();
    const [dbUser, setDbUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentClerkUser?.id) return;

            try {
                setIsLoading(true);
                console.warn("🔍 Fetching user profile data from database...");
                const userData = await userOperations.getUserByClerkId(currentClerkUser.id);

                if (userData) {
                    console.warn("✅ User profile data loaded:", {
                        name: `${userData.firstName} ${userData.lastName}`,
                        preferences: userData.preferences,
                        dietaryRestrictions: userData.dietaryRestrictions,
                    });
                    setDbUser(userData);
                } else {
                    console.warn("❌ No user data found in database");
                }
            } catch (error) {
                console.error("❌ Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [currentClerkUser?.id]);

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

    if (authLoading || isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!clerkUser && !dbUser) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>No user found</Text>
            </SafeAreaView>
        );
    }

    // Use database user data if available, fallback to Clerk user
    const userName = dbUser ? `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim() : clerkUser?.fullName || "Anonymous User";
    const userEmail = dbUser?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "";
    const userImage = dbUser?.imageUrl || clerkUser?.imageUrl;
    const joinDate = dbUser?.createdAt || clerkUser?.createdAt;

    // Get preferences and dietary restrictions from database
    const userPreferences = dbUser?.preferences || [];
    const userDietaryRestrictions = dbUser?.dietaryRestrictions || [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    {userImage && <Image source={{ uri: userImage }} style={styles.avatar} />}
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{userName || "Anonymous User"}</Text>
                        <Text style={styles.email}>{userEmail}</Text>
                        <Text style={styles.joinDate}>Member since {joinDate ? new Date(joinDate).toLocaleDateString() : "Unknown"}</Text>
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
                            <Text style={styles.preferenceValue}>{userDietaryRestrictions.length > 0 ? userDietaryRestrictions.join(", ") : "No dietary restrictions set"}</Text>
                        </View>
                        <View style={styles.preferenceItem}>
                            <Text style={styles.preferenceLabel}>Cuisines</Text>
                            <Text style={styles.preferenceValue}>{userPreferences.length > 0 ? userPreferences.join(", ") : "No cuisine preferences set"}</Text>
                        </View>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <Pressable style={styles.settingItem}>
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
