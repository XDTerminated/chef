import { useAuth } from "@clerk/clerk-expo";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.replace("/auth/sign-in");
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading while checking auth
    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Show loading while redirecting if not signed in
    if (!isSignedIn) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#FF8C00",
                    headerShown: false,
                    tabBarButton: HapticTab,
                }}
            >
                <Tabs.Screen
                    name="discovery"
                    options={{
                        title: "Discovery",
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="saved"
                    options={{
                        title: "Saved",
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                    }}
                />
            </Tabs>
        </View>
    );
}
