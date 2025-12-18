
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Chatbot with Thinking Mode
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  useThinking: boolean = false
): Promise<string> => {
  const ai = getAiClient();
  const modelName = 'gemini-3-pro-preview';
  
  const config: any = {
    systemInstruction: "You are an expert medical data analyst assistant for the APS Pain Management Dashboard. You help users interpret charts, trends, and patient demographics. Be concise, professional, and data-driven.",
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 16000 }; // Moderate budget for responsiveness
  }

  const chat = ai.chats.create({
    model: modelName,
    config,
    history: history.map(h => ({
      role: h.role,
      parts: h.parts
    }))
  });

  const response: GenerateContentResponse = await chat.sendMessage({ message });
  return response.text || "I couldn't generate a response.";
};

// 2. Image Analysis
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const modelName = 'gemini-3-pro-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        },
        { text: prompt || "Analyze this medical dashboard screenshot or clinical image." }
      ]
    }
  });

  return response.text || "No analysis generated.";
};

// 3. Image Editing (Nano Banana)
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  // Using gemini-2.5-flash-image for editing capabilities as requested (Nano banana equivalent)
  const modelName = 'gemini-2.5-flash-image'; 

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        },
        { text: prompt }
      ]
    }
  });

  // Check for image in response parts
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
  }
  
  throw new Error("No image generated in response.");
};

// 4. Audio Transcription
export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const ai = getAiClient();
  // Fixed model name to gemini-3-flash-preview for better multimodal performance
  const modelName = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'audio/wav', // Assuming WAV from browser recorder
            data: audioBase64
          }
        },
        { text: "Transcribe this medical note accurately." }
      ]
    }
  });

  return response.text || "Transcription failed.";
};
