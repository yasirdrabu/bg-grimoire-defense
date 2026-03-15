import type { LevelDefinition } from '../types/level';

export const LEVELS: Record<string, LevelDefinition> = {
  act1_level1: {
    id: 'act1_level1',
    name: 'The Shire Falls',
    act: 1,
    levelIndex: 0,
    gridCols: 20,
    gridRows: 15,
    spawns: [[0, 7]],
    nexus: [19, 7],
    startingGold: 650,
    maxNexusHP: 5,
    waves: [
      // Wave 1: 8 orc grunts
      {
        enemies: [{ type: 'orc_grunt', count: 8, interval: 800 }],
        parTime: 30000,
      },
      // Wave 2: 10 orc grunts, faster
      {
        enemies: [{ type: 'orc_grunt', count: 10, interval: 700 }],
        parTime: 28000,
      },
      // Wave 3: mixed orc grunts + goblin runners
      {
        enemies: [
          { type: 'orc_grunt', count: 6, interval: 600 },
          { type: 'goblin_runner', count: 4, interval: 600 },
        ],
        parTime: 25000,
      },
      // Wave 4: larger orc group
      {
        enemies: [{ type: 'orc_grunt', count: 12, interval: 600 }],
        parTime: 25000,
      },
      // Wave 5: mini-boss wave — goblin runners + uruk-hai berserkers
      {
        enemies: [
          { type: 'goblin_runner', count: 8, interval: 700 },
          { type: 'uruk_hai_berserker', count: 2, interval: 700 },
        ],
        parTime: 30000,
      },
      // Wave 6: large orc rush
      {
        enemies: [{ type: 'orc_grunt', count: 15, interval: 500 }],
        parTime: 22000,
      },
      // Wave 7: mixed goblin runners + orc grunts
      {
        enemies: [
          { type: 'goblin_runner', count: 6, interval: 500 },
          { type: 'orc_grunt', count: 6, interval: 500 },
        ],
        parTime: 22000,
      },
      // Wave 8: heavy uruk-hai wave
      {
        enemies: [{ type: 'uruk_hai_berserker', count: 10, interval: 800 }],
        parTime: 35000,
      },
      // Wave 9: mixed with cave trolls
      {
        enemies: [
          { type: 'orc_grunt', count: 8, interval: 600 },
          { type: 'goblin_runner', count: 4, interval: 600 },
          { type: 'cave_troll', count: 2, interval: 600 },
        ],
        parTime: 35000,
      },
      // Wave 10: final wave — full assault + Nazgul shade
      {
        enemies: [
          { type: 'orc_grunt', count: 20, interval: 400 },
          { type: 'uruk_hai_berserker', count: 4, interval: 400 },
          { type: 'nazgul_shade', count: 1, interval: 400 },
        ],
        parTime: 40000,
      },
    ],
  },
};
