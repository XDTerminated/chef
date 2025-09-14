import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    StyleSheet,
    TouchableOpacity,
    ViewStyle
} from "react-native";

// Import the speech recognition module
let useSpeechRecognitionEvent: any = null;

try {
  const speechModule = require("expo-speech-recognition");
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch (error) {
  console.warn("expo-speech-recognition events not available");
}

interface ContinuousSpeechInputProps {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  style?: ViewStyle;
  size?: number;
  disabled?: boolean;
  lang?: string;
  autoSend?: boolean; // New prop for auto-sending messages
  pauseThreshold?: number; // Milliseconds of silence before auto-sending
  isTTSSpeaking?: boolean; // Pause speech recognition when TTS is speaking
}

export function ContinuousSpeechInput({
  onTranscript,
  onError,
  style,
  size = 48,
  disabled = false,
  lang = "en-US",
  autoSend = true,
  pauseThreshold = 2000, // 2 seconds of silence
  isTTSSpeaking = false,
}: ContinuousSpeechInputProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [lastSpeechTime, setLastSpeechTime] = useState<number | null>(null);
  const [lastSentLength, setLastSentLength] = useState(0);
  const [wasListeningBeforeTTS, setWasListeningBeforeTTS] = useState(false);

  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang,
    onResult: (result) => {
      console.log("Continuous speech result:", result);
      
      // Extract only the new part of the transcript (everything after what we've already sent)
      const fullTranscript = result.transcript;
      const newSegment = fullTranscript.substring(lastSentLength).trim();
      
      console.log("Full transcript:", fullTranscript);
      console.log("Last sent length:", lastSentLength);
      console.log("New segment:", newSegment);
      
      setCurrentTranscript(newSegment);
      setLastSpeechTime(Date.now());
      
      // Clear any existing silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      // Always send interim results for real-time display
      onTranscript?.(newSegment, result.isFinal);
      
      if (result.isFinal && newSegment.trim()) {
        // For final results, send immediately and reset
        console.log("Final result received, sending message:", newSegment);
        onTranscript?.(newSegment, true);
        setCurrentTranscript("");
        
        // Update the last sent length to include this segment
        setLastSentLength(fullTranscript.length);
        
        // Continue listening for the next part of conversation
        setTimeout(() => {
          if (isListening) {
            console.log("Continuing to listen for next speech...");
          }
        }, 500);
      } else if (autoSend && !result.isFinal && newSegment.trim()) {
        // Set up auto-send timer for interim results after pause
        const timer = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - (lastSpeechTime || 0);
          if (timeSinceLastSpeech >= pauseThreshold && newSegment.trim()) {
            console.log("Auto-sending after pause:", newSegment);
            onTranscript?.(newSegment, true);
            setCurrentTranscript("");
            
            // Update the last sent length to include this segment
            setLastSentLength(fullTranscript.length);
          }
        }, pauseThreshold);
        
        setSilenceTimer(timer);
      }
    },
    onError: (error) => {
      console.error("Continuous speech error:", error);
      onError?.(error.message);
      setCurrentTranscript("");
      
      // Clear silence timer on error
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    },
    onStart: () => {
      console.log("Continuous speech started");
      setCurrentTranscript("");
      setLastSpeechTime(null);
      setLastSentLength(0);
      // Reset transcript to ensure clean start for each speech session
      resetTranscript();
    },
    onEnd: () => {
      console.log("Continuous speech ended");
      setCurrentTranscript("");
      setLastSentLength(0);
      
      // Clear silence timer when speech ends
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    },
  });

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [silenceTimer]);

  // Pause speech recognition when TTS is speaking
  useEffect(() => {
    if (isTTSSpeaking && isListening) {
      console.log('🔊 TTS started - pausing speech recognition');
      setWasListeningBeforeTTS(true);
      stopListening();
    } else if (!isTTSSpeaking && wasListeningBeforeTTS && !isListening) {
      console.log('🔊 TTS finished - resuming speech recognition');
      setWasListeningBeforeTTS(false);
      // Small delay to ensure TTS has fully stopped
      setTimeout(() => {
        startListening();
      }, 500);
    }
  }, [isTTSSpeaking, isListening, wasListeningBeforeTTS, stopListening, startListening]);

  // Listen for volume changes using the hook approach
  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent("volumechange", (event: any) => {
      setVolumeLevel(Math.max(0, event.value + 2));
    });
  }

  // Pulse animation when listening
  useEffect(() => {
    if (isListening && !disabled) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, disabled, pulseAnim]);

  const handlePress = async () => {
    if (disabled) return;

    if (!isSupported) {
      Alert.alert(
        "Speech Recognition Not Available",
        "Speech recognition is not supported on this device. Please ensure you have the required permissions and a compatible device.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  if (!isSupported) {
    return (
      <TouchableOpacity
        style={[styles.button, { width: size, height: size }, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="mic-off"
          size={size * 0.5}
          color="#999"
        />
      </TouchableOpacity>
    );
  }

  const microphoneColor = isTTSSpeaking ? "#FFA500" : (isListening ? "#FF4444" : (disabled ? "#999" : "#007AFF"));
  const backgroundColor = isTTSSpeaking ? "rgba(255, 165, 0, 0.1)" : (isListening ? "rgba(255, 68, 68, 0.1)" : "rgba(0, 122, 255, 0.1)");

  return (
    <ThemedView style={[styles.container, style]}>
      {error && (
        <ThemedText style={styles.errorText} numberOfLines={1}>
          Error: {error}
        </ThemedText>
      )}
      
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              width: size,
              height: size,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Ionicons
            name={isTTSSpeaking ? "volume-high" : (isListening ? "mic" : "mic-outline")}
            size={size * 0.5}
            color={microphoneColor}
          />
          
          {/* Volume indicator when listening */}
          {isListening && volumeLevel > 0 && (
            <ThemedView
              style={[
                styles.volumeIndicator,
                {
                  opacity: Math.min(0.6, volumeLevel / 8),
                  transform: [{ scale: 1 + (volumeLevel / 20) }],
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Show current transcript if available */}
      {currentTranscript && !isTTSSpeaking && (
        <ThemedText style={styles.transcriptText} numberOfLines={2}>
          {currentTranscript}
        </ThemedText>
      )}
      
      {/* Show TTS status */}
      {isTTSSpeaking && (
        <ThemedText style={styles.ttsStatusText} numberOfLines={1}>
          🔊 Speaking response...
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    padding: 4,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  volumeIndicator: {
    position: "absolute",
    width: "120%",
    height: "120%",
    borderRadius: 30,
    backgroundColor: "rgba(255, 68, 68, 0.2)",
  },
  transcriptText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 8,
    fontStyle: "italic",
    opacity: 0.7,
    maxWidth: 120,
  },
  ttsStatusText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 8,
    fontWeight: "500",
    color: "#FFA500",
    maxWidth: 120,
  },
  errorText: {
    fontSize: 10,
    color: "#FF4444",
    textAlign: "center",
    marginBottom: 4,
    paddingHorizontal: 8,
  },
});
