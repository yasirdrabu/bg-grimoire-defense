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
  return 10;
}

/**
 * Returns the essence bonus for reaching a combo threshold.
 * Awards 5 essence when comboCount is 25 or higher, otherwise 0.
 */
export function getComboEssence(comboCount: number): number {
  return comboCount >= 25 ? 5 : 0;
}

/**
 * Returns the one-time essence bonus for discovering a new fusion for the first time.
 */
export function getFirstFusionEssence(): number {
  return 25;
}
