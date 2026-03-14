export type Difficulty = 'story' | 'normal' | 'heroic';

export interface WaveEnemyGroup {
  readonly type: string; // enemy ID
  readonly count: number;
  readonly interval: number; // ms between spawns
}

export interface WaveDefinition {
  readonly enemies: readonly WaveEnemyGroup[];
  readonly parTime: number; // ms — target clear time for speed bonus
}

export interface LevelDefinition {
  readonly id: string;
  readonly name: string;
  readonly act: number;
  readonly levelIndex: number; // 0-based within act
  readonly gridCols: number;
  readonly gridRows: number;
  readonly spawns: readonly [number, number][];
  readonly nexus: [number, number];
  readonly startingGold: number;
  readonly maxNexusHP: number;
  readonly waves: readonly WaveDefinition[];
  readonly boss?: string; // boss enemy ID, if present
}

export interface DifficultyModifiers {
  readonly enemyHPMultiplier: number;
  readonly startingGoldMultiplier: number;
  readonly nexusHP: number;
}

export const DIFFICULTY_MODIFIERS: Record<Difficulty, DifficultyModifiers> = {
  story: { enemyHPMultiplier: 0.7, startingGoldMultiplier: 1.25, nexusHP: 8 },
  normal: { enemyHPMultiplier: 1.0, startingGoldMultiplier: 1.0, nexusHP: 5 },
  heroic: { enemyHPMultiplier: 1.3, startingGoldMultiplier: 0.9, nexusHP: 3 },
};
