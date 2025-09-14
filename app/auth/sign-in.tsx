import { useAuth, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

import BlurText from "../../components/BlurText";
import GradientText from "../../components/GradientText";
import HeavensKitchenLogo from "../../components/HeavensKitchenLogo";
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
            // Check if user has completed profile setup
            // For now, we'll always redirect to profile setup
            // In a real app, you'd check if the user has completed their profile
            router.replace("/profile-setup");
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
        <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80' }}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <GradientText
                            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                            animationSpeed={3}
                            showBorder={false}
                            style={styles.premiumText}
                        >
                            13k+ premium recipes
                        </GradientText>
                        <Text style={styles.title}>Heaven's Kitchen</Text>
                    </View>

                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <HeavensKitchenLogo width={80} height={80} />
                        </View>
                    </View>

                    {/* Features Section */}
                    <View style={styles.featuresSection}>
                        <BlurText
                            text="Find recipes and seek AI assistant for cooking"
                            delay={500}
                            animateBy="words"
                            direction="top"
                            style={styles.featureText}
                        />
                    </View>

                    {/* Sign In Button */}
                    <View style={styles.buttonSection}>
                        <Pressable 
                            style={[styles.button, isLoading && styles.buttonDisabled]} 
                            onPress={onPress} 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Start Cooking</Text>
                            )}
                        </Pressable>
                        
                        <Text style={styles.disclaimer}>
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: "center",
        marginTop: 20,
    },
    title: {
        fontSize: 48,
        fontWeight: "900",
        color: "#fff",
        marginBottom: 16,
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 1)",
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
    },
    premiumText: {
        fontSize: 20,
        color: "#FFD700",
        textAlign: "center",
        fontWeight: "700",
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 20,
    },
    logoSection: {
        alignItems: "center",
        marginVertical: 20,
    },
    logoContainer: {
        width: 100,
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    logoImage: {
        width: 80,
        height: 80,
    },
    featuresSection: {
        alignItems: "center",
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    featureText: {
        fontSize: 32,
        color: "#FFD700",
        textAlign: "center",
        fontWeight: "900",
        textShadowColor: "rgba(0, 0, 0, 1)",
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        lineHeight: 38,
    },
    buttonSection: {
        alignItems: "center",
    },
    button: {
        backgroundColor: "#FF4444",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 25,
        minWidth: width * 0.8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    disclaimer: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        paddingHorizontal: 20,
        lineHeight: 16,
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
