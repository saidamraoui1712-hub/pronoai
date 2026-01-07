
export type SportType = 'football' | 'basketball';

export interface Team {
  name: string;
  logo: string;
  form: string[]; 
  rank?: number;
  avgGoalsScored?: number;
  avgGoalsConceded?: number;
}

export interface LiveStats {
  possession: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  dangerousAttacks: { home: number; away: number };
  corners: { home: number; away: number };
  minute: number;
}

export interface Match {
  id: string;
  sport: SportType;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  odds: {
    home: number;
    draw?: number;
    away: number;
  };
  status: 'upcoming' | 'live' | 'finished';
  h2h?: string;
  aiProbability?: number; 
  liveStats?: LiveStats; // Nouvelles stats pour le direct
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface LiveInsight {
  minute: number;
  message: string;
  prediction: 'Goal_Soon_Home' | 'Goal_Soon_Away' | 'Stability' | 'Under_Alert' | 'Over_Alert';
  intensity: number; // 0-100
}

export interface AIAnalysis {
  matchId: string;
  winProbabilities: {
    home: number;
    draw: number;
    away: number;
  };
  expectedScore: string;
  keyInsights: string[];
  riskLevel: string;
  suggestedBet: string;
  confidenceScore: number; 
  absentPlayers: string[];
  weatherImpact?: string;
  sources?: GroundingSource[];
  liveInsights?: LiveInsight[]; // Historique des prédictions live
}

export interface BetSlipItem {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
}

export interface UserNote {
  matchId: string;
  note: string;
  updatedAt: string;
}
