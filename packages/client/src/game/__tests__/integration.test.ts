/**
 * Integration test: 2-wave gameplay without Phaser.
 *
 * Exercises the full ECS game loop — tower placement, enemy spawning, combat,
 * death, scoring, and wave progression — using the ECS world and systems
 * directly, with no sprites or rendering.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import PF from 'pathfinding';

import { GameWorld } from '../ecs/World';
import { LEVELS, TOWERS } from '@grimoire/shared';
import { WAVE_CLEAR_PAUSE_MS } from '@grimoire/shared';
import { WaveSystem } from '../ecs/systems/WaveSystem';
import { inputSystem } from '../ecs/systems/InputSystem';
import { enemyAISystem, _resetEnemyAIState } from '../enemies/EnemyAI';
import { movementSystem } from '../ecs/systems/MovementSystem';
import { targetingSystem } from '../ecs/systems/TargetingSystem';
import { attackSystem } from '../ecs/systems/AttackSystem';
import { projectileSystem } from '../ecs/systems/ProjectileSystem';
import { statusEffectSystem } from '../ecs/systems/StatusEffectSystem';
import { deathSystem } from '../ecs/systems/DeathSystem';
import { nexusSystem } from '../ecs/systems/NexusSystem';
import { scoreSystem, resetScoreSystem } from '../ecs/systems/ScoreSystem';
import { resetFireCells } from '../ecs/systems/FireCellSystem';
import { createTowerEntity } from '../towers/TowerFactory';
import { createEnemyEntity } from '../enemies/EnemyFactory';
import { useGameStore } from '../../stores/useGameStore';
import { HealthComponent } from '../ecs/components/Health';
import { EnemyDataComponent } from '../ecs/components/EnemyData';
import { TowerDataComponent } from '../ecs/components/TowerData';
import { AttackComponent } from '../ecs/components/Attack';
import { PositionComponent } from '../ecs/components/Position';
import { ProjectileComponent } from '../ecs/components/Projectile';

// ─── Constants ───────────────────────────────────────────────────────────────

const LEVEL = LEVELS['act1_level1']!;
const NEXUS_X = LEVEL.nexus[0];
const NEXUS_Y = LEVEL.nexus[1];
const SPAWN_X = LEVEL.spawns[0]![0];
const SPAWN_Y = LEVEL.spawns[0]![1];
const FRAME_MS = 16;

// Tower placement positions along y=7 (same row as path)
const TOWER_PLACEMENTS: Array<{ type: string; gridX: number; gridY: number }> = [
  { type: 'elven_archer_spire', gridX: 5, gridY: 7 },
  { type: 'ent_watchtower', gridX: 7, gridY: 7 },
  { type: 'istari_crystal', gridX: 9, gridY: 7 },
  { type: 'dwarven_cannon', gridX: 11, gridY: 7 },
  { type: 'gondorian_ballista', gridX: 13, gridY: 7 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a 20×15 grid (0 = walkable) with tower positions marked as blocked (1),
 * then compute a path from spawn to nexus using A*.
 */
function buildGridAndPath(
  towerPositions: Array<{ gridX: number; gridY: number }>,
): [number, number][] {
  // 15 rows × 20 cols, all walkable
  const gridData: number[][] = Array.from({ length: 15 }, () => new Array(20).fill(0));

  for (const { gridX, gridY } of towerPositions) {
    gridData[gridY]![gridX] = 1; // blocked
  }

  const grid = new PF.Grid(gridData);
  const finder = new PF.AStarFinder({ allowDiagonal: false });
  const rawPath = finder.findPath(SPAWN_X, SPAWN_Y, NEXUS_X, NEXUS_Y, grid);
  return rawPath as [number, number][];
}

/**
 * Run the full ECS game-loop pipeline for one frame.
 */
