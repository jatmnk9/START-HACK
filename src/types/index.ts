// ============================================================
// Game Types & Interfaces
// ============================================================

export interface Player {
  username: string;
  avatar: string;
  balance: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  portfolio: PortfolioItem[];
  powerCards: PowerCard[];
  completedWaves: number;
  onboardingComplete: boolean;
}

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: AssetType;
  sector: string;
  price: number;
  icon: string;
  buildingEmoji: string;
  description: string;
  chfPerTick?: number;
  tickSeconds?: number;
  volatilityRisk?: number;
  historicalBasis?: string;
}

export type AssetType = 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity';

export interface PortfolioItem {
  asset: Asset;
  quantity: number;
  purchasePrice: number;
  holdWaves: number;
  groupId?: string;
}

export interface HistoricalEvent {
  id: string;
  name: string;
  year: number;
  date: string;
  description: string;
  context: string;
  dangeredSectors: string[];
  benefitedSectors: string[];
  impacts: EventImpact[];
  panicLevel: number; // 0-100
  interestRateChange: number;
  usdChfChange: number;
  newsHeadlines: string[];
  weather: 'storm' | 'rain' | 'cloudy' | 'sunny' | 'thunder';
  tdEnemies?: TDEnemyDef[];
}

export interface EventImpact {
  assetId: string;
  percentChange: number;
}

export interface TDEnemyDef {
  id: string;
  name: string;
}

export interface PowerCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'offensive' | 'defensive';
  effect: PowerCardEffect;
}

export type PowerCardEffect =
  | 'fog_of_war'      // Blocks opponent's context module
  | 'time_machine'    // Changes the event
  | 'shield'          // Reduces losses by 50%
  | 'insider'         // Reveals one extra sector insight
  | 'double_down';    // Doubles gains (and losses)

export interface OnboardingModule {
  id: number;
  title: string;
  icon: string;
  theory: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  wrongExplanation: string;
}

export interface ArenaMatch {
  id: string;
  player1: Player;
  player2: Player;
  event: HistoricalEvent;
  status: 'waiting' | 'cards' | 'building' | 'impact' | 'result';
  timeRemaining: number;
}

export type GameScreen = 
  | 'registration'
  | 'onboarding'
  | 'hub'
  | 'survival'
  | 'arena'
  | 'shop'
  | 'profile';

export interface GameState {
  currentScreen: GameScreen;
  player: Player | null;
  currentEvent: HistoricalEvent | null;
  survivalPhase: 'roulette' | 'context' | 'market' | 'countdown' | 'impact' | 'result';
  waveTimer: number;
  marketSentiment: number; // -100 to 100
}
