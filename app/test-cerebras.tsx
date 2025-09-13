import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { cerebrasAPI } from "../lib/services/cerebras-api";

export default function TestCerebrasAPI() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string>("");

    const testConnection = async () => {
        setIsLoading(true);
        setResult("");

        try {
            const testResult = await cerebrasAPI.testConnection();

            if (testResult.success) {
                setResult(`✅ Success! Model: ${testResult.model}`);
                Alert.alert("Success", `Connected successfully with model: ${testResult.model}`);
            } else {
                setResult(`❌ Failed: ${testResult.message}`);
                Alert.alert("Error", testResult.message);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult(`❌ Error: ${errorMessage}`);
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const testSimpleChat = async () => {
        setIsLoading(true);
        setResult("");

        try {
            const chatRequest = cerebrasAPI.createChatRequest("Hello! Tell me a short cooking tip.");
            const response = await cerebrasAPI.chatCompletion(chatRequest);

            if (response.choices && response.choices.length > 0) {
                const aiResponse = response.choices[0].message.content;
                setResult(`✅ Chat successful:\n${aiResponse}`);
                Alert.alert("Chat Success", aiResponse);
            } else {
                setResult("❌ No response from chat");
                Alert.alert("Error", "No response from chat");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult(`❌ Chat Error: ${errorMessage}`);
            Alert.alert("Chat Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const testStreamingChat = async () => {
        setIsLoading(true);
        setResult("Streaming...");

        try {
            const chatRequest = cerebrasAPI.createCookingChatRequest("Give me a quick recipe for pasta.", { stream: true });
            let streamContent = "";

            for await (const chunk of cerebrasAPI.chatCompletionStream(chatRequest)) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const delta = chunk.choices[0].delta;
                    if (delta.content) {
                        streamContent += delta.content;
                        setResult(`📡 Streaming:\n${streamContent}`);
                    }
                }
            }

            setResult(`✅ Streaming complete:\n${streamContent}`);
            Alert.alert("Streaming Success", "Stream completed successfully!");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult(`❌ Streaming Error: ${errorMessage}`);
            Alert.alert("Streaming Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const testRealStreaming = async () => {
        setIsLoading(true);
        setResult("");

        try {
            const testResult = await cerebrasAPI.testRealStreaming();

            if (testResult.success) {
                setResult(`✅ Real streaming available: ${testResult.message}`);
                Alert.alert("Real Streaming Test", testResult.message);
            } else {
                setResult(`❌ Real streaming not available: ${testResult.message}`);
                Alert.alert("Real Streaming Test", `Not available: ${testResult.message}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult(`❌ Real streaming test error: ${errorMessage}`);
            Alert.alert("Real Streaming Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cerebras API Test</Text>

            <TouchableOpacity style={[styles.button, isLoading && styles.disabledButton]} onPress={testConnection} disabled={isLoading}>
                <Text style={styles.buttonText}>Test Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, isLoading && styles.disabledButton]} onPress={testSimpleChat} disabled={isLoading}>
                <Text style={styles.buttonText}>Test Simple Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, isLoading && styles.disabledButton]} onPress={testRealStreaming} disabled={isLoading}>
                <Text style={styles.buttonText}>Test Real Streaming</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, isLoading && styles.disabledButton]} onPress={testStreamingChat} disabled={isLoading}>
                <Text style={styles.buttonText}>Test Simulated Streaming</Text>
            </TouchableOpacity>

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Testing API...</Text>
                </View>
            )}

            {result ? (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
        color: "#333",
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#ccc",
        opacity: 0.6,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    resultText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
});
