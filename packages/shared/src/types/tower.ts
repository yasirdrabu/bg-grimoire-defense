export type Universe = 'middle_earth' | 'wizarding' | 'westeros';
export type TowerRole = 'cheap_dps' | 'medium_dps' | 'expensive_dps' | 'utility' | 'specialist';
export type DamageType = 'physical' | 'fire' | 'ice' | 'poison' | 'arcane';
export type ProjectileType = 'arrow' | 'fireball' | 'cannonball' | 'spell_bolt' | 'root_thorn';
export type TargetingMode = 'nearest' | 'strongest' | 'first';

export interface TowerDefinition {
  readonly id: string;
  readonly name: string;
  readonly universe: Universe;
  readonly role: TowerRole;
  readonly cost: number;
  readonly range: number;
  readonly attackSpeed: number; // seconds between attacks
  readonly damage: number;
  readonly damageType: DamageType;
  readonly canTargetAir: boolean;
  readonly projectileType: ProjectileType;
  readonly upgradeCostTier2: number;
  readonly upgradeCostTier3: number;
  readonly essenceCostTier3: number;
  readonly splashRadius?: number;
  readonly pierceCount?: number;
  readonly statusEffect?: StatusEffectDefinition;
  readonly special?: string;
}

export interface StatusEffectDefinition {
  readonly type: 'slow' | 'burn' | 'poison' | 'stun' | 'fear' | 'curse';
  readonly duration: number; // ms
  readonly magnitude: number; // 0-1 for slow, DPS for DoT
}

export interface TowerUpgradeBranch {
  readonly name: string;
  readonly description: string;
  readonly damageBonus: number;
  readonly rangeBonus: number;
  readonly attackSpeedBonus: number;
  readonly specialAbility?: string;
}

export interface TowerUpgradeData {
  readonly tier2: {
    readonly damageBonus: number;
    readonly rangeBonus: number;
    readonly attackSpeedBonus: number;
  };
  readonly tier3A: TowerUpgradeBranch;
  readonly tier3B: TowerUpgradeBranch;
}
