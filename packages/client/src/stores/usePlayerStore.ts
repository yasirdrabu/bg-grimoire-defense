import { createStore } from 'zustand/vanilla';
import type { LevelProgress } from '@grimoire/shared';

export interface PlayerState {
  isLoggedIn: boolean;
  playerId: string | null;
  username: string | null;
  progress: Map<string, LevelProgress>;
  discoveredFusions: Set<string>;

  setPlayer: (id: string, username: string) => void;
  updateProgress: (levelId: string, progress: LevelProgress) => void;
  discoverFusion: (fusionId: string) => void;
}

export const usePlayerStore = createStore<PlayerState>((set) => ({
  isLoggedIn: false,
  playerId: null,
  username: null,
  progress: new Map(),
  discoveredFusions: new Set(),

  setPlayer: (id: string, username: string) => {
    set({ isLoggedIn: true, playerId: id, username });
  },

  updateProgress: (levelId: string, progress: LevelProgress) => {
    set((state) => {
      const newProgress = new Map(state.progress);
      newProgress.set(levelId, progress);
      return { progress: newProgress };
    });
  },

  discoverFusion: (fusionId: string) => {
    set((state) => {
      const newFusions = new Set(state.discoveredFusions);
      newFusions.add(fusionId);
      return { discoveredFusions: newFusions };
    });
  },
}));
