import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ Falta la API KEY de Gemini.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash" 
});

export async function askGemini(message: string) {
  try {
    const result = await model.generateContent([
      { text: message }
    ]);

    return result.response.text();

  } catch (err) {
    console.error("Gemini error:", err);
    return "Hubo un error al procesar tu mensaje con la IA.";
  }
}
