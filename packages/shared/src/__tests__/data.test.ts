import { describe, it, expect } from 'vitest';
import { TOWERS } from '../data/towers';
import { ENEMIES } from '../data/enemies';
import { LEVELS } from '../data/levels';
import { FUSIONS } from '../data/fusions';
import { CHALLENGE_MODIFIERS } from '../data/challenges';
import { getScaledHP } from '../types/enemy';

describe('Tower data', () => {
  it('should have all 5 Middle-earth towers', () => {
    const meTowers = Object.values(TOWERS).filter((t) => t.universe === 'middle_earth');
    expect(meTowers).toHaveLength(5);
  });

  it('should have all 5 Wizarding World towers', () => {
    const wzTowers = Object.values(TOWERS).filter((t) => t.universe === 'wizarding');
    expect(wzTowers).toHaveLength(5);
  });

  it('should have all 5 Westeros towers', () => {
    const weTowers = Object.values(TOWERS).filter((t) => t.universe === 'westeros');
    expect(weTowers).toHaveLength(5);
  });

  it('should have Elven Archer Spire with correct archetype', () => {
    const archer = TOWERS['elven_archer_spire']!;
    expect(archer).toBeDefined();
    expect(archer.cost).toBe(100);
    expect(archer.range).toBe(4);
    expect(archer.attackSpeed).toBe(0.8);
    expect(archer.damage).toBe(15);
    expect(archer.canTargetAir).toBe(true);
  });

  it('should have Gondorian Ballista as expensive DPS', () => {
    const ballista = TOWERS['gondorian_ballista']!;
    expect(ballista).toBeDefined();
    expect(ballista.cost).toBe(300);
    expect(ballista.role).toBe('expensive_dps');
    expect(ballista.canTargetAir).toBe(false);
  });

  it('should have at least 2 air-targeting towers per universe', () => {
    const airTowers = Object.values(TOWERS).filter(
      (t) => t.universe === 'middle_earth' && t.canTargetAir,
    );
    expect(airTowers.length).toBeGreaterThanOrEqual(2);
  });

  it('should follow cost archetype pattern', () => {
    const costs: Record<string, number> = {};
    for (const t of Object.values(TOWERS)) {
      costs[t.role] = t.cost;
    }
    expect(costs['cheap_dps']).toBe(100);
    expect(costs['utility']).toBe(150);
    expect(costs['medium_dps']).toBe(200);
    expect(costs['specialist']).toBe(250);
    expect(costs['expensive_dps']).toBe(300);
  });

  it('should have valid upgrade costs (tier2 = 60% base, tier3 = 100% base)', () => {
    for (const tower of Object.values(TOWERS)) {
      expect(tower.upgradeCostTier2).toBe(Math.round(tower.cost * 0.6));
      expect(tower.upgradeCostTier3).toBe(tower.cost);
    }
  });
});

