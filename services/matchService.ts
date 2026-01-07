
import { GoogleGenAI, Type } from "@google/genai";
import { Match } from "../types";

export const fetchRealMatches = async (date: string): Promise<Match[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        league: { type: Type.STRING },
        homeTeam: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            logo: { type: Type.STRING }
          },
          required: ["name"]
        },
        awayTeam: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            logo: { type: Type.STRING }
          },
          required: ["name"]
        },
        date: { type: Type.STRING },
        odds: {
          type: Type.OBJECT,
          properties: {
            home: { type: Type.NUMBER },
            draw: { type: Type.NUMBER },
            away: { type: Type.NUMBER }
          },
          required: ["home", "away"]
        },
        aiProbability: { type: Type.NUMBER },
        predictedScore: { type: Type.STRING }
      },
      required: ["league", "homeTeam", "awayTeam", "date", "odds", "aiProbability"]
    }
  };

  const prompt = `Trouve les matchs de football RÉELS prévus le ${date}. 
  Cherche dans : Botola Pro (Maroc), Ligue 1, Premier League, Champions League, Saudi Pro League.
  Si aucun match n'est trouvé pour cette date précise, trouve les matchs les plus proches à venir.
  Génère des cotes réalistes basées sur la forme actuelle.
  Inclus des URLs de logos d'équipes valides (Wikipedia ou sites officiels).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2
      }
    });

    const matches = JSON.parse(response.text || "[]");
    return matches.map((m: any, i: number) => ({
      ...m,
      id: m.id || `match-${date}-${i}`,
      sport: 'football',
      status: 'upcoming',
      homeTeam: {
        ...m.homeTeam,
        logo: m.homeTeam.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.homeTeam.name}`
      },
      awayTeam: {
        ...m.awayTeam,
        logo: m.awayTeam.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.awayTeam.name}`
      }
    }));
  } catch (error) {
    console.error("Match Fetch Error:", error);
    return [];
  }
};
