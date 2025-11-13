import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FacialExpression } from '../types/mood';

let genAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (apiKey: string) => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  genAI = new GoogleGenerativeAI(apiKey);
};

export const generateMoodSummary = async (
  primaryEmotion: string,
  confidence: number,
  expressions: FacialExpression,
  history?: string[]
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Please provide an API key.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const emotionBreakdown = Object.entries(expressions)
      .filter(([_, value]) => value > 0.1)
      .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`)
      .join(', ');

    const historyContext = history && history.length > 0
      ? `Recent mood history: ${history.join(', ')}`
      : '';

    const prompt = `You are an empathetic mood analyzer. Based on the following facial expression analysis, provide a brief, friendly, and insightful summary of the person's emotional state in 1-2 sentences.

Primary emotion: ${primaryEmotion} (${(confidence * 100).toFixed(1)}% confidence)
Expression breakdown: ${emotionBreakdown}
${historyContext}

Keep the tone warm, supportive, and conversational. Focus on what they might be experiencing.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate mood summary');
  }
};

export const isGeminiInitialized = () => genAI !== null;
