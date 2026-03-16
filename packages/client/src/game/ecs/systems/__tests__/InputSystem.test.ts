import { describe, it, expect, beforeEach } from 'vitest';
import { GameWorld } from '../../World';
import { inputSystem } from '../InputSystem';
import { useGameStore } from '../../../../stores/useGameStore';

describe('InputSystem', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  it('should set game speed from SET_SPEED action', () => {
    const world = new GameWorld();
    useGameStore.getState().dispatch({ type: 'SET_SPEED', speed: 2 });

    inputSystem(world, 16);
    expect(useGameStore.getState().gameSpeed).toBe(2);
  });

  it('should toggle pause from TOGGLE_PAUSE action', () => {
    const world = new GameWorld();
    expect(useGameStore.getState().isPaused).toBe(false);

    useGameStore.getState().dispatch({ type: 'TOGGLE_PAUSE' });
    inputSystem(world, 16);
    expect(useGameStore.getState().isPaused).toBe(true);

    useGameStore.getState().dispatch({ type: 'TOGGLE_PAUSE' });
    inputSystem(world, 16);
    expect(useGameStore.getState().isPaused).toBe(false);
  });

  it('should set sendWaveEarlyFlag from SEND_WAVE_EARLY action', () => {
    const world = new GameWorld();
    useGameStore.getState().dispatch({ type: 'SEND_WAVE_EARLY' });

    inputSystem(world, 16);
    expect(useGameStore.getState().sendWaveEarlyFlag).toBe(true);
  });

  it('should drain all actions in one pass', () => {
    const world = new GameWorld();
    useGameStore.getState().dispatch({ type: 'SET_SPEED', speed: 3 });
    useGameStore.getState().dispatch({ type: 'SEND_WAVE_EARLY' });

    inputSystem(world, 16);
    expect(useGameStore.getState().gameSpeed).toBe(3);
    expect(useGameStore.getState().sendWaveEarlyFlag).toBe(true);
    expect(useGameStore.getState().pendingActions).toHaveLength(0);
  });

  it('should handle empty action queue gracefully', () => {
    const world = new GameWorld();
    expect(() => inputSystem(world, 16)).not.toThrow();
  });
});
