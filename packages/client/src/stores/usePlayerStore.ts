import { createStore } from 'zustand/vanilla';
import { LEVELS } from '@grimoire/shared';
import type { LevelProgress } from '@grimoire/shared';

export interface PlayerState {
  isLoggedIn: boolean;
  playerId: string | null;
  username: string | null;
  progress: Map<string, LevelProgress>;
  discoveredFusions: Set<string>;
  // Settings stubs
  volume: number;
  reducedMotion: boolean;
  uiScale: number;

  setPlayer: (id: string, username: string) => void;
  updateProgress: (levelId: string, progress: LevelProgress) => void;
  discoverFusion: (fusionId: string) => void;
  isLevelUnlocked: (levelId: string) => boolean;
  setVolume: (v: number) => void;
  setReducedMotion: (v: boolean) => void;
  setUiScale: (v: number) => void;
}

export const usePlayerStore = createStore<PlayerState>((set, get) => ({
  isLoggedIn: false,
  playerId: null,
  username: null,
  progress: new Map(),
  discoveredFusions: new Set(),
  volume: 0.8,
  reducedMotion: false,
  uiScale: 1,

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

  isLevelUnlocked: (levelId: string): boolean => {
    const levelDef = LEVELS[levelId];
    if (!levelDef) return false;
    // Level 1 of each act (levelIndex === 0) is always unlocked
    if (levelDef.levelIndex === 0) return true;
    // Find the previous level in the same act
    const prevLevelId = `act${levelDef.act}_level${levelDef.levelIndex}`;
    const prevProgress = get().progress.get(prevLevelId);
    return (prevProgress?.stars ?? 0) > 0;
  },

  setVolume: (v: number) => set({ volume: v }),
  setReducedMotion: (v: boolean) => set({ reducedMotion: v }),
  setUiScale: (v: number) => set({ uiScale: v }),
}));