describe('Enemy data', () => {
  it('should have all 6 Middle-earth enemies (including Balrog boss)', () => {
    const meEnemies = Object.values(ENEMIES).filter((e) => e.universe === 'middle_earth');
    expect(meEnemies).toHaveLength(6);
  });

  it('should have all 8 Wizarding World enemies (5 regulars + 1 spiderling + 2 bosses)', () => {
    const wzEnemies = Object.values(ENEMIES).filter((e) => e.universe === 'wizarding');
    expect(wzEnemies).toHaveLength(8);
  });

  it('should have all 7 Westeros enemies (5 regulars + 2 bosses)', () => {
    const weEnemies = Object.values(ENEMIES).filter((e) => e.universe === 'westeros');
    expect(weEnemies).toHaveLength(7);
  });

  it('should have Basilisk and Voldemort as wizarding bosses', () => {
    const basilisk = ENEMIES['basilisk'];
    expect(basilisk).toBeDefined();
    expect(basilisk!.isBoss).toBe(true);
    expect(basilisk!.bossPhases).toBe(2);
    expect(basilisk!.bossEssenceReward).toBe(120);

    const voldemort = ENEMIES['voldemort'];
    expect(voldemort).toBeDefined();
    expect(voldemort!.isBoss).toBe(true);
    expect(voldemort!.bossPhases).toBe(3);
    expect(voldemort!.bossEssenceReward).toBe(200);
  });

  it('should have White Walker General and Night King as Westeros bosses', () => {
    const wwg = ENEMIES['white_walker_general'];
    expect(wwg).toBeDefined();
    expect(wwg!.isBoss).toBe(true);
    expect(wwg!.bossPhases).toBe(2);
    expect(wwg!.bossEssenceReward).toBe(150);

    const nk = ENEMIES['night_king'];
    expect(nk).toBeDefined();
    expect(nk!.isBoss).toBe(true);
    expect(nk!.bossPhases).toBe(3);
    expect(nk!.bossEssenceReward).toBe(250);
  });

  it('should have Westeros enemies with correct ability types', () => {
    expect(ENEMIES['wight']!.abilityType).toBe('none');
    expect(ENEMIES['unsullied']!.abilityType).toBe('damage_reduction');
    expect(ENEMIES['dothraki_rider']!.abilityType).toBe('dodge_first');
    expect(ENEMIES['shadow_assassin']!.abilityType).toBe('invisible');
    expect(ENEMIES['giant']!.abilityType).toBe('none');
  });

  it('should have Dementor as a flying enemy', () => {
    const dementor = ENEMIES['dementor'];
    expect(dementor).toBeDefined();
    expect(dementor!.isFlying).toBe(true);
  });

  it('should have Orc Grunt as tutorial enemy', () => {
    const grunt = ENEMIES['orc_grunt']!;
    expect(grunt).toBeDefined();
    expect(grunt.baseHP).toBe(50);
    expect(grunt.speed).toBe(1.0);
    expect(grunt.goldReward).toBe(8);
    expect(grunt.abilityType).toBe('none');
  });

  it('should have Goblin Runner as fast low-HP enemy', () => {
    const goblin = ENEMIES['goblin_runner']!;
    expect(goblin).toBeDefined();
    expect(goblin.speed).toBeGreaterThan(1.5);
    expect(goblin.baseHP).toBeLessThan(50);
  });

  it('should scale HP correctly across acts', () => {
    expect(getScaledHP(50, 1, 0)).toBe(50);   // Act 1 Level 1
    expect(getScaledHP(50, 1, 4)).toBe(100);   // Act 1 Level 5
    expect(getScaledHP(50, 2, 0)).toBe(100);   // Act 2 Level 1
    expect(getScaledHP(50, 3, 0)).toBe(200);   // Act 3 Level 1
  });
});

