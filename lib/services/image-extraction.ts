import axios, { isAxiosError } from "axios";

interface ImageResult {
    url: string;
    score: number;
    rank: number;
    estimated_size?: string;
}

interface ImageExtractionResponse {
    success: boolean;
    url: string;
    total_found: number;
    images: ImageResult[];
    message?: string;
}

export async function extractImages(url: string, limit: number = 5): Promise<string[]> {
    try {
        console.warn("🖼️ Extracting images from:", url, "with limit:", limit);

        // Use Hugging Face Space API instead of local service
        const apiUrl = "https://hackez-name-extraction.hf.space/extract";
        console.warn("🌐 Using Hugging Face Space API:", apiUrl);

        const requestBody = {
            url: url,
            limit: limit,
        };

        console.warn("📤 Sending request to HF Space");
        console.warn("📤 Request body:", JSON.stringify(requestBody, null, 2));

        const response = await axios.post<ImageExtractionResponse>(apiUrl, requestBody, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 60000, // 60 seconds for Hugging Face API
        });

        console.warn("📥 Image extraction response:", {
            status: response.status,
            success: response.data.success,
            total_found: response.data.total_found,
            images_returned: response.data.images.length,
            message: response.data.message,
        });

        if (response.data.success && response.data.images && response.data.images.length > 0) {
            const imageUrls = response.data.images.map((img) => img.url);
            console.warn(`✅ Extracted ${imageUrls.length} images from ${url}`);
            response.data.images.slice(0, 3).forEach((img) => {
                console.warn(`  ${img.rank}. Score: ${img.score} - ${img.url.substring(0, 80)}...`);
            });
            return imageUrls;
        } else {
            console.warn("❌ No images found in response or request failed");
            return [];
        }
    } catch (error) {
        console.error("❌ Error extracting images:", error);
        if (isAxiosError(error)) {
            if (error.response) {
                console.warn("🚫 API error:", {
                    status: error.response.status,
                    data: error.response.data,
                });
            } else if (error.request) {
                console.warn("🚫 No response from Hugging Face API");
            } else {
                console.warn("🚫 Request error:", error.message);
            }
        }
        return [];
    }
}

export default extractImages;
