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

  // ─── Act 1, Level 6: "The Convergence" ────────────────────────────────────
  // Theme: Challenge level — cross-universe enemies, encourages fusion
  //        Mixed Middle-earth + Wizarding enemies require varied damage types
  //        No boss — pure gauntlet requiring adaptive tower placement
  act1_level6: {
    id: 'act1_level6',
    name: 'The Convergence',
    act: 1,
    levelIndex: 5,
    gridCols: 22,
    gridRows: 15,
    spawns: [[0, 7], [0, 3]],
    nexus: [21, 7],
    startingGold: 650,
    maxNexusHP: 5,
    waves: [
      // Wave 1: orc grunt + death eater mix — physical + arcane required
      {
        enemies: [
          { type: 'orc_grunt', count: 8, interval: 750 },
          { type: 'death_eater', count: 6, interval: 800 },
        ],
        parTime: 30000,
      },
      // Wave 2: goblin runners (fast physical) + dark wizards (arcane)
      {
        enemies: [
          { type: 'goblin_runner', count: 8, interval: 600 },
          { type: 'dark_wizard', count: 4, interval: 800 },
        ],
        parTime: 28000,
      },
      // Wave 3: uruk-hai + acromantula — tough physical + fast poison-immune
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 4, interval: 800 },
          { type: 'acromantula', count: 4, interval: 900 },
        ],
        parTime: 32000,
      },
      // Wave 4: dementor debut (flying arcane) + orc grunts — fusion becomes necessary
      {
        enemies: [
          { type: 'dementor', count: 5, interval: 800 },
          { type: 'orc_grunt', count: 10, interval: 600 },
        ],
        parTime: 30000,
      },
      // Wave 5: heavy ME push + wizarding support — stress test for split threat
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 6, interval: 750 },
          { type: 'death_eater', count: 8, interval: 700 },
          { type: 'dark_wizard', count: 4, interval: 800 },
        ],
        parTime: 35000,
      },
      // Wave 6: cave troll + acromantula — tankiness meets speed diverge
      {
        enemies: [
          { type: 'cave_troll', count: 2, interval: 900 },
          { type: 'acromantula', count: 6, interval: 800 },
          { type: 'goblin_runner', count: 8, interval: 550 },
        ],
        parTime: 35000,
      },
      // Wave 7: dementor + nazgul shade — all flying arcane threats
      {
        enemies: [
          { type: 'dementor', count: 6, interval: 750 },
          { type: 'nazgul_shade', count: 2, interval: 700 },
          { type: 'death_eater', count: 6, interval: 750 },
        ],
        parTime: 35000,
      },
      // Wave 8: orc + uruk-hai wall + dark wizard barrage — full cross push
      {
        enemies: [
          { type: 'orc_grunt', count: 14, interval: 500 },
          { type: 'uruk_hai_berserker', count: 5, interval: 700 },
          { type: 'dark_wizard', count: 6, interval: 750 },
        ],
        parTime: 38000,
      },
      // Wave 9: massive acromantula + death eater speed rush
      {
        enemies: [
          { type: 'acromantula', count: 8, interval: 750 },
          { type: 'death_eater', count: 10, interval: 650 },
          { type: 'dementor', count: 5, interval: 750 },
        ],
        parTime: 38000,
      },
      // Wave 10: cave troll + mountain troll cross-universe siege
      {
        enemies: [
          { type: 'cave_troll', count: 3, interval: 900 },
          { type: 'troll_hp', count: 3, interval: 950 },
          { type: 'goblin_runner', count: 10, interval: 500 },
          { type: 'death_eater', count: 8, interval: 650 },
        ],
        parTime: 42000,
      },
      // Wave 11: nazgul + dementor aerial flood + uruk-hai ground push
      {
        enemies: [
          { type: 'nazgul_shade', count: 3, interval: 700 },
          { type: 'dementor', count: 8, interval: 700 },
          { type: 'uruk_hai_berserker', count: 8, interval: 650 },
        ],
        parTime: 42000,
      },
      // Wave 12: full cross-universe convergence — all types
      {
        enemies: [
          { type: 'orc_grunt', count: 12, interval: 500 },
          { type: 'goblin_runner', count: 8, interval: 550 },
          { type: 'uruk_hai_berserker', count: 6, interval: 650 },
          { type: 'cave_troll', count: 2, interval: 900 },
          { type: 'death_eater', count: 10, interval: 600 },
          { type: 'dark_wizard', count: 6, interval: 700 },
          { type: 'acromantula', count: 6, interval: 800 },
          { type: 'dementor', count: 6, interval: 700 },
        ],
        parTime: 50000,
      },
      // Wave 13: nazgul + troll double threat
      {
        enemies: [
          { type: 'nazgul_shade', count: 4, interval: 700 },
          { type: 'troll_hp', count: 4, interval: 950 },
          { type: 'dark_wizard', count: 8, interval: 700 },
          { type: 'death_eater', count: 10, interval: 600 },
        ],
        parTime: 46000,
      },
      // Wave 14: near-maximum cross-universe push
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 10, interval: 600 },
          { type: 'acromantula', count: 10, interval: 750 },
          { type: 'dementor', count: 10, interval: 650 },
          { type: 'cave_troll', count: 3, interval: 900 },
          { type: 'death_eater', count: 12, interval: 550 },
        ],
        parTime: 55000,
      },
      // Wave 15: climax — the true convergence
      {
        enemies: [
          { type: 'orc_grunt', count: 16, interval: 480 },
          { type: 'goblin_runner', count: 12, interval: 500 },
          { type: 'uruk_hai_berserker', count: 8, interval: 600 },
          { type: 'nazgul_shade', count: 4, interval: 650 },
          { type: 'death_eater', count: 14, interval: 550 },
          { type: 'dark_wizard', count: 10, interval: 650 },
          { type: 'acromantula', count: 10, interval: 750 },
          { type: 'dementor', count: 10, interval: 650 },
          { type: 'troll_hp', count: 4, interval: 950 },
        ],
        parTime: 65000,
      },
      // Wave 16: final wave — the worlds collide
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 12, interval: 550 },
          { type: 'cave_troll', count: 4, interval: 900 },
          { type: 'troll_hp', count: 4, interval: 950 },
          { type: 'nazgul_shade', count: 5, interval: 650 },
          { type: 'acromantula', count: 12, interval: 700 },
          { type: 'dementor', count: 14, interval: 620 },
          { type: 'dark_wizard', count: 12, interval: 650 },
          { type: 'death_eater', count: 14, interval: 550 },
        ],
        parTime: 70000,
      },
      // Wave 17: pre-final surge
      {
        enemies: [
          { type: 'orc_grunt', count: 20, interval: 450 },
          { type: 'goblin_runner', count: 16, interval: 480 },
          { type: 'death_eater', count: 16, interval: 530 },
          { type: 'dark_wizard', count: 14, interval: 620 },
          { type: 'nazgul_shade', count: 6, interval: 650 },
          { type: 'troll_hp', count: 5, interval: 950 },
        ],
        parTime: 72000,
      },
      // Wave 18: true convergence final
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 14, interval: 500 },
          { type: 'cave_troll', count: 5, interval: 880 },
          { type: 'troll_hp', count: 6, interval: 900 },
          { type: 'acromantula', count: 14, interval: 700 },
          { type: 'dementor', count: 16, interval: 600 },
          { type: 'dark_wizard', count: 14, interval: 620 },
          { type: 'death_eater', count: 18, interval: 500 },
          { type: 'nazgul_shade', count: 6, interval: 620 },
        ],
        parTime: 80000,
      },
      // Wave 19: overwhelming flood
      {
        enemies: [
          { type: 'orc_grunt', count: 22, interval: 430 },
          { type: 'uruk_hai_berserker', count: 16, interval: 480 },
          { type: 'death_eater', count: 20, interval: 490 },
          { type: 'dementor', count: 18, interval: 580 },
          { type: 'acromantula', count: 16, interval: 680 },
          { type: 'troll_hp', count: 6, interval: 900 },
        ],
        parTime: 85000,
      },
      // Wave 20: final convergence cataclysm — all three universes at maximum
      {
        enemies: [
          { type: 'orc_grunt', count: 20, interval: 420 },
          { type: 'goblin_runner', count: 18, interval: 450 },
          { type: 'uruk_hai_berserker', count: 14, interval: 500 },
          { type: 'cave_troll', count: 6, interval: 880 },
          { type: 'troll_hp', count: 6, interval: 900 },
          { type: 'nazgul_shade', count: 8, interval: 600 },
          { type: 'death_eater', count: 20, interval: 480 },
          { type: 'dark_wizard', count: 16, interval: 600 },
          { type: 'acromantula', count: 16, interval: 670 },
          { type: 'dementor', count: 20, interval: 560 },
        ],
        parTime: 95000,
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ACT 3 — WESTEROS
  // startingGold: 1000, maxNexusHP: 5, HP scaling: 4x base (actMultiplier = 4)
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Act 3, Level 13: "The Wall" ──────────────────────────────────────────
  // Theme: Introduction to Westeros enemies — relentless wight hordes
  // HP scale: 4x base (levelIndex 0)
  act3_level13: {
    id: 'act3_level13',
    name: 'The Wall',
    act: 3,
    levelIndex: 0,
    gridCols: 24,
    gridRows: 17,
    spawns: [[0, 8]],
    nexus: [23, 8],
    startingGold: 1000,
    maxNexusHP: 5,
    waves: [
      // Wave 1: first wights
      {
        enemies: [{ type: 'wight', count: 10, interval: 700 }],
        parTime: 30000,
      },
      // Wave 2: more wights
      {
        enemies: [{ type: 'wight', count: 14, interval: 650 }],
        parTime: 28000,
      },
      // Wave 3: wights + unsullied
      {
        enemies: [
          { type: 'wight', count: 10, interval: 600 },
          { type: 'unsullied', count: 4, interval: 800 },
        ],
        parTime: 32000,
      },
      // Wave 4: wight swarm
      {
        enemies: [{ type: 'wight', count: 20, interval: 500 }],
        parTime: 25000,
      },
      // Wave 5: Dothraki riders charge
      {
        enemies: [
          { type: 'dothraki_rider', count: 6, interval: 700 },
          { type: 'wight', count: 8, interval: 600 },
        ],
        parTime: 28000,
      },
      // Wave 6: unsullied wall
      {
        enemies: [
          { type: 'unsullied', count: 10, interval: 750 },
          { type: 'wight', count: 12, interval: 550 },
        ],
        parTime: 35000,
      },
      // Wave 7: giant assault
      {
        enemies: [
          { type: 'giant', count: 2, interval: 2000 },
          { type: 'wight', count: 14, interval: 550 },
        ],
        parTime: 40000,
      },
      // Wave 8: shadow assassins infiltrate
      {
        enemies: [
          { type: 'shadow_assassin', count: 6, interval: 800 },
          { type: 'wight', count: 12, interval: 600 },
          { type: 'unsullied', count: 4, interval: 850 },
        ],
        parTime: 38000,
      },
      // Wave 9: cavalry charge
      {
        enemies: [
          { type: 'dothraki_rider', count: 10, interval: 650 },
          { type: 'unsullied', count: 6, interval: 800 },
        ],
        parTime: 32000,
      },
      // Wave 10: heavy wave — giants + wights
      {
        enemies: [
          { type: 'giant', count: 3, interval: 1800 },
          { type: 'wight', count: 20, interval: 500 },
          { type: 'unsullied', count: 8, interval: 780 },
        ],
        parTime: 45000,
      },
      // Wave 11: shadow assassin rush
      {
        enemies: [
          { type: 'shadow_assassin', count: 10, interval: 750 },
          { type: 'dothraki_rider', count: 8, interval: 680 },
        ],
        parTime: 35000,
      },
      // Wave 12: full combined assault
      {
        enemies: [
          { type: 'wight', count: 22, interval: 480 },
          { type: 'unsullied', count: 10, interval: 760 },
          { type: 'dothraki_rider', count: 8, interval: 660 },
          { type: 'shadow_assassin', count: 6, interval: 820 },
        ],
        parTime: 48000,
      },
      // Wave 13: giant vanguard
      {
        enemies: [
          { type: 'giant', count: 4, interval: 1600 },
          { type: 'wight', count: 24, interval: 480 },
          { type: 'unsullied', count: 12, interval: 750 },
        ],
        parTime: 52000,
      },
      // Wave 14: all types escalation
      {
        enemies: [
          { type: 'wight', count: 26, interval: 470 },
          { type: 'unsullied', count: 14, interval: 740 },
          { type: 'dothraki_rider', count: 10, interval: 650 },
          { type: 'shadow_assassin', count: 8, interval: 800 },
          { type: 'giant', count: 3, interval: 1700 },
        ],
        parTime: 55000,
      },
      // Wave 15: relentless wights
      {
        enemies: [{ type: 'wight', count: 35, interval: 440 }],
        parTime: 38000,
      },
      // Wave 16: cavalry + assassins
      {
        enemies: [
          { type: 'dothraki_rider', count: 14, interval: 630 },
          { type: 'shadow_assassin', count: 12, interval: 770 },
          { type: 'wight', count: 16, interval: 520 },
        ],
        parTime: 48000,
      },
      // Wave 17: giant siege
      {
        enemies: [
          { type: 'giant', count: 6, interval: 1500 },
          { type: 'wight', count: 28, interval: 460 },
          { type: 'unsullied', count: 16, interval: 730 },
        ],
        parTime: 58000,
      },
      // Wave 18: final wave — all enemies, overwhelming force
      {
        enemies: [
          { type: 'wight', count: 30, interval: 450 },
          { type: 'unsullied', count: 18, interval: 720 },
          { type: 'dothraki_rider', count: 14, interval: 640 },
          { type: 'shadow_assassin', count: 12, interval: 780 },
          { type: 'giant', count: 5, interval: 1600 },
        ],
        parTime: 65000,
      },
    ],
  },

  // ─── Act 3, Level 14: "King's Landing" ───────────────────────────────────
  // Theme: Urban combat — assassins, shields, fire
  // HP scale: 4x base * 1.25 (levelIndex 1)
  act3_level14: {
    id: 'act3_level14',
    name: "King's Landing",
    act: 3,
    levelIndex: 1,
    gridCols: 24,
    gridRows: 17,
    spawns: [[0, 5], [0, 11]],
    nexus: [23, 8],
    startingGold: 1000,
    maxNexusHP: 5,
    waves: [
      // Wave 1: city guards
      {
        enemies: [{ type: 'unsullied', count: 8, interval: 750 }],
        parTime: 32000,
      },
      // Wave 2: scouts infiltrate
      {
        enemies: [
          { type: 'shadow_assassin', count: 6, interval: 800 },
          { type: 'wight', count: 8, interval: 600 },
        ],
        parTime: 30000,
      },
      // Wave 3: cavalry flanks
      {
        enemies: [
          { type: 'dothraki_rider', count: 8, interval: 680 },
          { type: 'unsullied', count: 6, interval: 760 },
        ],
        parTime: 32000,
      },
      // Wave 4: wight horde through streets
      {
        enemies: [{ type: 'wight', count: 24, interval: 480 }],
        parTime: 28000,
      },
      // Wave 5: giant batters gates
      {
        enemies: [
          { type: 'giant', count: 3, interval: 1700 },
          { type: 'wight', count: 16, interval: 520 },
        ],
        parTime: 42000,
      },
      // Wave 6: assassin wave (both spawns)
      {
        enemies: [
          { type: 'shadow_assassin', count: 12, interval: 760 },
          { type: 'dothraki_rider', count: 10, interval: 660 },
        ],
        parTime: 38000,
      },
      // Wave 7: shield wall advance
      {
        enemies: [
          { type: 'unsullied', count: 16, interval: 730 },
          { type: 'wight', count: 18, interval: 510 },
        ],
        parTime: 45000,
      },
      // Wave 8: mixed push
      {
        enemies: [
          { type: 'wight', count: 22, interval: 490 },
          { type: 'dothraki_rider', count: 10, interval: 660 },
          { type: 'shadow_assassin', count: 8, interval: 790 },
          { type: 'unsullied', count: 10, interval: 750 },
        ],
        parTime: 50000,
      },
      // Wave 9: giant pair + cavalry
      {
        enemies: [
          { type: 'giant', count: 4, interval: 1600 },
          { type: 'dothraki_rider', count: 12, interval: 650 },
          { type: 'wight', count: 20, interval: 500 },
        ],
        parTime: 52000,
      },
      // Wave 10: full city assault
      {
        enemies: [
          { type: 'wight', count: 26, interval: 470 },
          { type: 'unsullied', count: 14, interval: 740 },
          { type: 'dothraki_rider', count: 12, interval: 660 },
          { type: 'shadow_assassin', count: 10, interval: 780 },
          { type: 'giant', count: 3, interval: 1700 },
        ],
        parTime: 58000,
      },
      // Wave 11: wight surge
      {
        enemies: [{ type: 'wight', count: 32, interval: 450 }],
        parTime: 36000,
      },
      // Wave 12: assassin + unsullied pincer
      {
        enemies: [
          { type: 'shadow_assassin', count: 16, interval: 750 },
          { type: 'unsullied', count: 18, interval: 720 },
        ],
        parTime: 48000,
      },
      // Wave 13: mounted siege
      {
        enemies: [
          { type: 'dothraki_rider', count: 16, interval: 640 },
          { type: 'wight', count: 24, interval: 480 },
          { type: 'giant', count: 4, interval: 1600 },
        ],
        parTime: 55000,
      },
      // Wave 14: combined arms
      {
        enemies: [
          { type: 'wight', count: 28, interval: 465 },
          { type: 'unsullied', count: 16, interval: 730 },
          { type: 'dothraki_rider', count: 14, interval: 650 },
          { type: 'shadow_assassin', count: 12, interval: 770 },
          { type: 'giant', count: 5, interval: 1550 },
        ],
        parTime: 62000,
      },
      // Wave 15: giant battalion
      {
        enemies: [
          { type: 'giant', count: 7, interval: 1400 },
          { type: 'wight', count: 26, interval: 470 },
          { type: 'unsullied', count: 14, interval: 740 },
        ],
        parTime: 60000,
      },
      // Wave 16: cavalry + assassin surge
      {
        enemies: [
          { type: 'dothraki_rider', count: 18, interval: 630 },
          { type: 'shadow_assassin', count: 16, interval: 760 },
          { type: 'wight', count: 22, interval: 480 },
        ],
        parTime: 55000,
      },
      // Wave 17: penultimate assault
      {
        enemies: [
          { type: 'wight', count: 30, interval: 460 },
          { type: 'unsullied', count: 20, interval: 720 },
          { type: 'dothraki_rider', count: 16, interval: 640 },
          { type: 'shadow_assassin', count: 14, interval: 760 },
          { type: 'giant', count: 6, interval: 1500 },
        ],
        parTime: 68000,
      },
      // Wave 18: final push — combined all types
      {
        enemies: [
          { type: 'wight', count: 32, interval: 450 },
          { type: 'unsullied', count: 22, interval: 710 },
          { type: 'dothraki_rider', count: 18, interval: 630 },
          { type: 'shadow_assassin', count: 16, interval: 750 },
          { type: 'giant', count: 7, interval: 1450 },
        ],
        parTime: 72000,
      },
      // Wave 19: elite wight battalion
      {
        enemies: [
          { type: 'wight', count: 40, interval: 430 },
          { type: 'shadow_assassin', count: 18, interval: 740 },
          { type: 'giant', count: 8, interval: 1400 },
        ],
        parTime: 70000,
      },
      // Wave 20: final siege — all forces converge
      {
        enemies: [
          { type: 'wight', count: 36, interval: 440 },
          { type: 'unsullied', count: 24, interval: 700 },
          { type: 'dothraki_rider', count: 20, interval: 620 },
          { type: 'shadow_assassin', count: 20, interval: 740 },
          { type: 'giant', count: 8, interval: 1400 },
        ],
        parTime: 80000,
      },
    ],
  },

  // ─── Act 3, Level 15: "The Iron Islands" ──────────────────────────────────
  // Theme: Multiple spawn points, naval raiders, fast flankers
  // HP scale: 4x base * 1.5 (levelIndex 2)
  act3_level15: {
    id: 'act3_level15',
    name: 'The Iron Islands',
    act: 3,
    levelIndex: 2,
    gridCols: 24,
    gridRows: 17,
    spawns: [[0, 4], [0, 8], [0, 13]],
    nexus: [23, 8],
    startingGold: 1000,
    maxNexusHP: 5,
    waves: [
      // Wave 1: raiders from three fronts
      {
        enemies: [{ type: 'wight', count: 12, interval: 650 }],
        parTime: 28000,
      },
      // Wave 2: cavalry raids
      {
        enemies: [
          { type: 'dothraki_rider', count: 8, interval: 680 },
          { type: 'wight', count: 10, interval: 600 },
        ],
        parTime: 30000,
      },
      // Wave 3: shield wall + scouts
      {
        enemies: [
          { type: 'unsullied', count: 10, interval: 740 },
          { type: 'shadow_assassin', count: 6, interval: 800 },
        ],
        parTime: 36000,
      },
      // Wave 4: three-flank wight rush
      {
        enemies: [{ type: 'wight', count: 28, interval: 470 }],
        parTime: 32000,
      },
      // Wave 5: mixed three-flank assault
      {
        enemies: [
          { type: 'wight', count: 18, interval: 510 },
          { type: 'dothraki_rider', count: 10, interval: 660 },
          { type: 'unsullied', count: 8, interval: 750 },
        ],
        parTime: 42000,
      },
      // Wave 6: shadow raiders
      {
        enemies: [
          { type: 'shadow_assassin', count: 14, interval: 760 },
          { type: 'dothraki_rider', count: 12, interval: 650 },
          { type: 'wight', count: 16, interval: 520 },
        ],
        parTime: 45000,
      },
      // Wave 7: giant reavers
      {
        enemies: [
          { type: 'giant', count: 4, interval: 1600 },
          { type: 'wight', count: 22, interval: 490 },
          { type: 'unsullied', count: 10, interval: 750 },
        ],
        parTime: 50000,
      },
      // Wave 8: siege wave all flanks
      {
        enemies: [
          { type: 'wight', count: 24, interval: 480 },
          { type: 'unsullied', count: 14, interval: 735 },
          { type: 'dothraki_rider', count: 12, interval: 655 },
          { type: 'shadow_assassin', count: 10, interval: 775 },
        ],
        parTime: 55000,
      },
      // Wave 9: giant charge + cavalry
      {
        enemies: [
          { type: 'giant', count: 5, interval: 1550 },
          { type: 'dothraki_rider', count: 16, interval: 640 },
          { type: 'wight', count: 20, interval: 500 },
        ],
        parTime: 55000,
      },
      // Wave 10: full island assault
      {
        enemies: [
          { type: 'wight', count: 28, interval: 465 },
          { type: 'unsullied', count: 16, interval: 730 },
          { type: 'dothraki_rider', count: 14, interval: 645 },
          { type: 'shadow_assassin', count: 12, interval: 770 },
          { type: 'giant', count: 4, interval: 1600 },
        ],
        parTime: 62000,
      },
      // Wave 11: wight armada
      {
        enemies: [{ type: 'wight', count: 36, interval: 440 }],
        parTime: 38000,
      },
      // Wave 12: shadow + cavalry blitz
      {
        enemies: [
          { type: 'shadow_assassin', count: 18, interval: 750 },
          { type: 'dothraki_rider', count: 18, interval: 635 },
          { type: 'wight', count: 20, interval: 500 },
        ],
        parTime: 55000,
      },
      // Wave 13: unsullied phalanx
      {
        enemies: [
          { type: 'unsullied', count: 22, interval: 720 },
          { type: 'wight', count: 26, interval: 470 },
          { type: 'giant', count: 5, interval: 1550 },
        ],
        parTime: 62000,
      },
      // Wave 14: all-out island storm
      {
        enemies: [
          { type: 'wight', count: 30, interval: 460 },
          { type: 'unsullied', count: 18, interval: 725 },
          { type: 'dothraki_rider', count: 16, interval: 640 },
          { type: 'shadow_assassin', count: 14, interval: 765 },
          { type: 'giant', count: 6, interval: 1500 },
        ],
        parTime: 68000,
      },
      // Wave 15: giant battering rams
      {
        enemies: [
          { type: 'giant', count: 8, interval: 1400 },
          { type: 'wight', count: 28, interval: 465 },
          { type: 'unsullied', count: 16, interval: 730 },
        ],
        parTime: 65000,
      },
      // Wave 16: assassin storm
      {
        enemies: [
          { type: 'shadow_assassin', count: 22, interval: 740 },
          { type: 'dothraki_rider', count: 20, interval: 630 },
          { type: 'wight', count: 24, interval: 475 },
        ],
        parTime: 60000,
      },
      // Wave 17: combined iron fleet
      {
        enemies: [
          { type: 'wight', count: 34, interval: 450 },
          { type: 'unsullied', count: 20, interval: 720 },
          { type: 'dothraki_rider', count: 18, interval: 635 },
          { type: 'shadow_assassin', count: 16, interval: 755 },
          { type: 'giant', count: 7, interval: 1450 },
        ],
        parTime: 72000,
      },
      // Wave 18: relentless horde
      {
        enemies: [
          { type: 'wight', count: 38, interval: 440 },
          { type: 'unsullied', count: 22, interval: 715 },
          { type: 'dothraki_rider', count: 20, interval: 630 },
          { type: 'shadow_assassin', count: 18, interval: 750 },
          { type: 'giant', count: 8, interval: 1400 },
        ],
        parTime: 78000,
      },
      // Wave 19: iron armada final push
      {
        enemies: [
          { type: 'wight', count: 42, interval: 430 },
          { type: 'shadow_assassin', count: 22, interval: 740 },
          { type: 'giant', count: 10, interval: 1350 },
          { type: 'dothraki_rider', count: 22, interval: 625 },
        ],
        parTime: 78000,
      },
      // Wave 20: overwhelming island force
      {
        enemies: [
          { type: 'wight', count: 40, interval: 435 },
          { type: 'unsullied', count: 24, interval: 710 },
          { type: 'dothraki_rider', count: 22, interval: 625 },
          { type: 'shadow_assassin', count: 22, interval: 740 },
          { type: 'giant', count: 10, interval: 1350 },
        ],
        parTime: 85000,
      },
    ],
  },

  // ─── Act 3, Level 16: "Winterfell" ────────────────────────────────────────
  // Theme: Heavy escalation, frozen siege, all Westeros enemy types
  // HP scale: 4x base * 1.75 (levelIndex 3)
  act3_level16: {
    id: 'act3_level16',
    name: 'Winterfell',
    act: 3,
    levelIndex: 3,
    gridCols: 24,
    gridRows: 17,
    spawns: [[0, 8]],
    nexus: [23, 8],
    startingGold: 1000,
    maxNexusHP: 5,
    waves: [
      // Wave 1: wight scouts
      {
        enemies: [{ type: 'wight', count: 14, interval: 620 }],
        parTime: 28000,
      },
      // Wave 2: cavalry vanguard
      {
        enemies: [
          { type: 'dothraki_rider', count: 10, interval: 660 },
          { type: 'wight', count: 12, interval: 580 },
        ],
        parTime: 30000,
      },
      // Wave 3: unsullied advance
      {
        enemies: [
          { type: 'unsullied', count: 12, interval: 740 },
          { type: 'wight', count: 14, interval: 560 },
        ],
        parTime: 36000,
      },
      // Wave 4: shadow infiltrators
      {
        enemies: [
          { type: 'shadow_assassin', count: 10, interval: 780 },
          { type: 'dothraki_rider', count: 10, interval: 650 },
          { type: 'wight', count: 16, interval: 540 },
        ],
        parTime: 40000,
      },
      // Wave 5: giant pair siege
      {
        enemies: [
          { type: 'giant', count: 4, interval: 1600 },
          { type: 'wight', count: 22, interval: 490 },
          { type: 'unsullied', count: 12, interval: 745 },
        ],
        parTime: 48000,
      },
      // Wave 6: full unit assault
      {
        enemies: [
          { type: 'wight', count: 26, interval: 470 },
          { type: 'unsullied', count: 14, interval: 735 },
          { type: 'dothraki_rider', count: 12, interval: 650 },
          { type: 'shadow_assassin', count: 10, interval: 775 },
        ],
        parTime: 55000,
      },
      // Wave 7: giant assault + cavalry
      {
        enemies: [
          { type: 'giant', count: 5, interval: 1550 },
          { type: 'dothraki_rider', count: 16, interval: 640 },
          { type: 'wight', count: 24, interval: 480 },
        ],
        parTime: 56000,
      },
      // Wave 8: shadow + unsullied pincer
      {
        enemies: [
          { type: 'shadow_assassin', count: 16, interval: 755 },
          { type: 'unsullied', count: 18, interval: 725 },
          { type: 'wight', count: 22, interval: 490 },
        ],
        parTime: 58000,
      },
      // Wave 9: wight swarm
      {
        enemies: [{ type: 'wight', count: 40, interval: 430 }],
        parTime: 40000,
      },
      // Wave 10: full Winterfell assault
      {
        enemies: [
          { type: 'wight', count: 30, interval: 460 },
          { type: 'unsullied', count: 18, interval: 725 },
          { type: 'dothraki_rider', count: 16, interval: 640 },
          { type: 'shadow_assassin', count: 14, interval: 765 },
          { type: 'giant', count: 6, interval: 1500 },
        ],
        parTime: 68000,
      },
      // Wave 11: massive wight push
      {
        enemies: [
          { type: 'wight', count: 38, interval: 440 },
          { type: 'shadow_assassin', count: 14, interval: 765 },
        ],
        parTime: 50000,
      },
      // Wave 12: cavalry + giants
      {
        enemies: [
          { type: 'dothraki_rider', count: 20, interval: 630 },
          { type: 'giant', count: 8, interval: 1400 },
          { type: 'wight', count: 28, interval: 465 },
        ],
        parTime: 65000,
      },
      // Wave 13: fortress breach
      {
        enemies: [
          { type: 'wight', count: 34, interval: 450 },
          { type: 'unsullied', count: 22, interval: 715 },
          { type: 'dothraki_rider', count: 18, interval: 635 },
          { type: 'shadow_assassin', count: 16, interval: 755 },
          { type: 'giant', count: 7, interval: 1450 },
        ],
        parTime: 72000,
      },
      // Wave 14: unstoppable horde
      {
        enemies: [
          { type: 'wight', count: 40, interval: 435 },
          { type: 'unsullied', count: 24, interval: 710 },
          { type: 'dothraki_rider', count: 20, interval: 630 },
          { type: 'shadow_assassin', count: 18, interval: 750 },
          { type: 'giant', count: 8, interval: 1400 },
        ],
        parTime: 78000,
      },
      // Wave 15: giant phalanx
      {
        enemies: [
          { type: 'giant', count: 10, interval: 1350 },
          { type: 'wight', count: 36, interval: 445 },
          { type: 'unsullied', count: 20, interval: 720 },
        ],
        parTime: 72000,
      },
      // Wave 16: assassin + cavalry storm
      {
        enemies: [
          { type: 'shadow_assassin', count: 24, interval: 740 },
          { type: 'dothraki_rider', count: 24, interval: 625 },
          { type: 'wight', count: 30, interval: 460 },
        ],
        parTime: 68000,
      },
      // Wave 17: Winterfell falls
      {
        enemies: [
          { type: 'wight', count: 44, interval: 425 },
          { type: 'unsullied', count: 26, interval: 705 },
          { type: 'dothraki_rider', count: 22, interval: 625 },
          { type: 'shadow_assassin', count: 20, interval: 745 },
          { type: 'giant', count: 9, interval: 1380 },
        ],
        parTime: 82000,
      },
      // Wave 18: the cold front
      {
        enemies: [
          { type: 'wight', count: 48, interval: 420 },
          { type: 'unsullied', count: 28, interval: 700 },
          { type: 'dothraki_rider', count: 24, interval: 620 },
          { type: 'shadow_assassin', count: 22, interval: 740 },
          { type: 'giant', count: 10, interval: 1360 },
        ],
        parTime: 88000,
      },
      // Wave 19: the dead march
      {
        enemies: [
          { type: 'wight', count: 52, interval: 410 },
          { type: 'shadow_assassin', count: 26, interval: 735 },
          { type: 'giant', count: 12, interval: 1330 },
          { type: 'unsullied', count: 30, interval: 695 },
          { type: 'dothraki_rider', count: 26, interval: 615 },
        ],
        parTime: 92000,
      },
      // Wave 20: all gates broken
      {
        enemies: [
          { type: 'wight', count: 56, interval: 400 },
          { type: 'unsullied', count: 32, interval: 690 },
          { type: 'dothraki_rider', count: 28, interval: 610 },
          { type: 'shadow_assassin', count: 26, interval: 730 },
          { type: 'giant', count: 12, interval: 1320 },
        ],
        parTime: 96000,
      },
      // Wave 21: night falls on Winterfell
      {
        enemies: [
          { type: 'wight', count: 60, interval: 390 },
          { type: 'unsullied', count: 34, interval: 685 },
          { type: 'dothraki_rider', count: 30, interval: 605 },
          { type: 'shadow_assassin', count: 28, interval: 725 },
          { type: 'giant', count: 14, interval: 1300 },
        ],
        parTime: 100000,
      },
      // Wave 22: final Winterfell defense
      {
        enemies: [
          { type: 'wight', count: 64, interval: 380 },
          { type: 'unsullied', count: 36, interval: 680 },
          { type: 'dothraki_rider', count: 32, interval: 600 },
          { type: 'shadow_assassin', count: 30, interval: 720 },
          { type: 'giant', count: 16, interval: 1280 },
        ],
        parTime: 108000,
      },
    ],
  },

  // ─── Act 3, Level 17: "Hardhome" ──────────────────────────────────────────
  // Theme: Boss level — White Walker General commands the undead army
  // HP scale: 4x base * 2.0 (levelIndex 4)
  act3_level17: {
    id: 'act3_level17',
    name: 'Hardhome',
    act: 3,
    levelIndex: 4,
    gridCols: 24,
    gridRows: 17,
    spawns: [[0, 8]],
    nexus: [23, 8],
    startingGold: 1000,
    maxNexusHP: 5,
    boss: 'white_walker_general',
    waves: [
      // Wave 1: the dead arrive
      {
        enemies: [{ type: 'wight', count: 16, interval: 580 }],
        parTime: 28000,
      },
      // Wave 2: cavalry and shadows
      {
        enemies: [
          { type: 'dothraki_rider', count: 10, interval: 650 },
          { type: 'shadow_assassin', count: 8, interval: 780 },
          { type: 'wight', count: 14, interval: 560 },
        ],
        parTime: 35000,
      },
      // Wave 3: shield wall
      {
        enemies: [
          { type: 'unsullied', count: 16, interval: 730 },
          { type: 'wight', count: 18, interval: 540 },
        ],
        parTime: 40000,
      },
      // Wave 4: giant vanguard
      {
        enemies: [
          { type: 'giant', count: 5, interval: 1550 },
          { type: 'wight', count: 24, interval: 480 },
          { type: 'unsullied', count: 12, interval: 745 },
        ],
        parTime: 52000,
      },
      // Wave 5: full army
      {
        enemies: [
          { type: 'wight', count: 30, interval: 460 },
          { type: 'unsullied', count: 16, interval: 730 },
          { type: 'dothraki_rider', count: 14, interval: 645 },
          { type: 'shadow_assassin', count: 12, interval: 770 },
          { type: 'giant', count: 5, interval: 1550 },
        ],
        parTime: 65000,
      },
      // Wave 6: the dead rise again
      {
        enemies: [
          { type: 'wight', count: 36, interval: 445 },
          { type: 'shadow_assassin', count: 16, interval: 755 },
          { type: 'unsullied', count: 18, interval: 725 },
        ],
        parTime: 58000,
      },
      // Wave 7: cavalry charge
      {
        enemies: [
          { type: 'dothraki_rider', count: 20, interval: 630 },
          { type: 'wight', count: 28, interval: 465 },
          { type: 'giant', count: 6, interval: 1500 },
        ],
        parTime: 60000,
      },
      // Wave 8: massive push
      {
        enemies: [
          { type: 'wight', count: 40, interval: 435 },
          { type: 'unsullied', count: 22, interval: 715 },
          { type: 'dothraki_rider', count: 18, interval: 635 },
          { type: 'shadow_assassin', count: 16, interval: 755 },
          { type: 'giant', count: 8, interval: 1400 },
        ],
        parTime: 75000,
      },
      // Wave 9: undead tide
      {
        enemies: [
          { type: 'wight', count: 48, interval: 420 },
          { type: 'shadow_assassin', count: 20, interval: 745 },
          { type: 'dothraki_rider', count: 20, interval: 630 },
        ],
        parTime: 65000,
      },
      // Wave 10: glacier assault
      {
        enemies: [
          { type: 'giant', count: 10, interval: 1350 },
          { type: 'wight', count: 40, interval: 435 },
          { type: 'unsullied', count: 26, interval: 710 },
          { type: 'shadow_assassin', count: 18, interval: 750 },
        ],
        parTime: 80000,
      },
      // Wave 11: storm of dead
      {
        enemies: [
          { type: 'wight', count: 52, interval: 410 },
          { type: 'dothraki_rider', count: 24, interval: 625 },
          { type: 'unsullied', count: 24, interval: 710 },
          { type: 'shadow_assassin', count: 22, interval: 740 },
          { type: 'giant', count: 10, interval: 1350 },
        ],
        parTime: 85000,
      },
      // Wave 12: overwhelming force
      {
        enemies: [
          { type: 'wight', count: 56, interval: 400 },
          { type: 'unsullied', count: 28, interval: 705 },
          { type: 'dothraki_rider', count: 26, interval: 620 },
          { type: 'shadow_assassin', count: 24, interval: 735 },
          { type: 'giant', count: 12, interval: 1320 },
        ],
        parTime: 90000,
      },
      // Wave 13: frozen march
      {
        enemies: [
          { type: 'wight', count: 60, interval: 390 },
          { type: 'shadow_assassin', count: 28, interval: 730 },
          { type: 'giant', count: 14, interval: 1290 },
          { type: 'unsullied', count: 30, interval: 700 },
        ],
        parTime: 92000,
      },
      // Wave 14: wall-to-wall undead
      {
        enemies: [
          { type: 'wight', count: 64, interval: 380 },
          { type: 'unsullied', count: 32, interval: 695 },
          { type: 'dothraki_rider', count: 28, interval: 615 },
          { type: 'shadow_assassin', count: 26, interval: 730 },
          { type: 'giant', count: 14, interval: 1290 },
        ],
        parTime: 98000,
      },
      // Wave 15: penultimate dead surge
      {
        enemies: [
          { type: 'wight', count: 68, interval: 370 },
          { type: 'unsullied', count: 34, interval: 690 },
          { type: 'dothraki_rider', count: 30, interval: 610 },
          { type: 'shadow_assassin', count: 28, interval: 725 },
          { type: 'giant', count: 16, interval: 1260 },
        ],
        parTime: 104000,
      },
      // Wave 16: hardhome burns
      {
        enemies: [
          { type: 'wight', count: 72, interval: 360 },
          { type: 'unsullied', count: 36, interval: 685 },
          { type: 'dothraki_rider', count: 32, interval: 605 },
          { type: 'shadow_assassin', count: 30, interval: 720 },
          { type: 'giant', count: 18, interval: 1240 },
        ],
        parTime: 110000,
      },
      // Wave 17: herald of the White Walker General
      {
        enemies: [
          { type: 'wight', count: 30, interval: 500 },
          { type: 'unsullied', count: 20, interval: 720 },
          { type: 'dothraki_rider', count: 16, interval: 645 },
          { type: 'shadow_assassin', count: 16, interval: 760 },
          { type: 'giant', count: 8, interval: 1400 },
        ],
        parTime: 85000,
      },
      // Wave 18: escalating escort
      {
        enemies: [
          { type: 'wight', count: 40, interval: 440 },
          { type: 'unsullied', count: 24, interval: 710 },
          { type: 'dothraki_rider', count: 20, interval: 632 },
          { type: 'shadow_assassin', count: 18, interval: 748 },
          { type: 'giant', count: 10, interval: 1350 },
        ],
        parTime: 90000,
      },
      // Wave 19: the general's vanguard
      {
        enemies: [
          { type: 'wight', count: 50, interval: 415 },
          { type: 'unsullied', count: 30, interval: 700 },
          { type: 'dothraki_rider', count: 26, interval: 618 },
          { type: 'shadow_assassin', count: 24, interval: 736 },
          { type: 'giant', count: 14, interval: 1290 },
        ],
        parTime: 100000,
      },
      // Wave 20: prelude to the General
      {
        enemies: [
          { type: 'wight', count: 60, interval: 390 },
          { type: 'unsullied', count: 36, interval: 685 },
          { type: 'dothraki_rider', count: 30, interval: 606 },
          { type: 'shadow_assassin', count: 28, interval: 724 },
          { type: 'giant', count: 16, interval: 1260 },
        ],
        parTime: 108000,
      },
      // Wave 21: final escort before boss
      {
        enemies: [
          { type: 'wight', count: 70, interval: 365 },
          { type: 'unsullied', count: 40, interval: 680 },
          { type: 'dothraki_rider', count: 34, interval: 600 },
          { type: 'shadow_assassin', count: 32, interval: 718 },
          { type: 'giant', count: 18, interval: 1240 },
        ],
        parTime: 115000,
      },
      // Wave 22: BOSS — White Walker General arrives
      {
        enemies: [
          { type: 'wight', count: 20, interval: 550 },
          { type: 'unsullied', count: 14, interval: 740 },
          { type: 'giant', count: 6, interval: 1500 },
          { type: 'white_walker_general', count: 1, interval: 5000 },
        ],
        parTime: 120000,
      },
    ],
  },

  // ─── Act 3, Level 18: "The Long Night" (Final Convergence) ───────────────
  // Theme: All 3 universes united, Night King final boss, 25-wave endgame
  // HP scale: 4x base * 2.25 (levelIndex 5)
  act3_level18: {
    id: 'act3_level18',
    name: 'The Long Night',
    act: 3,
    levelIndex: 5,
    gridCols: 28,
    gridRows: 20,
    spawns: [[0, 10], [0, 5], [0, 15]],
    nexus: [27, 10],
    startingGold: 1000,
    maxNexusHP: 5,
    boss: 'night_king',
    waves: [
      // Wave 1: darkness falls — first enemies from all universes
      {
        enemies: [
          { type: 'orc_grunt', count: 12, interval: 600 },
          { type: 'wight', count: 12, interval: 580 },
          { type: 'death_eater', count: 8, interval: 650 },
        ],
        parTime: 35000,
      },
      // Wave 2: triple-universe skirmish
      {
        enemies: [
          { type: 'goblin_runner', count: 10, interval: 550 },
          { type: 'dothraki_rider', count: 8, interval: 660 },
          { type: 'dementor', count: 6, interval: 700 },
        ],
        parTime: 32000,
      },
      // Wave 3: first major push
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 8, interval: 680 },
          { type: 'unsullied', count: 10, interval: 750 },
          { type: 'dark_wizard', count: 6, interval: 720 },
          { type: 'wight', count: 16, interval: 540 },
        ],
        parTime: 42000,
      },
      // Wave 4: wight + orc swarm
      {
        enemies: [
          { type: 'wight', count: 24, interval: 480 },
          { type: 'orc_grunt', count: 20, interval: 520 },
          { type: 'death_eater', count: 12, interval: 640 },
        ],
        parTime: 40000,
      },
      // Wave 5: shadow and fear
      {
        enemies: [
          { type: 'shadow_assassin', count: 10, interval: 780 },
          { type: 'nazgul_shade', count: 6, interval: 700 },
          { type: 'dementor', count: 10, interval: 680 },
          { type: 'wight', count: 18, interval: 530 },
        ],
        parTime: 48000,
      },
      // Wave 6: tank wave
      {
        enemies: [
          { type: 'cave_troll', count: 6, interval: 900 },
          { type: 'giant', count: 4, interval: 1600 },
          { type: 'troll_hp', count: 4, interval: 950 },
          { type: 'wight', count: 20, interval: 510 },
        ],
        parTime: 55000,
      },
      // Wave 7: fast flankers
      {
        enemies: [
          { type: 'goblin_runner', count: 16, interval: 520 },
          { type: 'dothraki_rider', count: 14, interval: 650 },
          { type: 'dark_wizard', count: 10, interval: 710 },
          { type: 'wight', count: 20, interval: 510 },
        ],
        parTime: 48000,
      },
      // Wave 8: shield wall + spawn wave
      {
        enemies: [
          { type: 'unsullied', count: 14, interval: 740 },
          { type: 'acromantula', count: 6, interval: 800 },
          { type: 'uruk_hai_berserker', count: 10, interval: 670 },
          { type: 'wight', count: 24, interval: 480 },
        ],
        parTime: 58000,
      },
      // Wave 9: convergence skirmish
      {
        enemies: [
          { type: 'wight', count: 28, interval: 465 },
          { type: 'orc_grunt', count: 22, interval: 510 },
          { type: 'death_eater', count: 14, interval: 635 },
          { type: 'shadow_assassin', count: 12, interval: 770 },
          { type: 'dementor', count: 12, interval: 680 },
        ],
        parTime: 65000,
      },
      // Wave 10: giant triple-universe siege
      {
        enemies: [
          { type: 'giant', count: 6, interval: 1500 },
          { type: 'cave_troll', count: 6, interval: 880 },
          { type: 'troll_hp', count: 6, interval: 920 },
          { type: 'wight', count: 30, interval: 460 },
          { type: 'uruk_hai_berserker', count: 12, interval: 665 },
        ],
        parTime: 72000,
      },
      // Wave 11: full convergence wave
      {
        enemies: [
          { type: 'wight', count: 32, interval: 455 },
          { type: 'orc_grunt', count: 24, interval: 505 },
          { type: 'death_eater', count: 16, interval: 630 },
          { type: 'unsullied', count: 16, interval: 730 },
          { type: 'dothraki_rider', count: 14, interval: 645 },
          { type: 'nazgul_shade', count: 10, interval: 695 },
          { type: 'dementor', count: 14, interval: 675 },
        ],
        parTime: 78000,
      },
      // Wave 12: assassin + shadow storm
      {
        enemies: [
          { type: 'shadow_assassin', count: 18, interval: 755 },
          { type: 'dark_wizard', count: 16, interval: 710 },
          { type: 'goblin_runner', count: 20, interval: 515 },
          { type: 'wight', count: 28, interval: 465 },
          { type: 'dothraki_rider', count: 16, interval: 640 },
        ],
        parTime: 72000,
      },
      // Wave 13: all tanks
      {
        enemies: [
          { type: 'giant', count: 8, interval: 1400 },
          { type: 'cave_troll', count: 8, interval: 860 },
          { type: 'troll_hp', count: 8, interval: 900 },
          { type: 'wight', count: 36, interval: 445 },
          { type: 'unsullied', count: 20, interval: 720 },
        ],
        parTime: 80000,
      },
      // Wave 14: chaos surge
      {
        enemies: [
          { type: 'wight', count: 40, interval: 435 },
          { type: 'orc_grunt', count: 28, interval: 500 },
          { type: 'death_eater', count: 20, interval: 625 },
          { type: 'unsullied', count: 20, interval: 720 },
          { type: 'dothraki_rider', count: 18, interval: 635 },
          { type: 'shadow_assassin', count: 16, interval: 755 },
          { type: 'nazgul_shade', count: 12, interval: 690 },
          { type: 'dementor', count: 16, interval: 670 },
        ],
        parTime: 90000,
      },
      // Wave 15: dragon bait — heavy aerial + ground
      {
        enemies: [
          { type: 'dementor', count: 20, interval: 660 },
          { type: 'nazgul_shade', count: 16, interval: 685 },
          { type: 'wight', count: 40, interval: 435 },
          { type: 'dothraki_rider', count: 22, interval: 625 },
          { type: 'shadow_assassin', count: 20, interval: 745 },
        ],
        parTime: 85000,
      },
      // Wave 16: uruk-hai mass charge
      {
        enemies: [
          { type: 'uruk_hai_berserker', count: 24, interval: 655 },
          { type: 'goblin_runner', count: 28, interval: 510 },
          { type: 'orc_grunt', count: 30, interval: 500 },
          { type: 'wight', count: 36, interval: 445 },
          { type: 'giant', count: 10, interval: 1350 },
        ],
        parTime: 88000,
      },
      // Wave 17: total convergence assault
      {
        enemies: [
          { type: 'wight', count: 44, interval: 425 },
          { type: 'orc_grunt', count: 30, interval: 495 },
          { type: 'death_eater', count: 22, interval: 620 },
          { type: 'unsullied', count: 24, interval: 715 },
          { type: 'dothraki_rider', count: 22, interval: 625 },
          { type: 'shadow_assassin', count: 20, interval: 745 },
          { type: 'dark_wizard', count: 20, interval: 705 },
          { type: 'dementor', count: 18, interval: 665 },
          { type: 'nazgul_shade', count: 14, interval: 685 },
          { type: 'giant', count: 10, interval: 1350 },
        ],
        parTime: 100000,
      },
      // Wave 18: death march — all tanks + swarms
      {
        enemies: [
          { type: 'wight', count: 50, interval: 410 },
          { type: 'cave_troll', count: 10, interval: 840 },
          { type: 'giant', count: 12, interval: 1310 },
          { type: 'troll_hp', count: 10, interval: 880 },
          { type: 'uruk_hai_berserker', count: 26, interval: 650 },
          { type: 'unsullied', count: 26, interval: 710 },
        ],
        parTime: 105000,
      },
      // Wave 19: prelude to darkness
      {
        enemies: [
          { type: 'wight', count: 54, interval: 400 },
          { type: 'orc_grunt', count: 34, interval: 490 },
          { type: 'death_eater', count: 26, interval: 615 },
          { type: 'unsullied', count: 28, interval: 705 },
          { type: 'dothraki_rider', count: 26, interval: 620 },
          { type: 'shadow_assassin', count: 24, interval: 738 },
          { type: 'dark_wizard', count: 22, interval: 700 },
          { type: 'dementor', count: 22, interval: 658 },
          { type: 'nazgul_shade', count: 16, interval: 680 },
          { type: 'giant', count: 12, interval: 1310 },
          { type: 'acromantula', count: 10, interval: 810 },
        ],
        parTime: 112000,
      },
      // Wave 20: the night deepens
      {
        enemies: [
          { type: 'wight', count: 60, interval: 390 },
          { type: 'orc_grunt', count: 36, interval: 485 },
          { type: 'death_eater', count: 28, interval: 610 },
          { type: 'unsullied', count: 30, interval: 700 },
          { type: 'dothraki_rider', count: 28, interval: 615 },
          { type: 'shadow_assassin', count: 26, interval: 732 },
          { type: 'nazgul_shade', count: 18, interval: 676 },
          { type: 'giant', count: 14, interval: 1280 },
        ],
        parTime: 118000,
      },
      // Wave 21: the storm before the king
      {
        enemies: [
          { type: 'wight', count: 64, interval: 380 },
          { type: 'goblin_runner', count: 36, interval: 490 },
          { type: 'dementor', count: 26, interval: 650 },
          { type: 'dothraki_rider', count: 30, interval: 610 },
          { type: 'shadow_assassin', count: 28, interval: 726 },
          { type: 'dark_wizard', count: 26, interval: 695 },
          { type: 'giant', count: 16, interval: 1250 },
          { type: 'cave_troll', count: 12, interval: 820 },
          { type: 'troll_hp', count: 12, interval: 860 },
        ],
        parTime: 122000,
      },
      // Wave 22: herald of the Night King
      {
        enemies: [
          { type: 'wight', count: 50, interval: 415 },
          { type: 'unsullied', count: 30, interval: 700 },
          { type: 'dothraki_rider', count: 28, interval: 615 },
          { type: 'shadow_assassin', count: 26, interval: 730 },
          { type: 'giant', count: 14, interval: 1280 },
          { type: 'uruk_hai_berserker', count: 24, interval: 655 },
          { type: 'death_eater', count: 24, interval: 615 },
          { type: 'nazgul_shade', count: 20, interval: 672 },
        ],
        parTime: 125000,
      },
      // Wave 23: the king's escort
      {
        enemies: [
          { type: 'wight', count: 70, interval: 365 },
          { type: 'unsullied', count: 34, interval: 694 },
          { type: 'dothraki_rider', count: 32, interval: 608 },
          { type: 'shadow_assassin', count: 30, interval: 722 },
          { type: 'giant', count: 16, interval: 1250 },
          { type: 'dementor', count: 28, interval: 644 },
          { type: 'dark_wizard', count: 28, interval: 690 },
        ],
        parTime: 130000,
      },
      // Wave 24: the long night deepens
      {
        enemies: [
          { type: 'wight', count: 76, interval: 355 },
          { type: 'orc_grunt', count: 40, interval: 480 },
          { type: 'death_eater', count: 32, interval: 605 },
          { type: 'unsullied', count: 36, interval: 688 },
          { type: 'dothraki_rider', count: 34, interval: 602 },
          { type: 'shadow_assassin', count: 32, interval: 716 },
          { type: 'giant', count: 18, interval: 1220 },
          { type: 'nazgul_shade', count: 22, interval: 668 },
          { type: 'uruk_hai_berserker', count: 28, interval: 648 },
        ],
        parTime: 138000,
      },
      // Wave 25: BOSS — Night King arrives, the Long Night begins
      {
        enemies: [
          { type: 'wight', count: 30, interval: 500 },
          { type: 'unsullied', count: 20, interval: 720 },
          { type: 'dothraki_rider', count: 16, interval: 645 },
          { type: 'shadow_assassin', count: 16, interval: 760 },
          { type: 'giant', count: 8, interval: 1400 },
          { type: 'orc_grunt', count: 20, interval: 520 },
          { type: 'death_eater', count: 16, interval: 630 },
          { type: 'dementor', count: 16, interval: 665 },
          { type: 'night_king', count: 1, interval: 8000 },
        ],
        parTime: 150000,
      },
    ],
  },
};
