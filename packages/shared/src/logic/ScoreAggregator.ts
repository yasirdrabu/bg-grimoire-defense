import type { ScoreBreakdown } from '../types/score';
import { MAX_POINTS_PER_WAVE } from '../constants';

/**
 * Maximum plausible points per wave (used for anti-cheat sanity check).
 * Even with perfect play, a wave should not yield more than this amount.
 */

/**
 * Aggregates all score components into a complete ScoreBreakdown with totalScore.
 */
export function aggregateScore(
  breakdown: Omit<ScoreBreakdown, 'totalScore'>,
): ScoreBreakdown {
  const totalScore =
    breakdown.baseScore +
    breakdown.comboScore +
    breakdown.speedScore +
    breakdown.styleScore +
    breakdown.perfectWaveBonus +
    breakdown.nexusHealthBonus;

  return { ...breakdown, totalScore };
}

/**
 * Performs a basic sanity check to detect implausible scores.
 * Returns false if:
 *   - totalScore is negative
 *   - totalScore doesn't match the sum of components (tampered)
 *   - totalScore exceeds the maximum plausible points for the given wave count
 */
export function validateScorePlausibility(
  score: ScoreBreakdown,
  waveCount: number,
): boolean {
  if (score.totalScore < 0) return false;

  const expectedTotal =
    score.baseScore +
    score.comboScore +
    score.speedScore +
    score.styleScore +
    score.perfectWaveBonus +
    score.nexusHealthBonus;

  if (expectedTotal !== score.totalScore) return false;

  const maxPlausible = MAX_POINTS_PER_WAVE * Math.max(waveCount, 1);
  if (score.totalScore > maxPlausible) return false;

  return true;
}
