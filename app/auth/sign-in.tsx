import { useAuth, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    useWarmUpBrowser();
    const { isSignedIn, isLoaded } = useAuth();
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.replace("/(tabs)");
        }
    }, [isLoaded, isSignedIn, router]);

    const onPress = React.useCallback(async () => {
        setIsLoading(true);
        try {
            // For Android, don't specify redirectUrl to use default behavior
            // which should work better with the catch-all route we created
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                // Don't manually navigate - useEffect will handle it
            }
        } catch (err) {
            console.error("OAuth error", err);
        } finally {
            setIsLoading(false);
        }
    }, [startOAuthFlow]);

    // Show loading while auth is being determined
    if (!isLoaded) {
        return (
            <View style={[styles.container, styles.content]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Don't render anything if signed in - let useEffect handle redirect
    if (isSignedIn) {
        return (
            <View style={[styles.container, styles.content]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to Chef</Text>
                <Text style={styles.subtitle}>Sign in to start cooking amazing recipes</Text>

                <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={onPress} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in with Google</Text>}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 40,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#4285F4",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
        minWidth: 200,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
});
