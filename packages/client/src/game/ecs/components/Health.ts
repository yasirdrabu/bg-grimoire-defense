import { defineComponent } from '../types';

export interface HealthData {
  current: number;
  max: number;
}

export const HealthComponent = defineComponent<HealthData>('Health');
