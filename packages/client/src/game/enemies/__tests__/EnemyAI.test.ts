import { describe, it, expect, beforeEach } from 'vitest';
import { GameWorld } from '../../ecs/World';
import { PositionComponent } from '../../ecs/components/Position';
import { HealthComponent } from '../../ecs/components/Health';
import { MovementComponent } from '../../ecs/components/Movement';
import { AttackComponent } from '../../ecs/components/Attack';
import { TowerDataComponent } from '../../ecs/components/TowerData';
import { EnemyDataComponent } from '../../ecs/components/EnemyData';
import { TowerDisabledComponent } from '../../ecs/components/TowerDisabled';
import { enemyAISystem, _resetEnemyAIState } from '../EnemyAI';

function createEnrageEnemy(world: GameWorld, hpCurrent: number, hpMax: number, speed = 0.7) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: 5, gridY: 5 });
  world.addComponent(id, HealthComponent, { current: hpCurrent, max: hpMax });
  world.addComponent(id, MovementComponent, {
    speed,
    path: [[5, 5], [15, 5]],
    pathIndex: 0,
    slowMultiplier: 1,
    gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'uruk_hai_berserker',
    goldReward: 15,
    scoreValue: 20,
    abilityType: 'enrage',
    isFlying: false,
    isBoss: false,
  });
  return id;
}

function createCaveTroll(world: GameWorld, x: number, y: number) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, HealthComponent, { current: 300, max: 300 });
  world.addComponent(id, MovementComponent, {
    speed: 0.4,
    path: [[x, y], [x + 5, y]],
    pathIndex: 0,
    slowMultiplier: 1,
    gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'cave_troll',
    goldReward: 25,
    scoreValue: 35,
    abilityType: 'tower_smash',
    isFlying: false,
    isBoss: false,
  });
  return id;
}

function createNazgul(world: GameWorld, x: number, y: number) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, HealthComponent, { current: 80, max: 80 });
  world.addComponent(id, MovementComponent, {
    speed: 1.2,
    path: [[x, y], [x + 5, y]],
    pathIndex: 0,
    slowMultiplier: 1,
    gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'nazgul_shade',
    goldReward: 20,
    scoreValue: 30,
    abilityType: 'fear_aura',
    isFlying: false,
    isBoss: false,
  });
  return id;
}

function createTower(world: GameWorld, x: number, y: number, attackSpeed = 1.0) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, AttackComponent, {
    range: 4,
    damage: 20,
    damageType: 'physical',
    attackSpeed,
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
  return id;
}

