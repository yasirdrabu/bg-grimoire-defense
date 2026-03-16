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

  // ─── Act 1, Level 2: "Bree Under Siege" ───────────────────────────────────
  // Theme: Economy tutorial — introduces upgrades and interest
  // HP scale: 1.25x (1 + 1 * 0.25)
  act1_level2: {
    id: 'act1_level2',
    name: 'Bree Under Siege',
    act: 1,
    levelIndex: 1,
    gridCols: 20,
    gridRows: 15,
    spawns: [[0, 7]],
    nexus: [19, 7],
    startingGold: 650,
    maxNexusHP: 5,
    waves: [
      // Wave 1: intro — 8 orc grunts
      {
        enemies: [{ type: 'orc_grunt', count: 8, interval: 800 }],
        parTime: 30000,
      },
      // Wave 2: 10 orc grunts — upgrade prompt fires after this
      {
        enemies: [{ type: 'orc_grunt', count: 10, interval: 750 }],
        parTime: 28000,
      },
      // Wave 3: mixed — orc grunts + goblin runners
      {
        enemies: [
          { type: 'orc_grunt', count: 8, interval: 650 },
          { type: 'goblin_runner', count: 6, interval: 650 },
        ],
        parTime: 25000,
      },
      // Wave 4: breather — fewer, tougher uruk-hai
      {
        enemies: [{ type: 'uruk_hai_berserker', count: 4, interval: 900 }],
        parTime: 30000,
      },
      // Wave 5: escalation — goblin rush + uruk-hai — tutorial complete after this
      {
        enemies: [
          { type: 'goblin_runner', count: 10, interval: 600 },
          { type: 'uruk_hai_berserker', count: 3, interval: 700 },
        ],
        parTime: 28000,
      },
      // Wave 6: large orc push
      {
        enemies: [{ type: 'orc_grunt', count: 18, interval: 500 }],
        parTime: 25000,
      },
      // Wave 7: curveball — fast goblin flood
      {
        enemies: [{ type: 'goblin_runner', count: 20, interval: 450 }],
        parTime: 22000,
      },
      // Wave 8: breather — small uruk-hai squad
      {
        enemies: [{ type: 'uruk_hai_berserker', count: 6, interval: 900 }],
        parTime: 32000,
      },
      // Wave 9: heavy assault — orcs + uruks + cave troll
      {
        enemies: [
          { type: 'orc_grunt', count: 12, interval: 550 },
          { type: 'uruk_hai_berserker', count: 5, interval: 650 },
          { type: 'cave_troll', count: 2, interval: 700 },
        ],
        parTime: 35000,
      },
      // Wave 10: elite — uruks + cave trolls
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 8, interval: 600 },
          { type: 'cave_troll', count: 3, interval: 700 },
        ],
        parTime: 35000,
      },
      // Wave 11: elite — Nazgul shade + escort
      {
        enemies: [
          { type: 'orc_grunt', count: 6, interval: 500 },
          { type: 'nazgul_shade', count: 2, interval: 600 },
        ],
        parTime: 38000,
      },
      // Wave 12: climax — full mixed assault
      {
        enemies: [
          { type: 'orc_grunt', count: 15, interval: 450 },
          { type: 'goblin_runner', count: 10, interval: 450 },
          { type: 'uruk_hai_berserker', count: 5, interval: 500 },
          { type: 'nazgul_shade', count: 1, interval: 500 },
        ],
        parTime: 40000,
      },
    ],
  },

  // ─── Act 1, Level 3: "Weathertop" ─────────────────────────────────────────
  // Theme: Fusion tutorial — requires adjacent tower placement
  // HP scale: 1.5x
  act1_level3: {
    id: 'act1_level3',
    name: 'Weathertop',
    act: 1,
    levelIndex: 2,
    gridCols: 20,
    gridRows: 15,
    spawns: [[0, 7]],
    nexus: [19, 7],
    startingGold: 650,
    maxNexusHP: 5,
    waves: [
      // Wave 1: intro — orcs
      {
        enemies: [{ type: 'orc_grunt', count: 8, interval: 750 }],
        parTime: 30000,
      },
      // Wave 2: intro — orcs + goblins
      {
        enemies: [
          { type: 'orc_grunt', count: 6, interval: 700 },
          { type: 'goblin_runner', count: 5, interval: 700 },
        ],
        parTime: 27000,
      },
      // Wave 3: mixed with first uruk-hai
      {
        enemies: [
          { type: 'orc_grunt', count: 8, interval: 600 },
          { type: 'uruk_hai_berserker', count: 4, interval: 650 },
        ],
        parTime: 28000,
      },
      // Wave 4: breather — fewer, cave troll debut
      {
        enemies: [
          { type: 'orc_grunt', count: 5, interval: 700 },
          { type: 'cave_troll', count: 2, interval: 800 },
        ],
        parTime: 30000,
      },
      // Wave 5: escalation — uruk-hai surge
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 8, interval: 600 },
          { type: 'goblin_runner', count: 8, interval: 550 },
        ],
        parTime: 28000,
      },
      // Wave 6: heavy uruk-hai + cave trolls
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 10, interval: 600 },
          { type: 'cave_troll', count: 3, interval: 700 },
        ],
        parTime: 32000,
      },
      // Wave 7: curveball — Nazgul shade + fast goblins
      {
        enemies: [
          { type: 'goblin_runner', count: 15, interval: 450 },
          { type: 'nazgul_shade', count: 1, interval: 600 },
        ],
        parTime: 25000,
      },
      // Wave 8: breather — medium uruk group
      {
        enemies: [{ type: 'uruk_hai_berserker', count: 7, interval: 700 }],
        parTime: 32000,
      },
      // Wave 9: heavy assault — all types
      {
        enemies: [
          { type: 'orc_grunt', count: 12, interval: 500 },
          { type: 'uruk_hai_berserker', count: 6, interval: 550 },
          { type: 'cave_troll', count: 3, interval: 650 },
        ],
        parTime: 35000,
      },
      // Wave 10: elite — double cave trolls + uruks
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 10, interval: 550 },
          { type: 'cave_troll', count: 5, interval: 650 },
        ],
        parTime: 38000,
      },
      // Wave 11: elite — Nazgul shades + heavy escort
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 8, interval: 550 },
          { type: 'nazgul_shade', count: 3, interval: 600 },
        ],
        parTime: 38000,
      },
      // Wave 12: climax — full mixed with cave trolls + Nazgul
      {
        enemies: [
          { type: 'orc_grunt', count: 12, interval: 450 },
          { type: 'uruk_hai_berserker', count: 8, interval: 500 },
          { type: 'cave_troll', count: 4, interval: 600 },
          { type: 'nazgul_shade', count: 2, interval: 600 },
        ],
        parTime: 40000,
      },
    ],
  },

  // ─── Act 1, Level 4: "Helm's Deep Approach" ───────────────────────────────
  // Theme: Escalation with split spawns — two spawn points
  // HP scale: 1.75x
  act1_level4: {
    id: 'act1_level4',
    name: "Helm's Deep Approach",
    act: 1,
    levelIndex: 3,
    gridCols: 22,
    gridRows: 15,
    spawns: [[0, 7], [0, 3]],
    nexus: [21, 7],
    startingGold: 650,
    maxNexusHP: 5,
    waves: [
      // Wave 1: intro — single spawn, orcs
      {
        enemies: [{ type: 'orc_grunt', count: 10, interval: 750 }],
        parTime: 30000,
      },
      // Wave 2: split intro — goblins from both spawns
      {
        enemies: [
          { type: 'orc_grunt', count: 8, interval: 700 },
          { type: 'goblin_runner', count: 6, interval: 650 },
        ],
        parTime: 28000,
      },
      // Wave 3: mixed heavy — uruks + goblins
      {
        enemies: [
          { type: 'orc_grunt', count: 10, interval: 600 },
          { type: 'uruk_hai_berserker', count: 5, interval: 650 },
          { type: 'goblin_runner', count: 5, interval: 600 },
        ],
        parTime: 28000,
      },
      // Wave 4: breather — cave troll push
      {
        enemies: [
          { type: 'cave_troll', count: 4, interval: 800 },
          { type: 'orc_grunt', count: 6, interval: 700 },
        ],
        parTime: 32000,
      },
      // Wave 5: escalation — heavy mixed
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 10, interval: 600 },
          { type: 'cave_troll', count: 3, interval: 700 },
          { type: 'goblin_runner', count: 8, interval: 550 },
        ],
        parTime: 30000,
      },
      // Wave 6: goblin flood from both spawns
      {
        enemies: [
          { type: 'goblin_runner', count: 25, interval: 400 },
          { type: 'orc_grunt', count: 10, interval: 500 },
        ],
        parTime: 25000,
      },
      // Wave 7: curveball — Nazgul + uruk-hai split
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 12, interval: 550 },
          { type: 'nazgul_shade', count: 2, interval: 600 },
        ],
        parTime: 30000,
      },
      // Wave 8: breather — medium cave troll squad
      {
        enemies: [{ type: 'cave_troll', count: 6, interval: 800 }],
        parTime: 35000,
      },
      // Wave 9: heavy assault — all types, large counts
      {
        enemies: [
          { type: 'orc_grunt', count: 15, interval: 500 },
          { type: 'uruk_hai_berserker', count: 8, interval: 550 },
          { type: 'cave_troll', count: 4, interval: 650 },
          { type: 'goblin_runner', count: 10, interval: 500 },
        ],
        parTime: 35000,
      },
      // Wave 10: full assault — 30+ enemies
      {
        enemies: [
          { type: 'orc_grunt', count: 20, interval: 450 },
          { type: 'uruk_hai_berserker', count: 10, interval: 500 },
          { type: 'cave_troll', count: 5, interval: 600 },
        ],
        parTime: 38000,
      },
      // Wave 11: elite — Nazgul + heavy escort
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 10, interval: 500 },
          { type: 'cave_troll', count: 5, interval: 600 },
          { type: 'nazgul_shade', count: 3, interval: 600 },
        ],
        parTime: 40000,
      },
      // Wave 12: climax push — heavy wave
      {
        enemies: [
          { type: 'orc_grunt', count: 18, interval: 450 },
          { type: 'uruk_hai_berserker', count: 12, interval: 500 },
          { type: 'cave_troll', count: 6, interval: 600 },
          { type: 'nazgul_shade', count: 2, interval: 600 },
        ],
        parTime: 40000,
      },
      // Wave 13: elite — cave troll + Nazgul flood
      {
        enemies: [
          { type: 'cave_troll', count: 8, interval: 600 },
          { type: 'nazgul_shade', count: 4, interval: 600 },
          { type: 'uruk_hai_berserker', count: 8, interval: 500 },
        ],
        parTime: 40000,
      },
      // Wave 14: final — maximum assault
      {
        enemies: [
          { type: 'orc_grunt', count: 20, interval: 400 },
          { type: 'goblin_runner', count: 15, interval: 400 },
          { type: 'uruk_hai_berserker', count: 12, interval: 450 },
          { type: 'cave_troll', count: 6, interval: 550 },
          { type: 'nazgul_shade', count: 3, interval: 550 },
        ],
        parTime: 42000,
      },
    ],
  },

  // ─── Act 1, Level 5: "The Bridge of Khazad-dûm" ──────────────────────────
  // Theme: Climax level — most difficult, ends with Balrog boss
  // HP scale: 2x
  act1_level5: {
    id: 'act1_level5',
    name: 'The Bridge of Khazad-dûm',
    act: 1,
    levelIndex: 4,
    gridCols: 24,
    gridRows: 15,
    spawns: [[0, 7]],
    nexus: [23, 7],
    startingGold: 650,
    maxNexusHP: 5,
    boss: 'balrog',
    waves: [
      // Wave 1: intro — heavy orcs (already 2x HP)
      {
        enemies: [{ type: 'orc_grunt', count: 10, interval: 750 }],
        parTime: 30000,
      },
      // Wave 2: mixed — orcs + goblins
      {
        enemies: [
          { type: 'orc_grunt', count: 10, interval: 700 },
          { type: 'goblin_runner', count: 8, interval: 650 },
        ],
        parTime: 28000,
      },
      // Wave 3: first uruks
      {
        enemies: [
          { type: 'orc_grunt', count: 10, interval: 600 },
          { type: 'uruk_hai_berserker', count: 6, interval: 650 },
          { type: 'goblin_runner', count: 6, interval: 600 },
        ],
        parTime: 28000,
      },
      // Wave 4: breather — cave trolls
      {
        enemies: [
          { type: 'cave_troll', count: 4, interval: 800 },
          { type: 'orc_grunt', count: 8, interval: 700 },
        ],
        parTime: 32000,
      },
      // Wave 5: escalation — uruks + cave trolls
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 12, interval: 600 },
          { type: 'cave_troll', count: 4, interval: 700 },
        ],
        parTime: 32000,
      },
      // Wave 6: Nazgul debut + flood
      {
        enemies: [
          { type: 'goblin_runner', count: 20, interval: 450 },
          { type: 'nazgul_shade', count: 2, interval: 600 },
        ],
        parTime: 28000,
      },
      // Wave 7: curveball — Nazgul + heavy escort
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 10, interval: 550 },
          { type: 'nazgul_shade', count: 3, interval: 600 },
          { type: 'cave_troll', count: 3, interval: 700 },
        ],
        parTime: 32000,
      },
      // Wave 8: breather — medium cave troll + uruks
      {
        enemies: [
          { type: 'cave_troll', count: 5, interval: 800 },
          { type: 'uruk_hai_berserker', count: 5, interval: 700 },
        ],
        parTime: 35000,
      },
      // Wave 9: heavy assault — 25+ enemies
      {
        enemies: [
          { type: 'orc_grunt', count: 15, interval: 500 },
          { type: 'uruk_hai_berserker', count: 10, interval: 550 },
          { type: 'cave_troll', count: 5, interval: 650 },
          { type: 'goblin_runner', count: 8, interval: 500 },
        ],
        parTime: 36000,
      },
      // Wave 10: full assault — 30+ enemies
      {
        enemies: [
          { type: 'orc_grunt', count: 20, interval: 450 },
          { type: 'uruk_hai_berserker', count: 12, interval: 500 },
          { type: 'cave_troll', count: 6, interval: 600 },
          { type: 'nazgul_shade', count: 2, interval: 600 },
        ],
        parTime: 38000,
      },
      // Wave 11: elite — Nazgul + heavy cave trolls
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 12, interval: 500 },
          { type: 'cave_troll', count: 8, interval: 600 },
          { type: 'nazgul_shade', count: 4, interval: 600 },
        ],
        parTime: 40000,
      },
      // Wave 12: pre-boss surge — maximum regular enemies
      {
        enemies: [
          { type: 'orc_grunt', count: 20, interval: 400 },
          { type: 'uruk_hai_berserker', count: 15, interval: 450 },
          { type: 'cave_troll', count: 8, interval: 550 },
          { type: 'nazgul_shade', count: 5, interval: 550 },
        ],
        parTime: 42000,
      },
      // Wave 13: penultimate — Nazgul flood
      {
        enemies: [
          { type: 'nazgul_shade', count: 8, interval: 550 },
          { type: 'uruk_hai_berserker', count: 10, interval: 500 },
          { type: 'cave_troll', count: 6, interval: 600 },
        ],
        parTime: 40000,
      },
      // Wave 14: boss pre-wave — clear the path for the Balrog
      {
        enemies: [
          { type: 'orc_grunt', count: 15, interval: 400 },
          { type: 'goblin_runner', count: 15, interval: 400 },
          { type: 'uruk_hai_berserker', count: 10, interval: 450 },
          { type: 'nazgul_shade', count: 4, interval: 550 },
        ],
        parTime: 40000,
      },
      // Wave 15: BOSS — Balrog with heavy escort
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 8, interval: 500 },
          { type: 'cave_troll', count: 4, interval: 600 },
          { type: 'balrog', count: 1, interval: 1000 },
        ],
        parTime: 45000,
      },
    ],
  },
};
