import { ContinuousSpeechInput } from "@/components/ContinuousSpeechInput";
import { MicrophoneButton } from "@/components/microphone-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function VoiceDemo() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const handleVoiceInput = (transcript: string) => {
    // Add the voice input to our messages
    const newMessage = `🎤 Voice: ${transcript}`;
    setMessages(prev => [...prev, newMessage]);
  };

  const handleContinuousVoiceInput = (transcript: string, isFinal: boolean) => {
    if (isFinal && transcript.trim()) {
      // Add the final voice input to our messages
      const newMessage = `🎙️ Continuous: ${transcript}`;
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleTextSubmit = () => {
    if (currentInput.trim()) {
      const newMessage = `⌨️ Text: ${currentInput}`;
      setMessages(prev => [...prev, newMessage]);
      setCurrentInput("");
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Voice Recognition Demo
      </ThemedText>
      
      <ThemedText style={styles.description}>
        This demonstrates both traditional and continuous speech recognition. Try both modes below.
      </ThemedText>

      {/* Traditional Voice Input Section */}
      <ThemedView style={styles.voiceSection}>
        <ThemedText style={styles.sectionTitle}>Traditional Voice Input (Tap & Release):</ThemedText>
        <MicrophoneButton
          onTranscript={handleVoiceInput}
          onError={(error) => console.error("Voice error:", error)}
          size={80}
          continuous={false}
        />
      </ThemedView>

      {/* Continuous Voice Input Section */}
      <ThemedView style={styles.voiceSection}>
        <ThemedText style={styles.sectionTitle}>Continuous Voice Input (Always Listening):</ThemedText>
        <ContinuousSpeechInput
          onTranscript={handleContinuousVoiceInput}
          onError={(error) => {
            console.error("Continuous voice error:", error);
            Alert.alert("Speech Error", error);
          }}
          size={80}
          lang="en-US"
        />
      </ThemedView>

      {/* Text Input for Comparison */}
      <ThemedView style={styles.textInputSection}>
        <ThemedText style={styles.sectionTitle}>Compare with Text Input:</ThemedText>
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={currentInput}
            onChangeText={setCurrentInput}
            placeholder="Type something here..."
            onSubmitEditing={handleTextSubmit}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleTextSubmit}>
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Messages Display */}
      <ThemedView style={styles.messagesSection}>
        <ThemedView style={styles.messagesHeader}>
          <ThemedText style={styles.sectionTitle}>Input History:</ThemedText>
          <TouchableOpacity style={styles.clearButton} onPress={clearMessages}>
            <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <ThemedText style={styles.emptyMessage}>
              No messages yet. Try speaking or typing something!
            </ThemedText>
          ) : (
            messages.map((message, index) => (
              <ThemedView key={index} style={styles.messageItem}>
                <ThemedText style={styles.messageText}>{message}</ThemedText>
              </ThemedView>
            ))
          )}
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  voiceSection: {
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  textInputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
  },
  messagesSection: {
    flex: 1,
  },
  messagesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: "#FF4444",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  messagesList: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(248, 248, 248, 0.5)",
  },
  emptyMessage: {
    textAlign: "center",
    opacity: 0.5,
    fontStyle: "italic",
    padding: 20,
  },
  messageItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