describe('enemyAISystem — enrage (Uruk-hai Berserker)', () => {
  beforeEach(() => {
    _resetEnemyAIState();
  });

  it('should increase speed by 50% when HP drops below 30%', () => {
    const world = new GameWorld();
    // 25% HP — below 30% threshold
    const enemy = createEnrageEnemy(world, 30, 120, 0.7);

    enemyAISystem(world, 16);

    const movement = world.getComponent(enemy, MovementComponent)!;
    expect(movement.speed).toBeCloseTo(0.7 * 1.5);
  });

  it('should not enrage when HP is above 30%', () => {
    const world = new GameWorld();
    // 50% HP — above threshold
    const enemy = createEnrageEnemy(world, 60, 120, 0.7);

    enemyAISystem(world, 16);

    const movement = world.getComponent(enemy, MovementComponent)!;
    expect(movement.speed).toBeCloseTo(0.7);
  });

  it('should not enrage exactly at 30% HP', () => {
    const world = new GameWorld();
    // Exactly 30% HP — should NOT enrage (threshold is strictly less than)
    const enemy = createEnrageEnemy(world, 36, 120, 0.7);

    enemyAISystem(world, 16);

    const movement = world.getComponent(enemy, MovementComponent)!;
    expect(movement.speed).toBeCloseTo(0.7);
  });

  it('should not double-enrage on subsequent ticks', () => {
    const world = new GameWorld();
    const enemy = createEnrageEnemy(world, 25, 120, 0.7);

    // First tick triggers enrage
    enemyAISystem(world, 16);
    const speedAfterFirstTick = world.getComponent(enemy, MovementComponent)!.speed;
    expect(speedAfterFirstTick).toBeCloseTo(0.7 * 1.5);

    // Second tick should not re-apply the multiplier
    enemyAISystem(world, 16);
    const speedAfterSecondTick = world.getComponent(enemy, MovementComponent)!.speed;
    expect(speedAfterSecondTick).toBeCloseTo(0.7 * 1.5);
  });

  it('should not affect enemy with abilityType none', () => {
    const world = new GameWorld();
    const id = world.createEntity();
    world.addComponent(id, PositionComponent, { gridX: 5, gridY: 5 });
    world.addComponent(id, HealthComponent, { current: 5, max: 50 });
    world.addComponent(id, MovementComponent, {
      speed: 1.0,
      path: [[5, 5], [10, 5]],
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

    enemyAISystem(world, 16);

    const movement = world.getComponent(id, MovementComponent)!;
    expect(movement.speed).toBeCloseTo(1.0);
  });
});

describe('enemyAISystem — tower_smash (Cave Troll)', () => {
  beforeEach(() => {
    _resetEnemyAIState();
  });

  it('should disable tower when cave troll passes within 1.5 tiles', () => {
    const world = new GameWorld();
    // Troll at (5, 5), tower at (6, 5) — distance = 1.0 (within 1.5)
    createCaveTroll(world, 5, 5);
    const tower = createTower(world, 6, 5);

    enemyAISystem(world, 16);

    const disabled = world.getComponent(tower, TowerDisabledComponent);
    expect(disabled).toBeDefined();
    expect(disabled!.remainingMs).toBe(3000);
  });

  it('should not disable tower when cave troll is farther than 1.5 tiles', () => {
    const world = new GameWorld();
    // Troll at (5, 5), tower at (10, 5) — distance = 5.0 (beyond 1.5)
    createCaveTroll(world, 5, 5);
    const tower = createTower(world, 10, 5);

    enemyAISystem(world, 16);

    const disabled = world.getComponent(tower, TowerDisabledComponent);
    expect(disabled).toBeUndefined();
  });

  it('should not re-smash the same tower on subsequent ticks', () => {
    const world = new GameWorld();
    createCaveTroll(world, 5, 5);
    const tower = createTower(world, 6, 5);

    // First tick: smash applied
    enemyAISystem(world, 16);
    const disabledAfterFirst = world.getComponent(tower, TowerDisabledComponent)!;
    expect(disabledAfterFirst.remainingMs).toBe(3000);

    // Manually reduce the timer to simulate time passing
    disabledAfterFirst.remainingMs = 100;

    // Second tick: troll still nearby but should NOT re-apply fresh 3000ms
    // (tower already smashed in this passage; cooldown tracked per troll)
    enemyAISystem(world, 16);
    const disabledAfterSecond = world.getComponent(tower, TowerDisabledComponent)!;
    // Timer should not have been reset to 3000 — it was ticked down by deltaMs
    expect(disabledAfterSecond.remainingMs).toBeLessThan(3000);
  });

  it('should tick down and remove TowerDisabled when duration expires', () => {
    const world = new GameWorld();
    // Place troll far away so it doesn't re-smash the tower during this tick
    createCaveTroll(world, 20, 20);
    const tower = createTower(world, 6, 5);

    // Apply disabled state manually with small duration
    world.addComponent(tower, TowerDisabledComponent, { remainingMs: 50 });

    // tick with deltaMs greater than remainingMs
    enemyAISystem(world, 100);

    const disabled = world.getComponent(tower, TowerDisabledComponent);
    expect(disabled).toBeUndefined();
  });

  it('should disable tower at exactly 1.5 tiles distance', () => {
    const world = new GameWorld();
    // Troll at (5, 5), tower at (5, 6.5) — distance = 1.5 (exactly at boundary)
    createCaveTroll(world, 5, 5);
    const tower = createTower(world, 5, 6.5);

    enemyAISystem(world, 16);

    const disabled = world.getComponent(tower, TowerDisabledComponent);
    expect(disabled).toBeDefined();
  });
});

describe('enemyAISystem — fear_aura (Nazgûl Shade)', () => {
  beforeEach(() => {
    _resetEnemyAIState();
  });

  it('should increase attackSpeed of nearby tower (making it attack slower)', () => {
    const world = new GameWorld();
    // Nazgul at (5, 5), tower at (7, 5) — distance = 2 (within 3 tiles)
    createNazgul(world, 5, 5);
    const tower = createTower(world, 7, 5, 1.0);

    enemyAISystem(world, 16);

    const attack = world.getComponent(tower, AttackComponent)!;
    // attackSpeed should be increased (higher = slower = 25% longer between shots)
    expect(attack.attackSpeed).toBeCloseTo(1.25);
  });

  it('should not affect tower outside 3 tile range', () => {
    const world = new GameWorld();
    // Nazgul at (5, 5), tower at (10, 5) — distance = 5 (beyond 3 tiles)
    createNazgul(world, 5, 5);
    const tower = createTower(world, 10, 5, 1.0);

    enemyAISystem(world, 16);

    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.attackSpeed).toBeCloseTo(1.0);
  });

  it('should restore attackSpeed on the next frame when nazgul moves away', () => {
    const world = new GameWorld();
    const nazgul = createNazgul(world, 5, 5);
    const tower = createTower(world, 7, 5, 1.0);

    // First tick: fear aura applied
    enemyAISystem(world, 16);
    expect(world.getComponent(tower, AttackComponent)!.attackSpeed).toBeCloseTo(1.25);

    // Move nazgul far away
    const nazgulPos = world.getComponent(nazgul, PositionComponent)!;
    nazgulPos.gridX = 20;
    nazgulPos.gridY = 20;

    // Second tick: fear restored at start of frame
    enemyAISystem(world, 16);
    expect(world.getComponent(tower, AttackComponent)!.attackSpeed).toBeCloseTo(1.0);
  });

  it('should not stack fear aura from multiple nazgul on the same tower', () => {
    const world = new GameWorld();
    // Two nazgul near the same tower
    createNazgul(world, 5, 5);
    createNazgul(world, 6, 5);
    const tower = createTower(world, 7, 5, 1.0);

    enemyAISystem(world, 16);

    // Should only be applied once — 1.25x, not 1.25 * 1.25
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.attackSpeed).toBeCloseTo(1.25);
  });

  it('should affect multiple towers each within range of the nazgul', () => {
    const world = new GameWorld();
    createNazgul(world, 5, 5);
    const tower1 = createTower(world, 7, 5, 1.0);
    const tower2 = createTower(world, 5, 7, 1.0);

    enemyAISystem(world, 16);

    expect(world.getComponent(tower1, AttackComponent)!.attackSpeed).toBeCloseTo(1.25);
    expect(world.getComponent(tower2, AttackComponent)!.attackSpeed).toBeCloseTo(1.25);
  });
});

