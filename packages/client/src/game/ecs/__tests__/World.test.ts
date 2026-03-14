import { describe, it, expect } from 'vitest';
import { GameWorld } from '../World';
import { PositionComponent } from '../components/Position';
import { HealthComponent } from '../components/Health';
import { MovementComponent } from '../components/Movement';

describe('ECS World', () => {
  it('should create entities with incrementing IDs', () => {
    const world = new GameWorld();
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    expect(e2).toBe(e1 + 1);
  });

  it('should add and retrieve components', () => {
    const world = new GameWorld();
    const entity = world.createEntity();
    world.addComponent(entity, PositionComponent, { gridX: 5, gridY: 3 });
    const pos = world.getComponent(entity, PositionComponent);
    expect(pos).toEqual({ gridX: 5, gridY: 3 });
  });

  it('should return undefined for missing components', () => {
    const world = new GameWorld();
    const entity = world.createEntity();
    expect(world.getComponent(entity, PositionComponent)).toBeUndefined();
  });

  it('should query entities by single component type', () => {
    const world = new GameWorld();
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    world.addComponent(e1, PositionComponent, { gridX: 0, gridY: 0 });
    const results = world.query(PositionComponent);
    expect(results).toContain(e1);
    expect(results).not.toContain(e2);
  });

  it('should query entities by multiple component types', () => {
    const world = new GameWorld();
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    const e3 = world.createEntity();
    world.addComponent(e1, PositionComponent, { gridX: 0, gridY: 0 });
    world.addComponent(e1, HealthComponent, { current: 100, max: 100 });
    world.addComponent(e2, PositionComponent, { gridX: 1, gridY: 1 });
    world.addComponent(e3, HealthComponent, { current: 50, max: 50 });
    const results = world.query(PositionComponent, HealthComponent);
    expect(results).toEqual([e1]);
  });

  it('should destroy entities and clean up all components', () => {
    const world = new GameWorld();
    const entity = world.createEntity();
    world.addComponent(entity, PositionComponent, { gridX: 0, gridY: 0 });
    world.addComponent(entity, HealthComponent, { current: 100, max: 100 });
    world.destroyEntity(entity);
    expect(world.getComponent(entity, PositionComponent)).toBeUndefined();
    expect(world.getComponent(entity, HealthComponent)).toBeUndefined();
    expect(world.query(PositionComponent)).toEqual([]);
  });

  it('should remove individual components', () => {
    const world = new GameWorld();
    const entity = world.createEntity();
    world.addComponent(entity, PositionComponent, { gridX: 0, gridY: 0 });
    world.addComponent(entity, HealthComponent, { current: 100, max: 100 });
    world.removeComponent(entity, HealthComponent);
    expect(world.getComponent(entity, PositionComponent)).toBeDefined();
    expect(world.getComponent(entity, HealthComponent)).toBeUndefined();
  });

  it('should allow component mutation', () => {
    const world = new GameWorld();
    const entity = world.createEntity();
    world.addComponent(entity, HealthComponent, { current: 100, max: 100 });
    const health = world.getComponent(entity, HealthComponent)!;
    health.current = 50;
    expect(world.getComponent(entity, HealthComponent)!.current).toBe(50);
  });

  it('should handle many entities efficiently', () => {
    const world = new GameWorld();
    const ids: number[] = [];
    for (let i = 0; i < 200; i++) {
      const id = world.createEntity();
      world.addComponent(id, PositionComponent, { gridX: i, gridY: 0 });
      if (i % 2 === 0) {
        world.addComponent(id, HealthComponent, { current: 100, max: 100 });
      }
      ids.push(id);
    }
    const withHealth = world.query(PositionComponent, HealthComponent);
    expect(withHealth).toHaveLength(100);
  });
});
