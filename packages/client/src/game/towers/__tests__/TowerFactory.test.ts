import { describe, it, expect } from 'vitest';
import { GameWorld } from '../../ecs/World';
import { createTowerEntity } from '../TowerFactory';
import { PositionComponent } from '../../ecs/components/Position';
import { AttackComponent } from '../../ecs/components/Attack';
import { TowerDataComponent } from '../../ecs/components/TowerData';
import { RenderableComponent } from '../../ecs/components/Renderable';
import { TOWERS } from '@grimoire/shared';

describe('TowerFactory', () => {
  it('should create a tower entity with all required components', () => {
    const world = new GameWorld();
    const id = createTowerEntity(world, 'elven_archer_spire', 5, 5);

    expect(world.getComponent(id, PositionComponent)).toBeDefined();
    expect(world.getComponent(id, AttackComponent)).toBeDefined();
    expect(world.getComponent(id, TowerDataComponent)).toBeDefined();
    expect(world.getComponent(id, RenderableComponent)).toBeDefined();
  });

  it('should set position to grid coordinates', () => {
    const world = new GameWorld();
    const id = createTowerEntity(world, 'elven_archer_spire', 8, 3);
    const pos = world.getComponent(id, PositionComponent)!;
    expect(pos.gridX).toBe(8);
    expect(pos.gridY).toBe(3);
  });

  it('should assign attack stats from tower definition', () => {
    const world = new GameWorld();
    const towerType = 'elven_archer_spire';
    const def = TOWERS[towerType]!;
    const id = createTowerEntity(world, towerType, 5, 5);
    const attack = world.getComponent(id, AttackComponent)!;

    expect(attack.range).toBe(def.range);
    expect(attack.damage).toBe(def.damage);
    expect(attack.damageType).toBe(def.damageType);
    expect(attack.attackSpeed).toBe(def.attackSpeed);
    expect(attack.cooldownRemaining).toBe(0);
    expect(attack.targetId).toBeNull();
    expect(attack.targetingMode).toBe('nearest');
  });

  it('should start at tier 1 with correct investment', () => {
    const world = new GameWorld();
    const towerType = 'elven_archer_spire';
    const def = TOWERS[towerType]!;
    const id = createTowerEntity(world, towerType, 5, 5);
    const data = world.getComponent(id, TowerDataComponent)!;

    expect(data.towerId).toBe(towerType);
    expect(data.tier).toBe(1);
    expect(data.totalInvestment).toBe(def.cost);
    expect(data.isFusion).toBe(false);
  });

  it('should set renderable sprite key to tower type', () => {
    const world = new GameWorld();
    const id = createTowerEntity(world, 'elven_archer_spire', 5, 5);
    const renderable = world.getComponent(id, RenderableComponent)!;
    expect(renderable.spriteKey).toBe('elven_archer_spire');
    expect(renderable.visible).toBe(true);
  });

  it('should throw for unknown tower type', () => {
    const world = new GameWorld();
    expect(() =>
      createTowerEntity(world, 'nonexistent_tower', 5, 5),
    ).toThrow('Unknown tower type: nonexistent_tower');
  });

  it('should create unique entity IDs for each tower', () => {
    const world = new GameWorld();
    const id1 = createTowerEntity(world, 'elven_archer_spire', 5, 5);
    const id2 = createTowerEntity(world, 'elven_archer_spire', 6, 5);
    expect(id1).not.toBe(id2);
  });

  it('should carry over canTargetAir from definition', () => {
    const world = new GameWorld();
    const towerType = 'elven_archer_spire';
    const def = TOWERS[towerType]!;
    const id = createTowerEntity(world, towerType, 5, 5);
    const attack = world.getComponent(id, AttackComponent)!;
    expect(attack.canTargetAir).toBe(def.canTargetAir);
  });

  it('should carry over projectileType from definition', () => {
    const world = new GameWorld();
    const towerType = 'elven_archer_spire';
    const def = TOWERS[towerType]!;
    const id = createTowerEntity(world, towerType, 5, 5);
    const attack = world.getComponent(id, AttackComponent)!;
    expect(attack.projectileType).toBe(def.projectileType);
  });
});
