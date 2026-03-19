import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Player, GameScreen, HistoricalEvent, PowerCard, PortfolioItem, Asset } from '../types';

interface GameState {
  currentScreen: GameScreen;
  player: Player | null;
  currentEvent: HistoricalEvent | null;
  survivalPhase: 'roulette' | 'context' | 'market' | 'countdown' | 'impact' | 'result';
  waveTimer: number;
  marketSentiment: number;
}

type GameAction =
  | { type: 'SET_SCREEN'; screen: GameScreen }
  | { type: 'CREATE_PLAYER'; username: string; avatar: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SET_EVENT'; event: HistoricalEvent }
  | { type: 'SET_SURVIVAL_PHASE'; phase: GameState['survivalPhase'] }
  | { type: 'BUY_ASSET'; asset: Asset; quantity: number; groupId?: string }
  | { type: 'SELL_ASSET'; assetId: string; quantity: number }
  | { type: 'APPLY_WAVE_IMPACT'; impacts: { assetId: string; percentChange: number }[] }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_POWER_CARD'; card: PowerCard }
  | { type: 'REMOVE_POWER_CARD'; cardId: string }
  | { type: 'SET_BALANCE'; amount: number }
  | { type: 'RESET_PORTFOLIO' }
  | { type: 'INCREMENT_HOLD_WAVES' }
  | { type: 'SET_MARKET_SENTIMENT'; value: number };

const initialState: GameState = {
  currentScreen: 'registration',
  player: null,
  currentEvent: null,
  survivalPhase: 'roulette',
  waveTimer: 0,
  marketSentiment: 0,
};

function calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
  // Each level requires more XP: level N requires N * 100 XP
  let totalXpNeeded = 0;
  let level = 1;
  while (totalXpNeeded + level * 100 <= xp) {
    totalXpNeeded += level * 100;
    level++;
  }
  return { level, xpToNextLevel: level * 100 - (xp - totalXpNeeded) };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen };

    case 'CREATE_PLAYER':
      return {
        ...state,
        player: {
          username: action.username,
          avatar: action.avatar,
          balance: 10000,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          portfolio: [],
          powerCards: [],
          completedWaves: 0,
          onboardingComplete: false,
        },
        currentScreen: 'onboarding',
      };

    case 'COMPLETE_ONBOARDING':
      if (!state.player) return state;
      return {
        ...state,
        player: { ...state.player, onboardingComplete: true },
        currentScreen: 'hub',
      };

    case 'SET_EVENT':
      return { ...state, currentEvent: action.event };

    case 'SET_SURVIVAL_PHASE':
      return { ...state, survivalPhase: action.phase };

    case 'BUY_ASSET': {
      if (!state.player) return state;
      const cost = action.asset.price * action.quantity;
      if (cost > state.player.balance) return state;

      const existingIdx = state.player.portfolio.findIndex(
        (p) => p.asset.id === action.asset.id && p.groupId === action.groupId
      );
      let newPortfolio: PortfolioItem[];
      if (existingIdx >= 0) {
        newPortfolio = state.player.portfolio.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + action.quantity }
            : item
        );
      } else {
        newPortfolio = [
          ...state.player.portfolio,
          {
            asset: action.asset,
            quantity: action.quantity,
            purchasePrice: action.asset.price,
            holdWaves: 0,
            groupId: action.groupId,
          },
        ];
      }
      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance - cost,
          portfolio: newPortfolio,
        },
      };
    }

    case 'SELL_ASSET': {
      if (!state.player) return state;
      const item = state.player.portfolio.find((p) => p.asset.id === action.assetId);
      if (!item) return state;
      const sellQuantity = Math.min(action.quantity, item.quantity);
      const revenue = item.asset.price * sellQuantity;

      const newPortfolio =
        sellQuantity >= item.quantity
          ? state.player.portfolio.filter((p) => p.asset.id !== action.assetId)
          : state.player.portfolio.map((p) =>
              p.asset.id === action.assetId
                ? { ...p, quantity: p.quantity - sellQuantity }
                : p
            );

      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance + revenue,
          portfolio: newPortfolio,
        },
      };
    }

    case 'APPLY_WAVE_IMPACT': {
      if (!state.player) return state;
      const updatedPortfolio = state.player.portfolio.map((item) => {
        const impact = action.impacts.find((i) => i.assetId === item.asset.id);
        if (!impact) return item;
        const newPrice = Math.max(1, item.asset.price * (1 + impact.percentChange / 100));
        return {
          ...item,
          asset: { ...item.asset, price: Math.round(newPrice * 100) / 100 },
        };
      });

      const portfolioValue = updatedPortfolio.reduce(
        (sum, item) => sum + item.asset.price * item.quantity,
        0
      );
      const totalNetWorth = state.player.balance + portfolioValue;
      const survived = totalNetWorth >= 8000;
      const xpGain = survived ? 50 + Math.floor((totalNetWorth - 8000) / 100) : 10;
      const newXp = state.player.xp + xpGain;
      const { level, xpToNextLevel } = calculateLevel(newXp);

      return {
        ...state,
        player: {
          ...state.player,
          portfolio: updatedPortfolio,
          completedWaves: state.player.completedWaves + 1,
          xp: newXp,
          level,
          xpToNextLevel,
        },
      };
    }

    case 'ADD_XP': {
      if (!state.player) return state;
      const newXp = state.player.xp + action.amount;
      const { level, xpToNextLevel } = calculateLevel(newXp);
      return {
        ...state,
        player: { ...state.player, xp: newXp, level, xpToNextLevel },
      };
    }

    case 'ADD_POWER_CARD':
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          powerCards: [...state.player.powerCards, action.card],
        },
      };

    case 'REMOVE_POWER_CARD':
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          powerCards: state.player.powerCards.filter((c) => c.id !== action.cardId),
        },
      };

    case 'SET_BALANCE':
      if (!state.player) return state;
      return {
        ...state,
        player: { ...state.player, balance: action.amount },
      };

    case 'RESET_PORTFOLIO':
      if (!state.player) return state;
      // Sell everything and return to balance
      const totalValue = state.player.portfolio.reduce(
        (sum, item) => sum + item.asset.price * item.quantity,
        0
      );
      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance + totalValue,
          portfolio: [],
        },
      };

    case 'INCREMENT_HOLD_WAVES':
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          portfolio: state.player.portfolio.map((item) => ({
            ...item,
            holdWaves: item.holdWaves + 1,
          })),
        },
      };

    case 'SET_MARKET_SENTIMENT':
      return { ...state, marketSentiment: action.value };

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({ state: initialState, dispatch: () => {} });

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
