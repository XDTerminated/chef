# Cerebras AI API Setup

## Getting Your Cerebras API Key

1. **Visit Cerebras Cloud**: Go to [https://cloud.cerebras.ai/](https://cloud.cerebras.ai/)

2. **Create Account**: Sign up for a free account if you don't have one

3. **Get API Key**: 
   - Navigate to your dashboard
   - Look for "API Keys" or "Credentials" section
   - Generate a new API key

4. **Add to Environment**: 
   - Open `.env.local` in your project root
   - Replace `your_cerebras_api_key_here` with your actual API key:
   ```
   EXPO_PUBLIC_CEREBRAS_API_KEY=your_actual_api_key_here
   ```

5. **Restart Development Server**: 
   - Stop the current expo server (Ctrl+C)
   - Run `npm start` again to load the new environment variable

## Features

Your AI chat now uses Cerebras's fast Llama 3.1 8B model for:
- **Real cooking assistance**: Get actual recipe suggestions and cooking tips
- **Conversation context**: The AI remembers your previous messages in the conversation
- **Optimized for speed**: Uses the fast 8B model for quick responses
- **Cooking-focused**: System prompt is specifically tuned for cooking assistance
- **Fallback handling**: If API fails, provides helpful fallback messages

## Model Details

- **Model**: `llama3.1-8b` - Fast and efficient for conversational AI
- **Max Tokens**: 200 - Keeps responses concise and focused
- **Temperature**: 0.7 - Balanced creativity and consistency
- **Context**: Maintains last 8 messages for conversation flow

## Cost Optimization

- Responses are limited to 200 tokens to keep costs low
- Only the last 8 messages are sent for context
- Fast model chosen for quick, affordable responses

## Testing

Once you add your API key:
1. Open the app on your iPhone
2. Go to AI Chat mode
3. Ask cooking questions like:
   - "How do I make pasta?"
   - "What's a good recipe for chocolate chip cookies?"
   - "How do I properly season a steak?"

You should now get real, helpful cooking responses from Cerebras AI! 🍳
