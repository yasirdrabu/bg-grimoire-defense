import type { TowerDefinition, TowerUpgradeData } from '@grimoire/shared';
import type { TowerDataData } from '../ecs/components/TowerData';
import type { AttackData } from '../ecs/components/Attack';

/**
 * Returns the gold and essence cost for the next upgrade tier.
 * Tier 1 → 2 costs upgradeCostTier2 gold (0 essence).
 * Tier 2 → 3 costs upgradeCostTier3 gold + essenceCostTier3 essence.
 */
export function getUpgradeCost(
  tower: TowerDataData,
  towerDef: TowerDefinition,
): { gold: number; essence: number } {
  if (tower.tier === 1) {
    return { gold: towerDef.upgradeCostTier2, essence: 0 };
  }
  return { gold: towerDef.upgradeCostTier3, essence: towerDef.essenceCostTier3 };
}

/**
 * Checks whether a tower can be upgraded.
 *
 * Rules:
 * - Tier 3 towers cannot be upgraded further.
 * - Tier 1 → 2 requires enough gold (no essence needed, no branch required).
 * - Tier 2 → 3 requires a branch selection AND enough gold AND enough essence.
 */
export function canUpgrade(
  tower: TowerDataData,
  gold: number,
  essence: number,
  towerDef: TowerDefinition,
  branch?: 'A' | 'B',
): boolean {
  if (tower.tier >= 3) return false;

  const cost = getUpgradeCost(tower, towerDef);

  if (tower.tier === 2) {
    // Branch is required for tier 3
    if (!branch) return false;
    return gold >= cost.gold && essence >= cost.essence;
  }

  // tier === 1
  return gold >= cost.gold;
}

/**
 * Mutates `attack` stats and advances `towerData.tier` (and sets `branch` for
 * tier-3 upgrades).
 *
 * Bonuses are ADDITIVE based on the tower's **base** stats (from `towerDef`).
 * Bonus conventions:
 * - `damageBonus`: fraction of base (0.3 = +30% of towerDef.damage)
 * - `rangeBonus`: flat tile increment (0.5 = +0.5 tiles)
 * - `attackSpeedBonus`: fraction of base (negative = faster; -0.1 = -10% of towerDef.attackSpeed)
 *
 * For example, a damageBonus of 0.3 adds 30% of `towerDef.damage` to the
 * current `attack.damage`.
 *
 * This function does NOT deduct gold/essence — the caller is responsible for
 * that before calling applyUpgrade.
 */
export function applyUpgrade(
  attack: AttackData,
  towerData: TowerDataData,
  towerDef: TowerDefinition,
  upgradeData: TowerUpgradeData,
  branch?: 'A' | 'B',
): void {
  if (towerData.tier === 1) {
    // Apply tier 2 bonuses
    attack.damage += towerDef.damage * upgradeData.tier2.damageBonus;
    attack.range += upgradeData.tier2.rangeBonus;
    attack.attackSpeed += towerDef.attackSpeed * upgradeData.tier2.attackSpeedBonus;
    towerData.tier = 2;
  } else if (towerData.tier === 2 && branch) {
    // Apply tier 3 branch bonuses
    const branchData = branch === 'A' ? upgradeData.tier3A : upgradeData.tier3B;
    attack.damage += towerDef.damage * branchData.damageBonus;
    attack.range += branchData.rangeBonus;
    attack.attackSpeed += towerDef.attackSpeed * branchData.attackSpeedBonus;
    towerData.tier = 3;
    towerData.branch = branch;
  }
}
