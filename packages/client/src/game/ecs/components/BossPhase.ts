import { defineComponent } from '../types';

export interface BossPhaseData {
  bossType: string; // 'balrog', etc.
  current: 'WALKING' | 'FLIGHT' | 'LANDING' | 'DEAD';
  timer: number; // general-purpose timer for phase logic (ms)
  phaseData: Record<string, unknown>; // phase-specific state
}

export const BossPhaseComponent = defineComponent<BossPhaseData>('BossPhase');
