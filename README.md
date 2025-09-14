# Heaven's Kitchen - AI-Powered Cooking Assistant �‍🍳

Heaven's Kitchen is an intelligent cooking companion app built with React Native and Expo that revolutionizes how you discover, plan, and execute recipes. The app combines cutting-edge AI technology with intuitive mobile design to provide personalized cooking assistance, recipe recommendations, and hands-free kitchen guidance.

## About the Project

Heaven's Kitchen leverages advanced AI models including Cerebras and Claude to deliver smart cooking assistance through multiple interaction modes. Users can chat with the AI assistant via text or voice commands, capture photos of ingredients for instant recipe suggestions, and receive step-by-step cooking guidance. The app features continuous speech recognition for hands-free operation, text-to-speech for audio feedback, and webscraping internet for recipes. Built with modern technologies like Drizzle ORM for database management, Clerk for authentication, and Expo for cross-platform deployment, Heaven's Kitchen provides a premium cooking experience that adapts to your culinary needs and skill level.

## Features

### 🤖 AI-Powered Assistance
- **Smart Recipe Chat**: Interactive AI assistant powered by advanced language models
- **Voice Commands**: Hands-free cooking guidance with continuous speech recognition
- **Ingredient Recognition**: Photo analysis for instant recipe suggestions
- **Personalized Recommendations**: AI learns your preferences and dietary restrictions

### 🍳 Recipe Discovery
- **Vast Recipe Database**: Access to 50,000+ curated recipes from multiple sources
- **Smart Search**: Advanced filtering by ingredients, cuisine, dietary needs, and difficulty
- **For You Page**: Personalized recipe recommendations based on your taste profile
- **Image-Rich Experience**: High-quality food photography for every recipe

### 🎯 User Experience
- **Profile Customization**: Set dietary restrictions, cuisine preferences, and cooking skill level
- **Seamless Authentication**: Secure login with Clerk integration
- **Cross-Platform**: Native iOS and Android experience with Expo
- **Modern UI**: Intuitive design with smooth animations and transitions

## Technology Stack

### Frontend
- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type-safe development
- **Expo Router** for file-based navigation
- **React Native SVG** for custom icons and graphics

### Backend & Data
- **Drizzle ORM** with **Turso** for database management
- **Clerk** for user authentication and management
- **Hugging Face API** for image processing and AI capabilities
- **Toolhouse AI** for recipe generation and cooking assistance

### AI & Voice Features
- **Expo Speech** for text-to-speech functionality
- **Expo AV** for audio recording and playback
- **Web Speech API** for speech recognition
- **Custom AI Services** for recipe analysis and recommendations

## Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/heavens-kitchen.git
cd heavens-kitchen
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
# Add your API keys and configuration
\`\`\`

4. Start the development server:
\`\`\`bash
npx expo start
\`\`\`

5. Open the app:
   - Press \`i\` for iOS simulator
   - Press \`a\` for Android emulator
   - Scan QR code with Expo Go app on your device

## Development

### Database Setup
\`\`\`bash
# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Open database studio
npm run db:studio
\`\`\`

### Building for Production
\`\`\`bash
# iOS
npx expo run:ios --configuration Release

# Android  
npx expo run:android --variant release
\`\`\`

## Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@heavenskitchen.app or join our Discord community.

---

**Heaven's Kitchen** - Transforming the way you cook, one recipe at a time. 🌟