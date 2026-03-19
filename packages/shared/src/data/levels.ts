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

  // ─── Act 2, Level 7: "The Forbidden Forest" ───────────────────────────────
  // Theme: Act 2 intro — Wizarding enemies only, HP 2x baseline
  // HP scale: 2x base (act 2, levelIndex 0)
  act2_level7: {
    id: 'act2_level7',
    name: 'The Forbidden Forest',
    act: 2,
    levelIndex: 0,
    gridCols: 22,
    gridRows: 15,
    spawns: [[0, 7]],
    nexus: [21, 7],
    startingGold: 800,
    maxNexusHP: 5,
    waves: [
      // Wave 1: intro — Death Eaters approach
      {
        enemies: [{ type: 'death_eater', count: 6, interval: 900 }],
        parTime: 32000,
      },
      // Wave 2: Dark Wizards appear
      {
        enemies: [
          { type: 'death_eater', count: 6, interval: 850 },
          { type: 'dark_wizard', count: 3, interval: 900 },
        ],
        parTime: 30000,
      },
      // Wave 3: Acromantula debut
      {
        enemies: [
          { type: 'death_eater', count: 5, interval: 800 },
          { type: 'acromantula', count: 3, interval: 1000 },
        ],
        parTime: 32000,
      },
      // Wave 4: Dementor introduction (flying threat)
      {
        enemies: [
          { type: 'dementor', count: 4, interval: 800 },
          { type: 'dark_wizard', count: 4, interval: 850 },
        ],
        parTime: 30000,
      },
      // Wave 5: mixed — escalation
      {
        enemies: [
          { type: 'death_eater', count: 8, interval: 700 },
          { type: 'acromantula', count: 4, interval: 900 },
          { type: 'dementor', count: 3, interval: 800 },
        ],
        parTime: 32000,
      },
      // Wave 6: Mountain Troll debut
      {
        enemies: [
          { type: 'troll_hp', count: 2, interval: 1000 },
          { type: 'death_eater', count: 6, interval: 750 },
        ],
        parTime: 35000,
      },
      // Wave 7: mixed heavy
      {
        enemies: [
          { type: 'dark_wizard', count: 6, interval: 750 },
          { type: 'acromantula', count: 4, interval: 900 },
          { type: 'dementor', count: 4, interval: 800 },
        ],
        parTime: 32000,
      },
      // Wave 8: dementor flood + death eaters
      {
        enemies: [
          { type: 'dementor', count: 8, interval: 700 },
          { type: 'death_eater', count: 8, interval: 650 },
        ],
        parTime: 28000,
      },
      // Wave 9: heavy assault
      {
        enemies: [
          { type: 'death_eater', count: 10, interval: 650 },
          { type: 'dark_wizard', count: 6, interval: 750 },
          { type: 'acromantula', count: 5, interval: 900 },
          { type: 'troll_hp', count: 2, interval: 1000 },
        ],
        parTime: 38000,
      },
      // Wave 10: troll surge
      {
        enemies: [
          { type: 'troll_hp', count: 4, interval: 1000 },
          { type: 'death_eater', count: 8, interval: 700 },
        ],
        parTime: 36000,
      },
      // Wave 11: full mixed — all types
      {
        enemies: [
          { type: 'death_eater', count: 10, interval: 600 },
          { type: 'dark_wizard', count: 6, interval: 700 },
          { type: 'acromantula', count: 6, interval: 850 },
          { type: 'dementor', count: 5, interval: 750 },
        ],
        parTime: 40000,
      },
      // Wave 12: climax pre-final
      {
        enemies: [
          { type: 'troll_hp', count: 4, interval: 1000 },
          { type: 'acromantula', count: 8, interval: 800 },
          { type: 'dark_wizard', count: 6, interval: 700 },
        ],
        parTime: 40000,
      },
      // Wave 13: final — maximum forest assault
      {
        enemies: [
          { type: 'death_eater', count: 12, interval: 550 },
          { type: 'dark_wizard', count: 8, interval: 700 },
          { type: 'acromantula', count: 6, interval: 800 },
          { type: 'dementor', count: 6, interval: 700 },
          { type: 'troll_hp', count: 3, interval: 1000 },
        ],
        parTime: 45000,
      },
      // Wave 14: endgame flood
      {
        enemies: [
          { type: 'death_eater', count: 14, interval: 500 },
          { type: 'dementor', count: 8, interval: 650 },
          { type: 'troll_hp', count: 4, interval: 950 },
        ],
        parTime: 42000,
      },
      // Wave 15: final wave — full forest assault
      {
        enemies: [
          { type: 'death_eater', count: 15, interval: 500 },
          { type: 'dark_wizard', count: 10, interval: 650 },
          { type: 'acromantula', count: 8, interval: 750 },
          { type: 'dementor', count: 8, interval: 650 },
          { type: 'troll_hp', count: 4, interval: 950 },
        ],
        parTime: 50000,
      },
    ],
  },

  // ─── Act 2, Level 8: "Hogsmeade Village" ──────────────────────────────────
  // Theme: Escalation — dual spawns stress test
  // HP scale: 2.25x (act 2, levelIndex 1)
  act2_level8: {
    id: 'act2_level8',
    name: 'Hogsmeade Village',
    act: 2,
    levelIndex: 1,
    gridCols: 22,
    gridRows: 15,
    spawns: [[0, 7], [0, 3]],
    nexus: [21, 7],
    startingGold: 800,
    maxNexusHP: 5,
    waves: [
      // Wave 1: Death Eater vanguard
      {
        enemies: [{ type: 'death_eater', count: 8, interval: 850 }],
        parTime: 32000,
      },
      // Wave 2: split — dark wizards + dementors
      {
        enemies: [
          { type: 'dark_wizard', count: 6, interval: 800 },
          { type: 'dementor', count: 4, interval: 800 },
        ],
        parTime: 30000,
      },
      // Wave 3: mixed escalation
      {
        enemies: [
          { type: 'death_eater', count: 8, interval: 700 },
          { type: 'acromantula', count: 5, interval: 900 },
          { type: 'dark_wizard', count: 4, interval: 800 },
        ],
        parTime: 32000,
      },
      // Wave 4: troll push
      {
        enemies: [
          { type: 'troll_hp', count: 3, interval: 1000 },
          { type: 'death_eater', count: 6, interval: 750 },
        ],
        parTime: 36000,
      },
      // Wave 5: dementor flood
      {
        enemies: [
          { type: 'dementor', count: 10, interval: 650 },
          { type: 'dark_wizard', count: 5, interval: 750 },
        ],
        parTime: 30000,
      },
      // Wave 6: acromantula rush
      {
        enemies: [
          { type: 'acromantula', count: 8, interval: 800 },
          { type: 'death_eater', count: 10, interval: 600 },
        ],
        parTime: 32000,
      },
      // Wave 7: heavy mixed
      {
        enemies: [
          { type: 'dark_wizard', count: 8, interval: 700 },
          { type: 'dementor', count: 6, interval: 700 },
          { type: 'troll_hp', count: 3, interval: 950 },
        ],
        parTime: 36000,
      },
      // Wave 8: death eater storm
      {
        enemies: [
          { type: 'death_eater', count: 15, interval: 550 },
          { type: 'acromantula', count: 5, interval: 850 },
        ],
        parTime: 32000,
      },
      // Wave 9: all types — max pressure
      {
        enemies: [
          { type: 'death_eater', count: 10, interval: 600 },
          { type: 'dark_wizard', count: 8, interval: 700 },
          { type: 'dementor', count: 8, interval: 650 },
          { type: 'acromantula', count: 6, interval: 800 },
          { type: 'troll_hp', count: 3, interval: 950 },
        ],
        parTime: 42000,
      },
      // Wave 10: breather — moderate troll push
      {
        enemies: [
          { type: 'troll_hp', count: 5, interval: 1000 },
          { type: 'death_eater', count: 8, interval: 700 },
        ],
        parTime: 38000,
      },
      // Wave 11: dementor + dark wizard coordinated assault
      {
        enemies: [
          { type: 'dementor', count: 10, interval: 600 },
          { type: 'dark_wizard', count: 10, interval: 650 },
        ],
        parTime: 34000,
      },
      // Wave 12: climax — all types at scale
      {
        enemies: [
          { type: 'death_eater', count: 12, interval: 550 },
          { type: 'dark_wizard', count: 8, interval: 650 },
          { type: 'acromantula', count: 8, interval: 800 },
          { type: 'dementor', count: 8, interval: 650 },
          { type: 'troll_hp', count: 4, interval: 950 },
        ],
        parTime: 45000,
      },
      // Wave 13: pre-climax surge
      {
        enemies: [
          { type: 'death_eater', count: 15, interval: 500 },
          { type: 'acromantula', count: 10, interval: 750 },
          { type: 'troll_hp', count: 5, interval: 950 },
        ],
        parTime: 44000,
      },
      // Wave 14: dementor + dark wizard finale
      {
        enemies: [
          { type: 'dementor', count: 12, interval: 600 },
          { type: 'dark_wizard', count: 12, interval: 600 },
          { type: 'death_eater', count: 10, interval: 550 },
        ],
        parTime: 42000,
      },
      // Wave 15: maximum assault
      {
        enemies: [
          { type: 'death_eater', count: 16, interval: 500 },
          { type: 'dark_wizard', count: 10, interval: 600 },
          { type: 'acromantula', count: 10, interval: 750 },
          { type: 'dementor', count: 10, interval: 600 },
          { type: 'troll_hp', count: 5, interval: 950 },
        ],
        parTime: 50000,
      },
      // Wave 16: final wave — village falls
      {
        enemies: [
          { type: 'death_eater', count: 18, interval: 450 },
          { type: 'dark_wizard', count: 12, interval: 550 },
          { type: 'acromantula', count: 10, interval: 700 },
          { type: 'dementor', count: 12, interval: 550 },
          { type: 'troll_hp', count: 6, interval: 900 },
        ],
        parTime: 55000,
      },
    ],
  },

  // ─── Act 2, Level 9: "The Chamber" ────────────────────────────────────────
  // Theme: Heavy Acromantula + Troll presence — spawn mechanics pressure
  // HP scale: 2.5x (act 2, levelIndex 2)
  act2_level9: {
    id: 'act2_level9',
    name: 'The Chamber of Secrets',
    act: 2,
    levelIndex: 2,
    gridCols: 22,
    gridRows: 15,
    spawns: [[0, 7], [0, 3]],
    nexus: [21, 7],
    startingGold: 800,
    maxNexusHP: 5,
    waves: [
      // Wave 1: acromantula vanguard
      {
        enemies: [{ type: 'acromantula', count: 5, interval: 900 }],
        parTime: 32000,
      },
      // Wave 2: trolls intro
      {
        enemies: [
          { type: 'troll_hp', count: 3, interval: 1000 },
          { type: 'acromantula', count: 4, interval: 900 },
        ],
        parTime: 35000,
      },
      // Wave 3: spiderling wave (spawn-on-death trigger)
      {
        enemies: [
          { type: 'acromantula', count: 8, interval: 850 },
          { type: 'death_eater', count: 6, interval: 750 },
        ],
        parTime: 35000,
      },
      // Wave 4: troll + dark wizard push
      {
        enemies: [
          { type: 'troll_hp', count: 5, interval: 950 },
          { type: 'dark_wizard', count: 6, interval: 750 },
        ],
        parTime: 38000,
      },
      // Wave 5: escalation — acromantula + trolls
      {
        enemies: [
          { type: 'acromantula', count: 10, interval: 800 },
          { type: 'troll_hp', count: 4, interval: 950 },
          { type: 'death_eater', count: 6, interval: 700 },
        ],
        parTime: 40000,
      },
      // Wave 6: dementor + dark wizard curveball
      {
        enemies: [
          { type: 'dementor', count: 8, interval: 700 },
          { type: 'dark_wizard', count: 8, interval: 700 },
        ],
        parTime: 34000,
      },
      // Wave 7: heavy acromantula flood
      {
        enemies: [
          { type: 'acromantula', count: 14, interval: 750 },
          { type: 'death_eater', count: 8, interval: 650 },
        ],
        parTime: 38000,
      },
      // Wave 8: troll horde
      {
        enemies: [
          { type: 'troll_hp', count: 8, interval: 950 },
          { type: 'acromantula', count: 6, interval: 850 },
        ],
        parTime: 42000,
      },
      // Wave 9: all types — high pressure
      {
        enemies: [
          { type: 'acromantula', count: 10, interval: 750 },
          { type: 'troll_hp', count: 5, interval: 950 },
          { type: 'dark_wizard', count: 8, interval: 700 },
          { type: 'dementor', count: 6, interval: 700 },
        ],
        parTime: 44000,
      },
      // Wave 10: breather — death eater push
      {
        enemies: [
          { type: 'death_eater', count: 14, interval: 600 },
          { type: 'dark_wizard', count: 6, interval: 700 },
        ],
        parTime: 36000,
      },
      // Wave 11: acromantula + troll surge
      {
        enemies: [
          { type: 'acromantula', count: 14, interval: 700 },
          { type: 'troll_hp', count: 7, interval: 900 },
        ],
        parTime: 44000,
      },
      // Wave 12: climax — all types at max
      {
        enemies: [
          { type: 'death_eater', count: 12, interval: 550 },
          { type: 'dark_wizard', count: 10, interval: 650 },
          { type: 'acromantula', count: 12, interval: 750 },
          { type: 'dementor', count: 8, interval: 650 },
          { type: 'troll_hp', count: 6, interval: 900 },
        ],
        parTime: 50000,
      },
      // Wave 13: pre-climax — huge acromantula + troll push
      {
        enemies: [
          { type: 'acromantula', count: 16, interval: 700 },
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'death_eater', count: 10, interval: 600 },
        ],
        parTime: 48000,
      },
      // Wave 14: dementor + dark wizard surge
      {
        enemies: [
          { type: 'dementor', count: 12, interval: 600 },
          { type: 'dark_wizard', count: 12, interval: 600 },
          { type: 'acromantula', count: 8, interval: 750 },
        ],
        parTime: 44000,
      },
      // Wave 15: maximum acromantula siege
      {
        enemies: [
          { type: 'acromantula', count: 18, interval: 650 },
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'death_eater', count: 12, interval: 550 },
          { type: 'dementor', count: 8, interval: 650 },
        ],
        parTime: 52000,
      },
      // Wave 16: final surge
      {
        enemies: [
          { type: 'acromantula', count: 20, interval: 600 },
          { type: 'troll_hp', count: 10, interval: 850 },
          { type: 'dark_wizard', count: 12, interval: 600 },
          { type: 'dementor', count: 10, interval: 600 },
        ],
        parTime: 56000,
      },
      // Wave 17: final wall
      {
        enemies: [
          { type: 'death_eater', count: 18, interval: 500 },
          { type: 'acromantula', count: 16, interval: 650 },
          { type: 'troll_hp', count: 10, interval: 850 },
          { type: 'dark_wizard', count: 12, interval: 600 },
          { type: 'dementor', count: 10, interval: 600 },
        ],
        parTime: 60000,
      },
    ],
  },

  // ─── Act 2, Level 10: "Azkaban" ───────────────────────────────────────────
  // Theme: Dementor-heavy — attack speed drain punishes weak towers
  // HP scale: 2.75x (act 2, levelIndex 3)
  act2_level10: {
    id: 'act2_level10',
    name: 'Azkaban',
    act: 2,
    levelIndex: 3,
    gridCols: 22,
    gridRows: 15,
    spawns: [[0, 7], [0, 3]],
    nexus: [21, 7],
    startingGold: 800,
    maxNexusHP: 5,
    waves: [
      // Wave 1: dementor flood opener
      {
        enemies: [{ type: 'dementor', count: 8, interval: 750 }],
        parTime: 28000,
      },
      // Wave 2: death eater + dementor combined
      {
        enemies: [
          { type: 'dementor', count: 8, interval: 700 },
          { type: 'death_eater', count: 8, interval: 700 },
        ],
        parTime: 30000,
      },
      // Wave 3: dark wizard teleport disruption
      {
        enemies: [
          { type: 'dementor', count: 6, interval: 700 },
          { type: 'dark_wizard', count: 6, interval: 750 },
        ],
        parTime: 30000,
      },
      // Wave 4: troll + dementor aura stack
      {
        enemies: [
          { type: 'troll_hp', count: 4, interval: 1000 },
          { type: 'dementor', count: 8, interval: 700 },
        ],
        parTime: 36000,
      },
      // Wave 5: acromantula + death eater push
      {
        enemies: [
          { type: 'acromantula', count: 8, interval: 850 },
          { type: 'death_eater', count: 10, interval: 650 },
        ],
        parTime: 36000,
      },
      // Wave 6: mega dementor flood
      {
        enemies: [
          { type: 'dementor', count: 16, interval: 600 },
          { type: 'dark_wizard', count: 6, interval: 700 },
        ],
        parTime: 32000,
      },
      // Wave 7: heavy combined assault
      {
        enemies: [
          { type: 'dementor', count: 10, interval: 650 },
          { type: 'death_eater', count: 10, interval: 600 },
          { type: 'troll_hp', count: 4, interval: 950 },
        ],
        parTime: 40000,
      },
      // Wave 8: dark wizard + acromantula sneak
      {
        enemies: [
          { type: 'dark_wizard', count: 10, interval: 650 },
          { type: 'acromantula', count: 8, interval: 800 },
        ],
        parTime: 38000,
      },
      // Wave 9: dementor siege
      {
        enemies: [
          { type: 'dementor', count: 16, interval: 550 },
          { type: 'troll_hp', count: 6, interval: 950 },
          { type: 'death_eater', count: 10, interval: 600 },
        ],
        parTime: 44000,
      },
      // Wave 10: full mixed
      {
        enemies: [
          { type: 'dementor', count: 12, interval: 600 },
          { type: 'death_eater', count: 12, interval: 600 },
          { type: 'dark_wizard', count: 8, interval: 700 },
          { type: 'acromantula', count: 8, interval: 800 },
          { type: 'troll_hp', count: 4, interval: 950 },
        ],
        parTime: 48000,
      },
      // Wave 11: troll + dementor aura stack — max drain
      {
        enemies: [
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'dementor', count: 14, interval: 600 },
        ],
        parTime: 44000,
      },
      // Wave 12: acromantula + dark wizard charge
      {
        enemies: [
          { type: 'acromantula', count: 14, interval: 750 },
          { type: 'dark_wizard', count: 12, interval: 650 },
          { type: 'death_eater', count: 10, interval: 600 },
        ],
        parTime: 46000,
      },
      // Wave 13: dementor overwhelming flood
      {
        enemies: [
          { type: 'dementor', count: 20, interval: 550 },
          { type: 'death_eater', count: 12, interval: 600 },
        ],
        parTime: 40000,
      },
      // Wave 14: all types — near maximum
      {
        enemies: [
          { type: 'dementor', count: 16, interval: 550 },
          { type: 'death_eater', count: 14, interval: 550 },
          { type: 'dark_wizard', count: 10, interval: 650 },
          { type: 'acromantula', count: 10, interval: 750 },
          { type: 'troll_hp', count: 6, interval: 900 },
        ],
        parTime: 55000,
      },
      // Wave 15: climax — Azkaban breaks
      {
        enemies: [
          { type: 'dementor', count: 20, interval: 500 },
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'dark_wizard', count: 12, interval: 600 },
          { type: 'acromantula', count: 12, interval: 700 },
        ],
        parTime: 55000,
      },
      // Wave 16: pre-final
      {
        enemies: [
          { type: 'dementor', count: 22, interval: 500 },
          { type: 'death_eater', count: 16, interval: 550 },
          { type: 'troll_hp', count: 8, interval: 850 },
        ],
        parTime: 54000,
      },
      // Wave 17: final wall
      {
        enemies: [
          { type: 'dementor', count: 24, interval: 480 },
          { type: 'death_eater', count: 16, interval: 550 },
          { type: 'dark_wizard', count: 14, interval: 600 },
          { type: 'acromantula', count: 12, interval: 700 },
          { type: 'troll_hp', count: 8, interval: 850 },
        ],
        parTime: 62000,
      },
      // Wave 18: Azkaban falls
      {
        enemies: [
          { type: 'dementor', count: 28, interval: 450 },
          { type: 'troll_hp', count: 10, interval: 850 },
          { type: 'dark_wizard', count: 16, interval: 600 },
          { type: 'death_eater', count: 18, interval: 500 },
          { type: 'acromantula', count: 14, interval: 700 },
        ],
        parTime: 68000,
      },
    ],
  },

  // ─── Act 2, Level 11: "The Shrieking Shack" ───────────────────────────────
  // Theme: Boss level — Basilisk as final wave
  // HP scale: 3x (act 2, levelIndex 4)
  act2_level11: {
    id: 'act2_level11',
    name: 'The Shrieking Shack',
    act: 2,
    levelIndex: 4,
    gridCols: 22,
    gridRows: 15,
    spawns: [[0, 7], [0, 3]],
    nexus: [21, 7],
    startingGold: 800,
    maxNexusHP: 5,
    boss: 'basilisk',
    waves: [
      // Wave 1: death eater vanguard
      {
        enemies: [{ type: 'death_eater', count: 8, interval: 800 }],
        parTime: 32000,
      },
      // Wave 2: dementor + dark wizard
      {
        enemies: [
          { type: 'dementor', count: 8, interval: 700 },
          { type: 'dark_wizard', count: 6, interval: 750 },
        ],
        parTime: 32000,
      },
      // Wave 3: acromantula + trolls
      {
        enemies: [
          { type: 'acromantula', count: 8, interval: 850 },
          { type: 'troll_hp', count: 4, interval: 950 },
        ],
        parTime: 36000,
      },
      // Wave 4: mixed heavy
      {
        enemies: [
          { type: 'death_eater', count: 10, interval: 650 },
          { type: 'dementor', count: 8, interval: 700 },
          { type: 'dark_wizard', count: 6, interval: 750 },
        ],
        parTime: 38000,
      },
      // Wave 5: troll surge
      {
        enemies: [
          { type: 'troll_hp', count: 6, interval: 950 },
          { type: 'acromantula', count: 8, interval: 850 },
          { type: 'death_eater', count: 8, interval: 700 },
        ],
        parTime: 40000,
      },
      // Wave 6: dementor + acromantula flood
      {
        enemies: [
          { type: 'dementor', count: 12, interval: 650 },
          { type: 'acromantula', count: 12, interval: 800 },
        ],
        parTime: 38000,
      },
      // Wave 7: full mixed
      {
        enemies: [
          { type: 'death_eater', count: 12, interval: 600 },
          { type: 'dark_wizard', count: 10, interval: 650 },
          { type: 'troll_hp', count: 6, interval: 950 },
          { type: 'dementor', count: 10, interval: 650 },
        ],
        parTime: 46000,
      },
      // Wave 8: acromantula horde
      {
        enemies: [
          { type: 'acromantula', count: 16, interval: 750 },
          { type: 'death_eater', count: 10, interval: 650 },
        ],
        parTime: 42000,
      },
      // Wave 9: heavy assault
      {
        enemies: [
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'dark_wizard', count: 12, interval: 650 },
          { type: 'dementor', count: 12, interval: 650 },
        ],
        parTime: 48000,
      },
      // Wave 10: all-out assault
      {
        enemies: [
          { type: 'death_eater', count: 14, interval: 580 },
          { type: 'dark_wizard', count: 12, interval: 650 },
          { type: 'acromantula', count: 12, interval: 750 },
          { type: 'dementor', count: 12, interval: 650 },
          { type: 'troll_hp', count: 6, interval: 900 },
        ],
        parTime: 55000,
      },
      // Wave 11: pre-boss heavy
      {
        enemies: [
          { type: 'troll_hp', count: 10, interval: 900 },
          { type: 'acromantula', count: 14, interval: 750 },
          { type: 'dementor', count: 14, interval: 620 },
        ],
        parTime: 52000,
      },
      // Wave 12: escalation — near maximum
      {
        enemies: [
          { type: 'death_eater', count: 16, interval: 550 },
          { type: 'dark_wizard', count: 14, interval: 620 },
          { type: 'acromantula', count: 14, interval: 750 },
          { type: 'troll_hp', count: 8, interval: 900 },
        ],
        parTime: 56000,
      },
      // Wave 13: dementor + death eater climax
      {
        enemies: [
          { type: 'dementor', count: 20, interval: 550 },
          { type: 'death_eater', count: 16, interval: 550 },
          { type: 'dark_wizard', count: 12, interval: 650 },
        ],
        parTime: 50000,
      },
      // Wave 14: penultimate — everything
      {
        enemies: [
          { type: 'death_eater', count: 18, interval: 520 },
          { type: 'dark_wizard', count: 14, interval: 600 },
          { type: 'acromantula', count: 16, interval: 720 },
          { type: 'dementor', count: 16, interval: 580 },
          { type: 'troll_hp', count: 10, interval: 880 },
        ],
        parTime: 62000,
      },
      // Wave 15: pre-boss — herald escort
      {
        enemies: [
          { type: 'death_eater', count: 14, interval: 550 },
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'acromantula', count: 12, interval: 750 },
          { type: 'dementor', count: 12, interval: 620 },
        ],
        parTime: 54000,
      },
      // Wave 16: boss pre-wave — heavy escort
      {
        enemies: [
          { type: 'dark_wizard', count: 16, interval: 580 },
          { type: 'troll_hp', count: 10, interval: 880 },
          { type: 'dementor', count: 16, interval: 580 },
          { type: 'death_eater', count: 14, interval: 550 },
        ],
        parTime: 58000,
      },
      // Wave 17: herald wave — announces the Basilisk
      {
        enemies: [
          { type: 'acromantula', count: 18, interval: 700 },
          { type: 'death_eater', count: 16, interval: 550 },
          { type: 'troll_hp', count: 8, interval: 900 },
        ],
        parTime: 54000,
      },
      // Wave 18: BOSS — Basilisk with heavy escort
      {
        enemies: [
          { type: 'dark_wizard', count: 10, interval: 600 },
          { type: 'troll_hp', count: 6, interval: 950 },
          { type: 'basilisk', count: 1, interval: 2000 },
        ],
        parTime: 60000,
      },
    ],
  },

  // ─── Act 2, Level 12: "The Battle of Hogwarts" ────────────────────────────
  // Theme: Convergence level — mixed ME + Wizarding enemies, Voldemort boss
  //        Mandatory fusion mechanic, expanded grid
  // HP scale: 3.25x (act 2, levelIndex 5)
  act2_level12: {
    id: 'act2_level12',
    name: 'The Battle of Hogwarts',
    act: 2,
    levelIndex: 5,
    gridCols: 24,
    gridRows: 17,
    spawns: [[0, 8], [0, 4]],
    nexus: [23, 8],
    startingGold: 800,
    maxNexusHP: 5,
    boss: 'voldemort',
    waves: [
      // Wave 1: Death Eaters storm the gate
      {
        enemies: [{ type: 'death_eater', count: 10, interval: 750 }],
        parTime: 32000,
      },
      // Wave 2: ME forces join — orc grunts cross over
      {
        enemies: [
          { type: 'orc_grunt', count: 8, interval: 700 },
          { type: 'death_eater', count: 8, interval: 750 },
        ],
        parTime: 30000,
      },
      // Wave 3: goblin runners + dark wizards
      {
        enemies: [
          { type: 'goblin_runner', count: 10, interval: 600 },
          { type: 'dark_wizard', count: 6, interval: 750 },
        ],
        parTime: 28000,
      },
      // Wave 4: dementor + nazgul aura stacking
      {
        enemies: [
          { type: 'dementor', count: 8, interval: 700 },
          { type: 'nazgul_shade', count: 3, interval: 700 },
        ],
        parTime: 34000,
      },
      // Wave 5: acromantula + uruk-hai berserker
      {
        enemies: [
          { type: 'acromantula', count: 8, interval: 850 },
          { type: 'uruk_hai_berserker', count: 6, interval: 700 },
          { type: 'death_eater', count: 6, interval: 700 },
        ],
        parTime: 36000,
      },
      // Wave 6: troll + cave troll duo
      {
        enemies: [
          { type: 'troll_hp', count: 4, interval: 950 },
          { type: 'cave_troll', count: 4, interval: 950 },
          { type: 'orc_grunt', count: 10, interval: 600 },
        ],
        parTime: 40000,
      },
      // Wave 7: dark wizard + goblin runner teleport chaos
      {
        enemies: [
          { type: 'dark_wizard', count: 10, interval: 700 },
          { type: 'goblin_runner', count: 12, interval: 550 },
          { type: 'dementor', count: 8, interval: 650 },
        ],
        parTime: 36000,
      },
      // Wave 8: uruk-hai + death eater combined assault
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 10, interval: 650 },
          { type: 'death_eater', count: 12, interval: 600 },
          { type: 'acromantula', count: 8, interval: 800 },
        ],
        parTime: 42000,
      },
      // Wave 9: nazgul + dementor aura double-stack
      {
        enemies: [
          { type: 'nazgul_shade', count: 6, interval: 700 },
          { type: 'dementor', count: 10, interval: 650 },
          { type: 'dark_wizard', count: 8, interval: 700 },
        ],
        parTime: 42000,
      },
      // Wave 10: full convergence — all ME + Wizarding
      {
        enemies: [
          { type: 'orc_grunt', count: 12, interval: 600 },
          { type: 'death_eater', count: 12, interval: 600 },
          { type: 'uruk_hai_berserker', count: 8, interval: 650 },
          { type: 'dark_wizard', count: 8, interval: 700 },
          { type: 'dementor', count: 8, interval: 650 },
          { type: 'acromantula', count: 8, interval: 800 },
        ],
        parTime: 52000,
      },
      // Wave 11: cave troll + mountain troll siege
      {
        enemies: [
          { type: 'cave_troll', count: 6, interval: 950 },
          { type: 'troll_hp', count: 6, interval: 950 },
          { type: 'death_eater', count: 10, interval: 620 },
          { type: 'orc_grunt', count: 10, interval: 600 },
        ],
        parTime: 50000,
      },
      // Wave 12: goblin runner + acromantula speed push
      {
        enemies: [
          { type: 'goblin_runner', count: 18, interval: 500 },
          { type: 'acromantula', count: 12, interval: 750 },
          { type: 'dark_wizard', count: 10, interval: 700 },
        ],
        parTime: 44000,
      },
      // Wave 13: nazgul + dementor + dark wizard triple aura
      {
        enemies: [
          { type: 'nazgul_shade', count: 8, interval: 700 },
          { type: 'dementor', count: 12, interval: 620 },
          { type: 'dark_wizard', count: 12, interval: 650 },
          { type: 'uruk_hai_berserker', count: 10, interval: 650 },
        ],
        parTime: 54000,
      },
      // Wave 14: full convergence — near maximum
      {
        enemies: [
          { type: 'orc_grunt', count: 14, interval: 570 },
          { type: 'goblin_runner', count: 12, interval: 520 },
          { type: 'uruk_hai_berserker', count: 10, interval: 640 },
          { type: 'death_eater', count: 14, interval: 580 },
          { type: 'dark_wizard', count: 12, interval: 660 },
          { type: 'acromantula', count: 12, interval: 750 },
          { type: 'dementor', count: 10, interval: 640 },
          { type: 'troll_hp', count: 6, interval: 930 },
        ],
        parTime: 66000,
      },
      // Wave 15: maximum assault — all ME types
      {
        enemies: [
          { type: 'cave_troll', count: 8, interval: 900 },
          { type: 'nazgul_shade', count: 8, interval: 680 },
          { type: 'uruk_hai_berserker', count: 14, interval: 620 },
          { type: 'goblin_runner', count: 16, interval: 500 },
          { type: 'orc_grunt', count: 14, interval: 560 },
        ],
        parTime: 60000,
      },
      // Wave 16: maximum assault — all Wizarding types
      {
        enemies: [
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'dementor', count: 16, interval: 580 },
          { type: 'dark_wizard', count: 14, interval: 640 },
          { type: 'acromantula', count: 14, interval: 720 },
          { type: 'death_eater', count: 16, interval: 560 },
        ],
        parTime: 62000,
      },
      // Wave 17: convergence climax — combined universes
      {
        enemies: [
          { type: 'orc_grunt', count: 16, interval: 540 },
          { type: 'goblin_runner', count: 14, interval: 510 },
          { type: 'uruk_hai_berserker', count: 12, interval: 620 },
          { type: 'cave_troll', count: 8, interval: 880 },
          { type: 'nazgul_shade', count: 8, interval: 660 },
          { type: 'death_eater', count: 16, interval: 550 },
          { type: 'dark_wizard', count: 14, interval: 640 },
          { type: 'acromantula', count: 14, interval: 720 },
          { type: 'dementor', count: 14, interval: 600 },
          { type: 'troll_hp', count: 8, interval: 900 },
        ],
        parTime: 75000,
      },
      // Wave 18: herald of Voldemort — boss escort arrives
      {
        enemies: [
          { type: 'death_eater', count: 18, interval: 520 },
          { type: 'dark_wizard', count: 16, interval: 600 },
          { type: 'nazgul_shade', count: 10, interval: 660 },
          { type: 'dementor', count: 14, interval: 590 },
          { type: 'troll_hp', count: 8, interval: 900 },
        ],
        parTime: 68000,
      },
      // Wave 19: chaos wave — everything at once
      {
        enemies: [
          { type: 'orc_grunt', count: 18, interval: 520 },
          { type: 'goblin_runner', count: 16, interval: 490 },
          { type: 'uruk_hai_berserker', count: 14, interval: 610 },
          { type: 'cave_troll', count: 10, interval: 860 },
          { type: 'death_eater', count: 18, interval: 520 },
          { type: 'dark_wizard', count: 16, interval: 620 },
          { type: 'acromantula', count: 16, interval: 700 },
          { type: 'dementor', count: 16, interval: 580 },
          { type: 'troll_hp', count: 10, interval: 880 },
          { type: 'nazgul_shade', count: 10, interval: 650 },
        ],
        parTime: 80000,
      },
      // Wave 20: BOSS — Voldemort with full escort
      {
        enemies: [
          { type: 'death_eater', count: 12, interval: 600 },
          { type: 'dark_wizard', count: 8, interval: 650 },
          { type: 'uruk_hai_berserker', count: 8, interval: 650 },
          { type: 'nazgul_shade', count: 6, interval: 700 },
          { type: 'voldemort', count: 1, interval: 3000 },
        ],
        parTime: 90000,
      },
    ],
  },
};
