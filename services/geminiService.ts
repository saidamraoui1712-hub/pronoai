
import { GoogleGenAI } from "@google/genai";
import { Match, AIAnalysis, GroundingSource } from "../types";

export const getMatchAnalysis = async (match: Match): Promise<AIAnalysis> => {
  // Initialisation à chaque appel pour garantir l'utilisation de la clé la plus récente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isLive = match.status === 'live' && match.liveStats;
  
  // Utilisation de gemini-3-pro-preview pour les tâches complexes d'analyse
  const modelName = 'gemini-3-pro-preview';

  const systemInstruction = `Tu es un expert mondial en analyse de football et en data-journalisme sportif.
  Ta mission est de fournir une analyse prédictive ultra-précise basée sur les statistiques actuelles, l'historique H2H et le momentum du match.
  
  RÈGLES CRITIQUES :
  1. Réponds UNIQUEMENT avec un objet JSON valide.
  2. N'ajoute AUCUN texte avant ou après le JSON.
  3. Si le match est en LIVE, analyse spécifiquement les probabilités de "Prochain But" et "Over/Under" en fonction des tirs et de la possession.
  4. Langue de réponse : Français.`;

  const prompt = `Analyse le match suivant :
  LIGUE: ${match.league}
  EQUIPES: ${match.homeTeam.name} vs ${match.awayTeam.name}
  STATUS: ${match.status} ${isLive ? `(Minute: ${match.liveStats?.minute})` : ''}
  COTES: Home ${match.odds.home}, Draw ${match.odds.draw}, Away ${match.odds.away}
  ${isLive ? `STATS LIVE: Possession ${match.liveStats?.possession.home}%-${match.liveStats?.possession.away}%, Tirs ${match.liveStats?.shotsOnTarget.home}-${match.liveStats?.shotsOnTarget.away}` : `HISTORIQUE: ${match.h2h}`}

  Génère une réponse suivant EXACTEMENT ce schéma :
  {
    "winProbabilities": {"home": number, "draw": number, "away": number},
    "expectedScore": "string",
    "keyInsights": ["string", "string", "string"],
    "riskLevel": "Bas | Moyen | Haut",
    "suggestedBet": "string",
    "confidenceScore": number,
    "absentPlayers": ["string"],
    "liveInsights": [{"minute": number, "message": "string", "prediction": "Goal_Soon_Home | Goal_Soon_Away | Stability | Under_Alert | Over_Alert", "intensity": number}]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Faible température pour plus de consistance
        responseMimeType: "application/json"
      },
    });

    const rawText = response.text || "{}";
    
    // Nettoyage du texte pour extraire le JSON proprement (au cas où le modèle ajoute des balises ```json)
    const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonString);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Analyse Web",
      uri: chunk.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#") || [];

    return { 
      ...result, 
      matchId: match.id,
      sources 
    } as AIAnalysis;
  } catch (e) {
    console.error("AI Analysis Failed:", e);
    // Fallback structuré pour ne pas casser l'interface
    return {
      matchId: match.id,
      winProbabilities: { home: 33, draw: 34, away: 33 },
      expectedScore: "N/A",
      keyInsights: ["L'IA est actuellement surchargée ou en maintenance.", "Veuillez réessayer dans quelques instants."],
      riskLevel: "Indéterminé",
      suggestedBet: "Attendre confirmation",
      confidenceScore: 0,
      absentPlayers: [],
      sources: [],
      liveInsights: []
    };
  }
};
