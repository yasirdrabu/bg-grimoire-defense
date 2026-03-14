import { defineComponent } from '../types';

export interface TowerDataData {
  towerId: string; // matches key in TOWERS
  tier: 1 | 2 | 3;
  branch?: 'A' | 'B'; // set at tier 3
  totalInvestment: number; // base cost + upgrade costs (for sell refund calc)
  isFusion: boolean;
}

export const TowerDataComponent = defineComponent<TowerDataData>('TowerData');
