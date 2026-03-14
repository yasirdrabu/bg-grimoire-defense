import { defineComponent } from '../types';

export interface ActiveStatusEffect {
  type: 'slow' | 'burn' | 'poison' | 'stun' | 'fear' | 'curse';
  remainingMs: number;
  magnitude: number; // 0-1 for slow, DPS for DoT
}

export interface StatusEffectsData {
  effects: ActiveStatusEffect[];
}

export const StatusEffectsComponent = defineComponent<StatusEffectsData>('StatusEffects');
