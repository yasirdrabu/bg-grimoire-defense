import { defineComponent } from '../types';

export interface TowerDisabledData {
  remainingMs: number;
}

export const TowerDisabledComponent = defineComponent<TowerDisabledData>('TowerDisabled');
