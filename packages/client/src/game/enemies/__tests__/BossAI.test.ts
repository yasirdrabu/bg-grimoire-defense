import { describe, it, expect, beforeEach } from 'vitest';
import { GameWorld } from '../../ecs/World';
import { PositionComponent } from '../../ecs/components/Position';
import { HealthComponent } from '../../ecs/components/Health';
import { MovementComponent } from '../../ecs/components/Movement';
import { EnemyDataComponent } from '../../ecs/components/EnemyData';
import { BossPhaseComponent } from '../../ecs/components/BossPhase';
import { bossAISystem, _resetBossAIState, FLIGHT_HP_THRESHOLD, FLIGHT_CYCLE_MS, LANDING_DURATION_MS } from '../BossAI';
import { addFireCell, isOnFire, resetFireCells, tickFireCells, FIRE_DURATION_MS } from '../../ecs/systems/FireCellSystem';

// ─── helpers ────────────────────────────────────────────────────────────────

function createBalrog(
  world: GameWorld,
  hpCurrent: number,
  hpMax: number,
  gridX = 5,
  gridY = 7,
) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX, gridY });
  world.addComponent(id, HealthComponent, { current: hpCurrent, max: hpMax });
  world.addComponent(id, MovementComponent, {
    speed: 0.3,
    path: [[gridX, gridY], [19, 7]],
    pathIndex: 0,
    slowMultiplier: 1,
    gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'balrog',
    goldReward: 0,
    scoreValue: 500,
    abilityType: 'boss',
    isFlying: false,
    isBoss: true,
  });
  world.addComponent(id, BossPhaseComponent, {
    bossType: 'balrog',
    current: 'WALKING',
    timer: 0,
    phaseData: {},
  });
  return id;
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('bossAISystem — Phase 1: WALKING', () => {
  beforeEach(() => {
    _resetBossAIState();
    resetFireCells();
  });

  it('Balrog at > 50% HP stays in WALKING', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1500, 2000); // 75% HP

    bossAISystem(world, 16);

    const phase = world.getComponent(id, BossPhaseComponent)!;
    expect(phase.current).toBe('WALKING');
  });

  it('Balrog at exactly 50% HP transitions to FLIGHT', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000); // exactly 50%

    bossAISystem(world, 16);

    const phase = world.getComponent(id, BossPhaseComponent)!;
    expect(phase.current).toBe('FLIGHT');
  });

  it('Balrog at < 50% HP transitions to FLIGHT', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 900, 2000); // 45% HP

    bossAISystem(world, 16);

    const phase = world.getComponent(id, BossPhaseComponent)!;
    expect(phase.current).toBe('FLIGHT');
  });

  it('creates a fire cell at the Balrog\'s current grid position during WALKING', () => {
    const world = new GameWorld();
    createBalrog(world, 1500, 2000, 5, 7);

    bossAISystem(world, 16);

    expect(isOnFire(5, 7)).toBe(true);
  });

  it('creates fire cells at different positions as the Balrog moves', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1500, 2000, 3, 7);

    bossAISystem(world, 16);
    expect(isOnFire(3, 7)).toBe(true);

    // Manually move the Balrog to simulate path progress
    const pos = world.getComponent(id, PositionComponent)!;
    pos.gridX = 4;

    bossAISystem(world, 16);
    expect(isOnFire(4, 7)).toBe(true);
    // Old cell should still be on fire (hasn't expired yet)
    expect(isOnFire(3, 7)).toBe(true);
  });
});

describe('bossAISystem — Phase transition: WALKING → FLIGHT', () => {
  beforeEach(() => {
    _resetBossAIState();
    resetFireCells();
  });

  it('isFlying is set to true when transitioning to FLIGHT', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000); // 50% HP

    bossAISystem(world, 16);

    const enemyData = world.getComponent(id, EnemyDataComponent)!;
    expect(enemyData.isFlying).toBe(true);
  });

  it('FLIGHT timer is initialised to FLIGHT_CYCLE_MS on transition', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 999, 2000); // below 50%

    bossAISystem(world, 16);

    const phase = world.getComponent(id, BossPhaseComponent)!;
    expect(phase.timer).toBe(FLIGHT_CYCLE_MS);
  });
});

