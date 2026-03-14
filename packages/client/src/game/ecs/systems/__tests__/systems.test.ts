import { describe, it, expect, beforeEach } from 'vitest';
import { GameWorld } from '../../World';
import { PositionComponent } from '../../components/Position';
import { HealthComponent } from '../../components/Health';
import { MovementComponent } from '../../components/Movement';
import { AttackComponent } from '../../components/Attack';
import { TowerDataComponent } from '../../components/TowerData';
import { EnemyDataComponent } from '../../components/EnemyData';
import { RenderableComponent } from '../../components/Renderable';
import { ProjectileComponent } from '../../components/Projectile';
import { StatusEffectsComponent } from '../../components/StatusEffects';
import { movementSystem } from '../MovementSystem';
import { targetingSystem } from '../TargetingSystem';
import { attackSystem } from '../AttackSystem';
import { projectileSystem } from '../ProjectileSystem';
import { statusEffectSystem } from '../StatusEffectSystem';
import { useGameStore } from '../../../../stores/useGameStore';

function createTowerAt(world: GameWorld, x: number, y: number, range = 4, damage = 15) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, AttackComponent, {
    range,
    damage,
    damageType: 'physical',
    attackSpeed: 0.8,
    cooldownRemaining: 0,
    targetId: null,
    targetingMode: 'nearest',
    projectileType: 'arrow',
    canTargetAir: true,
  });
  world.addComponent(id, TowerDataComponent, {
    towerId: 'elven_archer_spire',
    tier: 1,
    totalInvestment: 100,
    isFusion: false,
  });
  world.addComponent(id, RenderableComponent, { spriteKey: 'test', visible: true });
  return id;
}

function createEnemyAt(world: GameWorld, x: number, y: number, hp = 100) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, HealthComponent, { current: hp, max: hp });
  world.addComponent(id, MovementComponent, {
    speed: 1.0,
    path: [[x, y], [x + 5, y]],
    pathIndex: 0,
    slowMultiplier: 1,
    gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'orc_grunt',
    goldReward: 8,
    scoreValue: 10,
    abilityType: 'none',
    isFlying: false,
    isBoss: false,
  });
  world.addComponent(id, RenderableComponent, { spriteKey: 'test', visible: true });
  world.addComponent(id, StatusEffectsComponent, { effects: [] });
  return id;
}

describe('MovementSystem', () => {
  it('should advance enemy along path', () => {
    const world = new GameWorld();
    const enemy = world.createEntity();
    world.addComponent(enemy, PositionComponent, { gridX: 0, gridY: 0 });
    world.addComponent(enemy, MovementComponent, {
      speed: 1.0,
      path: [[0, 0], [1, 0], [2, 0]],
      pathIndex: 0,
      slowMultiplier: 1,
      gridVersion: 0,
    });

    movementSystem(world, 500); // 0.5 seconds
    const pos = world.getComponent(enemy, PositionComponent)!;
    expect(pos.gridX).toBeGreaterThan(0);
  });

  it('should apply separation between nearby enemies', () => {
    const world = new GameWorld();
    const e1 = world.createEntity();
    const e2 = world.createEntity();

    // Start slightly offset (within separation radius of 0.6)
    world.addComponent(e1, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(e1, MovementComponent, {
      speed: 1.0, path: [[5, 5], [10, 5]], pathIndex: 0, slowMultiplier: 1, gridVersion: 0,
    });
    world.addComponent(e2, PositionComponent, { gridX: 5.1, gridY: 5 });
    world.addComponent(e2, MovementComponent, {
      speed: 1.0, path: [[5, 5], [10, 5]], pathIndex: 0, slowMultiplier: 1, gridVersion: 0,
    });

    const xGapBefore = Math.abs(
      world.getComponent(e1, PositionComponent)!.gridX -
      world.getComponent(e2, PositionComponent)!.gridX,
    );

    movementSystem(world, 500);

    const p1 = world.getComponent(e1, PositionComponent)!;
    const p2 = world.getComponent(e2, PositionComponent)!;
    // Separation should cause them to move at different speeds (e1 pushed backward)
    // Verify they're not at exactly the same X position
    const xGapAfter = Math.abs(p1.gridX - p2.gridX);
    expect(xGapAfter).toBeGreaterThan(0);
  });
});

describe('TargetingSystem', () => {
  it('should acquire nearest enemy within range', () => {
    const world = new GameWorld();
    const tower = createTowerAt(world, 5, 5, 4);
    const enemy = createEnemyAt(world, 6, 5);

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBe(enemy);
  });

  it('should not target enemies out of range', () => {
    const world = new GameWorld();
    const tower = createTowerAt(world, 0, 0, 2);
    createEnemyAt(world, 10, 10);

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBeNull();
  });

  it('should prefer nearest enemy', () => {
    const world = new GameWorld();
    const tower = createTowerAt(world, 5, 5, 10);
    createEnemyAt(world, 8, 5); // far
    const near = createEnemyAt(world, 6, 5); // near

    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBe(near);
  });
});

describe('AttackSystem', () => {
  it('should spawn projectile when cooldown ready and target locked', () => {
    const world = new GameWorld();
    const tower = createTowerAt(world, 5, 5);
    const enemy = createEnemyAt(world, 6, 5);

    // Lock target
    world.getComponent(tower, AttackComponent)!.targetId = enemy;

    attackSystem(world, 16);

    // Should have spawned a projectile
    const projectiles = world.query(ProjectileComponent);
    expect(projectiles).toHaveLength(1);
  });

  it('should not fire when on cooldown', () => {
    const world = new GameWorld();
    const tower = createTowerAt(world, 5, 5);
    const enemy = createEnemyAt(world, 6, 5);

    const attack = world.getComponent(tower, AttackComponent)!;
    attack.targetId = enemy;
    attack.cooldownRemaining = 5; // still on cooldown

    attackSystem(world, 16);

    const projectiles = world.query(ProjectileComponent);
    expect(projectiles).toHaveLength(0);
  });
});

describe('ProjectileSystem', () => {
  it('should move projectile toward target', () => {
    const world = new GameWorld();
    const enemy = createEnemyAt(world, 10, 5);
    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: enemy,
      speed: 8,
      damage: 15,
      damageType: 'physical',
    });

    projectileSystem(world, 100);
    const pos = world.getComponent(proj, PositionComponent)!;
    expect(pos.gridX).toBeGreaterThan(5);
  });

  it('should apply damage on hit', () => {
    const world = new GameWorld();
    const enemy = createEnemyAt(world, 5.1, 5, 100);
    const proj = world.createEntity();
    world.addComponent(proj, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(proj, ProjectileComponent, {
      targetId: enemy,
      speed: 100,
      damage: 30,
      damageType: 'physical',
    });

    projectileSystem(world, 100);
    const health = world.getComponent(enemy, HealthComponent)!;
    expect(health.current).toBe(70);
  });
});

