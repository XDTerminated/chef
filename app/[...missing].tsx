import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

// This component handles OAuth redirects that don't match specific routes
// Particularly useful for Android deep link handling
export default function CatchAllRoute() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();

    useEffect(() => {
        console.log("Catch-all route triggered", { isLoaded, isSignedIn });

        // Small delay to ensure auth state is properly updated
        // Increased delay for Android OAuth stability
        const timer = setTimeout(() => {
            if (isLoaded) {
                if (isSignedIn) {
                    console.log("Redirecting to tabs after OAuth success");
                    router.replace("/(tabs)");
                } else {
                    console.log("No auth detected, redirecting to sign-in");
                    router.replace("/auth/sign-in");
                }
            }
        }, 500); // Increased from 100ms for better Android compatibility

        return () => clearTimeout(timer);
    }, [isLoaded, isSignedIn, router]);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
