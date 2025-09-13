import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

// This component handles OAuth redirects that don't match specific routes
// Particularly useful for Android deep link handling
export default function CatchAllRoute() {
    const router = useRouter();
    const segments = useSegments();
    const { isSignedIn, isLoaded } = useAuth();

    useEffect(() => {
        console.log("Catch-all route triggered", { isLoaded, isSignedIn, segments });

        // Don't redirect if we're already in the tabs section
        if (segments[0] === "(tabs)") {
            console.log("Already in tabs, no redirect needed");
            return;
        }

        // Small delay to ensure auth state is properly updated
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
        }, 500);

        return () => clearTimeout(timer);
    }, [isLoaded, isSignedIn, router, segments]);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
