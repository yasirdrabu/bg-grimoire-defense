/**
 * ScreenShake — trigger a micro-shake on the Phaser camera.
 *
 * Respects the player's `reducedMotion` accessibility setting: if enabled,
 * the shake is skipped entirely.
 *
 * The camera reference is typed as `unknown` so this module stays free of a
 * hard Phaser import (Phaser is large; avoid pulling it into modules that
 * don't strictly need it). A runtime duck-type check ensures the camera
 * exposes the expected `shake` method before calling it.
 */

import { usePlayerStore } from '../../stores/usePlayerStore';

const DEFAULT_INTENSITY = 0.002; // Phaser camera-shake intensity (fraction of view size)
const DEFAULT_DURATION_MS = 50;

interface PhaserCamera {
  shake(durationMs: number, intensity: number): void;
}

function isPhaserCamera(cam: unknown): cam is PhaserCamera {
  return (
    cam !== null &&
    typeof cam === 'object' &&
    'shake' in cam &&
    typeof (cam as Record<string, unknown>).shake === 'function'
  );
}

/**
 * Trigger a screen shake on the given Phaser camera.
 *
 * @param camera - Phaser.Cameras.Scene2D.Camera (typed as unknown to avoid Phaser import)
 * @param intensity - shake intensity (Phaser fraction of viewport; default 0.002 ≈ 1-2px)
 * @param durationMs - shake duration in milliseconds (default 50ms)
 */
export function triggerScreenShake(
  camera: unknown,
  intensity: number = DEFAULT_INTENSITY,
  durationMs: number = DEFAULT_DURATION_MS,
): void {
  // Skip if player has reduced motion enabled
  const { reducedMotion } = usePlayerStore.getState();
  if (reducedMotion) return;

  if (!isPhaserCamera(camera)) {
    console.warn('[ScreenShake] camera argument does not expose .shake() method');
    return;
  }

  camera.shake(durationMs, intensity);
}

// Pre-built shake profiles for common situations
export const SHAKE_PROFILES = {
  /** Light hit (arrow, bolt). */
  light: { intensity: 0.001, durationMs: 40 },
  /** Medium hit (ballista, cannon). */
  medium: { intensity: 0.002, durationMs: 60 },
  /** Heavy hit (bomb, fire explosion). */
  heavy: { intensity: 0.004, durationMs: 100 },
  /** Boss death or level-complete event. */
  epic: { intensity: 0.008, durationMs: 200 },
} as const;

export type ShakeProfile = keyof typeof SHAKE_PROFILES;
