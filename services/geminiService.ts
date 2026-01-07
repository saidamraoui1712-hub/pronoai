
import { GoogleGenAI, Type } from "@google/genai";
import { Match, AIAnalysis } from "../types";

export const getMatchAnalysis = async (match: Match): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Expert en football. Analyse de match de haute précision :
  Affiche : ${match.homeTeam.name} vs ${match.awayTeam.name}
  Ligue : ${match.league}
  Cotes : ${JSON.stringify(match.odds)}
  
  Instructions critiques :
  1. Catégorise le risque selon ces paliers : 
     - 90%+: Safe (Grosse confiance)
     - 70-89%: Moderate (Risque mesuré)
     - 50-69%: Risky (Mise 5dh max)
     - <50%: Extreme (Danger)
  2. Analyse l'impact météo et les blessures majeures.
  3. Propose une recommandation de type Over/Under ou Score Exact.
  4. Réponse en JSON uniquement.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winProbabilities: {
            type: Type.OBJECT,
            properties: {
              home: { type: Type.NUMBER },
              draw: { type: Type.NUMBER },
              away: { type: Type.NUMBER }
            },
            required: ["home", "draw", "away"]
          },
          expectedScore: { type: Type.STRING },
          keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskLevel: { type: Type.STRING },
          suggestedBet: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          absentPlayers: { type: Type.ARRAY, items: { type: Type.STRING } },
          weatherImpact: { type: Type.STRING }
        }
      }
    }
  });

  try {
    const text = response.text || "{}";
    const result = JSON.parse(text);
    return { ...result, matchId: match.id } as AIAnalysis;
  } catch (e) {
    return {
      matchId: match.id,
      winProbabilities: { home: 33, draw: 33, away: 34 },
      expectedScore: "1-1",
      keyInsights: ["Données temporairement indisponibles"],
      riskLevel: "Extreme",
      suggestedBet: "No Bet",
      confidenceScore: 0,
      absentPlayers: []
    };
  }
};