describe('Level data', () => {
  it('should have 6 Act 1 levels (5 main + 1 convergence challenge)', () => {
    const act1Levels = Object.values(LEVELS).filter((l) => l.act === 1);
    expect(act1Levels).toHaveLength(6);
  });

  it('should have 6 Act 2 levels (7-12)', () => {
    const act2Levels = Object.values(LEVELS).filter((l) => l.act === 2);
    expect(act2Levels).toHaveLength(6);
  });

  it('should have 6 Act 3 levels (13-18)', () => {
    const act3Levels = Object.values(LEVELS).filter((l) => l.act === 3);
    expect(act3Levels).toHaveLength(6);
  });

  it('should have correct Act 3 level indices (0-5)', () => {
    const act3Levels = Object.values(LEVELS).filter((l) => l.act === 3);
    const indices = act3Levels.map((l) => l.levelIndex).sort((a, b) => a - b);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should have correct Act 2 level indices (0-5)', () => {
    const act2Levels = Object.values(LEVELS).filter((l) => l.act === 2);
    const indices = act2Levels.map((l) => l.levelIndex).sort((a, b) => a - b);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should have Basilisk boss on Level 11', () => {
    const level11 = LEVELS['act2_level11'];
    expect(level11).toBeDefined();
    expect(level11!.boss).toBe('basilisk');
    expect(level11!.waves).toHaveLength(18);
  });

  it('should have Voldemort boss on Level 12 (Convergence)', () => {
    const level12 = LEVELS['act2_level12'];
    expect(level12).toBeDefined();
    expect(level12!.boss).toBe('voldemort');
    expect(level12!.waves).toHaveLength(20);
    expect(level12!.gridCols).toBe(24);
    expect(level12!.gridRows).toBe(17);
  });

  it('should have correct starting gold for Act 2 levels', () => {
    const act2Levels = Object.values(LEVELS).filter((l) => l.act === 2);
    for (const level of act2Levels) {
      expect(level.startingGold).toBe(800);
    }
  });

  it('should have convergence level with both ME and Wizarding enemies', () => {
    const level12 = LEVELS['act2_level12']!;
    const allEnemyTypes = new Set<string>();
    for (const wave of level12.waves) {
      for (const group of wave.enemies) {
        allEnemyTypes.add(group.type);
      }
    }
    // Middle-earth enemies
    expect(allEnemyTypes.has('orc_grunt')).toBe(true);
    expect(allEnemyTypes.has('uruk_hai_berserker')).toBe(true);
    expect(allEnemyTypes.has('nazgul_shade')).toBe(true);
    // Wizarding enemies
    expect(allEnemyTypes.has('death_eater')).toBe(true);
    expect(allEnemyTypes.has('dementor')).toBe(true);
    expect(allEnemyTypes.has('voldemort')).toBe(true);
  });

  it('should have White Walker General boss on Level 17', () => {
    const level17 = LEVELS['act3_level17'];
    expect(level17).toBeDefined();
    expect(level17!.boss).toBe('white_walker_general');
    expect(level17!.waves).toHaveLength(22);
    expect(level17!.act).toBe(3);
  });

  it('should have Night King boss on Level 18 (Final Convergence)', () => {
    const level18 = LEVELS['act3_level18'];
    expect(level18).toBeDefined();
    expect(level18!.boss).toBe('night_king');
    expect(level18!.waves).toHaveLength(25);
    expect(level18!.gridCols).toBe(28);
    expect(level18!.gridRows).toBe(20);
  });

  it('should have correct starting gold for Act 3 levels', () => {
    const act3Levels = Object.values(LEVELS).filter((l) => l.act === 3);
    for (const level of act3Levels) {
      expect(level.startingGold).toBe(1000);
    }
  });

  it('should have Final Convergence level with all 3 universe enemies', () => {
    const level18 = LEVELS['act3_level18']!;
    const allEnemyTypes = new Set<string>();
    for (const wave of level18.waves) {
      for (const group of wave.enemies) {
        allEnemyTypes.add(group.type);
      }
    }
    // Middle-earth enemies
    expect(allEnemyTypes.has('orc_grunt')).toBe(true);
    expect(allEnemyTypes.has('uruk_hai_berserker')).toBe(true);
    expect(allEnemyTypes.has('nazgul_shade')).toBe(true);
    // Wizarding enemies
    expect(allEnemyTypes.has('death_eater')).toBe(true);
    expect(allEnemyTypes.has('dementor')).toBe(true);
    // Westeros enemies
    expect(allEnemyTypes.has('wight')).toBe(true);
    expect(allEnemyTypes.has('shadow_assassin')).toBe(true);
    expect(allEnemyTypes.has('night_king')).toBe(true);
  });

  it('should have correct Act 1 level indices (0-5)', () => {
    const act1Levels = Object.values(LEVELS).filter((l) => l.act === 1);
    const indices = act1Levels.map((l) => l.levelIndex).sort((a, b) => a - b);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should have act1_level6 as Convergence challenge with 20 waves', () => {
    const level6 = LEVELS['act1_level6'];
    expect(level6).toBeDefined();
    expect(level6!.name).toBe('The Convergence');
    expect(level6!.waves).toHaveLength(20);
    expect(level6!.gridCols).toBe(22);
    expect(level6!.spawns).toHaveLength(2);
    expect(level6!.boss).toBeUndefined();
  });

  it('should have act1_level6 with cross-universe enemies from ME and Wizarding', () => {
    const level6 = LEVELS['act1_level6']!;
    const allEnemyTypes = new Set<string>();
    for (const wave of level6.waves) {
      for (const group of wave.enemies) {
        allEnemyTypes.add(group.type);
      }
    }
    // Middle-earth enemies
    expect(allEnemyTypes.has('orc_grunt')).toBe(true);
    expect(allEnemyTypes.has('uruk_hai_berserker')).toBe(true);
    expect(allEnemyTypes.has('nazgul_shade')).toBe(true);
    // Wizarding enemies
    expect(allEnemyTypes.has('death_eater')).toBe(true);
    expect(allEnemyTypes.has('dementor')).toBe(true);
    expect(allEnemyTypes.has('dark_wizard')).toBe(true);
  });

  it('should have all 18 levels defined across 3 acts', () => {
    const totalLevels = Object.values(LEVELS).length;
    expect(totalLevels).toBe(18);
  });
});

