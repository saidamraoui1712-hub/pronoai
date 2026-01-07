
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
  liveStats?: LiveStats;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIAnalysis {
  matchId: string;
  modelUsed: string;
  winProbabilities: {
    home: number;
    draw: number;
    away: number;
  };
  expectedScore: string;
  geminiPerspective: string;
  chatGptPerspective: string;
  keyInsights: string[];
  riskLevel: string;
  suggestedBet: string;
  confidenceScore: number; 
  sources?: GroundingSource[];
}

export interface BetSlipItem {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
}
