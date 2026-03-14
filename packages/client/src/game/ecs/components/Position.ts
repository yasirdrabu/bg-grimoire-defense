import { defineComponent } from '../types';

export interface PositionData {
  gridX: number;
  gridY: number;
}

export const PositionComponent = defineComponent<PositionData>('Position');
