import { defineComponent } from '../types';
import type { EntityId } from '../types';
import type { DamageType, ProjectileType, TargetingMode, StatusEffectDefinition } from '@grimoire/shared';

export interface AttackData {
  range: number;
  damage: number;
  damageType: DamageType;
  attackSpeed: number; // seconds between attacks
  cooldownRemaining: number; // seconds until next attack
  targetId: EntityId | null;
  targetingMode: TargetingMode;
  projectileType: ProjectileType;
  canTargetAir: boolean;
  statusEffect?: StatusEffectDefinition;
  splashRadius?: number;
  pierceCount?: number;
}

export const AttackComponent = defineComponent<AttackData>('Attack');
