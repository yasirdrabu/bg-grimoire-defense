const MAX_SPEED_BONUS = 500;

/**
 * Calculates a speed bonus for clearing a wave faster than par time.
 * Formula: Math.floor((parTime - clearTime) / parTime * 500)
 * Returns 0 if clearTime >= parTime. Maximum of 500.
 */
export function calculateSpeedBonus(clearTimeMs: number, parTimeMs: number): number {
  if (clearTimeMs >= parTimeMs || parTimeMs <= 0) return 0;
  return Math.min(
    Math.floor(((parTimeMs - clearTimeMs) / parTimeMs) * MAX_SPEED_BONUS),
    MAX_SPEED_BONUS,
  );
}

/**
 * Calculates a bonus for sending the next wave early.
 * Formula: Math.floor(remainingCountdownMs / 1000) * 10
 */
export function calculateEarlySendBonus(remainingCountdownMs: number): number {
  return Math.floor(remainingCountdownMs / 1000) * 10;
}
