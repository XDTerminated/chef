import { tandemAPI } from "../lib/services/tandem-api";

/**
 * Test functions to validate Tandem API integration
 */
export const testTandemAPI = async () => {
    console.log("=== Testing Tandem API ===");

    try {
        // Test 1: Simple non-streaming request
        console.log("Test 1: Non-streaming request...");
        const request = tandemAPI.createChatRequest("Say hello in exactly 5 words.", "You are a test assistant.", { temperature: 0.1, max_completion_tokens: 20 });

        const response = await tandemAPI.chatCompletion(request);
        console.log("✅ Non-streaming test passed");
        console.log("Response:", response.choices[0]?.message.content);

        // Test 2: Streaming request
        console.log("\nTest 2: Streaming request...");
        const streamRequest = tandemAPI.createChatRequest("Count from 1 to 5, one number per sentence.", "You are a test assistant.", { stream: true, temperature: 0.1, max_completion_tokens: 50 });

        let streamContent = "";
        let chunkCount = 0;
        const startTime = Date.now();

        for await (const chunk of tandemAPI.chatCompletionStream(streamRequest)) {
            chunkCount++;
            if (chunk.choices?.[0]?.delta?.content) {
                streamContent += chunk.choices[0].delta.content;
                console.log(`Chunk ${chunkCount}:`, chunk.choices[0].delta.content);
            }

            if (chunk.choices?.[0]?.finish_reason) {
                console.log("Stream finished with reason:", chunk.choices[0].finish_reason);
                break;
            }
        }

        const duration = Date.now() - startTime;
        console.log("✅ Streaming test passed");
        console.log(`Duration: ${duration}ms, Chunks: ${chunkCount}`);
        console.log("Full response:", streamContent);

        return {
            success: true,
            nonStreaming: response.choices[0]?.message.content,
            streaming: streamContent,
            streamChunks: chunkCount,
            streamDuration: duration,
        };
    } catch (error) {
        console.error("❌ API Test failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

/**
 * Test streaming error recovery
 */
export const testStreamingRecovery = async () => {
    console.log("=== Testing Streaming Error Recovery ===");

    try {
        // Test with a request that might cause issues
        const request = tandemAPI.createChatRequest("Write a very long essay about cooking (at least 500 words)", "You are a culinary expert.", { stream: true, temperature: 0.7, max_completion_tokens: 1000 });

        let content = "";
        let chunks = 0;
        let errors = 0;
        const startTime = Date.now();

        try {
            for await (const chunk of tandemAPI.chatCompletionStream(request)) {
                chunks++;
                try {
                    if (chunk.choices?.[0]?.delta?.content) {
                        content += chunk.choices[0].delta.content;
                    }

                    if (chunk.choices?.[0]?.finish_reason) {
                        break;
                    }
                } catch (chunkError) {
                    errors++;
                    console.warn(`Chunk processing error ${errors}:`, chunkError);
                }
            }
        } catch (streamError) {
            console.warn("Stream error caught:", streamError);

            // Test fallback to non-streaming
            console.log("Testing fallback...");
            const fallbackRequest = tandemAPI.createChatRequest("Write a short response about cooking (2-3 sentences)", "You are a culinary expert.");

            const fallbackResponse = await tandemAPI.chatCompletion(fallbackRequest);
            content = fallbackResponse.choices[0]?.message.content || "";
            console.log("✅ Fallback successful");
        }

        const duration = Date.now() - startTime;
        console.log(`Completed in ${duration}ms with ${chunks} chunks and ${errors} errors`);
        console.log("Final content length:", content.length);

        return {
            success: true,
            chunks,
            errors,
            duration,
            contentLength: content.length,
            hasContent: content.length > 0,
        };
    } catch (error) {
        console.error("❌ Recovery test failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
    console.log("🧪 Running Tandem API Tests...\n");

    const basicTest = await testTandemAPI();
    console.log("\n" + "=".repeat(50) + "\n");

    const recoveryTest = await testStreamingRecovery();

    console.log("\n" + "=".repeat(50));
    console.log("📊 Test Summary:");
    console.log("Basic API:", basicTest.success ? "✅ PASS" : "❌ FAIL");
    console.log("Error Recovery:", recoveryTest.success ? "✅ PASS" : "❌ FAIL");
    console.log("=".repeat(50));

    return {
        basicTest,
        recoveryTest,
        allPassed: basicTest.success && recoveryTest.success,
    };
};
