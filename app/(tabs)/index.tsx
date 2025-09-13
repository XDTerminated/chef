import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
    const { user, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ParallaxScrollView headerBackgroundColor={{ light: "#FF6B35", dark: "#FF4500" }} headerImage={<Image source={require("@/assets/images/partial-react-logo.png")} style={styles.headerImage} />}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome{user?.name ? `, ${user.name}` : ""}!</ThemedText>
                <HelloWave />
            </ThemedView>

            <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle">🍳 Your Kitchen Dashboard</ThemedText>
                <ThemedText>Discover amazing recipes, save your favorites, and create your own culinary masterpieces!</ThemedText>
            </ThemedView>

            <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle">📖 Recent Recipes</ThemedText>
                <ThemedText style={styles.placeholder}>No recent recipes yet. Start exploring to see your cooking history here!</ThemedText>
            </ThemedView>

            <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle">⭐ Your Favorites</ThemedText>
                <ThemedText style={styles.placeholder}>Save recipes you love to see them here quickly!</ThemedText>
            </ThemedView>

            <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle">🎯 Quick Actions</ThemedText>
                <ThemedText>
                    • Browse recipe collections{"\n"}• Create a new recipe{"\n"}• View your cooking stats{"\n"}• Share with friends
                </ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionContainer: {
        gap: 8,
        marginBottom: 16,
    },
    headerImage: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    placeholder: {
        opacity: 0.6,
        fontStyle: "italic",
    },
});