describe('StatusEffectSystem', () => {
  it('should apply slow to movement', () => {
    const world = new GameWorld();
    const enemy = createEnemyAt(world, 5, 5);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push({ type: 'slow', remainingMs: 2000, magnitude: 0.3 });

    statusEffectSystem(world, 16);
    const movement = world.getComponent(enemy, MovementComponent)!;
    expect(movement.slowMultiplier).toBeCloseTo(0.7);
  });

  it('should expire effects after duration', () => {
    const world = new GameWorld();
    const enemy = createEnemyAt(world, 5, 5);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push({ type: 'slow', remainingMs: 100, magnitude: 0.3 });

    statusEffectSystem(world, 200); // exceed duration
    expect(effects.effects).toHaveLength(0);
  });

  it('should apply DoT damage for burn', () => {
    const world = new GameWorld();
    const enemy = createEnemyAt(world, 5, 5, 100);
    const effects = world.getComponent(enemy, StatusEffectsComponent)!;
    effects.effects.push({ type: 'burn', remainingMs: 5000, magnitude: 10 }); // 10 DPS

    statusEffectSystem(world, 1000); // 1 second
    const health = world.getComponent(enemy, HealthComponent)!;
    expect(health.current).toBeCloseTo(90);
  });
});

describe('DeathSystem + NexusSystem', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  it('should award gold on enemy death (via DeathSystem)', async () => {
    const { deathSystem } = await import('../DeathSystem');
    const world = new GameWorld();
    const enemy = createEnemyAt(world, 5, 5, 0); // already dead

    const goldBefore = useGameStore.getState().gold;
    deathSystem(world, 16);

    expect(useGameStore.getState().gold).toBe(goldBefore + 8);
    expect(world.query(EnemyDataComponent)).toHaveLength(0);
  });

  it('should deduct nexus HP when enemy reaches nexus', async () => {
    const { nexusSystem } = await import('../NexusSystem');
    const world = new GameWorld();
    createEnemyAt(world, 19, 7); // near nexus at (19, 7)
    world.getComponent(
      world.query(MovementComponent)[0]!,
      MovementComponent,
    )!.pathIndex = 999; // at end of path

    const hpBefore = useGameStore.getState().nexusHP;
    nexusSystem(world, 16, 19, 7);

    expect(useGameStore.getState().nexusHP).toBe(hpBefore - 1);
  });
});
