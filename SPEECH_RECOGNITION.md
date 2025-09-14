# Speech Recognition Implementation

This project now includes continuous speech recognition using the [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition) library, which works with Expo Go.

## Features Implemented

### ✅ Continuous Speech Recognition
- Real-time speech-to-text conversion
- Works with Expo Go (no need for custom dev build)
- Visual feedback during listening
- Volume level indicators
- Error handling and permission management

### ✅ Components Created

1. **`useSpeechRecognition` Hook** (`/hooks/useSpeechRecognition.ts`)
   - Manages speech recognition state
   - Handles permissions automatically
   - Provides clean interface for components
   - Supports both final and interim results

2. **`MicrophoneButton` Component** (`/components/microphone-button.tsx`)
   - Toggle speech recognition on/off
   - Visual feedback with pulse animation
   - Volume level visualization
   - Real-time transcript display
   - Error state handling

3. **Voice Demo Screen** (`/app/voice-demo.tsx`)
   - Comprehensive testing interface
   - Comparison between voice and text input
   - Message history display
   - Clear demonstration of features

### ✅ Integration
- Added microphone button to home screen (`/app/(tabs)/index.tsx`)
- Configured app.json with required permissions
- Proper error handling and user feedback

## How to Test

### 1. Using Expo Go

1. **Start the development server** (already running):
   ```bash
   pnpm start
   ```

2. **Open in Expo Go**:
   - Scan the QR code with your phone's camera (iOS) or Expo Go app (Android)
   - Or press `a` for Android emulator / `i` for iOS simulator

3. **Test on Home Screen**:
   - Navigate to the home tab
   - Scroll down to "🎯 Quick Actions" section
   - Find the "🎤 Voice Commands" section
   - Tap the microphone button to start listening
   - Speak naturally - try phrases like:
     - "Find chicken recipes"
     - "Add eggs to shopping list"
     - "Show me Italian dishes"
   - Your speech will be converted to text and shown in an alert

4. **Test the Demo Screen**:
   - Navigate to `/voice-demo` (you may need to manually type this URL)
   - Use the larger microphone button for testing
   - Compare voice input vs text input
   - Observe real-time transcription
   - Watch the visual feedback while speaking

### 2. Testing Features

#### Continuous Recognition
- The speech recognition runs continuously until you tap stop
- It will automatically handle speech pauses and resume listening
- Final results are processed when speech ends naturally

#### Visual Feedback
- **Button Animation**: Pulses while listening
- **Color Changes**: Blue when idle, red when listening
- **Volume Indicators**: Visual feedback based on input volume
- **Real-time Transcript**: Shows what's being recognized

#### Error Handling
- Permission denied scenarios
- Device compatibility issues
- Network connectivity problems
- Speech recognition service errors

### 3. Permissions

The app will automatically request:
- **Microphone permission**: Required for audio input
- **Speech recognition permission** (iOS): Required for network-based recognition

## Configuration

### App.json Setup
```json
{
  "expo": {
    "plugins": [
      [
        "expo-speech-recognition",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to use the microphone for voice input.",
          "speechRecognitionPermission": "Allow $(PRODUCT_NAME) to use speech recognition for voice commands.",
          "androidSpeechServicePackages": ["com.google.android.googlequicksearchbox"]
        }
      ]
    ]
  }
}
```

### Speech Recognition Options
```typescript
{
  lang: "en-US",           // Language for recognition
  continuous: true,        // Continuous listening
  interimResults: true,    // Real-time partial results
  maxAlternatives: 1,      // Number of alternative results
  volumeChangeEventOptions: {
    enabled: true,         // Enable volume feedback
    intervalMillis: 100    // Volume update frequency
  }
}
```

## Platform Support

- ✅ **iOS**: Full support with Siri integration
- ✅ **Android**: Full support with Google Speech Recognition
- ✅ **Expo Go**: Compatible (this was the main requirement!)
- ❌ **Web**: Would need additional polyfill for web support

## Usage Examples

### Basic Usage
```typescript
import { MicrophoneButton } from '@/components/microphone-button';

<MicrophoneButton
  onTranscript={(text) => console.log('User said:', text)}
  onError={(error) => console.error('Speech error:', error)}
  size={60}
/>
```

### Advanced Usage with Hook
```typescript
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
  continuous: true,
  onResult: (result) => {
    if (result.isFinal) {
      // Process final result
      handleFinalTranscript(result.transcript);
    }
  }
});
```

## Troubleshooting

### Common Issues

1. **"Speech recognition not supported"**
   - Ensure you're testing on a physical device
   - Check that speech recognition services are enabled in device settings

2. **Permission Denied**
   - Grant microphone permission when prompted
   - Check device privacy settings

3. **No Speech Detected**
   - Ensure microphone is working
   - Speak clearly and at normal volume
   - Check for background noise interference

4. **Continuous Mode Not Working**
   - This feature requires Android 13+ or iOS
   - Fallback to non-continuous mode on older devices

### Testing Tips

- Test in a quiet environment for best results
- Speak naturally at normal pace
- Hold device at normal distance (not too close to mouth)
- Try different types of phrases (short commands vs longer sentences)
- Test both English and other languages if needed

## Next Steps

The implementation is now ready for integration into your chef app's specific features:

1. **Recipe Search**: Use voice to search for recipes
2. **Shopping Lists**: Add items via voice commands
3. **Timer Commands**: Set cooking timers by voice
4. **Recipe Reading**: Read recipe steps aloud
5. **Notes**: Voice-to-text recipe notes

The foundation is solid and can be extended for any voice-controlled features you want to add to your cooking app!
