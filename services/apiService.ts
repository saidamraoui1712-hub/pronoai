
import { Match, LiveStats } from '../types';
import { MOCK_MATCHES } from '../constants';

// On utilise désormais la variable d'environnement définie dans vite.config.ts
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
      home: 1.8 + (Math.random() * 2),
      draw: 3.0 + (Math.random() * 1.5),
      away: 2.5 + (Math.random() * 3)
    },
    status: status === 'FT' ? 'finished' : (['NS', 'TBD'].includes(status) ? 'upcoming' : 'live'),
    h2h: scoreText,
    aiProbability: Math.floor(Math.random() * (92 - 62 + 1)) + 62, 
    liveStats
  };
};

export const fetchMatchesByDate = async (date: string): Promise<{matches: Match[], isReal: boolean}> => {
  try {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/fixtures?date=${formattedDate}`, {
      method: 'GET',
      headers: { 
        'x-apisports-key': API_SPORTS_KEY,
        'x-apisports-host': 'v3.football.api-sports.io'
      }
    });
    
    const data = await response.json();
    
    if (!data.response || data.response.length === 0 || (data.errors && Object.keys(data.errors).length > 0)) {
      console.warn("API Football: Quota atteint ou erreur. Utilisation des mocks.");
      return { matches: MOCK_MATCHES, isReal: false };
    }

    const transformed = data.response.map(transformApiFixture);

    // Sort: Live first, then Botola and Top Europe
    const sorted = transformed.sort((a: Match, b: Match) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      
      const aPrio = a.league.match(/Botola|Premier League|La Liga|Ligue 1|Serie A|Bundesliga/i);
      const bPrio = b.league.match(/Botola|Premier League|La Liga|Ligue 1|Serie A|Bundesliga/i);
      
      if (aPrio && !bPrio) return -1;
      if (!aPrio && bPrio) return 1;
      
      return 0;
    });

    return { matches: sorted, isReal: true };
  } catch (error) {
    console.error("Erreur API Football:", error);
    return { matches: MOCK_MATCHES, isReal: false };
  }
};
