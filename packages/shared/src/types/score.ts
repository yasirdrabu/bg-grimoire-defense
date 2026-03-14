export interface ScoreBreakdown {
  readonly baseScore: number;
  readonly comboScore: number;
  readonly speedScore: number;
  readonly styleScore: number;
  readonly perfectWaveBonus: number;
  readonly nexusHealthBonus: number;
  readonly totalScore: number;
}

export interface StyleAction {
  readonly type: 'fusion_kill' | 'snipe' | 'overkill' | 'first_blood' | 'clean_wave' | 'maze_master';
  readonly points: number;
}

export const STYLE_POINTS: Record<StyleAction['type'], number> = {
  fusion_kill: 50,
  snipe: 25,
  overkill: 10,
  first_blood: 30,
  clean_wave: 100,
  maze_master: 200,
};

export const COMBO_MULTIPLIERS: readonly { readonly threshold: number; readonly multiplier: number }[] = [
  { threshold: 50, multiplier: 10 },
  { threshold: 25, multiplier: 5 },
  { threshold: 10, multiplier: 3 },
  { threshold: 5, multiplier: 2 },
  { threshold: 0, multiplier: 1 },
];

export const STAR_THRESHOLDS = [0, 0.4, 0.7, 0.95] as const;
