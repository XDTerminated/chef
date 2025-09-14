import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  noisyEnvironment?: boolean; // Adjust thresholds for noisy environments
  minTranscriptLength?: number; // Minimum words before considering valid speech
  confidenceThreshold?: number; // Minimum confidence for speech recognition
}

// Helper function to validate speech in noisy environments
function isValidSpeech(transcript: string, confidence?: number, options: {
  minLength?: number;
  confidenceThreshold?: number;
  noisyEnvironment?: boolean;
} = {}): boolean {
  const {
    minLength = 2,
    confidenceThreshold = 0.4,
    noisyEnvironment = false
  } = options;
  
  // Filter out empty or very short results
  if (!transcript || transcript.length < 2) {
    return false;
  }
  
  // Count meaningful words (exclude filler words and noise)
  const words = transcript.toLowerCase().split(/\s+/).filter(word => {
    // Filter out common filler words and noise artifacts
    const fillerWords = ['uh', 'um', 'ah', 'er', 'hmm', 'huh', 'yeah', 'ok', 'okay'];
    const noisePatterns = /^[^a-z]*$/; // Only punctuation/numbers
    
    return word.length > 1 && 
           !fillerWords.includes(word) && 
           !noisePatterns.test(word);
  });
  
  // Require minimum meaningful words
  if (words.length < minLength) {
    return false;
  }
  
  // Check confidence if available and not 0 (many devices report 0)
  if (confidence !== undefined && confidence > 0) {
    const threshold = noisyEnvironment ? confidenceThreshold * 0.8 : confidenceThreshold;
    if (confidence < threshold) {
      return false;
    }
  }
  
  // Additional checks for noisy environments
  if (noisyEnvironment) {
    // Reject very repetitive patterns (might be background noise)
    const uniqueWords = new Set(words);
    if (uniqueWords.size < words.length * 0.5) {
      return false;
    }
    
    // Reject if it's mostly short words (common in noise)
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    if (avgWordLength < 3) {
      return false;
    }
  }
  
  return true;
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
  noisyEnvironment = false,
  minTranscriptLength = 2, // Minimum 2 words
  confidenceThreshold = 0.4, // Lower threshold for noisy environments
}: ContinuousSpeechInputProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [lastSpeechTime, setLastSpeechTime] = useState<number | null>(null);
  const [lastSentLength, setLastSentLength] = useState(0);
  const [wasListeningBeforeTTS, setWasListeningBeforeTTS] = useState(false);
  const [forceFinalTimer, setForceFinalTimer] = useState<number | null>(null);
  const [isValidSpeechDetected, setIsValidSpeechDetected] = useState(false);

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
      console.log("🔍 Debug info:", {
        isFinal: result.isFinal,
        confidence: result.confidence,
        timestamp: Date.now()
      });
      
      // Extract only the new part of the transcript (everything after what we've already sent)
      const fullTranscript = result.transcript;
      const newSegment = fullTranscript.substring(lastSentLength).trim();
      
      console.log("Full transcript:", fullTranscript);
      console.log("Last sent length:", lastSentLength);
      console.log("New segment:", newSegment);
      
      // Enhanced validation for noisy environments - temporarily disabled for testing
      const isValid = true; // isValidSpeech(newSegment, result.confidence, {
      //   minLength: minTranscriptLength,
      //   confidenceThreshold,
      //   noisyEnvironment
      // });
      
      if (!isValid) {
        console.log("🔇 Ignoring invalid speech:", { newSegment, confidence: result.confidence });
        setIsValidSpeechDetected(false);
        return;
      }
      
      setIsValidSpeechDetected(true);
      
      setCurrentTranscript(newSegment);
      setLastSpeechTime(Date.now());
      
      // Clear any existing timers
      if (silenceTimer) {
        console.log("🔄 Clearing existing silence timer");
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      if (forceFinalTimer) {
        console.log("🔄 Clearing existing force timer");
        clearTimeout(forceFinalTimer);
        setForceFinalTimer(null);
      }
      
      // Always send results to parent component
      onTranscript?.(newSegment, result.isFinal);
      
      if (result.isFinal && newSegment.trim()) {
        // For final results, reset transcript and prepare for next input
        console.log("Final result received:", newSegment);
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
        console.log("🚀 Setting up auto-send timer with threshold:", pauseThreshold);
        
        const timer = setTimeout(() => {
          console.log("⏰ Auto-send timer fired! Current segment:", newSegment);
          const timeSinceLastSpeech = Date.now() - (lastSpeechTime || 0);
          console.log("📊 Time since last speech:", timeSinceLastSpeech);
          
          if (newSegment.trim()) {
            console.log("✅ Auto-sending message:", newSegment);
            onTranscript?.(newSegment, true); // Mark as final
            setCurrentTranscript("");
            setLastSentLength(fullTranscript.length);
            resetTranscript();
          }
        }, pauseThreshold);
        
        setSilenceTimer(timer);
        
        // Also set a force final timer as backup (longer than pause threshold)
        const forceTimer = setTimeout(() => {
          if (newSegment.trim()) {
            console.log("🔥 Force-sending after extended period:", newSegment);
            onTranscript?.(newSegment, true); // Force as final
            setCurrentTranscript("");
            setLastSentLength(fullTranscript.length);
            resetTranscript();
          }
        }, pauseThreshold * 2); // Double the pause threshold as backup
        
        setForceFinalTimer(forceTimer);
      }
    },
    onError: (error) => {
      console.error("Continuous speech error:", error);
      
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
        setCurrentTranscript("");
        
        // Clear silence timer on any error
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        // Clear force final timer on any error
        if (forceFinalTimer) {
          clearTimeout(forceFinalTimer);
          setForceFinalTimer(null);
        }
        return;
      }
      
      // Only call onError for actual problematic errors
      onError?.(error.message);
      setCurrentTranscript("");
      
      // Clear silence timer on error
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      // Clear force final timer on error
      if (forceFinalTimer) {
        clearTimeout(forceFinalTimer);
        setForceFinalTimer(null);
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
      
      // Clear force final timer when speech ends
      if (forceFinalTimer) {
        clearTimeout(forceFinalTimer);
        setForceFinalTimer(null);
      }
    },
  });

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (forceFinalTimer) {
        clearTimeout(forceFinalTimer);
      }
    };
  }, [silenceTimer, forceFinalTimer]);

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

  const microphoneColor = isTTSSpeaking ? "#FFA500" : 
    (isListening ? (isValidSpeechDetected ? "#00C851" : "#FF4444") : 
    (disabled ? "#999" : "#007AFF"));
  const backgroundColor = isTTSSpeaking ? "rgba(255, 165, 0, 0.1)" : 
    (isListening ? (isValidSpeechDetected ? "rgba(0, 200, 81, 0.1)" : "rgba(255, 68, 68, 0.1)") : 
    "rgba(0, 122, 255, 0.1)");

  return (
    <View style={[styles.container, style]}>
      {error && (
        <Text style={styles.errorText} numberOfLines={1}>
          Error: {error}
        </Text>
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
            <View
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
        <View style={styles.transcriptContainer}>
          <Text style={[
            styles.transcriptText, 
            { color: isValidSpeechDetected ? "#00C851" : "#FF4444" }
          ]} numberOfLines={2}>
            {currentTranscript}
          </Text>
          {noisyEnvironment && (
            <Text style={styles.statusIndicator}>
              {isValidSpeechDetected ? "✓ Valid speech" : "⚠ Background noise"}
            </Text>
          )}
        </View>
      )}
      
      {/* Show TTS status */}
      {isTTSSpeaking && (
        <Text style={styles.ttsStatusText} numberOfLines={1}>
          🔊 Speaking response...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
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
    color: "#333",
  },
  transcriptContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  statusIndicator: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
    color: "#666",
    fontWeight: "500",
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
