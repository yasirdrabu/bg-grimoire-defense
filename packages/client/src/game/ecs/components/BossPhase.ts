import { defineComponent } from '../types';

export interface BossPhaseData {
  bossType: string; // 'balrog', 'basilisk', 'voldemort', 'white_walker_general', 'night_king'
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
    // White Walker General phases
    | 'RESURRECT'
    | 'ICE_WALL'
    // Night King phases
    | 'CORRUPTION'
    | 'DRAGON'
    | 'LAST_STAND'
    // Shared
    | 'DEAD';
  timer: number; // general-purpose timer for phase logic (ms)
  phaseData: Record<string, unknown>; // phase-specific state
}

export const BossPhaseComponent = defineComponent<BossPhaseData>('BossPhase');
