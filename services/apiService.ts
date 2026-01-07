
import { Match, LiveStats } from '../types';
import { MOCK_MATCHES } from '../constants';

// NOTE: Cette clé est publique/démo. Pour un usage intensif, il faut utiliser sa propre clé sur api-football.com
const API_SPORTS_KEY = "93d2f39472309a60e2779d559be89a74"; 
const BASE_URL = "https://v3.football.api-sports.io";

const PRIORITY_LEAGUE_IDS = [
  39,  // Premier League
  140, // La Liga
  61,  // Ligue 1
  78,  // Bundesliga
  135, // Serie A
  200, // Botola Pro (Maroc)
  94,  // Primeira Liga
];

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

  // Score format
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
      home: 1.8 + Math.random(),
      draw: 3.0 + Math.random(),
      away: 2.5 + Math.random()
    },
    status: status === 'FT' ? 'finished' : (['NS', 'TBD'].includes(status) ? 'upcoming' : 'live'),
    h2h: scoreText,
    aiProbability: Math.floor(Math.random() * (92 - 60 + 1)) + 60, // Simulation de proba IA basée sur les tendances
    liveStats
  };
};

export const fetchMatchesByDate = async (date: string): Promise<{matches: Match[], isReal: boolean}> => {
  try {
    // On force la vérification de la date au format YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const response = await fetch(`${BASE_URL}/fixtures?date=${formattedDate}`, {
      method: 'GET',
      headers: { 
        'x-apisports-key': API_SPORTS_KEY,
        'x-apisports-host': 'v3.football.api-sports.io'
      }
    });
    
    const data = await response.json();
    
    // Si l'API renvoie une erreur de clé ou pas de réponse
    if (!data.response || data.response.length === 0 || (data.errors && Object.keys(data.errors).length > 0)) {
      console.warn("Flux réel indisponible ou limite atteinte. Passage en mode simulation.");
      return { matches: MOCK_MATCHES, isReal: false };
    }

    const transformed = data.response.map(transformApiFixture);

    // Tri intelligent : Matchs en direct d'abord, puis ligues prioritaires (Botola, etc)
    const sorted = transformed.sort((a: Match, b: Match) => {
      // 1. Live d'abord
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      
      // 2. Ligues prioritaires (Botola/Top Europe)
      const isAPrio = a.league.toLowerCase().includes('botola') || a.league.toLowerCase().includes('premier league') || a.league.toLowerCase().includes('la liga');
      const isBPrio = b.league.toLowerCase().includes('botola') || b.league.toLowerCase().includes('premier league') || b.league.toLowerCase().includes('la liga');
      
      if (isAPrio && !isBPrio) return -1;
      if (!isAPrio && isBPrio) return 1;
      
      return 0;
    });

    return { matches: sorted, isReal: true };
  } catch (error) {
    console.error("Erreur critique synchronisation:", error);
    return { matches: MOCK_MATCHES, isReal: false };
  }
};
