import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
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
            {isStreaming && <Text style={styles.cursor}>|</Text>}
        </Text>
    </View>
);

export default function ImprovedChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [useStreaming, setUseStreaming] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const sendMessageStreaming = async (userMessage: ChatMessage) => {
        // Create initial AI message for streaming
        const initialAiMessage: ChatMessage = {
            role: "assistant",
            content: "",
        };
        setMessages((prev) => [...prev, initialAiMessage]);
        setIsStreaming(true);

        try {
            const chatRequest = cerebrasAPI.createCookingChatRequest(userMessage.content, { stream: true });

            let fullContent = "";
            let chunkCount = 0;
            const startTime = Date.now();

            // Stream the response with better error handling
            for await (const chunk of cerebrasAPI.chatCompletionStream(chatRequest)) {
                chunkCount++;

                if (chunk.choices && chunk.choices.length > 0) {
                    const delta = chunk.choices[0].delta;
                    if (delta.content) {
                        fullContent += delta.content;

                        // Throttle updates to avoid too many re-renders
                        if (chunkCount % 3 === 0 || chunk.choices[0].finish_reason) {
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
                    }

                    // Check if streaming is complete
                    if (chunk.choices[0].finish_reason) {
                        console.log(`Streaming completed in ${Date.now() - startTime}ms with ${chunkCount} chunks`);
                        break;
                    }
                }
            }

            // Final update to make sure all content is displayed
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
        } catch (error) {
            console.error("Streaming error:", error);
            throw error;
        } finally {
            setIsStreaming(false);
        }
    };

    const sendMessageNonStreaming = async (userMessage: ChatMessage) => {
        try {
            const chatRequest = cerebrasAPI.createCookingChatRequest(userMessage.content);

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
            console.error("Non-streaming error:", error);
            throw error;
        }
    };

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
            if (useStreaming) {
                await sendMessageStreaming(userMessage);
            } else {
                await sendMessageNonStreaming(userMessage);
            }
        } catch (error) {
            console.error("Chat error:", error);

            // If streaming failed, try non-streaming as fallback
            if (useStreaming) {
                console.log("Streaming failed, trying non-streaming fallback");
                try {
                    await sendMessageNonStreaming(userMessage);
                } catch (fallbackError) {
                    console.error("Fallback failed:", fallbackError);
                    handleError();
                }
            } else {
                handleError();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = () => {
        Alert.alert("Error", "Failed to get response from AI. Please check your connection and try again.", [{ text: "OK" }]);

        // Add error message to chat
        const errorMessage: ChatMessage = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
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
                <Text style={styles.headerSubtitle}>Powered by Cerebras</Text>

                <View style={styles.settingsRow}>
                    <Text style={styles.settingLabel}>Streaming Mode</Text>
                    <Switch value={useStreaming} onValueChange={setUseStreaming} disabled={isLoading} />
                </View>
            </View>

            <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={(_, index) => index.toString()} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false} />

            {isLoading && !isStreaming && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>{useStreaming ? "AI is thinking..." : "Getting response..."}</Text>
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
        marginBottom: 12,
    },
    settingsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    settingLabel: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
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
