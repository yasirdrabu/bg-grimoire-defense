import {
  PERFECT_WAVE_ESSENCE,
  COMBO_ESSENCE_REWARD,
  COMBO_ESSENCE_THRESHOLD,
  FIRST_FUSION_ESSENCE,
} from '../constants';

/**
 * Returns the essence reward for killing a boss enemy.
 * Returns `bossEssenceReward` if the enemy is a boss and the reward is defined,
 * otherwise returns 0.
 */
export function getBossEssence(enemy: { isBoss: boolean; bossEssenceReward?: number }): number {
  if (!enemy.isBoss) return 0;
  return enemy.bossEssenceReward ?? 0;
}

/**
 * Returns the essence bonus for completing a wave without any nexus damage.
 */
export function getPerfectWaveEssence(): number {
  return PERFECT_WAVE_ESSENCE;
}

/**
 * Returns the essence bonus for reaching a combo threshold.
 * Awards essence when comboCount reaches the threshold, otherwise 0.
 */
export function getComboEssence(comboCount: number): number {
  return comboCount >= COMBO_ESSENCE_THRESHOLD ? COMBO_ESSENCE_REWARD : 0;
}

/**
 * Returns the one-time essence bonus for discovering a new fusion for the first time.
 */
export function getFirstFusionEssence(): number {
  return FIRST_FUSION_ESSENCE;
}
