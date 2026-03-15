import {
  SELL_REFUND_RATIO,
  INTEREST_RATE,
  INTEREST_CAP,
  STARTING_GOLD,
} from '../constants';

/**
 * Returns the gold reward for killing an enemy.
 */
export function getKillGold(enemy: { goldReward: number }): number {
  return enemy.goldReward;
}

/**
 * Returns the wave clear bonus gold.
 * Formula: 25 base + 5 per wave index.
 */
export function getWaveClearBonus(waveIndex: number): number {
  return 25 + waveIndex * 5;
}

/**
 * Calculates interest on the player's current gold.
 * Rate is INTEREST_RATE (10%), capped at INTEREST_CAP (50).
 */
export function calculateInterest(currentGold: number): number {
  return Math.min(Math.floor(currentGold * INTEREST_RATE), INTEREST_CAP);
}

/**
 * Returns the sell refund for a tower.
 * Refund is SELL_REFUND_RATIO (75%) of total spent (base cost + upgrade cost).
 */
export function getSellRefund(baseCost: number, upgradeCost: number): number {
  return Math.floor((baseCost + upgradeCost) * SELL_REFUND_RATIO);
}

/**
 * Returns the starting gold for a given act (1-indexed).
 * Falls back to 0 if the act is not defined.
 */
export function getStartingGold(act: number): number {
  return STARTING_GOLD[act] ?? 0;
}
