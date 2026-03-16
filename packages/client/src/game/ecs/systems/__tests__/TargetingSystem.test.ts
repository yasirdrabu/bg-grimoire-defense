import { describe, it, expect } from 'vitest';
import { GameWorld } from '../../World';
import { PositionComponent } from '../../components/Position';
import { HealthComponent } from '../../components/Health';
import { MovementComponent } from '../../components/Movement';
import { AttackComponent } from '../../components/Attack';
import { TowerDataComponent } from '../../components/TowerData';
import { EnemyDataComponent } from '../../components/EnemyData';
import { RenderableComponent } from '../../components/Renderable';
import { StatusEffectsComponent } from '../../components/StatusEffects';
import { targetingSystem } from '../TargetingSystem';

function createTower(world: GameWorld, x: number, y: number, range = 4, canTargetAir = true) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, AttackComponent, {
    range,
    damage: 10,
    damageType: 'physical',
    attackSpeed: 1,
    cooldownRemaining: 0,
    targetId: null,
    targetingMode: 'nearest',
    projectileType: 'arrow',
    canTargetAir,
  });
  world.addComponent(id, TowerDataComponent, {
    towerId: 'test_tower',
    tier: 1,
    totalInvestment: 100,
    isFusion: false,
  });
  return id;
}

function createEnemy(world: GameWorld, x: number, y: number, hp = 100, isFlying = false) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, HealthComponent, { current: hp, max: hp });
  world.addComponent(id, MovementComponent, {
    speed: 1, path: [[x, y]], pathIndex: 0, slowMultiplier: 1, gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'test', goldReward: 5, scoreValue: 10, abilityType: 'none', isFlying, isBoss: false,
  });
  world.addComponent(id, RenderableComponent, { spriteKey: 'test', visible: true });
  world.addComponent(id, StatusEffectsComponent, { effects: [] });
  return id;
}

describe('TargetingSystem', () => {
  it('should not target flying enemies when canTargetAir is false', () => {
    const world = new GameWorld();
    const tower = createTower(world, 5, 5, 10, false);
    createEnemy(world, 6, 5, 100, true); // flying

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBeNull();
  });

  it('should target flying enemies when canTargetAir is true', () => {
    const world = new GameWorld();
    const tower = createTower(world, 5, 5, 10, true);
    const flyer = createEnemy(world, 6, 5, 100, true);

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBe(flyer);
  });

  it('should skip dead enemies', () => {
    const world = new GameWorld();
    const tower = createTower(world, 5, 5, 10);
    createEnemy(world, 6, 5, 0); // dead

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBeNull();
  });

  it('should keep current target if still in range and alive', () => {
    const world = new GameWorld();
    const tower = createTower(world, 5, 5, 10);
    const enemy = createEnemy(world, 6, 5, 100);

    // Lock target
    world.getComponent(tower, AttackComponent)!.targetId = enemy;

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBe(enemy);
  });

  it('should drop target that moves out of range', () => {
    const world = new GameWorld();
    const tower = createTower(world, 5, 5, 2);
    const enemy = createEnemy(world, 6, 5, 100);

    // Lock target, then move enemy far away
    world.getComponent(tower, AttackComponent)!.targetId = enemy;
    world.getComponent(enemy, PositionComponent)!.gridX = 50;

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    // Should have acquired a new target (or null if none in range)
    expect(attack.targetId).not.toBe(enemy);
  });

  it('should drop target that dies', () => {
    const world = new GameWorld();
    const tower = createTower(world, 5, 5, 10);
    const enemy = createEnemy(world, 6, 5, 100);

    world.getComponent(tower, AttackComponent)!.targetId = enemy;
    world.getComponent(enemy, HealthComponent)!.current = 0;

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBeNull();
  });

  it('should skip ground-only tower targeting flying when no ground enemies exist', () => {
    const world = new GameWorld();
    const tower = createTower(world, 5, 5, 10, false);
    createEnemy(world, 6, 5, 100, true);
    createEnemy(world, 7, 5, 100, true);

    targetingSystem(world, 16);
    expect(world.getComponent(tower, AttackComponent)!.targetId).toBeNull();
  });
});
