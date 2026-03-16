import { describe, it, expect } from 'vitest';
import { GameWorld } from '../../ecs/World';
import { createEnemyEntity } from '../EnemyFactory';
import { PositionComponent } from '../../ecs/components/Position';
import { HealthComponent } from '../../ecs/components/Health';
import { MovementComponent } from '../../ecs/components/Movement';
import { EnemyDataComponent } from '../../ecs/components/EnemyData';
import { RenderableComponent } from '../../ecs/components/Renderable';
import { StatusEffectsComponent } from '../../ecs/components/StatusEffects';

describe('EnemyFactory', () => {
  const defaultPath: [number, number][] = [[0, 7], [5, 7], [10, 7], [19, 7]];

  it('should create an enemy entity with all required components', () => {
    const world = new GameWorld();
    const id = createEnemyEntity(world, 'orc_grunt', 0, 7, defaultPath, 1, 0);

    expect(world.getComponent(id, PositionComponent)).toBeDefined();
    expect(world.getComponent(id, HealthComponent)).toBeDefined();
    expect(world.getComponent(id, MovementComponent)).toBeDefined();
    expect(world.getComponent(id, EnemyDataComponent)).toBeDefined();
    expect(world.getComponent(id, RenderableComponent)).toBeDefined();
    expect(world.getComponent(id, StatusEffectsComponent)).toBeDefined();
  });

  it('should set position to spawn coordinates', () => {
    const world = new GameWorld();
    const id = createEnemyEntity(world, 'orc_grunt', 3, 5, defaultPath, 1, 0);
    const pos = world.getComponent(id, PositionComponent)!;
    expect(pos.gridX).toBe(3);
    expect(pos.gridY).toBe(5);
  });

  it('should scale HP based on act and level', () => {
    const world = new GameWorld();
    const idAct1 = createEnemyEntity(world, 'orc_grunt', 0, 0, defaultPath, 1, 0);
    const idAct2 = createEnemyEntity(world, 'orc_grunt', 0, 0, defaultPath, 2, 0);

    const hp1 = world.getComponent(idAct1, HealthComponent)!;
    const hp2 = world.getComponent(idAct2, HealthComponent)!;

    expect(hp2.current).toBeGreaterThan(hp1.current);
    expect(hp1.current).toBe(hp1.max);
    expect(hp2.current).toBe(hp2.max);
  });

  it('should assign correct movement data with path', () => {
    const world = new GameWorld();
    const path: [number, number][] = [[0, 0], [5, 0], [10, 0]];
    const id = createEnemyEntity(world, 'orc_grunt', 0, 0, path, 1, 0);
    const mov = world.getComponent(id, MovementComponent)!;

    expect(mov.path).toEqual(path);
    expect(mov.pathIndex).toBe(0);
    expect(mov.slowMultiplier).toBe(1);
    expect(mov.speed).toBe(1.0); // orc_grunt speed
  });

  it('should assign correct enemy data from definition', () => {
    const world = new GameWorld();
    const id = createEnemyEntity(world, 'orc_grunt', 0, 0, defaultPath, 1, 0);
    const data = world.getComponent(id, EnemyDataComponent)!;

    expect(data.enemyId).toBe('orc_grunt');
    expect(data.goldReward).toBe(8);
    expect(data.scoreValue).toBe(10);
    expect(data.abilityType).toBe('none');
    expect(data.isFlying).toBe(false);
    expect(data.isBoss).toBe(false);
  });

  it('should initialize with empty status effects', () => {
    const world = new GameWorld();
    const id = createEnemyEntity(world, 'orc_grunt', 0, 0, defaultPath, 1, 0);
    const effects = world.getComponent(id, StatusEffectsComponent)!;
    expect(effects.effects).toEqual([]);
  });

  it('should set renderable sprite key to enemy type', () => {
    const world = new GameWorld();
    const id = createEnemyEntity(world, 'orc_grunt', 0, 0, defaultPath, 1, 0);
    const renderable = world.getComponent(id, RenderableComponent)!;
    expect(renderable.spriteKey).toBe('orc_grunt');
    expect(renderable.visible).toBe(true);
  });

  it('should throw for unknown enemy type', () => {
    const world = new GameWorld();
    expect(() =>
      createEnemyEntity(world, 'nonexistent_enemy', 0, 0, defaultPath, 1, 0),
    ).toThrow('Unknown enemy type: nonexistent_enemy');
  });

  it('should create different enemies with correct stats', () => {
    const world = new GameWorld();
    const grunt = createEnemyEntity(world, 'orc_grunt', 0, 0, defaultPath, 1, 0);
    const runner = createEnemyEntity(world, 'goblin_runner', 0, 0, defaultPath, 1, 0);

    const gruntMov = world.getComponent(grunt, MovementComponent)!;
    const runnerMov = world.getComponent(runner, MovementComponent)!;

    // Goblin runner should be faster
    expect(runnerMov.speed).toBeGreaterThan(gruntMov.speed);

    // Orc grunt should have more HP
    const gruntHP = world.getComponent(grunt, HealthComponent)!;
    const runnerHP = world.getComponent(runner, HealthComponent)!;
    expect(gruntHP.max).toBeGreaterThan(runnerHP.max);
  });

  it('should create unique entity IDs for each enemy', () => {
    const world = new GameWorld();
    const id1 = createEnemyEntity(world, 'orc_grunt', 0, 0, defaultPath, 1, 0);
    const id2 = createEnemyEntity(world, 'orc_grunt', 1, 0, defaultPath, 1, 0);
    expect(id1).not.toBe(id2);
  });
});
