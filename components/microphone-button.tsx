import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

// Import the speech recognition module
let useSpeechRecognitionEvent: any = null;

try {
  const speechModule = require("expo-speech-recognition");
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
  console.log("✅ expo-speech-recognition events loaded successfully");
} catch (error) {
  console.warn("⚠️ expo-speech-recognition events not available");
}

interface MicrophoneButtonProps {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  style?: ViewStyle;
  size?: number;
  continuous?: boolean;
  showTranscript?: boolean;
}

export function MicrophoneButton({
  onTranscript,
  onError,
  style,
  size = 60,
  continuous = true,
  showTranscript = true,
}: MicrophoneButtonProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");

  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous,
    interimResults: true,
    onResult: (result) => {
      console.log("Speech result:", result);
      if (result.isFinal && result.transcript.trim()) {
        onTranscript?.(result.transcript.trim());
        if (!continuous) {
          // For non-continuous mode, reset after each final result
          setTimeout(resetTranscript, 100);
        }
      } else if (result.transcript.trim()) {
        // Update interim results for visual feedback
        setInterimTranscript(result.transcript.trim());
      }
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      
      // Filter out non-critical errors that shouldn't trigger user-visible errors
      const errorMessage = error.message?.toLowerCase() || "";
      const ignorableErrors = [
        "no-speech",
        "no speech", 
        "silence",
        "timeout",
        "aborted",
        "audio-capture"
      ];
      
      const shouldIgnoreError = ignorableErrors.some(ignorable => 
        errorMessage.includes(ignorable)
      );
      
      if (shouldIgnoreError) {
        console.log("🔇 Ignoring non-critical speech error:", error);
        return;
      }
      
      // Only call onError for actual problematic errors
      onError?.(error.message);
    },
    onStart: () => {
      console.log("Speech recognition started");
      setInterimTranscript("");
    },
    onEnd: () => {
      console.log("Speech recognition ended");
      setInterimTranscript("");
    },
  });

  // Listen for volume changes using the hook approach
  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent("volumechange", (event: any) => {
      setVolumeLevel(Math.max(0, event.value + 2)); // Normalize volume level
    });
  }

  // Pulse animation when listening
  React.useEffect(() => {
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedView style={[styles.buttonContainer, {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#FFE4E4",
        }]}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                width: size - 8,
                height: size - 8,
                borderRadius: (size - 8) / 2,
              },
            ]}
            onPress={() => {
              onError?.("Speech recognition is not supported on this device. Please ensure you have a compatible device and the required permissions.");
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="mic-off"
              size={size * 0.4}
              color="#FF4444"
            />
          </TouchableOpacity>
        </ThemedView>
        <ThemedText style={styles.errorText}>
          Speech recognition unavailable{"\n"}
          Check device compatibility
        </ThemedText>
      </ThemedView>
    );
  }

  const microphoneColor = isListening ? "#FF4444" : "#007AFF";
  const backgroundColor = isListening ? "#FFE4E4" : "#E6F4FE";

  return (
    <ThemedView style={[styles.container, style]}>
      {error && (
        <ThemedText style={styles.errorText} numberOfLines={2}>
          {error}
        </ThemedText>
      )}
      
      {showTranscript && (transcript || interimTranscript) && (
        <ThemedText style={[
          styles.transcriptText,
          !transcript && styles.interimTranscript
        ]} numberOfLines={3}>
          {transcript || interimTranscript}
        </ThemedText>
      )}

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: pulseAnim }],
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={size * 0.4}
            color={microphoneColor}
          />
          
          {/* Volume indicator when listening */}
          {isListening && volumeLevel > 0 && (
            <ThemedView
              style={[
                styles.volumeIndicator,
                {
                  opacity: Math.min(1, volumeLevel / 5),
                  transform: [{ scale: 1 + (volumeLevel / 10) }],
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      <ThemedText style={styles.instructionText}>
        {isListening ? "Listening... Tap to stop" : "Tap to speak"}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 8,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  volumeIndicator: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    backgroundColor: "rgba(255, 68, 68, 0.2)",
  },
  instructionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  transcriptText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    fontStyle: "italic",
    opacity: 0.8,
  },
  interimTranscript: {
    opacity: 0.5,
    fontStyle: "normal",
  },
  errorText: {
    fontSize: 12,
    color: "#FF4444",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
});
