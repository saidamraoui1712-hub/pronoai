
import { GoogleGenAI, Type } from "@google/genai";
import { Match, AIAnalysis } from "../types";

export const analyzeMatch = async (match: Match): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Analyse approfondie pour le match : ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.league}).
  Cotes actuelles : 1(${match.odds.home}) N(${match.odds.draw}) 2(${match.odds.away}).
  Fournis une analyse technique (stats, blessures) et une analyse stratégique (enjeux, psychologie).
  Identifie 3 insights clés.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      winProbabilities: {
        type: Type.OBJECT,
        properties: {
          home: { type: Type.NUMBER },
          draw: { type: Type.NUMBER },
          away: { type: Type.NUMBER }
        }
      },
      expectedScore: { type: Type.STRING },
      technicalAnalysis: { type: Type.STRING },
      strategicAnalysis: { type: Type.STRING },
      keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestedBet: { type: Type.STRING },
      confidenceScore: { type: Type.NUMBER }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3
      }
    });

    const result = JSON.parse(response.text || "{}");
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = grounding.map((c: any) => ({
      title: c.web?.title || "Analyse Web",
      uri: c.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#");

    return {
      ...result,
      matchId: match.id,
      sources,
      modelUsed: "gemini-3-pro-preview"
    };
  } catch (error) {
    throw error;
  }
};
