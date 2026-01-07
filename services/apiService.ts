
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
    'TIMED': 'upcoming'
  };

  const status = statusMap[match.status] || 'upcoming';
  const score = match.score?.fullTime;
  
  return {
    id: `fd-${match.id}`,
    sport: 'football',
    league: match.competition?.name || "Ligue Pro",
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
      home: Number((1.5 + Math.random() * 2).toFixed(2)),
      draw: Number((3.0 + Math.random() * 1.5).toFixed(2)),
      away: Number((2.0 + Math.random() * 3).toFixed(2))
    },
    status: status,
    h2h: (score?.home !== null && score?.away !== null) ? `${score.home} - ${score.away}` : "VS",
    aiProbability: Math.floor(Math.random() * 30) + 65, 
  };
};

export const fetchMatchesByDate = async (date: string, onStatusUpdate?: (status: string) => void): Promise<{matches: Match[], source: 'API' | 'AI_SEARCH' | 'MOCK'}> => {
  try {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    if (onStatusUpdate) onStatusUpdate("Vérification des serveurs officiels...");

    const response = await fetch(`${BASE_URL}/matches?dateFrom=${formattedDate}&dateTo=${formattedDate}`, {
      method: 'GET',
      headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.matches && data.matches.length > 0) {
        if (onStatusUpdate) onStatusUpdate("Matchs officiels trouvés.");
        return { matches: data.matches.map(transformApiFixture), source: 'API' };
      }
    }
    
    // Si on arrive ici, soit l'API a échoué, soit elle est vide
    if (onStatusUpdate) onStatusUpdate("API vide. Lancement du scanner global Gemini...");
    const aiMatches = await searchRealMatchesViaAI(formattedDate);
    
    if (aiMatches.length > 0) {
      return { matches: aiMatches, source: 'AI_SEARCH' };
    }

    return { matches: [], source: 'MOCK' };
  } catch (error) {
    console.warn("API Error, fallback to AI...");
    if (onStatusUpdate) onStatusUpdate("Erreur serveur. Scan IA activé...");
    const aiMatches = await searchRealMatchesViaAI(date);
    return { matches: aiMatches, source: aiMatches.length > 0 ? 'AI_SEARCH' : 'MOCK' };
  }
};
