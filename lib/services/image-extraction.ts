import axios, { isAxiosError } from "axios";

interface ImageExtractionRequest {
    url: string;
    limit?: number;
}

interface ImageExtractionResponse {
    url: string;
    images: string[];
    total: number;
    limit: number;
}

export async function extractImages(url: string, limit: number = 5): Promise<string[]> {
    try {
        console.log("Extracting images from:", url, "with limit:", limit);

        const requestBody: ImageExtractionRequest = {
            url: url,
            limit: limit,
        };

        const response = await axios.post<ImageExtractionResponse>("http://localhost:8000/extract", requestBody, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 15000, // 15 second timeout
        });

        console.log(`Extracted ${response.data.images.length} images from ${url}`);
        return response.data.images;
    } catch (error) {
        console.error("Error extracting images:", error);
        if (isAxiosError(error)) {
            if (error.code === "ECONNREFUSED") {
                console.warn("Image extraction service not running on localhost:8000");
            } else if (error.response) {
                console.warn("Image extraction service error:", error.response.status, error.response.data);
            }
        }
        return [];
    }
}

export default extractImages;
