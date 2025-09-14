# Speech Recognition Setup Guide

## Current Status
✅ **Speech recognition code is implemented and ready**  
⚠️ **Requires development build to work (not available in Expo Go)**

## Quick Setup for Development Build

### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS Build
```bash
eas build:configure
```

### 4. Build for your platform
```bash
# For iOS (requires Apple Developer account)
eas build --platform ios

# For Android
eas build --platform android
```

### 5. Install the built app on your device
- Download from the EAS build dashboard
- Install on your physical device
- The speech recognition will work fully!

## What Works in Development Build

### 🎤 Continuous Speech Recognition
- Real-time speech-to-text conversion
- Continuous listening mode
- Interim results as you speak

### 📱 Native Features
- Microphone permissions
- Volume level visualization
- Platform-specific optimizations

### 🗣️ Voice Commands
- Recipe search: "Find chicken recipes"
- Shopping lists: "Add eggs to shopping list"
- Cooking timers: "Set timer for 5 minutes"
- Any custom voice commands you implement

## Alternative for Testing

### Web Browser Testing
You can test the speech recognition concept in a web browser:
1. Run `npm run web`
2. Open in Chrome or Safari
3. The Web Speech API will work for basic testing

## Files Created

- `hooks/useSpeechRecognition.ts` - Main speech recognition logic
- `components/microphone-button.tsx` - UI component with animations
- `components/speech-recognition-info.tsx` - Setup instructions
- Updated `app.json` with required permissions

## Next Steps

1. Create development build using EAS
2. Test on physical device
3. Implement voice command handlers
4. Add recipe search via voice
5. Integrate with cooking features

The foundation is ready - just needs a development build to unlock full functionality!
