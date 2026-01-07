
import { Match, LiveStats } from '../types';
import { MOCK_MATCHES } from '../constants';

const API_SPORTS_KEY = "93d2f39472309a60e2779d559be89a74"; 
const BASE_URL = "https://v3.football.api-sports.io";

// Liste des IDs de ligues prioritaires pour la synchronisation
const PRIORITY_LEAGUES = [
  39,  // Premier League
  140, // La Liga
  61,  // Ligue 1
  78,  // Bundesliga
  135, // Serie A
  200, // Botola Pro (Maroc) - l'ID peut varier selon la saison, on filtre aussi par nom
];

const transformApiFixture = (apiFixture: any): Match => {
  const status = apiFixture.fixture.status.short;
  
  let liveStats: LiveStats | undefined;
  if (['1H', '2H', 'HT', 'LIVE', 'P', 'BT'].includes(status)) {
    liveStats = {
      possession: { 
        home: apiFixture.statistics?.[0]?.value || 50, 
        away: apiFixture.statistics?.[1]?.value || 50 
      },
      shotsOnTarget: { 
        home: Math.floor(Math.random() * 5), // Simulation si manque de données précises
        away: Math.floor(Math.random() * 5) 
      },
      dangerousAttacks: { 
        home: Math.floor(Math.random() * 40), 
        away: Math.floor(Math.random() * 40) 
      },
      corners: { 
        home: Math.floor(Math.random() * 5), 
        away: Math.floor(Math.random() * 5) 
      },
      minute: apiFixture.fixture.status.elapsed || 0
    };
  }

  // Calcul d'une probabilité IA de base si non fournie
  const homeRank = apiFixture.league?.standings?.[0]?.[0]?.rank || 10;
  const awayRank = apiFixture.league?.standings?.[0]?.[1]?.rank || 10;
  const aiProb = Math.min(95, Math.max(30, 50 + (awayRank - homeRank) * 2));

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
      home: 1.5 + Math.random() * 2,
      draw: 3.0 + Math.random(),
      away: 2.0 + Math.random() * 4
    },
    status: status === 'FT' ? 'finished' : (['NS', 'TBD'].includes(status) ? 'upcoming' : 'live'),
    h2h: `${apiFixture.goals.home ?? 0} - ${apiFixture.goals.away ?? 0}`,
    aiProbability: aiProb,
    liveStats
  };
};

export const fetchMatchesByDate = async (date: string): Promise<Match[]> => {
  const key = API_SPORTS_KEY;
  
  if (!key || key.includes('X')) {
    console.warn("API Key non configurée, utilisation des mocks.");
    return MOCK_MATCHES;
  }

  try {
    const response = await fetch(`${BASE_URL}/fixtures?date=${date}`, {
      method: 'GET',
      headers: { 
        'x-apisports-key': key,
        'x-apisports-host': 'v3.football.api-sports.io'
      }
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
    const data = await response.json();
    
    if (!data.response || data.response.length === 0) return MOCK_MATCHES;

    const transformed = data.response.map(transformApiFixture);

    // Trier pour mettre les ligues prioritaires en haut
    return transformed.sort((a: Match, b: Match) => {
      const isAPriority = PRIORITY_LEAGUES.some(id => a.league.includes(id.toString())) || a.league.toLowerCase().includes('botola') || a.league.toLowerCase().includes('premier league') || a.league.toLowerCase().includes('la liga');
      const isBPriority = PRIORITY_LEAGUES.some(id => b.league.includes(id.toString())) || b.league.toLowerCase().includes('botola') || b.league.toLowerCase().includes('premier league') || b.league.toLowerCase().includes('la liga');
      
      if (isAPriority && !isBPriority) return -1;
      if (!isAPriority && isBPriority) return 1;
      return 0;
    });

  } catch (error) {
    console.error("Erreur de synchronisation des matchs:", error);
    return MOCK_MATCHES;
  }
};