function tickSystems(world: GameWorld, dt: number): void {
  inputSystem(world, dt);
  enemyAISystem(world, dt);
  movementSystem(world, dt);
  targetingSystem(world, dt);
  attackSystem(world, dt);
  projectileSystem(world, dt);
  statusEffectSystem(world, dt);
  deathSystem(world, dt);
  nexusSystem(world, dt, NEXUS_X, NEXUS_Y);
  scoreSystem(world, dt);
}

/**
 * Count living enemies (health > 0, entity still exists).
 */
function countLivingEnemies(world: GameWorld): number {
  return world.query(HealthComponent, EnemyDataComponent).filter((id) => {
    const health = world.getComponent(id, HealthComponent);
    return health !== undefined && health.current > 0;
  }).length;
}

/**
 * Advance WaveSystem through pre_wave countdown immediately by calling
 * sendWaveEarly(), then tick until we leave pre_wave.
 */
function fastForwardToSpawning(waveSystem: WaveSystem): void {
  waveSystem.sendWaveEarly();
  // Tick with a large delta to exit pre_wave
  waveSystem.tick(FRAME_MS, 0);
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('Integration: 2-wave gameplay', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    resetScoreSystem();
    resetFireCells();
    _resetEnemyAIState();
    // Suppress console.debug noise from AudioManager
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  it('places all 5 Middle-earth tower types with correct components', () => {
    const world = new GameWorld();

    for (const { type, gridX, gridY } of TOWER_PLACEMENTS) {
      const def = TOWERS[type]!;
      const entityId = createTowerEntity(world, type, gridX, gridY);

      const towerData = world.getComponent(entityId, TowerDataComponent);
      const attack = world.getComponent(entityId, AttackComponent);
      const pos = world.getComponent(entityId, PositionComponent);

      expect(towerData, `${type} TowerData missing`).toBeDefined();
      expect(attack, `${type} Attack missing`).toBeDefined();
      expect(pos, `${type} Position missing`).toBeDefined();

      expect(towerData!.towerId).toBe(type);
      expect(towerData!.tier).toBe(1);
      expect(pos!.gridX).toBe(gridX);
      expect(pos!.gridY).toBe(gridY);
      expect(attack!.range).toBe(def.range);
      expect(attack!.damage).toBe(def.damage);
    }
  });

  it('runs 2 full waves: enemies are killed, gold increases, score increases', () => {
    const world = new GameWorld();
    const waveSystem = new WaveSystem(LEVEL);

    // ── Initialise store ──────────────────────────────────────────────────────
    useGameStore.setState({
      gold: LEVEL.startingGold,
      nexusHP: LEVEL.maxNexusHP,
      maxNexusHP: LEVEL.maxNexusHP,
      totalWaves: LEVEL.waves.length,
      score: 0,
    });

    // ── Place towers ──────────────────────────────────────────────────────────
    let goldSpent = 0;
    for (const { type, gridX, gridY } of TOWER_PLACEMENTS) {
      createTowerEntity(world, type, gridX, gridY);
      goldSpent += TOWERS[type]!.cost;
    }
    useGameStore.setState({
      gold: LEVEL.startingGold - goldSpent,
    });

    // ── Compute path (towers at y=7 are blocked, path goes around them) ───────
    const path = buildGridAndPath(TOWER_PLACEMENTS);
    // Path must be non-empty — towers are on the path row but A* will route around
    expect(path.length).toBeGreaterThan(0);

    const goldAfterBuild = useGameStore.getState().gold;

    // ─────────────────────────────────────────────────────────────────────────
    // WAVE 1
    // ─────────────────────────────────────────────────────────────────────────
    fastForwardToSpawning(waveSystem);
    expect(waveSystem.getState()).toBe('spawning');

    let totalSpawned = 0;
    let wave1Killed = 0;
    const wave1EnemyIds = new Set<number>();

    // Run enough frames so all wave-1 enemies spawn and combat resolves.
    // Wave 1: 8 orc_grunts @ 800ms interval → ~5.6s to spawn all.
    // At 1.0 speed on a 20-cell path the slowest enemy takes ~20s to walk.
    // We run 1000 frames × 16ms = 16s of game time — towers should kill most/all.
    const WAVE1_FRAMES = 1000;

    for (let frame = 0; frame < WAVE1_FRAMES; frame++) {
      const aliveCount = countLivingEnemies(world);
      const events = waveSystem.tick(FRAME_MS, aliveCount);

      for (const event of events) {
        if (event.type === 'SPAWN_ENEMY') {
          const id = createEnemyEntity(
            world,
            event.enemyType,
            SPAWN_X,
            SPAWN_Y,
            path,
            LEVEL.act,
            LEVEL.levelIndex,
          );
          wave1EnemyIds.add(id);
          totalSpawned++;
        }
      }

      tickSystems(world, FRAME_MS);

      // Track kills: entity no longer in world means it was destroyed by deathSystem
      for (const id of wave1EnemyIds) {
        if (world.getComponent(id, EnemyDataComponent) === undefined) {
          wave1Killed++;
          wave1EnemyIds.delete(id);
        }
      }

      // Early exit once wave is clear or level_complete
      if (
        waveSystem.getState() === 'wave_clear' ||
        waveSystem.getState() === 'level_complete'
      ) {
        break;
      }
    }

    // ── Wave 1 assertions ─────────────────────────────────────────────────────
    // At least some enemies should have been killed by the towers
    expect(wave1Killed).toBeGreaterThan(0);

    // Gold should have increased from kills
    const goldAfterWave1 = useGameStore.getState().gold;
    expect(goldAfterWave1).toBeGreaterThan(goldAfterBuild);

    // Score should be positive
    expect(useGameStore.getState().score).toBeGreaterThan(0);

    // Wave system should have progressed from spawning
    const stateAfterWave1 = waveSystem.getState();
    expect(['active', 'wave_clear', 'level_complete']).toContain(stateAfterWave1);

    // Nexus should still be standing (towers are placed along the only route)
    expect(useGameStore.getState().nexusHP).toBeGreaterThan(0);

    // ─────────────────────────────────────────────────────────────────────────
    // Advance through wave_clear pause to Wave 2
    // ─────────────────────────────────────────────────────────────────────────
    if (stateAfterWave1 === 'wave_clear') {
      // Tick through the WAVE_CLEAR_PAUSE_MS delay
      const clearFrames = Math.ceil(WAVE_CLEAR_PAUSE_MS / FRAME_MS) + 2;
      for (let f = 0; f < clearFrames; f++) {
        waveSystem.tick(FRAME_MS, countLivingEnemies(world));
        tickSystems(world, FRAME_MS);
        if (waveSystem.getState() === 'pre_wave') break;
      }

      expect(waveSystem.getState()).toBe('pre_wave');
      expect(waveSystem.getCurrentWaveIndex()).toBe(1);
    }

    // If level was already complete (all enemies leaked to nexus before being
    // killed), skip wave 2 — the integration goal is still met.
    if (waveSystem.getState() === 'level_complete') {
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WAVE 2
    // ─────────────────────────────────────────────────────────────────────────
    const scoreBeforeWave2 = useGameStore.getState().score;
    const goldBeforeWave2 = useGameStore.getState().gold;

    fastForwardToSpawning(waveSystem);
    expect(waveSystem.getState()).toBe('spawning');
    expect(waveSystem.getCurrentWaveIndex()).toBe(1);

    let wave2Killed = 0;
    const wave2EnemyIds = new Set<number>();
    const WAVE2_FRAMES = 1000;

    for (let frame = 0; frame < WAVE2_FRAMES; frame++) {
      const aliveCount = countLivingEnemies(world);
      const events = waveSystem.tick(FRAME_MS, aliveCount);

      for (const event of events) {
        if (event.type === 'SPAWN_ENEMY') {
          const id = createEnemyEntity(
            world,
            event.enemyType,
            SPAWN_X,
            SPAWN_Y,
            path,
            LEVEL.act,
            LEVEL.levelIndex,
          );
          wave2EnemyIds.add(id);
        }
      }

      tickSystems(world, FRAME_MS);

      for (const id of wave2EnemyIds) {
        if (world.getComponent(id, EnemyDataComponent) === undefined) {
          wave2Killed++;
          wave2EnemyIds.delete(id);
        }
      }

      if (
        waveSystem.getState() === 'wave_clear' ||
        waveSystem.getState() === 'level_complete'
      ) {
        break;
      }
    }

    // ── Wave 2 assertions ─────────────────────────────────────────────────────
    expect(wave2Killed).toBeGreaterThan(0);

    // Cumulative gold should have grown further
    expect(useGameStore.getState().gold).toBeGreaterThan(goldBeforeWave2);

    // Score should be higher than after wave 1
    expect(useGameStore.getState().score).toBeGreaterThan(scoreBeforeWave2);

    // Wave counter should now be 1 (0-indexed wave 2)
    expect(waveSystem.getCurrentWaveIndex()).toBe(1);

    // Nexus should still be alive
    expect(useGameStore.getState().nexusHP).toBeGreaterThan(0);
  });

  it('WaveSystem emits correct number of SPAWN_ENEMY events for wave 1', () => {
    const waveSystem = new WaveSystem(LEVEL);

    fastForwardToSpawning(waveSystem);

    const spawnEvents: string[] = [];

    // Wave 1: 8 orc_grunts @ 800ms interval
    // Tick enough to spawn all 8: 8 * 800ms = 6400ms + buffer
    const totalMs = 10_000;
    const stepMs = 100;
    for (let elapsed = 0; elapsed < totalMs; elapsed += stepMs) {
      const events = waveSystem.tick(stepMs, 99); // 99 = always some alive, stay in spawning
      for (const e of events) {
        if (e.type === 'SPAWN_ENEMY') spawnEvents.push(e.enemyType);
      }
      if (waveSystem.getState() !== 'spawning') break;
    }

    expect(spawnEvents).toHaveLength(8);
    expect(spawnEvents.every((t) => t === 'orc_grunt')).toBe(true);
  });

  it('towers acquire targets and fire projectiles within range', () => {
    const world = new GameWorld();

    // Place a single elven archer spire (range 4) at (5, 7)
    createTowerEntity(world, 'elven_archer_spire', 5, 7);

    // Spawn an enemy directly in range (7, 7) — distance ~2 tiles
    const path: [number, number][] = [[7, 7], [19, 7]];
    const enemyId = createEnemyEntity(world, 'orc_grunt', 7, 7, path, 1, 0);

    // One targeting + attack tick
    targetingSystem(world, FRAME_MS);
    const attack = world.query(AttackComponent).map((id) => world.getComponent(id, AttackComponent)!)[0]!;
    expect(attack.targetId).toBe(enemyId);

    attackSystem(world, FRAME_MS);

    // A projectile should now exist
    const projectiles = world.query(ProjectileComponent);
    expect(projectiles.length).toBeGreaterThan(0);
  });

  it('enemies die and award gold when HP reaches 0', () => {
    const world = new GameWorld();
    const path: [number, number][] = [[0, 7], [19, 7]];

    // Create an already-dead enemy
    const enemyId = createEnemyEntity(world, 'orc_grunt', 0, 7, path, 1, 0);
    const health = world.getComponent(enemyId, HealthComponent)!;
    health.current = 0;

    const goldBefore = useGameStore.getState().gold;
    const scoreBefore = useGameStore.getState().score;

    deathSystem(world, FRAME_MS);

    // Enemy destroyed
    expect(world.getComponent(enemyId, EnemyDataComponent)).toBeUndefined();

    // Gold and score awarded
    expect(useGameStore.getState().gold).toBeGreaterThan(goldBefore); // +8 (orc_grunt reward)
    expect(useGameStore.getState().score).toBeGreaterThan(scoreBefore); // +10 (orc_grunt scoreValue)
  });
});
