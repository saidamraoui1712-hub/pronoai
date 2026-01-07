
import { GoogleGenAI, Type } from "@google/genai";
import { Match } from "../types";

export const searchRealMatchesViaAI = async (date: string): Promise<Match[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

  const prompt = `Trouve les 10 matchs de football les plus importants qui ont lieu le ${date}. 
  Inclus les ligues majeures (Ligue 1, Premier League, La Liga, Serie A, Bundesliga, Champions League ou Botola Pro).
  
  Pour chaque match, j'ai besoin de :
  1. Nom exact des deux équipes
  2. Nom de la ligue
  3. Heure du match
  4. Un lien URL vers le logo de l'équipe (utilise des URLs fiables comme celles de wikipedia ou de sites de sport connus).
  
  Réponds UNIQUEMENT avec un tableau JSON suivant ce format exact :
  [{
    "id": "string_unique",
    "league": "nom_ligue",
    "homeTeam": {"name": "nom", "logo": "url_logo"},
    "awayTeam": {"name": "nom", "logo": "url_logo"},
    "date": "ISO_DATE_STRING",
    "odds": {"home": 2.0, "draw": 3.0, "away": 3.5},
    "status": "upcoming",
    "aiProbability": number_entre_60_et_90
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
    const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);
    
    return data.map((m: any) => ({
      ...m,
      sport: 'football',
      h2h: 'VS'
    })) as Match[];
  } catch (error) {
    console.error("Gemini Match Search Failed:", error);
    return [];
  }
};
