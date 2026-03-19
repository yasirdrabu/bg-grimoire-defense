import { describe, it, expect } from 'vitest';
import { TOWERS } from '../data/towers';
import { ENEMIES } from '../data/enemies';
import { LEVELS } from '../data/levels';
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
  it('should have 5 Act 1 levels', () => {
    const act1Levels = Object.values(LEVELS).filter((l) => l.act === 1);
    expect(act1Levels).toHaveLength(5);
  });

  it('should have 6 Act 2 levels (7-12)', () => {
    const act2Levels = Object.values(LEVELS).filter((l) => l.act === 2);
    expect(act2Levels).toHaveLength(6);
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
});
