import { MAX_POINTS_PER_WAVE } from '@grimoire/shared';

/** Maximum enemies expected per wave — generous upper bound for plausibility check. */
const MAX_ENEMIES_PER_WAVE = 200;

interface PlausibilityInput {
  durationMs: number;
  wavesCompleted: number;
  totalWaves: number;
  enemiesKilled: number;
  maxCombo: number;
  totalScore: number;
  towersBuilt: number;
}

interface PlausibilityResult {
  valid: boolean;
  reason?: string;
}

/**
 * Server-side plausibility check for submitted game stats.
 * These are quick sanity bounds — not a full replay verification.
 */
export function validatePlausibility(data: PlausibilityInput): PlausibilityResult {
  const {
    durationMs,
    wavesCompleted,
    totalWaves,
    enemiesKilled,
    maxCombo,
    totalScore,
    towersBuilt,
  } = data;

  // Must have placed at least one tower to play
  if (towersBuilt <= 0) {
    return { valid: false, reason: 'towers_built must be > 0' };
  }

  // Minimum plausible duration: 5 seconds per wave
  const minDurationMs = wavesCompleted * 5_000;
  if (durationMs < minDurationMs) {
    return {
      valid: false,
      reason: `duration_ms (${durationMs}) is too short for ${wavesCompleted} waves (min ${minDurationMs})`,
    };
  }

  // Enemies killed should not exceed the theoretical maximum for completed waves
  const maxKillable = wavesCompleted * MAX_ENEMIES_PER_WAVE;
  if (enemiesKilled > maxKillable) {
    return {
      valid: false,
      reason: `enemies_killed (${enemiesKilled}) exceeds max plausible for ${wavesCompleted} waves (${maxKillable})`,
    };
  }

  // A combo cannot exceed the number of enemies killed
  if (maxCombo > enemiesKilled) {
    return {
      valid: false,
      reason: `max_combo (${maxCombo}) cannot exceed enemies_killed (${enemiesKilled})`,
    };
  }

  // Total score cannot exceed max per wave times completed waves
  const maxPlausibleScore = MAX_POINTS_PER_WAVE * Math.max(wavesCompleted, 1);
  if (totalScore > maxPlausibleScore) {
    return {
      valid: false,
      reason: `total_score (${totalScore}) exceeds max plausible for ${wavesCompleted} waves (${maxPlausibleScore})`,
    };
  }

  // wavesCompleted cannot exceed totalWaves
  if (wavesCompleted > totalWaves) {
    return {
      valid: false,
      reason: `waves_completed (${wavesCompleted}) cannot exceed total_waves (${totalWaves})`,
    };
  }

  return { valid: true };
}
