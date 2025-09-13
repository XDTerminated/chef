import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ClerkProvider } from "@clerk/clerk-expo";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
    throw new Error("Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env.local");
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <AuthProvider>
                <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="auth/sign-in" />
                        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </AuthProvider>
        </ClerkProvider>
    );
}
