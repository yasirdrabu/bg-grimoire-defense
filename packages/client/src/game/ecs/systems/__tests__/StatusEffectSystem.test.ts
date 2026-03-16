import { describe, it, expect } from 'vitest';
import { GameWorld } from '../../World';
import { PositionComponent } from '../../components/Position';
import { HealthComponent } from '../../components/Health';
import { MovementComponent } from '../../components/Movement';
import { EnemyDataComponent } from '../../components/EnemyData';
import { StatusEffectsComponent } from '../../components/StatusEffects';
import { statusEffectSystem } from '../StatusEffectSystem';

function createEnemy(world: GameWorld, hp = 100) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: 5, gridY: 5 });
  world.addComponent(id, HealthComponent, { current: hp, max: hp });
  world.addComponent(id, MovementComponent, {
    speed: 1, path: [[5, 5], [10, 5]], pathIndex: 0, slowMultiplier: 1, gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'test', goldReward: 5, scoreValue: 10, abilityType: 'none', isFlying: false, isBoss: false,
  });
  world.addComponent(id, StatusEffectsComponent, { effects: [] });
  return id;
}

describe('StatusEffectSystem', () => {
  it('should apply stun by setting slowMultiplier to 0', () => {
    const world = new GameWorld();
    const enemy = createEnemy(world);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push({ type: 'stun', remainingMs: 2000, magnitude: 1 });

    statusEffectSystem(world, 16);
    const movement = world.getComponent(enemy, MovementComponent)!;
    expect(movement.slowMultiplier).toBe(0);
  });

  it('should stack multiple slow effects multiplicatively', () => {
    const world = new GameWorld();
    const enemy = createEnemy(world);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push(
      { type: 'slow', remainingMs: 2000, magnitude: 0.3 },
      { type: 'slow', remainingMs: 2000, magnitude: 0.2 },
    );

    statusEffectSystem(world, 16);
    const movement = world.getComponent(enemy, MovementComponent)!;
    // (1 - 0.3) * (1 - 0.2) = 0.7 * 0.8 = 0.56
    expect(movement.slowMultiplier).toBeCloseTo(0.56);
  });

  it('should apply poison damage over time', () => {
    const world = new GameWorld();
    const enemy = createEnemy(world, 100);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push({ type: 'poison', remainingMs: 5000, magnitude: 5 }); // 5 DPS

    statusEffectSystem(world, 2000); // 2 seconds
    const health = world.getComponent(enemy, HealthComponent)!;
    expect(health.current).toBeCloseTo(90); // 100 - 5 * 2
  });

  it('should reset slowMultiplier each frame before applying effects', () => {
    const world = new GameWorld();
    const enemy = createEnemy(world);
    const movement = world.getComponent(enemy, MovementComponent)!;
    movement.slowMultiplier = 0.5; // leftover from previous frame

    // No active effects
    statusEffectSystem(world, 16);
    expect(movement.slowMultiplier).toBe(1);
  });

  it('should remove multiple expired effects in one pass', () => {
    const world = new GameWorld();
    const enemy = createEnemy(world);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push(
      { type: 'slow', remainingMs: 50, magnitude: 0.3 },
      { type: 'burn', remainingMs: 50, magnitude: 10 },
      { type: 'stun', remainingMs: 50, magnitude: 1 },
    );

    statusEffectSystem(world, 100);
    expect(effects.effects).toHaveLength(0);
  });

  it('should handle entity with StatusEffects but no Movement', () => {
    const world = new GameWorld();
    const id = world.createEntity();
    world.addComponent(id, StatusEffectsComponent, {
      effects: [{ type: 'slow', remainingMs: 1000, magnitude: 0.5 }],
    });

    // Should not crash
    expect(() => statusEffectSystem(world, 16)).not.toThrow();
  });

  it('stun should override any slow effects (multiplier = 0)', () => {
    const world = new GameWorld();
    const enemy = createEnemy(world);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push(
      { type: 'slow', remainingMs: 2000, magnitude: 0.3 },
      { type: 'stun', remainingMs: 2000, magnitude: 1 },
    );

    statusEffectSystem(world, 16);
    const movement = world.getComponent(enemy, MovementComponent)!;
    expect(movement.slowMultiplier).toBe(0);
  });
});
