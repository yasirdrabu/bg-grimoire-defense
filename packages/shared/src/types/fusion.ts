import type { DamageType, StatusEffectDefinition, Universe } from './tower';

export type FusionTier = 'intra' | 'cross' | 'convergence';

export interface FusionRecipe {
  readonly id: string;
  readonly name: string;
  readonly inputs: readonly [string, string]; // tower IDs (order doesn't matter)
  readonly universe: Universe | 'cross' | 'convergence';
  readonly tier: FusionTier;
  readonly essenceCost: number;
  readonly stats: FusionTowerStats;
  readonly mechanic: string;
  readonly hint: string; // cryptic grimoire flavor text
}

export interface FusionTowerStats {
  readonly range: number;
  readonly attackSpeed: number;
  readonly damage: number;
  readonly damageType: DamageType;
  readonly canTargetAir: boolean;
  readonly splashRadius?: number;
  readonly pierceCount?: number;
  readonly statusEffect?: StatusEffectDefinition;
}