describe('bossAISystem — Phase 2: FLIGHT', () => {
  beforeEach(() => {
    _resetBossAIState();
    resetFireCells();
  });

  it('Balrog in FLIGHT is only targetable by air towers (isFlying = true)', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000); // 50% — transitions to FLIGHT

    bossAISystem(world, 16);

    const enemyData = world.getComponent(id, EnemyDataComponent)!;
    expect(enemyData.isFlying).toBe(true);
  });

  it('transitions to LANDING after FLIGHT_CYCLE_MS has elapsed', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000);

    // Trigger phase transition
    bossAISystem(world, 16);
    expect(world.getComponent(id, BossPhaseComponent)!.current).toBe('FLIGHT');

    // Tick until FLIGHT_CYCLE_MS expires (one big tick)
    bossAISystem(world, FLIGHT_CYCLE_MS);

    const phase = world.getComponent(id, BossPhaseComponent)!;
    expect(phase.current).toBe('LANDING');
  });

  it('LANDING timer is LANDING_DURATION_MS when landing begins', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000);

    bossAISystem(world, 16);
    bossAISystem(world, FLIGHT_CYCLE_MS);

    const phase = world.getComponent(id, BossPhaseComponent)!;
    expect(phase.current).toBe('LANDING');
    expect(phase.timer).toBe(LANDING_DURATION_MS);
  });

  it('isFlying becomes false during LANDING', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000);

    bossAISystem(world, 16);
    bossAISystem(world, FLIGHT_CYCLE_MS);

    const enemyData = world.getComponent(id, EnemyDataComponent)!;
    expect(enemyData.isFlying).toBe(false);
  });

  it('returns to FLIGHT after LANDING_DURATION_MS expires', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000);

    // Transition: WALKING → FLIGHT
    bossAISystem(world, 16);
    // FLIGHT → LANDING
    bossAISystem(world, FLIGHT_CYCLE_MS);
    expect(world.getComponent(id, BossPhaseComponent)!.current).toBe('LANDING');

    // LANDING → FLIGHT
    bossAISystem(world, LANDING_DURATION_MS);

    const phase = world.getComponent(id, BossPhaseComponent)!;
    expect(phase.current).toBe('FLIGHT');
  });

  it('isFlying is restored to true after returning from LANDING', () => {
    const world = new GameWorld();
    const id = createBalrog(world, 1000, 2000);

    bossAISystem(world, 16);
    bossAISystem(world, FLIGHT_CYCLE_MS);
    bossAISystem(world, LANDING_DURATION_MS);

    const enemyData = world.getComponent(id, EnemyDataComponent)!;
    expect(enemyData.isFlying).toBe(true);
  });
});

describe('FireCellSystem — fire cell lifecycle', () => {
  beforeEach(() => {
    resetFireCells();
  });

  it('fire cells expire after FIRE_DURATION_MS', () => {
    const world = new GameWorld();
    createBalrog(world, 1500, 2000, 6, 7);

    // Create the fire cell via the boss
    bossAISystem(world, 16);
    expect(isOnFire(6, 7)).toBe(true);

    // Tick until expiry
    tickFireCells(FIRE_DURATION_MS);

    expect(isOnFire(6, 7)).toBe(false);
  });

  it('fire cells do NOT expire before FIRE_DURATION_MS', () => {
    const world = new GameWorld();
    createBalrog(world, 1500, 2000, 8, 7);

    bossAISystem(world, 16);
    expect(isOnFire(8, 7)).toBe(true);

    // Tick almost to expiry
    tickFireCells(FIRE_DURATION_MS - 1);

    expect(isOnFire(8, 7)).toBe(true);
  });

  it('addFireCell refreshes an existing fire cell timer', () => {
    addFireCell(3, 3);
    // Tick away most of the duration
    tickFireCells(FIRE_DURATION_MS - 100);
    expect(isOnFire(3, 3)).toBe(true);

    // Re-ignite — timer should reset
    addFireCell(3, 3);
    tickFireCells(100); // would have expired without refresh
    expect(isOnFire(3, 3)).toBe(true);

    // Now tick the full reset duration
    tickFireCells(FIRE_DURATION_MS);
    expect(isOnFire(3, 3)).toBe(false);
  });

  it('isOnFire returns false for cells not on fire', () => {
    expect(isOnFire(99, 99)).toBe(false);
  });
});

describe('bossAISystem — FLIGHT_HP_THRESHOLD constant', () => {
  it('FLIGHT_HP_THRESHOLD is 0.5', () => {
    expect(FLIGHT_HP_THRESHOLD).toBe(0.5);
  });
});
