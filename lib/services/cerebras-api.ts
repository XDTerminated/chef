
const CEREBRAS_API_KEY = process.env.EXPO_PUBLIC_CEREBRAS_API_KEY;
const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1';

interface CerebrasMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CerebrasResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class CerebrasAPI {
  private static instance: CerebrasAPI;

  static getInstance(): CerebrasAPI {
    if (!CerebrasAPI.instance) {
      CerebrasAPI.instance = new CerebrasAPI();
    }
    return CerebrasAPI.instance;
  }

  async getCookingResponse(userMessage: string, conversationHistory: CerebrasMessage[] = []): Promise<string> {
    if (!CEREBRAS_API_KEY || CEREBRAS_API_KEY === 'your_cerebras_api_key_here') {
      console.warn('Cerebras API key not configured, using fallback response');
      return this.getFallbackResponse(userMessage);
    }

    try {
      const systemPrompt: CerebrasMessage = {
        role: 'system',
        content: `You are a helpful AI cooking assistant. Provide very concise, practical cooking advice. Keep responses to 1-2 sentences maximum. Be direct and helpful. Focus on essential information only.`
      };

      const messages: CerebrasMessage[] = [
        systemPrompt,
        ...conversationHistory.slice(-8), // Keep last 8 messages for context
        {
          role: 'user',
          content: userMessage
        }
      ];

      console.log('🧠 Sending request to Cerebras API...');
      const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.1-8b', // Fast model for cooking assistant
          messages,
          max_tokens: 100, // Keep responses very short
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.error('Cerebras API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: CerebrasResponse = await response.json();
      console.log('✅ Received Cerebras response');

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('No response choices returned');
      }

    } catch (error) {
      console.error('Error calling Cerebras API:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const fallbackResponses = [
      "I'd be happy to help you with that cooking question! However, I'm having trouble connecting to my knowledge base right now.",
      "That's a great cooking question! I'm currently experiencing some technical difficulties, but I'd love to help you explore that recipe or technique.",
      "Cooking is such a wonderful adventure! I'm having some connection issues at the moment, but I'm sure we can figure out a delicious solution together.",
      "What an interesting culinary challenge! I'm temporarily unable to access my full cooking knowledge, but I'm here to help however I can.",
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return `${randomResponse} You asked about "${userMessage.toLowerCase()}".`;
  }

  // Convert chat history to Cerebras message format
  static convertChatHistory(messages: Array<{ text: string; isUser: boolean }>): CerebrasMessage[] {
    return messages
      .filter(msg => msg.text.trim()) // Filter out empty messages
      .map(msg => ({
        role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text
      }))
      .slice(-10); // Keep last 10 messages for context
  }
}

export default CerebrasAPI.getInstance();
