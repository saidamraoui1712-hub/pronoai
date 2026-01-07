
export type SportType = 'football' | 'basketball';

export interface Team {
  name: string;
  logo: string;
  form: string[]; 
  rank?: number;
  avgGoalsScored?: number;
  avgGoalsConceded?: number;
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
  // Ajouté pour le filtrage par probabilité
  aiProbability?: number; 
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
  riskLevel: 'Safe' | 'Moderate' | 'Risky' | 'Extreme';
  suggestedBet: string;
  confidenceScore: number; 
  absentPlayers: string[];
  weatherImpact?: string;
}

export interface BetSlipItem {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
}

// Added UserNote interface to store personal analyst notes
export interface UserNote {
  matchId: string;
  note: string;
  updatedAt: string;
}
