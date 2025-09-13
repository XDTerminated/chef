import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cerebrasAPI, ChatMessage } from "../lib/services/cerebras-api";

interface ChatBubbleProps {
    message: ChatMessage;
    isUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser }) => (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{message.content}</Text>
    </View>
);

export default function ChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: inputText.trim(),
        };

        // Add user message to chat
        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            // Create the chat request for cooking assistance
            const chatRequest = cerebrasAPI.createCookingChatRequest(userMessage.content);

            // Send to Cerebras API
            const response = await cerebrasAPI.chatCompletion(chatRequest);

            if (response.choices && response.choices.length > 0) {
                const aiMessage: ChatMessage = {
                    role: "assistant",
                    content: response.choices[0].message.content,
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error("No response from AI");
            }
        } catch (error) {
            console.error("Chat error:", error);
            Alert.alert("Error", "Failed to get response from AI. Please try again.", [{ text: "OK" }]);

            // Add error message to chat
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => <ChatBubble message={item} isUser={item.role === "user"} />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chef AI Assistant</Text>
                <Text style={styles.headerSubtitle}>Powered by Cerebras</Text>
            </View>

            <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={(_, index) => index.toString()} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false} />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>AI is thinking...</Text>
                </View>
            )}

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} placeholder="Ask me anything about cooking..." multiline maxLength={1000} editable={!isLoading} />
                    <TouchableOpacity style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]} onPress={sendMessage} disabled={!inputText.trim() || isLoading}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#fff",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    headerSubtitle: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 20,
    },
    bubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
    },
    userBubble: {
        backgroundColor: "#007AFF",
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: "#fff",
        alignSelf: "flex-start",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    bubbleText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userText: {
        color: "#fff",
    },
    aiText: {
        color: "#333",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        backgroundColor: "#f9f9f9",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#666",
    },
    inputContainer: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        alignItems: "flex-end",
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    sendButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: "#ccc",
    },
    sendButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
