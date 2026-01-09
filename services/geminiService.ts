
import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

export async function generateAIImage(prompt: string, aspectRatio: AspectRatio): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No image was generated. Please try a different prompt.");
    }

    // Iterate through parts to find the image part
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error("Generated content did not contain an image.");
  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    throw new Error(error.message || "An unexpected error occurred during generation.");
  }
}
