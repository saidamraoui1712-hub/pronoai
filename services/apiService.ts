
import { Match } from '../types';
import { MOCK_MATCHES } from '../constants';

const API_SPORTS_KEY = "XxXxXxXxXxXxXxXxXxXxXxXx"; 
const BASE_URL = "https://v3.football.api-sports.io";

const transformApiFixture = (apiFixture: any): Match => {
  const proba = Math.floor(Math.random() * 60) + 40; // Simulation de proba entre 40 et 100
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
    status: apiFixture.fixture.status.short === 'FT' ? 'finished' : (apiFixture.fixture.status.short === 'NS' ? 'upcoming' : 'live'),
    h2h: `${apiFixture.goals.home ?? 0} - ${apiFixture.goals.away ?? 0}`,
    aiProbability: proba
  };
};

export const fetchMatchesByDate = async (date: string): Promise<Match[]> => {
  if (API_SPORTS_KEY === "XxXxXxXxXxXxXxXxXxXxXxXx") {
    return MOCK_MATCHES.map(m => ({...m, aiProbability: Math.floor(Math.random() * 50) + 50}));
  }

  try {
    const response = await fetch(`${BASE_URL}/fixtures?date=${date}`, {
      method: 'GET',
      headers: { 'x-apisports-key': API_SPORTS_KEY }
    });
    const data = await response.json();
    return (data.response || []).map(transformApiFixture);
  } catch (error) {
    console.error("Fetch error", error);
    return MOCK_MATCHES;
  }
};

export const fetchLiveMatches = async (): Promise<Match[]> => {
  const today = new Date().toISOString().split('T')[0];
  return fetchMatchesByDate(today);
};

export const getLeagueTrends = async (lang: 'fr' | 'ar') => {
  return [
    { league: 'Premier League', trend: lang === 'fr' ? 'Forte tendance Over 2.5' : 'غالباً أكثر من 2.5 أهداف', status: 'Stable' },
    { league: 'La Liga', trend: lang === 'fr' ? 'Victoires serrées à domicile' : 'انتصارات ضيقة للأرض', status: 'Stable' },
  ];
};
