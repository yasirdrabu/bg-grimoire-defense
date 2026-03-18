/**
 * BossAI — Balrog boss multi-phase AI system.
 *
 * Phase 1 — WALKING (HP > 50%):
 *   - Follows normal enemy path (MovementSystem handles movement)
 *   - Leaves a fire trail: every cell the Balrog occupies becomes a fire cell
 *
 * Phase 2 — FLIGHT (HP <= 50%):
 *   - isFlying flag set on EnemyData → only air-targetable towers can hit it
 *   - Moves between predefined waypoints (map center ↔ spawn area)
 *   - Every FLIGHT_CYCLE_MS, transitions to LANDING for LANDING_DURATION_MS
 *
 * LANDING (sub-state of Phase 2):
 *   - isFlying = false → all towers can target it
 *   - Stationary for LANDING_DURATION_MS, then returns to FLIGHT
 *
 * No Phaser dependencies in this file.
 */

import type { World } from '@grimoire/shared';
import { BossPhaseComponent } from '../ecs/components/BossPhase';
import { EnemyDataComponent } from '../ecs/components/EnemyData';
import { HealthComponent } from '../ecs/components/Health';
import { PositionComponent } from '../ecs/components/Position';
import { MovementComponent } from '../ecs/components/Movement';
import { addFireCell } from '../ecs/systems/FireCellSystem';

/** HP fraction below which the boss transitions to flight */
const FLIGHT_HP_THRESHOLD = 0.5;

/** Time (ms) Balrog spends flying before landing */
const FLIGHT_CYCLE_MS = 8_000;

/** Duration (ms) of LANDING state */
const LANDING_DURATION_MS = 3_000;

/**
 * Waypoints for the figure-8 / oscillating flight pattern.
 * Index 0 = spawn-side, Index 1 = nexus-side (map centre).
 * These are logical grid coordinates; adjust to match your map layout.
 */
const FLIGHT_WAYPOINTS: readonly [number, number][] = [
  [2, 7],   // near spawn
  [10, 7],  // map centre
];

/** Tracks which bosses we've already set up phase data for */
const initialisedBosses = new Set<number>();

/**
 * Process all boss entities each frame.
 * Must run AFTER enemyAISystem and BEFORE movementSystem.
 */
export function bossAISystem(world: World, deltaMs: number): void {
  const bosses = world.query(BossPhaseComponent, EnemyDataComponent, HealthComponent, PositionComponent);

  // Clean up tracking for destroyed entities
  for (const id of initialisedBosses) {
    const health = world.getComponent(id, HealthComponent);
    if (!health || health.current <= 0) {
      initialisedBosses.delete(id);
    }
  }

  for (const bossId of bosses) {
    const health = world.getComponent(bossId, HealthComponent)!;
    if (health.current <= 0) continue;

    const phase = world.getComponent(bossId, BossPhaseComponent)!;
    const enemyData = world.getComponent(bossId, EnemyDataComponent)!;
    const pos = world.getComponent(bossId, PositionComponent)!;

    switch (phase.current) {
      case 'WALKING':
        processWalking(world, bossId, health, phase, enemyData, pos, deltaMs);
        break;
      case 'FLIGHT':
        processFlight(world, bossId, phase, enemyData, pos, deltaMs);
        break;
      case 'LANDING':
        processLanding(world, bossId, phase, enemyData, deltaMs);
        break;
      case 'DEAD':
        break;
      default:
        break;
    }
  }
}

function processWalking(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  enemyData: import('../ecs/components/EnemyData').EnemyDataData,
  pos: import('../ecs/components/Position').PositionData,
  _deltaMs: number,
): void {
  // Leave fire trail at current grid cell
  addFireCell(Math.round(pos.gridX), Math.round(pos.gridY));

  // Check for phase transition to FLIGHT
  const hpRatio = health.current / health.max;
  if (hpRatio <= FLIGHT_HP_THRESHOLD) {
    phase.current = 'FLIGHT';
    phase.timer = FLIGHT_CYCLE_MS;
    // phaseData tracks current waypoint index for flight movement
    phase.phaseData = { waypointIndex: 1 };

    // Mark as flying — TargetingSystem already filters by isFlying + canTargetAir
    enemyData.isFlying = true;

    // Override the movement path with flight waypoints
    setFlightPath(world, bossId, 1);
  }
}

function processFlight(
  world: World,
  bossId: number,
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  enemyData: import('../ecs/components/EnemyData').EnemyDataData,
  pos: import('../ecs/components/Position').PositionData,
  deltaMs: number,
): void {
  phase.timer -= deltaMs;

  // Oscillate between waypoints as we move
  const movement = world.getComponent(bossId, MovementComponent);
  if (movement && movement.pathIndex >= movement.path.length - 1) {
    // Reached end of current flight segment — flip waypoint
    const currentWpIdx = (phase.phaseData['waypointIndex'] as number) ?? 0;
    const nextWpIdx = currentWpIdx === 0 ? 1 : 0;
    phase.phaseData = { ...phase.phaseData, waypointIndex: nextWpIdx };
    setFlightPath(world, bossId, nextWpIdx);
  }

  // Transition to LANDING
  if (phase.timer <= 0) {
    phase.current = 'LANDING';
    phase.timer = LANDING_DURATION_MS;

    // While landing the boss is visible to ground towers
    enemyData.isFlying = false;

    // Stop movement during landing
    const mov = world.getComponent(bossId, MovementComponent);
    if (mov) {
      mov.path = [[Math.round(pos.gridX), Math.round(pos.gridY)]];
      mov.pathIndex = 0;
    }
  }
}

function processLanding(
  _world: World,
  _bossId: number,
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  enemyData: import('../ecs/components/EnemyData').EnemyDataData,
  deltaMs: number,
): void {
  phase.timer -= deltaMs;

  if (phase.timer <= 0) {
    // Return to FLIGHT
    phase.current = 'FLIGHT';
    phase.timer = FLIGHT_CYCLE_MS;

    enemyData.isFlying = true;

    // Resume waypoint flight from the other end
    const currentWpIdx = (phase.phaseData['waypointIndex'] as number) ?? 0;
    const nextWpIdx = currentWpIdx === 0 ? 1 : 0;
    phase.phaseData = { ...phase.phaseData, waypointIndex: nextWpIdx };
    setFlightPath(_world, _bossId, nextWpIdx);
  }
}

/**
 * Sets the MovementComponent path to fly toward the given waypoint.
 * The current position is the start; the waypoint is the end.
 */
function setFlightPath(world: World, bossId: number, waypointIndex: number): void {
  const movement = world.getComponent(bossId, MovementComponent);
  const pos = world.getComponent(bossId, PositionComponent);
  if (!movement || !pos) return;

  const target = FLIGHT_WAYPOINTS[waypointIndex];
  if (!target) return;

  movement.path = [
    [Math.round(pos.gridX), Math.round(pos.gridY)],
    [target[0], target[1]],
  ];
  movement.pathIndex = 0;
}

/** Exported for testing: clears module-level tracking state */
export function _resetBossAIState(): void {
  initialisedBosses.clear();
}

/** Exported constants for tests */
export { FLIGHT_HP_THRESHOLD, FLIGHT_CYCLE_MS, LANDING_DURATION_MS, FLIGHT_WAYPOINTS };
