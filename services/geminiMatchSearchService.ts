
import { GoogleGenAI, Type } from "@google/genai";
import { Match } from "../types";

export const searchRealMatchesViaAI = async (date: string): Promise<Match[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Utilisation de Flash pour la rapidité de recherche
  const model = 'gemini-3-flash-preview';

  const prompt = `URGENT: Trouve les matchs de football RÉELS qui se jouent le ${date}. 
  Cherche partout : championnats européens, coupes nationales, Botola Pro (Maroc), Ligue des Champions, ou matchs internationaux.
  
  Si c'est une date sans grands matchs, cherche des divisions inférieures ou des ligues d'autres pays (Brésil, USA, Asie).
  
  Pour chaque match trouvé :
  1. Noms exacts des deux équipes
  2. Nom de la compétition
  3. Heure précise (UTC)
  4. URL d'un logo (cherche des URLs directes .png ou .jpg sur Wikipedia ou des sites de sport)
  
  Réponds UNIQUEMENT avec un tableau JSON (max 12 matchs) :
  [{
    "id": "ai_unique_id",
    "league": "nom_ligue",
    "homeTeam": {"name": "nom", "logo": "url_logo"},
    "awayTeam": {"name": "nom", "logo": "url_logo"},
    "date": "ISO_DATE_STRING",
    "odds": {"home": 2.1, "draw": 3.2, "away": 3.4},
    "status": "upcoming",
    "aiProbability": 75
  }]`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
        responseMimeType: "application/json"
      },
    });

    const rawText = response.text || "[]";
    const data = JSON.parse(rawText);
    
    return data.map((m: any) => ({
      ...m,
      sport: 'football',
      h2h: 'VS'
    })) as Match[];
  } catch (error) {
    console.error("Échec de la recherche IA globale:", error);
    return [];
  }
};
