import { defineComponent } from '../types';

export interface MovementData {
  speed: number;
  path: [number, number][];
  pathIndex: number;
  slowMultiplier: number;
  gridVersion: number;
}

export const MovementComponent = defineComponent<MovementData>('Movement');
