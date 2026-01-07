
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
    id: 'f1',
    sport: 'football',
    league: 'Ligue 1 - France',
    homeTeam: {
      name: 'Paris SG',
      logo: 'https://picsum.photos/seed/psg/64/64',
      form: ['W', 'W', 'D', 'W', 'L'],
      avgGoalsScored: 2.4,
      avgGoalsConceded: 0.8
    },
    awayTeam: {
      name: 'Marseille',
      logo: 'https://picsum.photos/seed/om/64/64',
      form: ['W', 'L', 'W', 'W', 'D'],
      avgGoalsScored: 1.6,
      avgGoalsConceded: 1.1
    },
    date: '2024-05-20T21:00:00Z',
    odds: { home: 1.45, draw: 4.80, away: 6.50 },
    status: 'upcoming',
    h2h: 'PSG 3-1 OM (Mars 2024)'
  }
];
