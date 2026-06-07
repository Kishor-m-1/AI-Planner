import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Instantiate the official client library
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateTaskInsights = async (title, description) => {
  const systemPrompt = `
    You are an expert project management assistant. Analyze the given task title and description.
    Break it down into subtasks, evaluate complexity, and identity risks.
    You must respond ONLY with a raw JSON object matching this schema. Do not use markdown backticks:
    {
      "suggestedSubtasks": ["string"],
      "complexityScore": "Low" | "Medium" | "High",
      "riskAssessment": "string description of key blocker or risk"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Task Title: ${title}\nDescription: ${description}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Engine Error:", error);
    return { suggestedSubtasks: [], complexityScore: "Medium", riskAssessment: "Failed to process AI insights." };
  }
};