import type { World } from '@grimoire/shared';
import { ComboTracker } from '@grimoire/shared';
import { useGameStore } from '../../../stores/useGameStore';

/**
 * Singleton ComboTracker instance for the current game session.
 * Reset when the game resets.
 */
let comboTracker = new ComboTracker();
let elapsedMs = 0;

/**
 * Resets the ScoreSystem state (call on game reset / new game).
 */
export function resetScoreSystem(): void {
  comboTracker = new ComboTracker();
  elapsedMs = 0;
}

/**
 * Returns the current ComboTracker instance (for external kill registration).
 * Other systems call getComboTracker().registerKill(getElapsedMs())
 */
export function getComboTracker(): ComboTracker {
  return comboTracker;
}

/**
 * Returns the elapsed time in milliseconds since the game started.
 */
export function getElapsedMs(): number {
  return elapsedMs;
}

/**
 * ECS system that updates the combo tracker and projects score/combo state
 * to the Zustand store each frame.
 */
export function scoreSystem(_world: World, deltaMs: number): void {
  elapsedMs += deltaMs;

  // Tick the combo tracker — will reset combo if window expired
  comboTracker.tick(elapsedMs);

  // Project combo state to store
  const store = useGameStore.getState();
  const multiplier = comboTracker.getMultiplier();
  const comboCount = comboTracker.comboCount;

  if (
    store.comboCount !== comboCount ||
    store.comboMultiplier !== multiplier
  ) {
    useGameStore.setState({
      comboCount,
      comboMultiplier: multiplier,
    });
  }
}
