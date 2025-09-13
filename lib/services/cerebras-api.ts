export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    stream?: boolean;
    temperature?: number;
    max_completion_tokens?: number;
    reasoning_effort?: "low" | "medium" | "high";
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
            reasoning?: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    time_info?: {
        queue_time: number;
        prompt_time: number;
        completion_time: number;
        total_time: number;
        created: number;
    };
}

export interface ChatCompletionStreamChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        delta: {
            role?: string;
            content?: string;
            reasoning?: string;
        };
        finish_reason?: string;
    }[];
}

class CerebrasAPIService {
    private readonly baseURL = "https://api.cerebras.ai/v1";
    private readonly apiKey: string;

    constructor() {
        // Use the API key from environment
        this.apiKey = "csk-xndy2fdryr323kwjdwvpfyrwh39dxp83cmp64njkewcmn8n2";
        if (!this.apiKey) {
            throw new Error("CEREBRAS_API key is not available");
        }
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "ChefApp/1.0", // Required to avoid CloudFront blocking
        };
    }

    private getStreamHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
            "User-Agent": "ChefApp/1.0", // Required to avoid CloudFront blocking
        };
    }

    /**
     * Send a chat completion request (non-streaming)
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify({
                    ...request,
                    stream: false,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cerebras API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error("Cerebras API request failed:", error);
            throw error;
        }
    }

    /**
     * Send a chat completion request with streaming response (React Native compatible)
     */
    async *chatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<ChatCompletionStreamChunk> {
        console.log("Starting Cerebras streaming request...");

        // For React Native, streaming is often problematic, so let's simulate streaming
        // by making a non-streaming request and breaking it into chunks
        try {
            console.log("Using simulated streaming (React Native compatible)...");

            const nonStreamRequest = { ...request, stream: false };
            const response = await this.chatCompletion(nonStreamRequest);

            if (response.choices && response.choices.length > 0) {
                const fullContent = response.choices[0].message.content;
                const words = fullContent.split(" ");

                // Simulate streaming by yielding word by word with small delays
                for (let i = 0; i < words.length; i++) {
                    yield {
                        id: response.id,
                        object: "chat.completion.chunk",
                        created: response.created,
                        model: response.model,
                        choices: [
                            {
                                index: 0,
                                delta: {
                                    role: i === 0 ? "assistant" : undefined,
                                    content: (i > 0 ? " " : "") + words[i],
                                },
                                finish_reason: i === words.length - 1 ? "stop" : undefined,
                            },
                        ],
                    };

                    // Small delay to simulate streaming
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            }

            return;
        } catch (error) {
            console.error("Simulated streaming failed:", error);
            throw error;
        }
    }

    /**
     * Alternative streaming using chunked responses (more React Native compatible)
     */
    async chatCompletionStreamChunked(request: ChatCompletionRequest): Promise<string> {
        try {
            console.log("Using chunked streaming fallback...");

            // For now, just use non-streaming as it's more reliable
            const response = await this.chatCompletion({ ...request, stream: false });

            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content;
            }

            throw new Error("No content in response");
        } catch (error) {
            console.error("Chunked streaming failed:", error);
            throw error;
        }
    }

    /**
     * Test if real streaming is available (for debugging)
     */
    async testRealStreaming(): Promise<{ success: boolean; message: string }> {
        try {
            console.log("Testing real streaming...");

            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: "POST",
                headers: this.getStreamHeaders(),
                body: JSON.stringify({
                    model: "llama3.1-8b",
                    messages: [{ role: "user", content: "Say 'Hello World'" }],
                    stream: true,
                    max_completion_tokens: 10,
                }),
            });

            console.log("Real streaming test - Response status:", response.status);
            console.log("Real streaming test - Headers:", Object.fromEntries(response.headers.entries()));
            console.log("Real streaming test - Body available:", !!response.body);

            if (response.body) {
                console.log("Real streaming test - Body type:", typeof response.body);
                console.log("Real streaming test - Body locked:", response.body.locked);
            }

            return {
                success: response.ok && !!response.body,
                message: `Status: ${response.status}, Body: ${!!response.body}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Helper method to create a simple chat request with reasonable defaults
     */
    createChatRequest(userMessage: string, systemMessage: string = "You are a helpful assistant", options: Partial<ChatCompletionRequest> = {}): ChatCompletionRequest {
        return {
            model: "llama3.1-8b", // Fast and reliable model for most tasks
            messages: [
                {
                    role: "system",
                    content: systemMessage,
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
            temperature: 0.7,
            max_completion_tokens: 2000,
            stream: false,
            ...options,
        };
    }

    /**
     * Create a chat request optimized for cooking tasks
     */
    createCookingChatRequest(userMessage: string, options: Partial<ChatCompletionRequest> = {}): ChatCompletionRequest {
        return this.createChatRequest(userMessage, "You are an expert culinary assistant and professional chef. You provide practical cooking advice, detailed recipes, ingredient substitutions, cooking techniques, and food safety guidance. Always be specific with measurements, temperatures, and timing. If asked about recipes, provide clear step-by-step instructions.", {
            model: "llama3.1-8b", // Good balance of speed and quality for cooking tasks
            temperature: 0.6, // Slightly more focused for cooking instructions
            ...options,
        });
    }

    /**
     * Test connection to the Cerebras API
     */
    async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
        try {
            const testRequest = this.createChatRequest("Hello! Are you working correctly?");
            const response = await this.chatCompletion(testRequest);

            return {
                success: true,
                message: "Connection successful",
                model: response.model,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    }

    /**
     * Get available models (based on documentation)
     */
    getAvailableModels(): string[] {
        return [
            "llama3.1-8b", // Fast, general purpose
            "llama-3.3-70b", // More capable, slower
            "llama-4-scout-17b-16e-instruct", // Scout model
            "qwen-3-32b", // Alternative model
            "gpt-oss-120b", // Supports reasoning effort parameter
        ];
    }
}

export const cerebrasAPI = new CerebrasAPIService();
export default cerebrasAPI;
