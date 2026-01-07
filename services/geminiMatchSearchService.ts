
import { GoogleGenAI } from "@google/genai";
import { Match } from "../types";

export const searchRealMatchesViaAI = async (date: string): Promise<Match[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const prompt = `DÉTECTION DE MATCHS RÉELS - DATE: ${date}
  Utilise Google Search pour trouver TOUS les matchs de football professionnels qui se jouent à cette date.
  Priorités : 
  1. Championnats arabes (Botola Maroc, Saudi Pro League, Qatar, Égypte).
  2. Grandes ligues européennes (même si c'est la coupe ou des divisions inférieures).
  3. Ligues en cours (Brésil, Argentine, MLS, J-League).

  Tu DOIS retourner un tableau JSON valide. Si tu ne trouves aucun match majeur, cherche des matchs de divisions 2 ou 3. Ne renvoie JAMAIS un tableau vide si des matchs existent sur Terre ce jour-là.

  Structure JSON strictement requise :
  [{
    "id": "gen-unique-hash",
    "league": "Nom Complet de la Ligue",
    "homeTeam": {"name": "Nom Équipe A", "logo": "https://source.unsplash.com/100x100/?football,logo,teamA"},
    "awayTeam": {"name": "Nom Équipe B", "logo": "https://source.unsplash.com/100x100/?football,logo,teamB"},
    "date": "${date}T18:00:00Z",
    "odds": {"home": 2.10, "draw": 3.40, "away": 3.10},
    "status": "upcoming",
    "aiProbability": 78
  }]`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
        responseMimeType: "application/json"
      },
    });

    const rawText = response.text || "[]";
    // Nettoyage au cas où le modèle renverrait du markdown
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);
    
    if (!Array.isArray(data)) return [];

    return data.map((m: any, index: number) => ({
      ...m,
      id: m.id || `ai-${date}-${index}`,
      sport: 'football',
      h2h: m.h2h || 'VS',
      aiProbability: m.aiProbability || Math.floor(Math.random() * 30) + 60
    })) as Match[];
  } catch (error) {
    console.error("Échec critique de la recherche IA:", error);
    return [];
  }
};
