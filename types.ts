
export type SportType = 'football' | 'basketball';

export interface Team {
  name: string;
  logo: string;
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
  aiProbability: number;
  predictedScore?: string;
}

// Added GroundingSource interface
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIAnalysis {
  matchId: string;
  winProbabilities: { home: number; draw: number; away: number };
  expectedScore: string;
  technicalAnalysis: string;
  strategicAnalysis: string;
  // Added optional perspectives for geminiService compatibility
  geminiPerspective?: string;
  chatGptPerspective?: string;
  keyInsights: string[];
  suggestedBet: string;
  confidenceScore: number;
  sources: GroundingSource[];
  // Added modelUsed and riskLevel
  modelUsed: string;
  riskLevel?: string;
}

export interface BetSlipItem {
  matchId: string;
  matchName: string;
  prediction: string;
  odds: number;
}
