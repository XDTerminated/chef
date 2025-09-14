import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";

export function SpeechRecognitionInfo() {
  const openExpoDevBuildDocs = () => {
    Linking.openURL('https://docs.expo.dev/develop/development-builds/introduction/');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        🎤 Speech Recognition Setup
      </ThemedText>
      
      <ThemedView style={styles.infoBox}>
        <ThemedText style={styles.description}>
          Speech recognition is currently not available in Expo Go due to native module limitations.
        </ThemedText>
        
        <ThemedText style={styles.sectionTitle}>
          To enable speech recognition:
        </ThemedText>
        
        <ThemedView style={styles.stepsList}>
          <ThemedText style={styles.step}>
            1. Create a development build using EAS Build
          </ThemedText>
          <ThemedText style={styles.step}>
            2. Install the app on your device
          </ThemedText>
          <ThemedText style={styles.step}>
            3. The microphone button will work with full speech recognition
          </ThemedText>
        </ThemedView>
        
        <TouchableOpacity style={styles.button} onPress={openExpoDevBuildDocs}>
          <ThemedText style={styles.buttonText}>
            Learn about Development Builds
          </ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.features}>
          <ThemedText style={styles.featuresTitle}>Features when enabled:</ThemedText>
          {"\n"}• Continuous speech recognition
          {"\n"}• Real-time transcription
          {"\n"}• Voice commands for recipes
          {"\n"}• Hands-free cooking assistance
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  stepsList: {
    marginBottom: 16,
  },
  step: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  features: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresTitle: {
    fontWeight: "600",
  },
});
