const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
const CLAUDE_BASE_URL = 'https://api.anthropic.com/v1';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    source?: {
      type: 'base64';
      media_type: string;
      data: string;
    };
  }>;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeAPI {
  private static instance: ClaudeAPI;

  static getInstance(): ClaudeAPI {
    if (!ClaudeAPI.instance) {
      ClaudeAPI.instance = new ClaudeAPI();
    }
    return ClaudeAPI.instance;
  }

  async analyzeImageWithText(
    imageBase64: string, 
    imageType: string, 
    userMessage: string,
    conversationHistory: Array<{text: string; isUser: boolean}> = []
  ): Promise<string> {
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your_claude_api_key_here') {
      console.warn('Claude API key not configured, using fallback response');
      return this.getFallbackResponse(userMessage);
    }

    try {
      // Build conversation context
      let contextPrompt = "You are a helpful AI cooking assistant. ";
      if (conversationHistory.length > 0) {
        contextPrompt += "Here's our recent conversation for context:\n";
        conversationHistory.slice(-4).forEach(msg => {
          contextPrompt += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}\n`;
        });
        contextPrompt += "\n";
      }

      contextPrompt += "Now analyze this image and respond to the user's message. Be concise and practical, focusing on cooking advice.";

      const message: ClaudeMessage = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: contextPrompt
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageType,
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: userMessage || "What can you tell me about this image in the context of cooking?"
          }
        ]
      };

      console.log('🎯 Sending image analysis request to Claude...');

      const response = await fetch(`${CLAUDE_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CLAUDE_API_KEY}`,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 300, // Keep responses concise
          messages: [message]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Claude API error:', response.status, errorData);
        
        if (response.status === 401) {
          console.error('❌ Invalid Claude API key - please update your API key in .env.local');
          return "I'm having trouble with the image analysis service. Please check that you have a valid Claude API key configured. You can get one from https://console.anthropic.com/";
        }
        
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data: ClaudeResponse = await response.json();
      console.log('✅ Claude response received');

      if (data.content && data.content.length > 0) {
        return data.content[0].text;
      } else {
        throw new Error('No content in Claude response');
      }

    } catch (error) {
      console.error('Error calling Claude API:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const fallbackResponses = [
      "I can see you've shared an image! However, I need a valid Claude API key to analyze images. Please check your API key at https://console.anthropic.com/ and update it in your .env.local file.",
      "The image analysis service requires a valid Claude API key. You can get one from Anthropic's console and add it to your environment variables.",
      "I'd love to help analyze your image, but the Claude API key needs to be configured properly. Please check your .env.local file.",
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}