describe('enemyAISystem — AttackSystem integration (disabled towers do not fire)', () => {
  beforeEach(() => {
    _resetEnemyAIState();
  });

  it('should prevent a disabled tower from firing', async () => {
    const { attackSystem } = await import('../../ecs/systems/AttackSystem');
    const { ProjectileComponent } = await import('../../ecs/components/Projectile');
    const world = new GameWorld();

    const tower = createTower(world, 5, 5);
    // Create a target enemy
    const enemy = world.createEntity();
    world.addComponent(enemy, PositionComponent, { gridX: 6, gridY: 5 });
    world.addComponent(enemy, HealthComponent, { current: 100, max: 100 });
    world.addComponent(enemy, MovementComponent, {
      speed: 1,
      path: [[6, 5], [10, 5]],
      pathIndex: 0,
      slowMultiplier: 1,
      gridVersion: 0,
    });
    world.addComponent(enemy, EnemyDataComponent, {
      enemyId: 'orc_grunt',
      goldReward: 8,
      scoreValue: 10,
      abilityType: 'none',
      isFlying: false,
      isBoss: false,
    });

    // Lock target on tower
    world.getComponent(tower, AttackComponent)!.targetId = enemy;

    // Disable the tower
    world.addComponent(tower, TowerDisabledComponent, { remainingMs: 3000 });

    attackSystem(world, 16);

    const projectiles = world.query(ProjectileComponent);
    expect(projectiles).toHaveLength(0);
  });
});
