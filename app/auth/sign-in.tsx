import { useAuth, useOAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    useWarmUpBrowser();
    const { isSignedIn, isLoaded } = useAuth();
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    const [isLoading, setIsLoading] = useState(false);

    const onPress = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                // Don't manually navigate - let the auth state change handle it
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

    // Redirect to tabs if already signed in
    if (isSignedIn) {
        return <Redirect href="/(tabs)" />;
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
