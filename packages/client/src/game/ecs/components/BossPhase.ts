import { defineComponent } from '../types';

export interface BossPhaseData {
  bossType: string; // 'balrog', 'basilisk', 'voldemort', etc.
  current:
    // Balrog phases
    | 'WALKING'
    | 'FLIGHT'
    | 'LANDING'
    // Basilisk phases
    | 'TUNNELING'
    | 'BURROWED'
    | 'PETRIFY'
    // Voldemort phases
    | 'TELEPORT'
    | 'HORCRUXES'
    | 'DESPERATE'
    // Shared
    | 'DEAD';
  timer: number; // general-purpose timer for phase logic (ms)
  phaseData: Record<string, unknown>; // phase-specific state
}

export const BossPhaseComponent = defineComponent<BossPhaseData>('BossPhase');
