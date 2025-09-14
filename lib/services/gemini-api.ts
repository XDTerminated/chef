const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Debug logging for API key
console.log('🔍 Gemini API Key status:', {
  exists: !!GEMINI_API_KEY,
  length: GEMINI_API_KEY?.length || 0,
  starts_with: GEMINI_API_KEY?.substring(0, 15) || 'undefined'
});

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiAPI {
  private static instance: GeminiAPI;

  static getInstance(): GeminiAPI {
    if (!GeminiAPI.instance) {
      GeminiAPI.instance = new GeminiAPI();
    }
    return GeminiAPI.instance;
  }

  async analyzeImageWithText(
    imageBase64: string, 
    imageType: string, 
    userMessage: string,
    conversationHistory: Array<{text: string; isUser: boolean}> = []
  ): Promise<string> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured, using fallback response');
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
      
      const fullPrompt = `${contextPrompt}\n\nUser: ${userMessage || "What can you tell me about this image in the context of cooking?"}`;

      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              },
              {
                inlineData: {
                  mimeType: imageType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7
        }
      };

      console.log('🎯 Sending image analysis request to Gemini...');
      console.log('🔑 Using API key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 15)}...` : 'undefined');

      const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', response.status, errorData);
        
        if (response.status === 401) {
          console.error('❌ Invalid Gemini API key - please update your API key in .env.local');
          return "I'm having trouble with the image analysis service. Please check that you have a valid Gemini API key configured. You can get one from https://aistudio.google.com/app/apikey";
        }
        
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('✅ Gemini response received');

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No content in Gemini response');
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const fallbackResponses = [
      "I can see you've shared an image! However, I need a valid Gemini API key to analyze images. Please check your API key at https://aistudio.google.com/app/apikey and update it in your .env.local file.",
      "The image analysis service requires a valid Gemini API key. You can get one from Google AI Studio and add it to your environment variables.",
      "I'd love to help analyze your image, but the Gemini API key needs to be configured properly. Please check your .env.local file.",
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}
