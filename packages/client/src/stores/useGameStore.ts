import { createStore } from 'zustand/vanilla';
import { STARTING_GOLD } from '@grimoire/shared';

export type GameAction =
  | { type: 'BUILD_TOWER'; towerType: string; gridX: number; gridY: number }
  | { type: 'UPGRADE_TOWER'; towerId: string; branch: 'A' | 'B' }
  | { type: 'SELL_TOWER'; towerId: string }
  | { type: 'FUSE_TOWERS'; towerIdA: string; towerIdB: string }
  | { type: 'SEND_WAVE_EARLY' }
  | { type: 'SET_SPEED'; speed: 1 | 2 | 3 }
  | { type: 'TOGGLE_PAUSE' };

export interface GameState {
  // Projected state (written by ECS systems, read by Preact)
  gold: number;
  essence: number;
  wave: number;
  totalWaves: number;
  nexusHP: number;
  maxNexusHP: number;
  score: number;
  comboCount: number;
  comboMultiplier: number;
  gameSpeed: 1 | 2 | 3;
  isPaused: boolean;
  isGameOver: boolean;

  // Action queue (written by Preact, drained by InputSystem)
  pendingActions: GameAction[];
  dispatch: (action: GameAction) => void;
  drainActions: () => GameAction[];

  // Lifecycle
  resetGameState: () => void;
}

const DEFAULT_STATE = {
  gold: STARTING_GOLD[1]!,
  essence: 0,
  wave: 0,
  totalWaves: 0,
  nexusHP: 5,
  maxNexusHP: 5,
  score: 0,
  comboCount: 0,
  comboMultiplier: 1,
  gameSpeed: 1 as const,
  isPaused: false,
  isGameOver: false,
  pendingActions: [] as GameAction[],
};

export const useGameStore = createStore<GameState>((set, get) => ({
  ...DEFAULT_STATE,

  dispatch: (action: GameAction) => {
    set((state) => ({
      pendingActions: [...state.pendingActions, action],
    }));
  },

  drainActions: () => {
    const actions = get().pendingActions;
    set({ pendingActions: [] });
    return actions;
  },

  resetGameState: () => {
    set({ ...DEFAULT_STATE, pendingActions: [] });
  },
}));
