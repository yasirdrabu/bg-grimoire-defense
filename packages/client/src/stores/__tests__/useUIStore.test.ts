import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset to default state
    useUIStore.setState({
      inputMode: 'idle',
      selectedTowerId: null,
      buildTowerType: null,
      hoveredEntityId: null,
      activeTab: 'none',
      showPathOverlay: false,
    });
  });

  describe('build mode', () => {
    it('should enter build mode with tower type', () => {
      useUIStore.getState().enterBuildMode('elven_archer_spire');
      const state = useUIStore.getState();

      expect(state.inputMode).toBe('build');
      expect(state.buildTowerType).toBe('elven_archer_spire');
      expect(state.selectedTowerId).toBeNull();
    });

    it('should exit build mode', () => {
      useUIStore.getState().enterBuildMode('elven_archer_spire');
      useUIStore.getState().exitBuildMode();
      const state = useUIStore.getState();

      expect(state.inputMode).toBe('idle');
      expect(state.buildTowerType).toBeNull();
    });

    it('should clear selected tower when entering build mode', () => {
      useUIStore.getState().selectTower('tower-1');
      useUIStore.getState().enterBuildMode('elven_archer_spire');

      expect(useUIStore.getState().selectedTowerId).toBeNull();
    });
  });

  describe('tower selection', () => {
    it('should select a tower', () => {
      useUIStore.getState().selectTower('tower-42');
      const state = useUIStore.getState();

      expect(state.inputMode).toBe('selected');
      expect(state.selectedTowerId).toBe('tower-42');
      expect(state.buildTowerType).toBeNull();
    });

    it('should deselect tower', () => {
      useUIStore.getState().selectTower('tower-1');
      useUIStore.getState().deselectTower();
      const state = useUIStore.getState();

      expect(state.inputMode).toBe('idle');
      expect(state.selectedTowerId).toBeNull();
    });

    it('should clear build mode when selecting tower', () => {
      useUIStore.getState().enterBuildMode('elven_archer_spire');
      useUIStore.getState().selectTower('tower-1');

      expect(useUIStore.getState().buildTowerType).toBeNull();
    });
  });

  describe('hovered entity', () => {
    it('should set hovered entity', () => {
      useUIStore.getState().setHoveredEntity('entity-5');
      expect(useUIStore.getState().hoveredEntityId).toBe('entity-5');
    });

    it('should clear hovered entity', () => {
      useUIStore.getState().setHoveredEntity('entity-5');
      useUIStore.getState().setHoveredEntity(null);
      expect(useUIStore.getState().hoveredEntityId).toBeNull();
    });
  });

  describe('active tab', () => {
    it('should set active tab', () => {
      useUIStore.getState().setActiveTab('profile');
      expect(useUIStore.getState().activeTab).toBe('profile');
    });

    it('should switch between tabs', () => {
      useUIStore.getState().setActiveTab('grimoire');
      useUIStore.getState().setActiveTab('leaderboard');
      expect(useUIStore.getState().activeTab).toBe('leaderboard');
    });

    it('should reset to none', () => {
      useUIStore.getState().setActiveTab('store');
      useUIStore.getState().setActiveTab('none');
      expect(useUIStore.getState().activeTab).toBe('none');
    });
  });

  describe('path overlay', () => {
    it('should toggle path overlay on', () => {
      useUIStore.getState().togglePathOverlay();
      expect(useUIStore.getState().showPathOverlay).toBe(true);
    });

    it('should toggle path overlay off', () => {
      useUIStore.getState().togglePathOverlay();
      useUIStore.getState().togglePathOverlay();
      expect(useUIStore.getState().showPathOverlay).toBe(false);
    });
  });
});
