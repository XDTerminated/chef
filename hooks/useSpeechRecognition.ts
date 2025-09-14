import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";

// Import the speech recognition module with web polyfill support
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;
let ExpoWebSpeechRecognition: any = null;

try {
  const speechModule = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
  ExpoWebSpeechRecognition = speechModule.ExpoWebSpeechRecognition;
  console.log("✅ expo-speech-recognition loaded successfully");
} catch (error) {
  console.warn("⚠️ expo-speech-recognition not available, checking for web API:", error);
  
  // Check for native web speech recognition API
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const webkitSpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (webkitSpeechRecognition) {
      console.log("✅ Web Speech Recognition API available");
    } else {
      console.warn("❌ Web Speech Recognition API not available");
    }
  }
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: { error: string; message: string }) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = "en-US",
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    onResult,
    onError,
    onStart,
    onEnd,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => {
    if (!ExpoSpeechRecognitionModule) {
      return false;
    }
    try {
      return ExpoSpeechRecognitionModule.isRecognitionAvailable();
    } catch {
      return false;
    }
  });
  
  const finalTranscriptRef = useRef("");

  // Set up event listeners using the hook approach from the official docs
  // Only if the event handler is available
  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent("start", () => {
      console.log("🎤 Speech recognition started");
      setIsListening(true);
      setError(null);
      onStart?.();
    });

    useSpeechRecognitionEvent("end", () => {
      console.log("🛑 Speech recognition ended");
      setIsListening(false);
      onEnd?.();
    });

    useSpeechRecognitionEvent("result", (event: any) => {
      console.log("📝 Speech result:", event);
      
      if (event.results && event.results.length > 0) {
        const result = event.results[0];
        
        // Filter out empty or very short results that are likely noise
        const transcript = result.transcript?.trim() || "";
        if (transcript.length < 1) { // Allow single characters for testing
          console.log("🔇 Ignoring empty transcript:", transcript);
          return;
        }
        
        // Skip confidence filtering since many devices return 0
        const confidence = result.confidence;
        console.log("📊 Speech confidence:", confidence, "transcript:", transcript);
        
        const newResult: SpeechRecognitionResult = {
          transcript: transcript,
          isFinal: event.isFinal,
          confidence: confidence,
        };

        if (event.isFinal) {
          // For final results, append to previous transcript
          const newFinalTranscript = finalTranscriptRef.current + " " + transcript;
          finalTranscriptRef.current = newFinalTranscript.trim();
          setTranscript(finalTranscriptRef.current);
        } else {
          // For interim results, show combined final + interim
          const currentTranscript = (finalTranscriptRef.current + " " + transcript).trim();
          setTranscript(currentTranscript);
        }

        onResult?.(newResult);
      }
    });

    useSpeechRecognitionEvent("error", (event: any) => {
      // Filter out certain error types that shouldn't be treated as actual errors
      const errorType = event.error?.toLowerCase() || "";
      const errorMessage = event.message?.toLowerCase() || "";
      
      // Ignore "no speech detected" or similar scenarios
      const ignorableErrors = [
        "no-speech",
        "no speech",
        "silence",
        "timeout",
        "aborted",
        "audio-capture", // Sometimes fires when there's no audio input
      ];
      
      const shouldIgnoreError = ignorableErrors.some(ignorable => 
        errorType.includes(ignorable) || errorMessage.includes(ignorable)
      );
      
      if (shouldIgnoreError) {
        console.log("🔇 Ignoring non-critical speech recognition error:", event);
        // Just end listening gracefully without setting an error
        setIsListening(false);
        return;
      }
      
      // Only log and set error for actual problematic errors
      console.error("❌ Speech recognition error:", event);
      setError(`${event.error}: ${event.message}`);
      setIsListening(false);
      onError?.(event);
    });
  }

  const startListening = useCallback(async () => {
    if (!isSupported || !ExpoSpeechRecognitionModule) {
      setError("Speech recognition is not supported on this device. Please ensure you have the required permissions and a compatible device.");
      return;
    }

    try {
      console.log("🎯 Requesting speech recognition permissions...");
      // Request permissions before starting
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setError("Microphone and speech recognition permissions are required");
        return;
      }

      console.log("🚀 Starting speech recognition with options:", {
        lang,
        interimResults,
        continuous,
        maxAlternatives,
      });

      // Clear previous transcript
      finalTranscriptRef.current = "";
      setTranscript("");
      setError(null);

      // Start speech recognition with options from the official docs
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults,
        continuous,
        maxAlternatives,
        // Enable volume metering for visual feedback
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 100,
        },
      });
    } catch (err) {
      console.error("💥 Failed to start speech recognition:", err);
      setError(`Failed to start speech recognition: ${err}`);
    }
  }, [isSupported, lang, interimResults, continuous, maxAlternatives]);

  const stopListening = useCallback(() => {
    if (ExpoSpeechRecognitionModule && isListening) {
      console.log("⏹️ Stopping speech recognition...");
      ExpoSpeechRecognitionModule.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    console.log("🔄 Resetting transcript...");
    setTranscript("");
    finalTranscriptRef.current = "";
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
