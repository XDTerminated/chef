#!/bin/bash

echo "🔄 Rebuilding development build with expo-speech support..."

# Clear any existing build cache
echo "📁 Clearing build cache..."
npx expo install --fix

# Create new development build for iOS
echo "📱 Creating new iOS development build..."
npx eas build --platform ios --profile development

echo ""
echo "✅ Development build process started!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for the build to complete (check EAS dashboard)"
echo "2. Install the new build on your iPhone when ready"
echo "3. The new build will include expo-speech for text-to-speech"
echo ""
echo "🔗 Monitor build progress at: https://expo.dev"
