
import { GoogleGenAI, Type } from "@google/genai";
import { Match, AIAnalysis, GroundingSource, LiveInsight } from "../types";

export const getMatchAnalysis = async (match: Match): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";

  if (match.status === 'live' && match.liveStats) {
    // Prompt spécifique pour le LIVE
    prompt = `ANALYSE TACTIQUE EN DIRECT (Minute ${match.liveStats.minute}).
    Affiche : ${match.homeTeam.name} vs ${match.awayTeam.name}.
    Stats actuelles : Possession ${match.liveStats.possession.home}%-${match.liveStats.possession.away}%, 
    Tirs Cadrés : ${match.liveStats.shotsOnTarget.home}-${match.liveStats.shotsOnTarget.away},
    Attaques Dangereuses : ${match.liveStats.dangerousAttacks.home}-${match.liveStats.dangerousAttacks.away}.

    Agis comme un scout pro. Analyse si un but est imminent ou si le match va se fermer (Under 2.5).
    Réponds en JSON avec : winProbabilities, expectedScore, keyInsights, riskLevel, suggestedBet, confidenceScore, absentPlayers, et un nouveau champ "liveInsights" (liste d'objets avec minute, message, prediction, intensity).`;
  } else {
    // Prompt standard Avant-match
    prompt = `Analyse en temps réel pour le match : ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.league}).
    Cotes actuelles : ${JSON.stringify(match.odds)}.
    Vérifie les blessures de dernière minute, la météo et la forme.
    Réponds en JSON avec : winProbabilities, expectedScore, keyInsights (3 points), riskLevel, suggestedBet, confidenceScore, absentPlayers.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#") || [];

    return { 
      ...result, 
      matchId: match.id,
      sources 
    } as AIAnalysis;
  } catch (e) {
    console.error("Gemini Analysis Error:", e);
    return {
      matchId: match.id,
      winProbabilities: { home: 33, draw: 34, away: 33 },
      expectedScore: "1-1",
      keyInsights: ["Erreur de flux de données"],
      riskLevel: "Inconnu",
      suggestedBet: "Attendre",
      confidenceScore: 0,
      absentPlayers: [],
      sources: []
    };
  }
};
