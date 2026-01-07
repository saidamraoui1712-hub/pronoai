
import { Match, LiveStats } from '../types';
import { MOCK_MATCHES } from '../constants';

const API_SPORTS_KEY = "93d2f39472309a60e2779d559be89a74"; 
const BASE_URL = "https://v3.football.api-sports.io";

const transformApiFixture = (apiFixture: any): Match => {
  const proba = Math.floor(Math.random() * 60) + 40;
  const status = apiFixture.fixture.status.short;
  
  // Simulation de stats live si le match est en cours
  let liveStats: LiveStats | undefined;
  if (status === '1H' || status === '2H' || status === 'HT' || status === 'LIVE') {
    liveStats = {
      possession: { home: 45 + Math.floor(Math.random() * 10), away: 45 + Math.floor(Math.random() * 10) },
      shotsOnTarget: { home: Math.floor(Math.random() * 5), away: Math.floor(Math.random() * 5) },
      dangerousAttacks: { home: 20 + Math.floor(Math.random() * 30), away: 20 + Math.floor(Math.random() * 30) },
      corners: { home: Math.floor(Math.random() * 6), away: Math.floor(Math.random() * 6) },
      minute: apiFixture.fixture.status.elapsed || 15
    };
  }

  return {
    id: `foot-${apiFixture.fixture.id}`,
    sport: 'football',
    league: `${apiFixture.league.name}`,
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
      home: 1.2 + Math.random() * 2,
      draw: 3.0 + Math.random(),
      away: 2.0 + Math.random() * 3
    },
    status: status === 'FT' ? 'finished' : (status === 'NS' ? 'upcoming' : 'live'),
    h2h: `${apiFixture.goals.home ?? 0} - ${apiFixture.goals.away ?? 0}`,
    aiProbability: proba,
    liveStats
  };
};

export const fetchMatchesByDate = async (date: string): Promise<Match[]> => {
  const key = API_SPORTS_KEY as string;
  if (key === "XxXxXxXxXxXxXxXxXxXxXxXx" || !key) {
    return MOCK_MATCHES.map(m => ({...m, aiProbability: Math.floor(Math.random() * 50) + 50}));
  }

  try {
    const response = await fetch(`${BASE_URL}/fixtures?date=${date}`, {
      method: 'GET',
      headers: { 'x-apisports-key': key }
    });
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    
    if (!data.response || data.response.length === 0) return MOCK_MATCHES;

    return (data.response || []).map(transformApiFixture);
  } catch (error) {
    console.error("Fetch error", error);
    return MOCK_MATCHES;
  }
};