describe('Fusion data', () => {
  const towerIds = new Set(Object.keys(TOWERS));

  it('should have exactly 30 fusion recipes', () => {
    expect(Object.keys(FUSIONS)).toHaveLength(30);
  });

  it('should have 9 intra-universe recipes', () => {
    const intra = Object.values(FUSIONS).filter((f) => f.tier === 'intra');
    expect(intra).toHaveLength(9);
  });

  it('should have 18 cross-universe recipes', () => {
    const cross = Object.values(FUSIONS).filter((f) => f.tier === 'cross');
    expect(cross).toHaveLength(18);
  });

  it('should have 3 convergence recipes', () => {
    const convergence = Object.values(FUSIONS).filter((f) => f.tier === 'convergence');
    expect(convergence).toHaveLength(3);
  });

  it('should have all recipe inputs reference valid tower IDs', () => {
    for (const recipe of Object.values(FUSIONS)) {
      const [inputA, inputB] = recipe.inputs;
      expect(towerIds.has(inputA), `Recipe ${recipe.id}: input "${inputA}" not found in TOWERS`).toBe(true);
      expect(towerIds.has(inputB), `Recipe ${recipe.id}: input "${inputB}" not found in TOWERS`).toBe(true);
    }
  });

  it('should have no duplicate input pairs', () => {
    const seen = new Set<string>();
    for (const recipe of Object.values(FUSIONS)) {
      const [a, b] = recipe.inputs;
      const key = [a, b].sort().join('|');
      expect(seen.has(key), `Duplicate input pair found: ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it('should have 3 intra Middle-earth recipes', () => {
    const meIntra = Object.values(FUSIONS).filter(
      (f) => f.tier === 'intra' && f.universe === 'middle_earth',
    );
    expect(meIntra).toHaveLength(3);
  });

  it('should have 3 intra Wizarding recipes', () => {
    const wizIntra = Object.values(FUSIONS).filter(
      (f) => f.tier === 'intra' && f.universe === 'wizarding',
    );
    expect(wizIntra).toHaveLength(3);
  });

  it('should have 3 intra Westeros recipes', () => {
    const weIntra = Object.values(FUSIONS).filter(
      (f) => f.tier === 'intra' && f.universe === 'westeros',
    );
    expect(weIntra).toHaveLength(3);
  });

  it('should have correct essenceCost for each tier', () => {
    for (const recipe of Object.values(FUSIONS)) {
      if (recipe.tier === 'intra') {
        expect(recipe.essenceCost).toBe(25);
      } else if (recipe.tier === 'cross') {
        expect(recipe.essenceCost).toBe(50);
      } else if (recipe.tier === 'convergence') {
        expect(recipe.essenceCost).toBe(100);
      }
    }
  });

  it('should have all recipes with required fields', () => {
    for (const recipe of Object.values(FUSIONS)) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.inputs).toHaveLength(2);
      expect(recipe.mechanic).toBeTruthy();
      expect(recipe.hint).toBeTruthy();
      expect(recipe.stats.damage).toBeGreaterThan(0);
      expect(recipe.stats.range).toBeGreaterThan(0);
      expect(recipe.stats.attackSpeed).toBeGreaterThan(0);
    }
  });
});

describe('Challenge modifier data', () => {
  it('should have exactly 4 challenge modifiers', () => {
    expect(Object.keys(CHALLENGE_MODIFIERS)).toHaveLength(4);
  });

  it('should have all expected modifier IDs', () => {
    expect(CHALLENGE_MODIFIERS['no_utility']).toBeDefined();
    expect(CHALLENGE_MODIFIERS['double_speed']).toBeDefined();
    expect(CHALLENGE_MODIFIERS['limited_gold']).toBeDefined();
    expect(CHALLENGE_MODIFIERS['fragile_nexus']).toBeDefined();
  });

  it('should have valid modifier structures', () => {
    for (const mod of Object.values(CHALLENGE_MODIFIERS)) {
      expect(mod.id).toBeTruthy();
      expect(mod.name).toBeTruthy();
      expect(mod.description).toBeTruthy();
      expect(typeof mod.modifiers).toBe('object');
    }
  });

  it('should have no_utility ban only utility role', () => {
    const mod = CHALLENGE_MODIFIERS['no_utility']!;
    expect(mod.modifiers.bannedTowerRoles).toEqual(['utility']);
  });

  it('should have double_speed use 2x multiplier', () => {
    const mod = CHALLENGE_MODIFIERS['double_speed']!;
    expect(mod.modifiers.enemySpeedMultiplier).toBe(2);
  });

  it('should have limited_gold use 0.5x multiplier', () => {
    const mod = CHALLENGE_MODIFIERS['limited_gold']!;
    expect(mod.modifiers.startingGoldMultiplier).toBe(0.5);
  });

  it('should have fragile_nexus set maxNexusHP to 1', () => {
    const mod = CHALLENGE_MODIFIERS['fragile_nexus']!;
    expect(mod.modifiers.maxNexusHP).toBe(1);
  });
});
