import { describe, it, expect } from 'vitest';
import { GameWorld } from '../../World';
import { PositionComponent } from '../../components/Position';
import { HealthComponent } from '../../components/Health';
import { ProjectileComponent } from '../../components/Projectile';
import { StatusEffectsComponent } from '../../components/StatusEffects';
import { projectileSystem } from '../ProjectileSystem';

function createTarget(world: GameWorld, x: number, y: number, hp = 100) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, HealthComponent, { current: hp, max: hp });
  world.addComponent(id, StatusEffectsComponent, { effects: [] });
  return id;
}

describe('ProjectileSystem', () => {
  it('should destroy projectile when target is gone', () => {
    const world = new GameWorld();
    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 0, gridY: 0 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: 9999, // non-existent
      speed: 8,
      damage: 10,
      damageType: 'physical',
    });

    projectileSystem(world, 100);
    expect(world.query(ProjectileComponent)).toHaveLength(0);
  });

  it('should move projectile toward target', () => {
    const world = new GameWorld();
    const target = createTarget(world, 10, 5);
    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 0, gridY: 5 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: target,
      speed: 8,
      damage: 10,
      damageType: 'physical',
    });

    projectileSystem(world, 500); // 0.5s
    const pos = world.getComponent(proj, PositionComponent)!;
    expect(pos.gridX).toBeGreaterThan(0);
    expect(pos.gridX).toBeLessThan(10);
  });

  it('should apply status effect on hit', () => {
    const world = new GameWorld();
    const target = createTarget(world, 5.1, 5);
    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: target,
      speed: 100,
      damage: 10,
      damageType: 'arcane',
      statusEffect: { type: 'slow', duration: 2000, magnitude: 0.3 },
    });

    projectileSystem(world, 100);
    const effects = world.getComponent(target, StatusEffectsComponent)!;
    expect(effects.effects).toHaveLength(1);
    expect(effects.effects[0]!.type).toBe('slow');
    expect(effects.effects[0]!.magnitude).toBe(0.3);
  });

  it('should not apply status effect if target has no StatusEffectsComponent', () => {
    const world = new GameWorld();
    // Create target without StatusEffects
    const target = world.createEntity();
    world.addComponent(target, PositionComponent, { gridX: 5.1, gridY: 5 });
    world.addComponent(target, HealthComponent, { current: 100, max: 100 });

    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: target,
      speed: 100,
      damage: 10,
      damageType: 'physical',
      statusEffect: { type: 'slow', duration: 2000, magnitude: 0.3 },
    });

    // Should not crash
    expect(() => projectileSystem(world, 100)).not.toThrow();
    expect(world.getComponent(target, HealthComponent)!.current).toBe(90);
  });

  it('should destroy projectile on hit', () => {
    const world = new GameWorld();
    const target = createTarget(world, 5.1, 5);
    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: target,
      speed: 100,
      damage: 10,
      damageType: 'physical',
    });

    projectileSystem(world, 100);
    expect(world.query(ProjectileComponent)).toHaveLength(0);
  });

  it('should not apply damage if target has no Health component', () => {
    const world = new GameWorld();
    const target = world.createEntity();
    world.addComponent(target, PositionComponent, { gridX: 5.1, gridY: 5 });

    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: target,
      speed: 100,
      damage: 10,
      damageType: 'physical',
    });

    expect(() => projectileSystem(world, 100)).not.toThrow();
  });
});
