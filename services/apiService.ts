
import { Match, LiveStats } from '../types';
import { searchRealMatchesViaAI } from './geminiMatchSearchService';

const API_SPORTS_KEY = process.env.FOOTBALL_API_KEY || "93d2f39472309a60e2779d559be89a74"; 
const BASE_URL = "https://v3.football.api-sports.io";

const transformApiFixture = (apiFixture: any): Match => {
  const status = apiFixture.fixture.status.short;
  const goals = apiFixture.goals;
  
  let liveStats: LiveStats | undefined;
  if (['1H', '2H', 'HT', 'LIVE', 'P', 'BT'].includes(status)) {
    liveStats = {
      possession: { 
        home: apiFixture.statistics?.[0]?.value || 50, 
        away: apiFixture.statistics?.[1]?.value || 50 
      },
      shotsOnTarget: { home: 0, away: 0 },
      dangerousAttacks: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      minute: apiFixture.fixture.status.elapsed || 0
    };
  }

  const scoreText = (goals.home !== null && goals.away !== null) 
    ? `${goals.home} - ${goals.away}` 
    : "VS";

  return {
    id: `foot-${apiFixture.fixture.id}`,
    sport: 'football',
    league: apiFixture.league.name,
    homeTeam: {
      name: apiFixture.teams.home.name,
      logo: apiFixture.teams.home.logo,
      form: [],
    },
    awayTeam: {
      name: apiFixture.teams.away.name,
      logo: apiFixture.teams.away.logo,
      form: [],
    },
    date: apiFixture.fixture.date,
    odds: {
      home: Number((1.8 + Math.random() * 2).toFixed(2)),
      draw: Number((3.0 + Math.random() * 1.5).toFixed(2)),
      away: Number((2.5 + Math.random() * 3).toFixed(2))
    },
    status: status === 'FT' ? 'finished' : (['NS', 'TBD'].includes(status) ? 'upcoming' : 'live'),
    h2h: scoreText,
    aiProbability: Math.floor(Math.random() * (92 - 62 + 1)) + 62, 
    liveStats
  };
};

export const fetchMatchesByDate = async (date: string, onStatusUpdate?: (status: string) => void): Promise<{matches: Match[], source: 'API' | 'AI_SEARCH' | 'MOCK'}> => {
  try {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    if (onStatusUpdate) onStatusUpdate("Étape 1: Appel API Football...");
    
    const response = await fetch(`${BASE_URL}/fixtures?date=${formattedDate}`, {
      method: 'GET',
      headers: { 
        'x-apisports-key': API_SPORTS_KEY,
        'x-apisports-host': 'v3.football.api-sports.io'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Vérification des erreurs retournées par l'API dans le corps du JSON
    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorMsg = JSON.stringify(data.errors);
      console.warn("API Football Error:", errorMsg);
      if (onStatusUpdate) onStatusUpdate("Quota API atteint ou clé invalide...");
      throw new Error("API_LIMIT_OR_ERROR");
    }
    
    // Si l'API renvoie des matchs
    if (data.response && data.response.length > 0) {
      console.log(`API Succès: ${data.response.length} matchs trouvés.`);
      if (onStatusUpdate) onStatusUpdate("Données API récupérées avec succès.");
      const transformed = data.response.map(transformApiFixture);
      const sorted = transformed.sort((a: Match, b: Match) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return 0;
      });
      return { matches: sorted, source: 'API' };
    }

    // Si l'API est vide pour cette date
    console.warn("Aucun match trouvé par l'API pour cette date.");
    if (onStatusUpdate) onStatusUpdate("API vide. Recherche via Intelligence Artificielle...");
    
    const aiMatches = await searchRealMatchesViaAI(date);
    if (aiMatches.length > 0) {
      return { matches: aiMatches, source: 'AI_SEARCH' };
    }
    
    return { matches: [], source: 'MOCK' };
  } catch (error) {
    console.error("Échec de la connexion API, passage au mode IA:", error);
    if (onStatusUpdate) onStatusUpdate("Mode secours : Recherche Gemini en cours...");
    const aiMatches = await searchRealMatchesViaAI(date);
    return { matches: aiMatches, source: aiMatches.length > 0 ? 'AI_SEARCH' : 'MOCK' };
  }
};
