import { createStore } from 'zustand/vanilla';

export type InputMode = 'idle' | 'build' | 'selected';
export type HubTab = 'none' | 'profile' | 'grimoire' | 'store' | 'leaderboard';

export interface UIState {
  inputMode: InputMode;
  selectedTowerId: string | null;
  buildTowerType: string | null;
  hoveredEntityId: string | null;
  activeTab: HubTab;
  showPathOverlay: boolean;

  enterBuildMode: (towerType: string) => void;
  exitBuildMode: () => void;
  selectTower: (towerId: string) => void;
  deselectTower: () => void;
  setHoveredEntity: (entityId: string | null) => void;
  setActiveTab: (tab: HubTab) => void;
  togglePathOverlay: () => void;
}

export const useUIStore = createStore<UIState>((set) => ({
  inputMode: 'idle',
  selectedTowerId: null,
  buildTowerType: null,
  hoveredEntityId: null,
  activeTab: 'none',
  showPathOverlay: false,

  enterBuildMode: (towerType: string) => {
    set({ inputMode: 'build', buildTowerType: towerType, selectedTowerId: null });
  },

  exitBuildMode: () => {
    set({ inputMode: 'idle', buildTowerType: null });
  },

  selectTower: (towerId: string) => {
    set({ inputMode: 'selected', selectedTowerId: towerId, buildTowerType: null });
  },

  deselectTower: () => {
    set({ inputMode: 'idle', selectedTowerId: null });
  },

  setHoveredEntity: (entityId: string | null) => {
    set({ hoveredEntityId: entityId });
  },

  setActiveTab: (tab: HubTab) => {
    set({ activeTab: tab });
  },

  togglePathOverlay: () => {
    set((state) => ({ showPathOverlay: !state.showPathOverlay }));
  },
}));
