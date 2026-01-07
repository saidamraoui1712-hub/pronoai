
import { Match, LiveStats } from '../types';
import { searchRealMatchesViaAI } from './geminiMatchSearchService';

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_API_KEY || "e6ab5f98ee6742bbba9bd7425af2d10d"; 
const BASE_URL = "https://api.football-data.org/v4";

const transformApiFixture = (match: any): Match => {
  const statusMap: Record<string, 'upcoming' | 'live' | 'finished'> = {
    'FINISHED': 'finished',
    'LIVE': 'live',
    'IN_PLAY': 'live',
    'PAUSED': 'live',
    'SCHEDULED': 'upcoming',
    'POSTPONED': 'upcoming',
    'SUSPENDED': 'upcoming',
    'CANCELLED': 'upcoming',
    'TIMED': 'upcoming'
  };

  const status = statusMap[match.status] || 'upcoming';
  const score = match.score?.fullTime;
  
  let liveStats: LiveStats | undefined;
  if (status === 'live') {
    liveStats = {
      possession: { home: 50, away: 50 },
      shotsOnTarget: { home: 0, away: 0 },
      dangerousAttacks: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      minute: 0 
    };
  }

  const scoreText = (score?.home !== null && score?.away !== null) 
    ? `${score.home} - ${score.away}` 
    : "VS";

  return {
    id: `foot-${match.id}`,
    sport: 'football',
    league: match.competition?.name || "Ligue",
    homeTeam: {
      name: match.homeTeam.shortName || match.homeTeam.name,
      logo: match.homeTeam.crest || "",
      form: [],
    },
    awayTeam: {
      name: match.awayTeam.shortName || match.awayTeam.name,
      logo: match.awayTeam.crest || "",
      form: [],
    },
    date: match.utcDate,
    odds: {
      home: Number((1.6 + Math.random() * 2).toFixed(2)),
      draw: Number((3.1 + Math.random() * 1.5).toFixed(2)),
      away: Number((2.4 + Math.random() * 3).toFixed(2))
    },
    status: status,
    h2h: scoreText,
    aiProbability: Math.floor(Math.random() * (94 - 65 + 1)) + 65, 
    liveStats
  };
};

export const fetchMatchesByDate = async (date: string, onStatusUpdate?: (status: string) => void): Promise<{matches: Match[], source: 'API' | 'AI_SEARCH' | 'MOCK'}> => {
  try {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    if (onStatusUpdate) onStatusUpdate("Vérification des serveurs officiels...");
    
    const response = await fetch(`${BASE_URL}/matches?dateFrom=${formattedDate}&dateTo=${formattedDate}`, {
      method: 'GET',
      headers: { 
        'X-Auth-Token': FOOTBALL_DATA_API_KEY
      }
    });
    
    if (!response.ok) {
      console.warn(`API Official Error: ${response.status}`);
      throw new Error("OFFICIAL_API_UNAVAILABLE");
    }

    const data = await response.json();
    
    if (data.matches && data.matches.length > 0) {
      if (onStatusUpdate) onStatusUpdate("Données officielles détectées...");
      const transformed = data.matches.map(transformApiFixture);
      return { matches: transformed, source: 'API' };
    }

    // Si 0 match, on passe direct à l'IA avec un message clair
    if (onStatusUpdate) onStatusUpdate("Lancement de la recherche globale IA...");
    const aiMatches = await searchRealMatchesViaAI(date);
    
    if (aiMatches.length > 0) {
      return { matches: aiMatches, source: 'AI_SEARCH' };
    }
    
    return { matches: [], source: 'MOCK' };

  } catch (error: any) {
    console.error("Erreur API, basculement IA:", error);
    if (onStatusUpdate) onStatusUpdate("Connexion IA de secours...");
    const aiMatches = await searchRealMatchesViaAI(date);
    return { matches: aiMatches, source: aiMatches.length > 0 ? 'AI_SEARCH' : 'MOCK' };
  }
};
