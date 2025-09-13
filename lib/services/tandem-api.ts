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
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
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
        };
        finish_reason?: string;
    }[];
}

class TandemAPIService {
    private readonly baseURL = "https://api.tandemn.com/api/v1";
    private readonly apiKey: string;

    constructor() {
        // In React Native with Expo, use EXPO_PUBLIC_ prefix for client-side access
        // or handle server-side calls differently
        this.apiKey = "gk-OtxLaGiS_vyu2j7jnd5q"; // Direct key for now, should be moved to secure storage
        if (!this.apiKey) {
            throw new Error("TANDEMN_API_KEY is not available");
        }
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
        };
    }

    private getStreamHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
        };
    }

    /**
     * Send a chat completion request (non-streaming)
     */
    async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
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
            throw new Error(`Tandem API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Send a chat completion request with streaming response
     */
    async *chatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<ChatCompletionStreamChunk> {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: "POST",
            headers: this.getStreamHeaders(),
            body: JSON.stringify({
                ...request,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tandem API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        if (!response.body) {
            throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    // Process any remaining data in buffer
                    if (buffer.trim()) {
                        this.processStreamBuffer(buffer);
                    }
                    break;
                }

                // Add new chunk to buffer
                buffer += decoder.decode(value, { stream: true });

                // Process complete lines from buffer
                const lines = buffer.split("\n");

                // Keep the last incomplete line in buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();

                    if (trimmedLine === "" || trimmedLine === "data: [DONE]") {
                        continue;
                    }

                    if (trimmedLine.startsWith("data: ")) {
                        try {
                            const jsonData = trimmedLine.slice(6); // Remove 'data: ' prefix

                            // Skip empty data
                            if (!jsonData || jsonData.trim() === "") {
                                continue;
                            }

                            const parsed = JSON.parse(jsonData) as ChatCompletionStreamChunk;

                            // Validate the chunk has the expected structure
                            if (parsed && parsed.choices && Array.isArray(parsed.choices)) {
                                yield parsed;
                            }
                        } catch (parseError) {
                            console.warn("Failed to parse SSE data:", trimmedLine, parseError);
                            // Don't throw here, just continue with next chunk
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Stream reading error:", error);
            throw new Error(`Streaming error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            try {
                reader.releaseLock();
            } catch (releaseError) {
                console.warn("Error releasing reader lock:", releaseError);
            }
        }
    }

    /**
     * Helper method to process remaining buffer data
     */
    private processStreamBuffer(buffer: string): void {
        const lines = buffer.split("\n");
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ") && trimmedLine !== "data: [DONE]") {
                try {
                    const jsonData = trimmedLine.slice(6);
                    if (jsonData && jsonData.trim()) {
                        JSON.parse(jsonData); // Just validate it's valid JSON
                    }
                } catch {
                    console.warn("Invalid JSON in buffer:", trimmedLine);
                }
            }
        }
    }

    /**
     * Helper method to create a simple chat request
     */
    createChatRequest(userMessage: string, systemMessage: string = "You are a helpful assistant", options: Partial<ChatCompletionRequest> = {}): ChatCompletionRequest {
        return {
            model: "casperhansen/deepseek-r1-distill-llama-70b-awq",
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
}

export const tandemAPI = new TandemAPIService();
export default tandemAPI;
