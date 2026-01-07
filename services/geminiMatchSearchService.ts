
import { GoogleGenAI } from "@google/genai";
import { Match } from "../types";

export const searchRealMatchesViaAI = async (date: string): Promise<Match[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  // Prompt ultra-direct pour forcer l'extraction de données réelles
  const prompt = `LOGICIEL DE PRONOSTICS - MISSION : EXTRACTION DE DONNÉES TEMPS RÉEL
  DATE CIBLE : ${date}
  
  ACTION : Utilise Google Search pour trouver tous les matchs de football RÉELS de cette journée.
  INVENTAIRE : 
  - Championnats du monde entier (Maroc Botola, Arabie Saoudite, Europe, Amériques).
  - Matches amicaux internationaux.
  - Coupes.

  RÈGLES DE SORTIE :
  1. Retourne UNIQUEMENT un tableau JSON.
  2. Si aucun match majeur n'existe, cherche des matchs de ligues secondaires (D2, D3).
  3. Ne renvoie jamais un tableau vide. S'il n'y a vraiment rien le ${date}, cherche les matchs du lendemain et ajuste la date.

  STRUCTURE JSON :
  [{
    "id": "match_id_unique",
    "league": "Nom de la compétition",
    "homeTeam": {"name": "Équipe domicile", "logo": "https://img.logo.com/football/1.png"},
    "awayTeam": {"name": "Équipe extérieur", "logo": "https://img.logo.com/football/2.png"},
    "date": "${date}T20:00:00Z",
    "odds": {"home": 1.95, "draw": 3.40, "away": 3.80},
    "status": "upcoming",
    "aiProbability": 82
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
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);
    
    if (!Array.isArray(data)) return [];

    return data.map((m: any, idx: number) => ({
      ...m,
      id: m.id || `gen-${date}-${idx}`,
      sport: 'football',
      h2h: 'VS',
      // Logos de secours si l'IA ne fournit pas d'URL valide
      homeTeam: {
        ...m.homeTeam,
        logo: m.homeTeam.logo?.startsWith('http') ? m.homeTeam.logo : `https://api.dicebear.com/7.x/identicon/svg?seed=${m.homeTeam.name}`
      },
      awayTeam: {
        ...m.awayTeam,
        logo: m.awayTeam.logo?.startsWith('http') ? m.awayTeam.logo : `https://api.dicebear.com/7.x/identicon/svg?seed=${m.awayTeam.name}`
      }
    })) as Match[];
  } catch (error) {
    console.error("Erreur de recherche IA:", error);
    return [];
  }
};
