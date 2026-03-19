import { createStore } from 'zustand/vanilla';
import { LEVELS } from '@grimoire/shared';
import type { LevelProgress } from '@grimoire/shared';
import { api } from '../api/client';
import { OfflineQueue } from '../api/offlineQueue';
import type { AuthPlayerRow } from '../api/client';

const TOKEN_STORAGE_KEY = 'grimoire_token';

export interface PlayerState {
  isLoggedIn: boolean;
  playerId: string | null;
  username: string | null;
  displayName: string | null;
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

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

function applyAuthPlayer(player: AuthPlayerRow): void {
  usePlayerStore.setState({
    isLoggedIn: true,
    playerId: player.id,
    username: player.username,
    displayName: player.displayName ?? player.username,
  });
}

export const usePlayerStore = createStore<PlayerState>((set, get) => ({
  isLoggedIn: false,
  playerId: null,
  username: null,
  displayName: null,
  progress: new Map(),
  discoveredFusions: new Set(),
  volume: 0.8,
  reducedMotion: false,
  uiScale: 1,

  setPlayer: (id: string, username: string) => {
    set({ isLoggedIn: true, playerId: id, username, displayName: username });
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

  login: async (email: string, password: string) => {
    const res = await api.login(email, password);
    api.setToken(res.token);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    applyAuthPlayer(res.player);
    // Process any queued scores now that we have a token
    void OfflineQueue.processQueue(api);
  },

  register: async (email: string, username: string, password: string) => {
    const res = await api.register(email, username, password);
    api.setToken(res.token);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    applyAuthPlayer(res.player);
  },

  logout: () => {
    api.setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({
      isLoggedIn: false,
      playerId: null,
      username: null,
      displayName: null,
    });
  },
}));

// On app start, restore saved token and fetch profile
const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
if (savedToken) {
  api.setToken(savedToken);
  // Eagerly fetch profile to validate token and populate state
  api
    .getProfile()
    .then((res) => {
      applyAuthPlayer(res.player);
      // Restore server-side progress into local store
      for (const p of res.progress) {
        usePlayerStore.getState().updateProgress(p.levelId, {
          levelId: p.levelId,
          difficulty: p.difficulty,
          bestScore: p.bestScore,
          stars: p.stars,
          bestCombo: p.bestCombo,
          timesCompleted: p.timesCompleted,
          fastestClearMs: p.fastestClearMs ?? undefined,
        });
      }
      // Restore discovered fusions
      for (const f of res.fusions) {
        usePlayerStore.getState().discoverFusion(f.fusionId);
      }
      // Process any offline-queued scores
      void OfflineQueue.processQueue(api);
    })
    .catch(() => {
      // Token is invalid/expired — clear it
      api.setToken(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    });
}
