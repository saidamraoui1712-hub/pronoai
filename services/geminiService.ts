
import { GoogleGenAI } from "@google/genai";
import { Match, AIAnalysis, GroundingSource } from "../types";

// Service for complex match analysis using multiple Gemini models
export const getMatchAnalysis = async (match: Match): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `Tu es une IA hybride combinant les capacités de raisonnement de Gemini 3 Pro et la finesse stratégique de ChatGPT.
  Ta mission est de fournir deux analyses distinctes pour un match de football :
  1. La perspective "Gemini" : Focus sur les données brutes, les statistiques et le momentum.
  2. La perspective "ChatGPT Style" : Focus sur la psychologie du match, les enjeux tactiques et une vision globale.
  
  RÈGLES :
  - Réponds UNIQUEMENT en JSON.
  - Langue : Français.
  - Sois très précis sur les scores probables.`;

  const prompt = `Analyse le match : ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.league}).
  Cotes : 1:${match.odds.home} | N:${match.odds.draw} | 2:${match.odds.away}.
  
  Format de réponse JSON attendu :
  {
    "winProbabilities": {"home": 45, "draw": 25, "away": 30},
    "expectedScore": "2-1",
    "geminiPerspective": "Analyse technique détaillée ici...",
    "chatGptPerspective": "Analyse stratégique globale ici...",
    "keyInsights": ["Point tactique 1", "Point tactique 2"],
    "riskLevel": "Bas | Moyen | Haut",
    "suggestedBet": "Le conseil de pari",
    "confidenceScore": 85
  }`;

  const tryGenerate = async (modelName: string): Promise<AIAnalysis | null> => {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
          responseMimeType: "application/json"
        },
      });

      const rawText = response.text || "{}";
      const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonString);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources: GroundingSource[] = groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "Source Web",
        uri: chunk.web?.uri || "#"
      })).filter((s: any) => s.uri !== "#") || [];

      // Map perspectives to standard interface fields for cross-component compatibility
      return { 
        ...result, 
        matchId: match.id,
        modelUsed: modelName,
        sources,
        technicalAnalysis: result.geminiPerspective || result.technicalAnalysis || "",
        strategicAnalysis: result.chatGptPerspective || result.strategicAnalysis || ""
      } as AIAnalysis;
    } catch (e) {
      console.warn(`Modèle ${modelName} a échoué, tentative de fallback...`, e);
      return null;
    }
  };

  // 1. Essayer avec Gemini 3 Pro
  let analysis = await tryGenerate('gemini-3-pro-preview');
  
  // 2. Si échec, fallback sur Gemini 3 Flash
  if (!analysis) {
    analysis = await tryGenerate('gemini-3-flash-preview');
  }

  // 3. Fallback ultime si tout échoue
  return analysis || {
    matchId: match.id,
    modelUsed: 'Fallback Error',
    winProbabilities: { home: 33, draw: 34, away: 33 },
    expectedScore: "N/A",
    geminiPerspective: "Erreur de connexion aux serveurs de haute performance.",
    chatGptPerspective: "Impossible de générer la comparaison pour le moment.",
    technicalAnalysis: "Erreur de connexion aux serveurs de haute performance.",
    strategicAnalysis: "Impossible de générer la comparaison pour le moment.",
    keyInsights: ["Problème de quota API ou maintenance."],
    riskLevel: "Indéterminé",
    suggestedBet: "Attendre le rétablissement du service",
    confidenceScore: 0,
    sources: []
  };
};
