import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

export async function generateAIImage(prompt: string, aspectRatio: AspectRatio): Promise<string> {
  // process.env.API_KEY akan diisi oleh Vite saat build sesuai konfigurasi di vite.config.ts
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key tidak ditemukan. Pastikan Anda sudah mengaturnya di Environment Variables Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
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

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].content?.parts) {
      throw new Error("Gagal menghasilkan gambar. Coba gunakan prompt yang berbeda.");
    }

    // Cari bagian data gambar di dalam response
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Response API tidak mengandung data gambar.");
  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    
    // Penanganan khusus untuk error quota (429)
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Kuota API habis atau model belum tersedia untuk akun Anda. Pastikan Anda menggunakan API Key dari project Google Cloud yang valid.");
    }
    
    throw new Error(error.message || "Terjadi kesalahan yang tidak terduga.");
  }
}
