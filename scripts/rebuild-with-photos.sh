#!/bin/bash

echo "🔧 Rebuilding development build with expo-image-picker support..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios android .expo

# Generate native directories with all dependencies
echo "📱 Generating native iOS and Android projects..."
npx expo prebuild --clean

echo "✅ Native projects generated!"
echo ""
echo "📋 Next steps to enable photo functionality:"
echo "1. Build and install development build:"
echo "   npx expo run:ios --device"
echo ""
echo "2. Or create EAS development build:"
echo "   npx eas build --platform ios --profile development"
echo ""
echo "3. Once installed, restart the development server:"
echo "   npx expo start --dev-client --lan"
echo ""
echo "🎯 This will enable photo capture functionality in your app!"
