import { GoogleGenerativeAI } from "@google/generative-ai";

const systemInstruction = `You are the BloodConnect Assistant, a helpful AI for a blood donation app in Kenya.
Your goal is to encourage blood donation, explain the process, and help users understand eligibility.

Key Context from BloodConnect:
- Mission: Connect donors to patients in real-time.
- Problem: Kenya needs 500,000 units/year but collects <50%.
- Process: Safe, fast, and verified.
- Eligibility: Generally 18-65 years, >50kg, healthy.

Tone: Empathetic, professional, encouraging, and urgent when necessary.
Keep answers concise (under 3 sentences where possible) as this is a mobile chat.
`;

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("Gemini API Key not found");
      return "I'm here to help with blood donation questions! Currently, I can answer general questions about eligibility, the donation process, and finding donation centers in Kenya.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    });

    const prompt = `${systemInstruction}\n\nUser Question: ${userMessage}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text() || "I'd be happy to help with blood donation information. Could you please rephrase your question?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently having trouble connecting to my knowledge base. Please try again later or contact support for immediate assistance.";
  }
};