import { describe, it, expect } from 'vitest';
import { canUpgrade, getUpgradeCost, applyUpgrade } from '../TowerUpgrade';
import { TOWERS, TOWER_UPGRADES } from '@grimoire/shared';
import type { TowerDataData } from '../../ecs/components/TowerData';
import type { AttackData } from '../../ecs/components/Attack';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function makeTowerData(overrides: Partial<TowerDataData> = {}): TowerDataData {
  return {
    towerId: 'elven_archer_spire',
    tier: 1,
    totalInvestment: 100,
    isFusion: false,
    ...overrides,
  };
}

function makeAttackData(overrides: Partial<AttackData> = {}): AttackData {
  return {
    range: 4,
    damage: 15,
    damageType: 'physical',
    attackSpeed: 0.8,
    cooldownRemaining: 0,
    targetId: null,
    targetingMode: 'nearest',
    projectileType: 'arrow',
    canTargetAir: true,
    ...overrides,
  };
}

const archerDef = TOWERS['elven_archer_spire']!;
const archerUpgrades = TOWER_UPGRADES['elven_archer_spire']!;

// ──────────────────────────────────────────────────────────────────────────────
// canUpgrade
// ──────────────────────────────────────────────────────────────────────────────

describe('canUpgrade', () => {
  it('returns true when at tier 1 with enough gold', () => {
    const tower = makeTowerData({ tier: 1 });
    expect(canUpgrade(tower, 200, 0, archerDef)).toBe(true);
  });

  it('returns false when at tier 1 with insufficient gold', () => {
    const tower = makeTowerData({ tier: 1 });
    expect(canUpgrade(tower, 59, 0, archerDef)).toBe(false);
  });

  it('returns true when at tier 2 with branch A, enough gold and essence', () => {
    const tower = makeTowerData({ tier: 2 });
    expect(canUpgrade(tower, 200, 100, archerDef, 'A')).toBe(true);
  });

  it('returns false when at tier 2 with branch A but insufficient gold', () => {
    const tower = makeTowerData({ tier: 2 });
    expect(canUpgrade(tower, 99, 100, archerDef, 'A')).toBe(false);
  });

  it('returns false when at tier 2 with branch A but insufficient essence', () => {
    const tower = makeTowerData({ tier: 2 });
    expect(canUpgrade(tower, 200, 49, archerDef, 'A')).toBe(false);
  });

  it('returns false when at tier 2 without providing a branch', () => {
    const tower = makeTowerData({ tier: 2 });
    expect(canUpgrade(tower, 500, 500, archerDef)).toBe(false);
  });

  it('returns false when already at tier 3 (cannot upgrade further)', () => {
    const tower = makeTowerData({ tier: 3, branch: 'A' });
    expect(canUpgrade(tower, 999, 999, archerDef, 'A')).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// getUpgradeCost
// ──────────────────────────────────────────────────────────────────────────────

describe('getUpgradeCost', () => {
  it('returns tier 2 cost in gold (0 essence) when at tier 1', () => {
    const tower = makeTowerData({ tier: 1 });
    const cost = getUpgradeCost(tower, archerDef);
    expect(cost.gold).toBe(archerDef.upgradeCostTier2);
    expect(cost.essence).toBe(0);
  });

  it('returns tier 3 cost with essence when at tier 2', () => {
    const tower = makeTowerData({ tier: 2 });
    const cost = getUpgradeCost(tower, archerDef);
    expect(cost.gold).toBe(archerDef.upgradeCostTier3);
    expect(cost.essence).toBe(archerDef.essenceCostTier3);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// applyUpgrade — tier 1 → tier 2
// ──────────────────────────────────────────────────────────────────────────────

describe('applyUpgrade (tier 1 → tier 2)', () => {
  it('advances tier to 2', () => {
    const tower = makeTowerData({ tier: 1 });
    const attack = makeAttackData();
    applyUpgrade(attack, tower, archerDef, archerUpgrades);
    expect(tower.tier).toBe(2);
  });

  it('adds damage bonus based on base damage', () => {
    const tower = makeTowerData({ tier: 1 });
    const attack = makeAttackData({ damage: 15 });
    applyUpgrade(attack, tower, archerDef, archerUpgrades);
    // +30% of base (15) = 4.5, so 15 + 4.5 = 19.5
    expect(attack.damage).toBeCloseTo(archerDef.damage * (1 + archerUpgrades.tier2.damageBonus));
  });

  it('adds range bonus', () => {
    const tower = makeTowerData({ tier: 1 });
    const attack = makeAttackData({ range: 4 });
    applyUpgrade(attack, tower, archerDef, archerUpgrades);
    // +0.5 range
    expect(attack.range).toBeCloseTo(archerDef.range + archerUpgrades.tier2.rangeBonus);
  });

  it('applies attack speed bonus (negative = faster)', () => {
    const tower = makeTowerData({ tier: 1 });
    const attack = makeAttackData({ attackSpeed: 0.8 });
    applyUpgrade(attack, tower, archerDef, archerUpgrades);
    // -10% of base (0.8) = -0.08, so 0.8 - 0.08 = 0.72
    expect(attack.attackSpeed).toBeCloseTo(archerDef.attackSpeed * (1 + archerUpgrades.tier2.attackSpeedBonus));
  });

  it('does not set branch on tier 2 upgrade', () => {
    const tower = makeTowerData({ tier: 1 });
    const attack = makeAttackData();
    applyUpgrade(attack, tower, archerDef, archerUpgrades);
    expect(tower.branch).toBeUndefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// applyUpgrade — tier 2 → tier 3
// ──────────────────────────────────────────────────────────────────────────────

describe('applyUpgrade (tier 2 → tier 3 branch A)', () => {
  it('advances tier to 3 and sets branch A', () => {
    const tower = makeTowerData({ tier: 2 });
    const attack = makeAttackData();
    applyUpgrade(attack, tower, archerDef, archerUpgrades, 'A');
    expect(tower.tier).toBe(3);
    expect(tower.branch).toBe('A');
  });

  it('adds cumulative tier3A damage on top of tier2 damage', () => {
    // Simulate tower already at tier 2 stats
    const tier2Damage = archerDef.damage * (1 + archerUpgrades.tier2.damageBonus);
    const tower = makeTowerData({ tier: 2 });
    const attack = makeAttackData({ damage: tier2Damage });
    applyUpgrade(attack, tower, archerDef, archerUpgrades, 'A');
    // +50% of base on top of tier2 attack
    expect(attack.damage).toBeCloseTo(tier2Damage + archerDef.damage * archerUpgrades.tier3A.damageBonus);
  });

  it('adds cumulative tier3A range on top of current range', () => {
    const tier2Range = archerDef.range + archerUpgrades.tier2.rangeBonus;
    const tower = makeTowerData({ tier: 2 });
    const attack = makeAttackData({ range: tier2Range });
    applyUpgrade(attack, tower, archerDef, archerUpgrades, 'A');
    expect(attack.range).toBeCloseTo(tier2Range + archerUpgrades.tier3A.rangeBonus);
  });
});

describe('applyUpgrade (tier 2 → tier 3 branch B)', () => {
  it('advances tier to 3 and sets branch B', () => {
    const tower = makeTowerData({ tier: 2 });
    const attack = makeAttackData();
    applyUpgrade(attack, tower, archerDef, archerUpgrades, 'B');
    expect(tower.tier).toBe(3);
    expect(tower.branch).toBe('B');
  });

  it('applies tier3B bonuses', () => {
    const tier2Damage = archerDef.damage * (1 + archerUpgrades.tier2.damageBonus);
    const tower = makeTowerData({ tier: 2 });
    const attack = makeAttackData({ damage: tier2Damage });
    applyUpgrade(attack, tower, archerDef, archerUpgrades, 'B');
    expect(attack.damage).toBeCloseTo(tier2Damage + archerDef.damage * archerUpgrades.tier3B.damageBonus);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// All 5 towers have upgrade data
// ──────────────────────────────────────────────────────────────────────────────

describe('TOWER_UPGRADES completeness', () => {
  const towerIds = [
    'elven_archer_spire',
    'ent_watchtower',
    'gondorian_ballista',
    'istari_crystal',
    'dwarven_cannon',
  ];

  for (const id of towerIds) {
    it(`${id} has tier2, tier3A, and tier3B upgrade data`, () => {
      const upgrades = TOWER_UPGRADES[id];
      expect(upgrades).toBeDefined();
      expect(upgrades?.tier2).toBeDefined();
      expect(upgrades?.tier3A).toBeDefined();
      expect(upgrades?.tier3B).toBeDefined();
      expect(upgrades?.tier3A.name).toBeTruthy();
      expect(upgrades?.tier3B.name).toBeTruthy();
    });
  }
});
