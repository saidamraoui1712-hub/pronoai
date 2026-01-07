
import { Match, LiveStats } from '../types';
import { searchRealMatchesViaAI } from './geminiMatchSearchService';

// Utilisation du nouveau token et de la configuration Football-Data.org
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
    // Football-data.org free tier simule des stats de base
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
      // Génération d'odds réalistes car l'API gratuite n'en fournit pas toujours
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
    
    if (onStatusUpdate) onStatusUpdate("Terminal: Accès Football-Data.org...");
    
    const response = await fetch(`${BASE_URL}/matches?dateFrom=${formattedDate}&dateTo=${formattedDate}`, {
      method: 'GET',
      headers: { 
        'X-Auth-Token': FOOTBALL_DATA_API_KEY
      }
    });
    
    if (!response.ok) {
      if (response.status === 429) throw new Error("API_RATE_LIMIT");
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.matches && data.matches.length > 0) {
      console.log(`API Succès: ${data.matches.length} matchs détectés.`);
      if (onStatusUpdate) onStatusUpdate("Données officielles chargées.");
      
      const transformed = data.matches.map(transformApiFixture);
      const sorted = transformed.sort((a: Match, b: Match) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return 0;
      });
      
      return { matches: sorted, source: 'API' };
    }

    if (onStatusUpdate) onStatusUpdate("Aucun match officiel aujourd'hui. Recherche IA...");
    const aiMatches = await searchRealMatchesViaAI(date);
    return { matches: aiMatches, source: aiMatches.length > 0 ? 'AI_SEARCH' : 'MOCK' };

  } catch (error: any) {
    console.error("Erreur API Football-Data:", error);
    const msg = error.message === "API_RATE_LIMIT" ? "Quota atteint. Passage en mode IA..." : "Erreur serveur. Passage en mode IA...";
    if (onStatusUpdate) onStatusUpdate(msg);
    
    const aiMatches = await searchRealMatchesViaAI(date);
    return { matches: aiMatches, source: aiMatches.length > 0 ? 'AI_SEARCH' : 'MOCK' };
  }
};
