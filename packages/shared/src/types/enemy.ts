import type { Universe } from './tower';

export type EnemyAbilityType =
  | 'none'
  | 'enrage'
  | 'tower_smash'
  | 'fear_aura'
  | 'flying'
  | 'tunneling'
  | 'petrify'
  | 'teleport'
  | 'resurrect'
  | 'ice_wall'
  | 'corruption'
  | 'boss';

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly universe: Universe;
  readonly baseHP: number;
  readonly speed: number; // grid cells per second
  readonly goldReward: number;
  readonly scoreValue: number;
  readonly abilityType: EnemyAbilityType;
  readonly abilityDescription?: string;
  readonly isFlying: boolean;
  readonly isBoss: boolean;
  readonly bossPhases?: number;
  readonly bossEssenceReward?: number;
}

/** Computes scaled HP for a given level */
export function getScaledHP(baseHP: number, act: number, levelIndexWithinAct: number): number {
  const actMultiplier = Math.pow(2, act - 1); // 1x, 2x, 4x
  const levelMultiplier = 1 + levelIndexWithinAct * 0.25;
  return Math.round(baseHP * actMultiplier * levelMultiplier);
}
