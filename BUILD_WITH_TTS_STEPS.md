# Complete Steps to Build with TTS Support

## ✅ EAS CLI Installed Successfully!

EAS CLI is now installed and ready to use. Here are the complete steps to create a development build with TTS support:

## 🔐 Step 1: EAS Login

```bash
cd /Users/noahwolk/chef-2
eas login
```

**Enter your Expo account credentials:**
- Email/Username: Your Expo account email
- Password: Your Expo account password

**Don't have an Expo account?**
- Create one at: https://expo.dev/signup
- It's free and takes 30 seconds

## 🏗️ Step 2: Create Development Build

After successful login, run:

```bash
eas build --platform ios --profile development
```

This will:
1. Upload your project to Expo's build servers
2. Build a development build with expo-speech included
3. Generate a download link for your iPhone

## 📱 Step 3: Install on iPhone

1. **Wait for build completion** (usually 10-15 minutes)
2. **Get download link** from EAS dashboard or terminal output
3. **Open link on your iPhone** 
4. **Install the new development build**

## 🎯 Alternative: Quick Setup Commands

If you want to do this all in one go:

```bash
# Login (enter your credentials when prompted)
eas login

# Create the build
eas build --platform ios --profile development --clear-cache
```

## 🚀 What You'll Get

**After installing the new build:**
- ✅ Speech recognition (same as before)
- ✅ Short AI responses (same as before) 
- ✅ **NEW**: Text-to-Speech for AI responses
- ✅ **NEW**: "Speak naturally - responses will be spoken back to you"

## 🔄 Current Status

**Right now with your existing build:**
- Everything works perfectly except TTS
- You can use the app normally for cooking assistance
- Speech recognition gives you short, helpful responses

**After new build:**
- Same as above + AI responses are spoken back to you
- Perfect for hands-free cooking!

## ⚡ Quick Alternative

If you don't want to create a new build right now, your current app is already excellent for cooking assistance! The TTS is just a nice enhancement - your speech recognition and short AI responses are working perfectly.

Would you like to proceed with the build, or are you satisfied with the current functionality?
