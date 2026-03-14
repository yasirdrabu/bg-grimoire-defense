import { defineComponent } from '../types';
import type { EnemyAbilityType } from '@grimoire/shared';

export interface EnemyDataData {
  enemyId: string; // matches key in ENEMIES
  goldReward: number;
  scoreValue: number;
  abilityType: EnemyAbilityType;
  isFlying: boolean;
  isBoss: boolean;
}

export const EnemyDataComponent = defineComponent<EnemyDataData>('EnemyData');
