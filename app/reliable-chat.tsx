import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cerebrasAPI, ChatMessage } from "../lib/services/cerebras-api";

interface ChatBubbleProps {
    message: ChatMessage;
    isUser: boolean;
    isStreaming?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, isStreaming }) => (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
            {message.content}
            {isStreaming && <Text style={styles.cursor}>●</Text>}
        </Text>
    </View>
);

export default function ReliableChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
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
        const messageToSend = inputText.trim();
        setInputText("");
        setIsLoading(true);

        // Try streaming first, with aggressive fallback to non-streaming
        let success = false;

        // Option 1: Try streaming (with quick timeout)
        try {
            console.log("Attempting streaming...");
            setIsStreaming(true);

            // Create initial AI message
            const initialAiMessage: ChatMessage = {
                role: "assistant",
                content: "",
            };
            setMessages((prev) => [...prev, initialAiMessage]);

            const chatRequest = cerebrasAPI.createCookingChatRequest(messageToSend, { stream: true });
            let fullContent = "";
            let streamTimeout: any = null;

            // Set a shorter timeout for streaming
            streamTimeout = setTimeout(() => {
                console.log("Stream timeout - switching to fallback");
                throw new Error("Stream timeout");
            }, 10000); // 10 second timeout

            try {
                for await (const chunk of cerebrasAPI.chatCompletionStream(chatRequest)) {
                    if (chunk.choices && chunk.choices.length > 0) {
                        const delta = chunk.choices[0].delta;
                        if (delta.content) {
                            fullContent += delta.content;

                            // Update the last message with accumulated content
                            setMessages((prev) => {
                                const newMessages = [...prev];
                                const lastIndex = newMessages.length - 1;
                                if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
                                    newMessages[lastIndex] = {
                                        ...newMessages[lastIndex],
                                        content: fullContent,
                                    };
                                }
                                return newMessages;
                            });
                        }

                        // Check if streaming is complete
                        if (chunk.choices[0].finish_reason) {
                            break;
                        }
                    }
                }

                if (streamTimeout) clearTimeout(streamTimeout);

                if (fullContent.trim()) {
                    console.log("Streaming successful!");
                    success = true;
                }
            } catch (streamError) {
                if (streamTimeout) clearTimeout(streamTimeout);
                console.warn("Streaming failed:", streamError);
                throw streamError;
            }
        } catch {
            console.log("Streaming failed, trying non-streaming fallback...");
        } finally {
            setIsStreaming(false);
        }

        // Option 2: Non-streaming fallback
        if (!success) {
            try {
                console.log("Using non-streaming API...");
                const chatRequest = cerebrasAPI.createCookingChatRequest(messageToSend);
                const response = await cerebrasAPI.chatCompletion(chatRequest);

                if (response.choices && response.choices.length > 0) {
                    const aiMessage: ChatMessage = {
                        role: "assistant",
                        content: response.choices[0].message.content,
                    };

                    // Replace or add the AI message
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;

                        // If we had started streaming, replace the last message
                        if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant" && newMessages[lastIndex].content === "") {
                            newMessages[lastIndex] = aiMessage;
                        } else {
                            // Otherwise add a new message
                            newMessages.push(aiMessage);
                        }

                        return newMessages;
                    });

                    console.log("Non-streaming successful!");
                    success = true;
                }
            } catch (fallbackError) {
                console.error("Non-streaming also failed:", fallbackError);
            }
        }

        // If both methods failed
        if (!success) {
            Alert.alert("Connection Error", "Unable to reach the AI service. Please check your internet connection and try again.", [{ text: "OK" }]);

            // Add error message
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
            };

            setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;

                // If we had started streaming, replace the last message
                if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant" && newMessages[lastIndex].content === "") {
                    newMessages[lastIndex] = errorMessage;
                } else {
                    // Otherwise add a new message
                    newMessages.push(errorMessage);
                }

                return newMessages;
            });
        }

        setIsLoading(false);
    };

    const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
        const isLastMessage = index === messages.length - 1;
        const shouldShowStreaming = isStreaming && isLastMessage && item.role === "assistant";

        return <ChatBubble message={item} isUser={item.role === "user"} isStreaming={shouldShowStreaming} />;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chef AI Assistant</Text>
                <Text style={styles.headerSubtitle}>Powered by Cerebras • Reliable Mode</Text>
            </View>

            <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={(_, index) => index.toString()} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false} />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>{isStreaming ? "AI is responding..." : "Getting response..."}</Text>
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
    cursor: {
        opacity: 0.7,
        fontWeight: "bold",
        color: "#007AFF",
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
