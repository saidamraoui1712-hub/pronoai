
import { GoogleGenAI } from "@google/genai";
import { Match, AIAnalysis, GroundingSource } from "../types";

export const getMatchAnalysis = async (match: Match): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isLive = match.status === 'live' && match.liveStats;
  
  const systemInstruction = `Tu es un expert mondial en analyse de football. 
  Réponds UNIQUEMENT en JSON pur, sans texte avant ou après. 
  Si le match est en LIVE (Minute ${isLive ? match.liveStats?.minute : 'N/A'}), analyse le momentum actuel (possession, tirs) pour prédire si un but va arriver ou si le match sera Under 2.5.`;

  const prompt = isLive 
    ? `ANALYSE LIVE: ${match.homeTeam.name} vs ${match.awayTeam.name}. 
       Stats: Possession ${match.liveStats!.possession.home}%-${match.liveStats!.possession.away}%, 
       Tirs cadrés ${match.liveStats!.shotsOnTarget.home}-${match.liveStats!.shotsOnTarget.away}.
       Est-ce que Barca/Real va marquer bientôt ?`
    : `ANALYSE PRE-MATCH: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.league}).
       Forme: ${match.homeTeam.form.join(',')} vs ${match.awayTeam.form.join(',')}.`;

  const format = `
  {
    "winProbabilities": {"home": 45, "draw": 25, "away": 30},
    "expectedScore": "2-1",
    "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
    "riskLevel": "Bas / Moyen / Haut",
    "suggestedBet": "Victoire Equipe A ou Under 2.5",
    "confidenceScore": 85,
    "absentPlayers": ["Nom Joueur 1"],
    "liveInsights": [{"minute": 25, "message": "Forte pression offensive", "prediction": "Goal_Soon_Home", "intensity": 80}]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `${prompt}\nStructure JSON:\n${format}` }] }],
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const rawText = response.text || "{}";
    
    // Extraction robuste du bloc JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    
    const result = JSON.parse(jsonMatch[0]);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Source Directe",
      uri: chunk.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#") || [];

    return { 
      ...result, 
      matchId: match.id,
      sources 
    } as AIAnalysis;
  } catch (e) {
    console.error("AI Analysis Error:", e);
    // Fallback data if API fails or parsing fails
    return {
      matchId: match.id,
      winProbabilities: { home: 33, draw: 34, away: 33 },
      expectedScore: "1-1",
      keyInsights: ["Données temporairement indisponibles", "Vérifiez votre connexion"],
      riskLevel: "Inconnu",
      suggestedBet: "Attendre le direct",
      confidenceScore: 0,
      absentPlayers: [],
      sources: [],
      liveInsights: []
    };
  }
};
