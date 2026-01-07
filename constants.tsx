
import { Match } from './types';

export const MOCK_MATCHES: Match[] = [
  {
    id: 'live-clasico',
    sport: 'football',
    league: 'La Liga - Espagne',
    homeTeam: {
      name: 'Real Madrid',
      logo: 'https://p7.hiclipart.com/preview/443/537/796/real-madrid-cf-uefa-champions-league-santiago-bernabeu-stadium-la-liga-football-real-madrid.jpg',
      form: ['W', 'W', 'W', 'D', 'W'],
      avgGoalsScored: 2.8,
      avgGoalsConceded: 0.9
    },
    awayTeam: {
      name: 'FC Barcelona',
      logo: 'https://p7.hiclipart.com/preview/417/30/805/fc-barcelona-la-liga-football-sport-logo-barcelona.jpg',
      form: ['W', 'W', 'L', 'W', 'W'],
      avgGoalsScored: 2.5,
      avgGoalsConceded: 1.1
    },
    date: new Date().toISOString(),
    odds: { home: 2.10, draw: 3.50, away: 3.20 },
    status: 'live',
    h2h: 'Real 1-1 Barca (HT)',
    aiProbability: 75,
    liveStats: {
      minute: 25,
      possession: { home: 55, away: 45 },
      shotsOnTarget: { home: 4, away: 2 },
      dangerousAttacks: { home: 42, away: 31 },
      corners: { home: 3, away: 1 }
    }
  },
  {
    id: 'botola-1',
    sport: 'football',
    league: 'Botola Pro Inwi - Maroc',
    homeTeam: {
      name: 'Raja Casablanca',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Raja_Casablanca_logo.svg/1200px-Raja_Casablanca_logo.svg.png',
      form: ['W', 'W', 'W', 'D', 'W'],
      avgGoalsScored: 1.9,
      avgGoalsConceded: 0.5
    },
    awayTeam: {
      name: 'Wydad Casablanca',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Wydad_Athletic_Club_logo.svg/1200px-Wydad_Athletic_Club_logo.svg.png',
      form: ['W', 'D', 'L', 'W', 'W'],
      avgGoalsScored: 1.7,
      avgGoalsConceded: 0.8
    },
    date: new Date().toISOString(),
    odds: { home: 2.30, draw: 2.90, away: 3.10 },
    status: 'upcoming',
    h2h: 'RCA 0-0 WAC (Jan 2024)',
    aiProbability: 82
  },
  {
    id: 'pl-1',
    sport: 'football',
    league: 'Premier League - England',
    homeTeam: {
      name: 'Man City',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
      form: ['W', 'W', 'W', 'W', 'W'],
      avgGoalsScored: 3.1,
      avgGoalsConceded: 1.0
    },
    awayTeam: {
      name: 'Liverpool',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png',
      form: ['W', 'W', 'D', 'W', 'W'],
      avgGoalsScored: 2.4,
      avgGoalsConceded: 1.1
    },
    date: '2024-05-21T19:00:00Z',
    odds: { home: 1.85, draw: 3.75, away: 4.20 },
    status: 'upcoming',
    h2h: 'LIV 1-1 MCI (Mars 2024)',
    aiProbability: 88
  }
];
