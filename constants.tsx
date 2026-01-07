
import { Match } from './types';

export const MOCK_MATCHES: Match[] = [
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
  },
  {
    id: 'b1',
    sport: 'basketball',
    league: 'NBA - USA',
    homeTeam: {
      name: 'Boston Celtics',
      logo: 'https://picsum.photos/seed/celtics/64/64',
      form: ['W', 'W', 'W', 'L', 'W'],
      avgGoalsScored: 120.5,
      avgGoalsConceded: 109.2
    },
    awayTeam: {
      name: 'Dallas Mavericks',
      logo: 'https://picsum.photos/seed/mavs/64/64',
      form: ['L', 'W', 'W', 'W', 'W'],
      avgGoalsScored: 118.2,
      avgGoalsConceded: 114.5
    },
    date: '2024-05-21T02:00:00Z',
    odds: { home: 1.35, away: 3.20 },
    status: 'upcoming',
    h2h: 'Celtics 110-105 Mavs (Jan 2024)'
  },
  {
    id: 'f2',
    sport: 'football',
    league: 'Premier League - Angleterre',
    homeTeam: {
      name: 'Man City',
      logo: 'https://picsum.photos/seed/mcity/64/64',
      form: ['W', 'W', 'W', 'W', 'W'],
      avgGoalsScored: 2.8,
      avgGoalsConceded: 0.7
    },
    awayTeam: {
      name: 'Arsenal',
      logo: 'https://picsum.photos/seed/arsenal/64/64',
      form: ['W', 'W', 'D', 'W', 'W'],
      avgGoalsScored: 2.5,
      avgGoalsConceded: 0.6
    },
    date: '2024-05-21T18:00:00Z',
    odds: { home: 1.85, draw: 3.75, away: 4.10 },
    status: 'upcoming'
  },
  {
    id: 'b2',
    sport: 'basketball',
    league: 'EuroLeague',
    homeTeam: {
      name: 'Real Madrid BK',
      logo: 'https://picsum.photos/seed/realbk/64/64',
      form: ['W', 'W', 'W', 'W', 'L']
    },
    awayTeam: {
      name: 'Panathinaikos',
      logo: 'https://picsum.photos/seed/pana/64/64',
      form: ['W', 'L', 'W', 'W', 'W']
    },
    date: '2024-05-21T20:00:00Z',
    odds: { home: 1.55, away: 2.45 },
    status: 'upcoming'
  }
];
