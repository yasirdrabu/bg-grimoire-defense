import { describe, it, expect } from 'vitest';
import { TOWERS } from '../data/towers';
import { ENEMIES } from '../data/enemies';
import type { TowerDefinition } from '../types/tower';
import type { EnemyDefinition } from '../types/enemy';
import { getScaledHP } from '../types/enemy';

describe('Tower data', () => {
  it('should have all 5 Middle-earth towers', () => {
    const meTowers = Object.values(TOWERS).filter((t) => t.universe === 'middle_earth');
    expect(meTowers).toHaveLength(5);
  });

  it('should have Elven Archer Spire with correct archetype', () => {
    const archer = TOWERS['elven_archer_spire'];
    expect(archer).toBeDefined();
    expect(archer.cost).toBe(100);
    expect(archer.range).toBe(4);
    expect(archer.attackSpeed).toBe(0.8);
    expect(archer.damage).toBe(15);
    expect(archer.canTargetAir).toBe(true);
  });

  it('should have Gondorian Ballista as expensive DPS', () => {
    const ballista = TOWERS['gondorian_ballista'];
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
  it('should have all 5 Middle-earth enemies', () => {
    const meEnemies = Object.values(ENEMIES).filter((e) => e.universe === 'middle_earth');
    expect(meEnemies).toHaveLength(5);
  });

  it('should have Orc Grunt as tutorial enemy', () => {
    const grunt = ENEMIES['orc_grunt'];
    expect(grunt).toBeDefined();
    expect(grunt.baseHP).toBe(50);
    expect(grunt.speed).toBe(1.0);
    expect(grunt.goldReward).toBe(8);
    expect(grunt.abilityType).toBe('none');
  });

  it('should have Goblin Runner as fast low-HP enemy', () => {
    const goblin = ENEMIES['goblin_runner'];
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
