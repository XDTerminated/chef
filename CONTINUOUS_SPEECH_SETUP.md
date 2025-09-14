# Continuous Speech Recognition Setup Guide

This guide explains how to set up continuous speech recognition in your Expo app using the `expo-speech-recognition` package. The implementation now works directly with Expo Go without requiring additional plugins!

## Overview

The `expo-speech-recognition` package provides native speech recognition capabilities that work with Expo Go. This enables:

- **Continuous speech recognition** - Always listening for speech input
- **Real-time transcription** - See words as you speak
- **Automatic message sending** - Final speech results are sent automatically
- **Visual feedback** - Volume indicators and animations
- **Cross-platform support** - Works on iOS and Android

## Installation & Setup

### 1. Install the Package

The package is already installed in your project:

```bash
pnpm add expo-speech-recognition
```

### 2. Configure the Plugin

The `expo-speech-recognition` plugin is configured in your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-speech-recognition",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to use the microphone for voice commands.",
          "speechRecognitionPermission": "Allow $(PRODUCT_NAME) to use speech recognition for hands-free cooking assistance.",
          "androidSpeechServicePackages": ["com.google.android.googlequicksearchbox", "com.google.android.tts"]
        }
      ]
    ]
  }
}
```

### 3. Development Build (Recommended)

For full functionality, create a development build:

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Create development build
npx expo run:ios    # for iOS
npx expo run:android # for Android
```

### 4. Testing with Expo Go

Basic speech recognition features work with Expo Go, but for full functionality including continuous recognition, use the development build.

## Features Implemented

### 1. Enhanced Speech Recognition Hook (`hooks/useSpeechRecognition.ts`)

- Follows official documentation patterns
- Proper event handling with hooks
- Comprehensive error handling
- Real-time transcription support
- Volume metering integration

### 2. Continuous Speech Input Component (`components/ContinuousSpeechInput.tsx`)

- Always-on speech recognition
- Visual feedback with pulse animations
- Volume level indicators
- Automatic final result processing
- Compact design for chat interfaces

### 3. Enhanced AI Chat Interface (`components/AIChat.tsx`)

- **Speech/Type mode toggle** - Switch between typing and speaking
- **Continuous speech input** - Speak naturally without button presses
- **Automatic message sending** - Final speech results sent automatically
- **Visual mode indicators** - Clear UI for current input mode

### 4. Traditional Microphone Button (`components/microphone-button.tsx`)

- Tap-to-speak functionality
- Visual feedback and animations
- Real-time transcript display
- Error handling

### 5. Voice Demo (`app/voice-demo.tsx`)

- Side-by-side comparison of input methods
- Real-time message display
- Error handling demonstrations

## Usage Examples

### Basic Continuous Speech

```tsx
import { ContinuousSpeechInput } from '@/components/ContinuousSpeechInput';

<ContinuousSpeechInput
  onTranscript={(transcript, isFinal) => {
    if (isFinal) {
      console.log('Final result:', transcript);
      // Send message or process the text
    } else {
      console.log('Interim result:', transcript);
      // Show live transcription
    }
  }}
  onError={(error) => {
    console.error('Speech error:', error);
  }}
  size={60}
  lang="en-US"
/>
```

### Using the Hook Directly

```tsx
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

function MyComponent() {
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
    onResult: (result) => {
      if (result.isFinal) {
        console.log('Final:', result.transcript);
      }
    },
  });

  return (
    <View>
      <Button 
        title={isListening ? "Stop" : "Start"} 
        onPress={isListening ? stopListening : startListening} 
      />
      <Text>{transcript}</Text>
    </View>
  );
}
```

### AI Chat with Speech Mode

The AI chat interface includes a toggle between typing and speech modes:

- **Type Mode**: Traditional text input with send button
- **Speak Mode**: Continuous speech recognition with automatic sending

## Configuration Options

### Language Support

```tsx
<ContinuousSpeechInput
  lang="en-US"  // English (US)
  // lang="es-ES"  // Spanish (Spain)
  // lang="fr-FR"  // French (France)
  // lang="de-DE"  // German (Germany)
/>
```

### Recognition Options

```tsx
const { startListening } = useSpeechRecognition({
  continuous: true,        // Keep listening for multiple phrases
  interimResults: true,    // Show real-time transcription
  maxAlternatives: 1,      // Number of alternative transcriptions
  lang: "en-US",           // Recognition language
});
```

## Platform Support

### iOS
- ✅ Continuous recognition
- ✅ Interim results
- ✅ Volume metering
- ✅ On-device recognition

### Android
- ✅ Continuous recognition (Android 13+)
- ✅ Interim results
- ✅ Volume metering
- ✅ Multiple recognition services

## Troubleshooting

### Common Issues

#### "Speech recognition not supported"
1. **Check device compatibility**: Ensure the device supports speech recognition
2. **Verify permissions**: The app will request microphone permissions automatically
3. **Test with development build**: Some features require a development build

#### "No speech detected"
1. **Check microphone**: Ensure the device microphone is working
2. **Environment**: Test in a quiet environment
3. **Permissions**: Verify microphone permissions are granted

#### "Recognition stops unexpectedly"
1. **Continuous mode**: Ensure `continuous: true` is set
2. **Error handling**: Check console for error messages
3. **Platform limitations**: Some features vary by platform

### Error Codes

The library follows Web Speech API error codes:

- `not-allowed`: Permissions not granted
- `no-speech`: No speech detected
- `audio-capture`: Microphone access issue
- `network`: Network-related error
- `service-not-allowed`: Speech service unavailable

## Best Practices

### For Continuous Speech
- Speak clearly and at normal pace
- Allow brief pauses between thoughts
- Use in reasonably quiet environments
- Handle final results appropriately

### Performance Optimization
- Stop recognition when not needed
- Handle memory cleanup properly
- Test on various device types
- Monitor battery usage

### User Experience
- Provide clear visual feedback
- Show interim results for better UX
- Handle errors gracefully
- Offer fallback input methods

## Testing

### Development Build Testing
1. Create a development build: `npx expo run:ios` or `npx expo run:android`
2. Install on device
3. Test full speech recognition features

### Expo Go Testing
1. Open your app in Expo Go
2. Basic speech features should work
3. Some advanced features may be limited

### Voice Demo Screen
Navigate to `/voice-demo` to test:
1. Traditional microphone button (tap & release)
2. Continuous speech input (always listening)
3. Error handling scenarios

## Next Steps

1. **Test thoroughly** on your target devices
2. **Customize UI** to match your app design
3. **Add language selection** for international users
4. **Implement error recovery** for production use
5. **Consider offline capabilities** for better privacy

The implementation now follows the latest `expo-speech-recognition` patterns and provides a solid foundation for speech recognition in your cooking app, enabling hands-free interaction perfect for kitchen use!
