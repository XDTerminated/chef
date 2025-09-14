import { useCallback, useRef, useState } from 'react';

// Import Speech with error handling
let Speech: any = null;
let speechAvailable = false;

try {
  Speech = require('expo-speech');
  speechAvailable = true;
  console.log('✅ expo-speech loaded successfully');
} catch (error) {
  console.warn('⚠️ expo-speech not available - will use fallback mode');
  speechAvailable = false;
}

export interface TextToSpeechOptions {
  enabled?: boolean;
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const {
    enabled = true,
    pitch = 1.0,
    rate = 0.9, // Slightly slower for better comprehension
    volume = 1.0,
  } = options;

  const isSpeakingRef = useRef(false);
  const [isModuleAvailable, setIsModuleAvailable] = useState(speechAvailable);
  const [isSpeakingState, setIsSpeakingState] = useState(false);

  // Return module availability status
  const isAvailable = useCallback(() => {
    return speechAvailable && isModuleAvailable;
  }, [isModuleAvailable]);

  const speak = useCallback(async (text: string) => {
    if (!enabled || !text.trim() || !speechAvailable || !Speech) {
      if (!speechAvailable) {
        console.log('🔊 TTS not available - speech module not loaded');
      }
      return;
    }

    try {
      // Stop any current speech
      if (isSpeakingRef.current) {
        Speech.stop();
      }

      console.log('🔊 Speaking:', text);
      isSpeakingRef.current = true;
      setIsSpeakingState(true);

      await Speech.speak(text, {
        pitch,
        rate,
        volume,
        onStart: () => {
          console.log('🔊 TTS started');
          isSpeakingRef.current = true;
          setIsSpeakingState(true);
        },
        onDone: () => {
          console.log('🔊 TTS finished');
          isSpeakingRef.current = false;
          setIsSpeakingState(false);
        },
        onStopped: () => {
          console.log('🔊 TTS stopped');
          isSpeakingRef.current = false;
          setIsSpeakingState(false);
        },
        onError: (error: any) => {
          console.error('🔊 TTS error:', error);
          isSpeakingRef.current = false;
          setIsSpeakingState(false);
        },
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
      isSpeakingRef.current = false;
      setIsSpeakingState(false);
    }
  }, [enabled, pitch, rate, volume]);

  const stop = useCallback(() => {
    if (!speechAvailable || !Speech) {
      return;
    }
    
    try {
      Speech.stop();
      isSpeakingRef.current = false;
      setIsSpeakingState(false);
      console.log('🔊 TTS stopped manually');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }, []);

  const isSpeaking = useCallback(() => {
    return isSpeakingRef.current;
  }, []);

  return {
    speak,
    stop,
    isSpeaking: isSpeakingState,
    isAvailable,
  };
}
