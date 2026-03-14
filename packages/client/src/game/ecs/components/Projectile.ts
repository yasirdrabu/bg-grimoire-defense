import { defineComponent } from '../types';
import type { EntityId } from '../types';
import type { DamageType, StatusEffectDefinition } from '@grimoire/shared';

export interface ProjectileData {
  targetId: EntityId;
  speed: number;
  damage: number;
  damageType: DamageType;
  statusEffect?: StatusEffectDefinition;
}

export const ProjectileComponent = defineComponent<ProjectileData>('Projectile');
