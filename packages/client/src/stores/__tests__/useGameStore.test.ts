import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  it('should have correct default state', () => {
    const state = useGameStore.getState();
    expect(state.gold).toBe(650);
    expect(state.essence).toBe(0);
    expect(state.wave).toBe(0);
    expect(state.nexusHP).toBe(5);
    expect(state.gameSpeed).toBe(1);
    expect(state.isPaused).toBe(false);
    expect(state.isGameOver).toBe(false);
  });

  it('should queue actions via dispatch', () => {
    const { dispatch } = useGameStore.getState();
    dispatch({ type: 'BUILD_TOWER', towerType: 'elven_archer_spire', gridX: 5, gridY: 3 });
    expect(useGameStore.getState().pendingActions).toHaveLength(1);
    expect(useGameStore.getState().pendingActions[0]!.type).toBe('BUILD_TOWER');
  });

  it('should drain and clear actions', () => {
    const { dispatch, drainActions } = useGameStore.getState();
    dispatch({ type: 'SEND_WAVE_EARLY' });
    dispatch({ type: 'TOGGLE_PAUSE' });

    const actions = drainActions();
    expect(actions).toHaveLength(2);
    expect(useGameStore.getState().pendingActions).toHaveLength(0);
  });

  it('should reset game state', () => {
    useGameStore.setState({ gold: 999, wave: 5, score: 5000 });
    useGameStore.getState().resetGameState();
    const state = useGameStore.getState();
    expect(state.gold).toBe(650);
    expect(state.wave).toBe(0);
    expect(state.score).toBe(0);
  });
});
