/**
 * BossAI — multi-phase AI system for all bosses.
 *
 * ── Balrog ──────────────────────────────────────────────────────────────────
 * Phase 1 — WALKING (HP > 50%):
 *   - Follows normal enemy path (MovementSystem handles movement)
 *   - Leaves a fire trail: every cell the Balrog occupies becomes a fire cell
 * Phase 2 — FLIGHT (HP <= 50%):
 *   - isFlying flag set on EnemyData → only air-targetable towers can hit it
 *   - Moves between predefined waypoints (map center ↔ spawn area)
 *   - Every FLIGHT_CYCLE_MS, transitions to LANDING for LANDING_DURATION_MS
 * LANDING (sub-state of Phase 2):
 *   - isFlying = false → all towers can target it
 *   - Stationary for LANDING_DURATION_MS, then returns to FLIGHT
 *
 * ── Basilisk ────────────────────────────────────────────────────────────────
 * Phase 1 — TUNNELING (HP > 40%):
 *   - Alternates WALKING → BURROWED every BURROW_CYCLE_MS
 *   - While BURROWED: untargetable for BURROW_DURATION_MS, then re-emerges
 *     BURROW_ADVANCE_CELLS further along path
 * Phase 2 — PETRIFY (HP <= 40%):
 *   - Periodically emits a warning (PETRIFY_WARN_MS), then disables nearest
 *     tower for PETRIFY_DISABLE_MS
 *
 * ── Voldemort ───────────────────────────────────────────────────────────────
 * Phase 1 — TELEPORT (HP > 60%):
 *   - Teleports between path waypoints every VOLDEMORT_TELEPORT_MS
 *   - Immune to slow effects (enforced in MovementSystem / StatusEffectSystem)
 * Phase 2 — HORCRUXES (HP <= 60%, > 20%):
 *   - Damage shield active (all damage reduced to 0 until all 7 Horcruxes die)
 *   - Spawns 7 Horcrux minions (100 HP each) at random path positions
 * Phase 3 — DESPERATE (HP <= 20%):
 *   - Teleport frequency doubles (VOLDEMORT_TELEPORT_MS / 2)
 *   - Every TOWER_KILL_COOLDOWN_MS, instantly kills a random tower
 *
 * No Phaser dependencies in this file.
 */

import type { World } from '@grimoire/shared';
import { BossPhaseComponent } from '../ecs/components/BossPhase';
import { EnemyDataComponent } from '../ecs/components/EnemyData';
import { HealthComponent } from '../ecs/components/Health';
import { PositionComponent } from '../ecs/components/Position';
import { MovementComponent } from '../ecs/components/Movement';
import { AttackComponent } from '../ecs/components/Attack';
import { TowerDataComponent } from '../ecs/components/TowerData';
import { TowerDisabledComponent } from '../ecs/components/TowerDisabled';
import { addFireCell } from '../ecs/systems/FireCellSystem';
import { addIceCell } from '../ecs/systems/IceCellSystem';

// ─── Balrog constants ────────────────────────────────────────────────────────

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

// ─── Basilisk constants ──────────────────────────────────────────────────────

/** HP fraction below which Basilisk enters PETRIFY phase */
const BASILISK_PETRIFY_THRESHOLD = 0.4;

/** How often (ms) the Basilisk burrows while in TUNNELING phase */
const BURROW_CYCLE_MS = 6_000;

/** Duration (ms) of the BURROWED sub-state (untargetable) */
const BURROW_DURATION_MS = 3_000;

/** Number of path cells the Basilisk advances while burrowed */
const BURROW_ADVANCE_CELLS = 4;

/** Warning duration (ms) before Basilisk petrifies a tower */
const PETRIFY_WARN_MS = 1_500;

/** Duration (ms) a petrified tower is disabled */
const PETRIFY_DISABLE_MS = 5_000;

/** How often (ms) the Basilisk attempts to petrify in Phase 2 */
const PETRIFY_COOLDOWN_MS = 8_000;

// ─── Voldemort constants ─────────────────────────────────────────────────────

/** HP fraction below which Voldemort enters HORCRUXES phase */
const VOLDEMORT_HORCRUX_THRESHOLD = 0.6;

/** HP fraction below which Voldemort enters DESPERATE phase */
const VOLDEMORT_DESPERATE_THRESHOLD = 0.2;

/** How often (ms) Voldemort teleports in Phase 1 */
const VOLDEMORT_TELEPORT_MS = 4_000;

/** Number of Horcrux minions spawned in Phase 2 */
const HORCRUX_COUNT = 7;

/** HP of each Horcrux minion */
const HORCRUX_HP = 100;

/** Cooldown (ms) for Voldemort's tower instant-kill in Phase 3 */
const TOWER_KILL_COOLDOWN_MS = 10_000;

// ─── White Walker General constants ──────────────────────────────────────────

/** HP fraction below which the White Walker General transitions to ICE_WALL phase */
const WWG_ICE_WALL_THRESHOLD = 0.5;

/** Range (tiles) within which dying enemies are resurrected */
const WWG_RESURRECT_RANGE = 2;

/** HP fraction at which resurrected undead are created */
const WWG_RESURRECT_HP_FRACTION = 0.5;

/** Range (tiles) within which towers have attack speed slowed */
const WWG_SLOW_AURA_RANGE = 2;

/** Attack speed multiplier for towers in the slow aura (25% slower) */
const WWG_SLOW_MULTIPLIER = 1.25;

/** Duration (ms) for each ice wall freeze */
const WWG_ICE_WALL_DURATION_MS = 10_000;

/** How often (ms) the White Walker General creates a new ice wall row */
const WWG_ICE_WALL_COOLDOWN_MS = 12_000;

// ─── Night King constants ─────────────────────────────────────────────────────

/** HP fraction below which the Night King mounts his dragon */
const NK_DRAGON_THRESHOLD = 0.5;

/** HP fraction below which the Night King enters LAST_STAND */
const NK_LAST_STAND_THRESHOLD = 0.15;

/** Duration (ms) towers are corrupted (disabled) in Phase 1 */
const NK_CORRUPTION_DISABLE_MS = 8_000;

/** Range (tiles) within which towers are corrupted */
const NK_CORRUPTION_RANGE = 2;

/** How often (ms) a new corruption pulse hits towers in range */
const NK_CORRUPTION_COOLDOWN_MS = 15_000;

/** How often (ms) the Night King spawns wight minions in LAST_STAND */
const NK_LAST_STAND_SPAWN_MS = 5_000;

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
      // ── Balrog ──
      case 'WALKING':
        processWalking(world, bossId, health, phase, enemyData, pos, deltaMs);
        break;
      case 'FLIGHT':
        processFlight(world, bossId, phase, enemyData, pos, deltaMs);
        break;
      case 'LANDING':
        processLanding(world, bossId, phase, enemyData, deltaMs);
        break;

      // ── Basilisk ──
      case 'TUNNELING':
        processBasiliskTunneling(world, bossId, health, phase, deltaMs);
        break;
      case 'BURROWED':
        processBasiliskBurrowed(world, bossId, health, phase, deltaMs);
        break;
      case 'PETRIFY':
        processBasiliskPetrify(world, bossId, phase, deltaMs);
        break;

      // ── Voldemort ──
      case 'TELEPORT':
        processVoldemortTeleport(world, bossId, health, phase, deltaMs);
        break;
      case 'HORCRUXES':
        processVoldemortHorcruxes(world, bossId, health, phase, deltaMs);
        break;
      case 'DESPERATE':
        processVoldemortDesperate(world, bossId, phase, deltaMs);
        break;

      // ── White Walker General ──
      case 'RESURRECT':
        processWWGResurrect(world, bossId, health, phase, deltaMs);
        break;
      case 'ICE_WALL':
        processWWGIceWall(world, bossId, phase, deltaMs);
        break;

      // ── Night King ──
      case 'CORRUPTION':
        processNKCorruption(world, bossId, health, phase, deltaMs);
        break;
      case 'DRAGON':
        processNKDragon(world, bossId, health, phase, enemyData, deltaMs);
        break;
      case 'LAST_STAND':
        processNKLastStand(world, bossId, phase, deltaMs);
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

// ─── Basilisk implementation ─────────────────────────────────────────────────

/**
 * TUNNELING phase: boss follows normal path, periodically burrows.
 * Transitions to PETRIFY at 40% HP.
 */
function processBasiliskTunneling(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  // Check phase transition to PETRIFY
  if (health.current / health.max <= BASILISK_PETRIFY_THRESHOLD) {
    phase.current = 'PETRIFY';
    phase.timer = PETRIFY_COOLDOWN_MS;
    phase.phaseData = { warned: false, warnTimer: 0 };
    return;
  }

  phase.timer -= deltaMs;

  if (phase.timer <= 0) {
    // Begin burrowing
    phase.current = 'BURROWED';
    phase.timer = BURROW_DURATION_MS;

    // Make untargetable — reuse isFlying flag as "untargetable underground"
    const enemyData = world.getComponent(bossId, EnemyDataComponent);
    if (enemyData) {
      enemyData.isFlying = true; // only air towers can target, and Basilisk has no air-target
    }

    // Pause movement during burrow
    const pos = world.getComponent(bossId, PositionComponent);
    const movement = world.getComponent(bossId, MovementComponent);
    if (movement && pos) {
      movement.path = [[Math.round(pos.gridX), Math.round(pos.gridY)]];
      movement.pathIndex = 0;
    }
  }
}

/**
 * BURROWED sub-state: enemy is underground (untargetable).
 * Advances BURROW_ADVANCE_CELLS along the original path, then re-emerges.
 */
function processBasiliskBurrowed(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  phase.timer -= deltaMs;

  if (phase.timer <= 0) {
    // Re-emerge BURROW_ADVANCE_CELLS ahead on the stored full path
    const storedPath = phase.phaseData['fullPath'] as [number, number][] | undefined;
    const storedIndex = (phase.phaseData['fullPathIndex'] as number | undefined) ?? 0;

    if (storedPath) {
      const newIndex = Math.min(storedIndex + BURROW_ADVANCE_CELLS, storedPath.length - 1);
      phase.phaseData = { ...phase.phaseData, fullPathIndex: newIndex };

      const movement = world.getComponent(bossId, MovementComponent);
      const pos = world.getComponent(bossId, PositionComponent);
      if (movement && pos) {
        movement.path = storedPath.slice(newIndex);
        movement.pathIndex = 0;
        const target = storedPath[newIndex];
        if (target) {
          pos.gridX = target[0];
          pos.gridY = target[1];
        }
      }
    }

    // Make targetable again
    const enemyData = world.getComponent(bossId, EnemyDataComponent);
    if (enemyData) {
      enemyData.isFlying = false;
    }

    // Transition back to TUNNELING
    phase.current = 'TUNNELING';
    phase.timer = BURROW_CYCLE_MS;

    // Check phase transition after re-emerging
    if (health.current / health.max <= BASILISK_PETRIFY_THRESHOLD) {
      phase.current = 'PETRIFY';
      phase.timer = PETRIFY_COOLDOWN_MS;
      phase.phaseData = { warned: false, warnTimer: 0 };
    }
  }
}

/**
 * PETRIFY phase: periodically warns then disables the nearest tower for 5s.
 */
function processBasiliskPetrify(
  world: World,
  bossId: number,
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  const warned = phase.phaseData['warned'] as boolean;

  if (!warned) {
    phase.timer -= deltaMs;
    if (phase.timer <= PETRIFY_WARN_MS && !warned) {
      // Warning phase begins
      phase.phaseData = { ...phase.phaseData, warned: true };
    }
    return;
  }

  // Warn timer: wait PETRIFY_WARN_MS then apply disable
  const warnTimer = (phase.phaseData['warnTimer'] as number | undefined) ?? 0;
  const nextWarnTimer = warnTimer + deltaMs;

  if (nextWarnTimer >= PETRIFY_WARN_MS) {
    // Apply petrify to nearest tower
    const pos = world.getComponent(bossId, PositionComponent);
    if (pos) {
      petrifyNearestTower(world, bossId, pos);
    }
    // Reset cooldown
    phase.current = 'PETRIFY';
    phase.timer = PETRIFY_COOLDOWN_MS;
    phase.phaseData = { warned: false, warnTimer: 0 };
  } else {
    phase.phaseData = { ...phase.phaseData, warnTimer: nextWarnTimer };
  }
}

function petrifyNearestTower(world: World, _bossId: number, bossPos: import('../ecs/components/Position').PositionData): void {
  const towers = world.query(PositionComponent, AttackComponent, TowerDataComponent);
  let nearestId: number | null = null;
  let nearestDist = Infinity;

  for (const towerId of towers) {
    const tPos = world.getComponent(towerId, PositionComponent)!;
    const dist = Math.sqrt((bossPos.gridX - tPos.gridX) ** 2 + (bossPos.gridY - tPos.gridY) ** 2);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestId = towerId;
    }
  }

  if (nearestId !== null) {
    const existing = world.getComponent(nearestId, TowerDisabledComponent);
    if (existing) {
      existing.remainingMs = Math.max(existing.remainingMs, PETRIFY_DISABLE_MS);
    } else {
      world.addComponent(nearestId, TowerDisabledComponent, { remainingMs: PETRIFY_DISABLE_MS });
    }
  }
}

// ─── Voldemort implementation ─────────────────────────────────────────────────

/** Tracks which Voldemort entities have already transitioned to HORCRUXES */
const horcruxSpawnedByBoss = new Set<number>();

/**
 * TELEPORT phase: teleports between path waypoints every VOLDEMORT_TELEPORT_MS.
 * Immune to slow (SlowComponent is never applied — enforced in StatusEffectSystem).
 * Transitions to HORCRUXES at 60% HP.
 */
function processVoldemortTeleport(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  // Phase transition check
  if (health.current / health.max <= VOLDEMORT_HORCRUX_THRESHOLD) {
    phase.current = 'HORCRUXES';
    phase.timer = 0;
    phase.phaseData = { horcruxesAlive: HORCRUX_COUNT, shieldActive: true };
    return;
  }

  phase.timer -= deltaMs;

  if (phase.timer <= 0) {
    phase.timer = VOLDEMORT_TELEPORT_MS;
    voldemortTeleportForward(world, bossId, BURROW_ADVANCE_CELLS);
  }
}

/**
 * HORCRUXES phase: damage is absorbed (shield) until all 7 horcruxes die.
 * Once all dead, shield lifts and Voldemort transitions to DESPERATE at 20%.
 */
function processVoldemortHorcruxes(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  // Spawn horcruxes once
  if (!horcruxSpawnedByBoss.has(bossId)) {
    horcruxSpawnedByBoss.add(bossId);
    spawnHorcruxes(world, bossId, HORCRUX_COUNT);
  }

  const horcruxesAlive = (phase.phaseData['horcruxesAlive'] as number) ?? HORCRUX_COUNT;

  // Check if all horcruxes are dead (tracked externally by DeathSystem)
  if (horcruxesAlive <= 0) {
    phase.phaseData = { ...phase.phaseData, shieldActive: false };

    // Transition to DESPERATE if at threshold, else back to TELEPORT
    if (health.current / health.max <= VOLDEMORT_DESPERATE_THRESHOLD) {
      phase.current = 'DESPERATE';
      phase.timer = TOWER_KILL_COOLDOWN_MS;
      phase.phaseData = { teleportTimer: VOLDEMORT_TELEPORT_MS / 2, towerKillTimer: TOWER_KILL_COOLDOWN_MS };
    } else {
      phase.current = 'TELEPORT';
      phase.timer = VOLDEMORT_TELEPORT_MS;
    }
    return;
  }

  // Continue teleporting while waiting for horcruxes to die
  phase.timer -= deltaMs;
  if (phase.timer <= 0) {
    phase.timer = VOLDEMORT_TELEPORT_MS;
    voldemortTeleportForward(world, bossId, BURROW_ADVANCE_CELLS);
  }
}

/**
 * DESPERATE phase: teleport frequency doubled, instant-kills random tower every 10s.
 */
function processVoldemortDesperate(
  world: World,
  bossId: number,
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  const teleportTimer = ((phase.phaseData['teleportTimer'] as number | undefined) ?? VOLDEMORT_TELEPORT_MS / 2) - deltaMs;
  const towerKillTimer = ((phase.phaseData['towerKillTimer'] as number | undefined) ?? TOWER_KILL_COOLDOWN_MS) - deltaMs;

  let nextTeleportTimer = teleportTimer;
  let nextTowerKillTimer = towerKillTimer;

  if (teleportTimer <= 0) {
    nextTeleportTimer = VOLDEMORT_TELEPORT_MS / 2;
    voldemortTeleportForward(world, bossId, BURROW_ADVANCE_CELLS);
  }

  if (towerKillTimer <= 0) {
    nextTowerKillTimer = TOWER_KILL_COOLDOWN_MS;
    instantKillRandomTower(world);
  }

  phase.phaseData = {
    ...phase.phaseData,
    teleportTimer: nextTeleportTimer,
    towerKillTimer: nextTowerKillTimer,
  };
}

function voldemortTeleportForward(world: World, bossId: number, cells: number): void {
  const movement = world.getComponent(bossId, MovementComponent);
  const pos = world.getComponent(bossId, PositionComponent);
  if (!movement || !pos) return;

  const newIndex = Math.min(movement.pathIndex + cells, movement.path.length - 1);
  movement.pathIndex = newIndex;
  const target = movement.path[newIndex];
  if (target) {
    pos.gridX = target[0];
    pos.gridY = target[1];
  }
}

function spawnHorcruxes(world: World, _bossId: number, count: number): void {
  // Horcrux spawn is handled by the scene/spawner layer.
  // Here we emit a signal via phaseData so the GameScene can read it.
  // The actual entity creation requires scene access — BossAI stays engine-agnostic.
  // GameScene polls phase.phaseData['spawnRequest'] each frame.
  void world;
  void count;
  // Intentionally a no-op: GameScene reads horcruxesAlive from phaseData to trigger spawn.
}

function instantKillRandomTower(world: World): void {
  const towers = world.query(PositionComponent, AttackComponent, TowerDataComponent);
  const towerArray = Array.from(towers);
  if (towerArray.length === 0) return;

  const randomIndex = Math.floor(Math.random() * towerArray.length);
  const targetId = towerArray[randomIndex];
  if (targetId === undefined) return;

  // Disable tower for a very long duration (effectively destroy it from combat)
  const existing = world.getComponent(targetId, TowerDisabledComponent);
  if (existing) {
    existing.remainingMs = 999_999;
  } else {
    world.addComponent(targetId, TowerDisabledComponent, { remainingMs: 999_999 });
  }
}

// ─── White Walker General implementation ─────────────────────────────────────

/** Tracks which WWG entities had their slow aura applied last frame */
const wwgSlowedTowersLastFrame = new Map<number, number>();

/**
 * RESURRECT phase: walks the path, slows nearby towers' attack speed by 25%.
 * Transitions to ICE_WALL at 50% HP.
 */
function processWWGResurrect(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  _deltaMs: number,
): void {
  // Phase transition check
  if (health.current / health.max <= WWG_ICE_WALL_THRESHOLD) {
    // Restore any slowed towers before transition
    for (const [towerId, originalSpeed] of wwgSlowedTowersLastFrame) {
      const attack = world.getComponent(towerId, AttackComponent);
      if (attack) attack.attackSpeed = originalSpeed;
    }
    wwgSlowedTowersLastFrame.clear();

    phase.current = 'ICE_WALL';
    phase.timer = WWG_ICE_WALL_COOLDOWN_MS;
    phase.phaseData = { nextRow: 0 };
    return;
  }

  // Restore towers slowed last frame
  for (const [towerId, originalSpeed] of wwgSlowedTowersLastFrame) {
    const attack = world.getComponent(towerId, AttackComponent);
    if (attack) attack.attackSpeed = originalSpeed;
  }
  wwgSlowedTowersLastFrame.clear();

  // Apply slow aura to nearby towers
  const bossPos = world.getComponent(bossId, PositionComponent);
  if (!bossPos) return;

  const towers = world.query(PositionComponent, AttackComponent, TowerDataComponent);
  for (const towerId of towers) {
    const towerPos = world.getComponent(towerId, PositionComponent)!;
    const dist = Math.sqrt(
      (bossPos.gridX - towerPos.gridX) ** 2 +
      (bossPos.gridY - towerPos.gridY) ** 2,
    );
    if (dist <= WWG_SLOW_AURA_RANGE) {
      const attack = world.getComponent(towerId, AttackComponent)!;
      if (!wwgSlowedTowersLastFrame.has(towerId)) {
        wwgSlowedTowersLastFrame.set(towerId, attack.attackSpeed);
        attack.attackSpeed = attack.attackSpeed * WWG_SLOW_MULTIPLIER;
      }
    }
  }
}

/**
 * Returns the resurrect range and HP fraction for external use (e.g. DeathSystem).
 * When an enemy dies within WWG_RESURRECT_RANGE of the White Walker General,
 * DeathSystem should respawn it at WWG_RESURRECT_HP_FRACTION of its max HP.
 */
export function getWWGResurrectParams(): { range: number; hpFraction: number } {
  return { range: WWG_RESURRECT_RANGE, hpFraction: WWG_RESURRECT_HP_FRACTION };
}

/**
 * ICE_WALL phase: periodically freezes a row of grid cells for ICE_WALL_DURATION_MS,
 * forcing all enemies to repath around the blocked row.
 */
function processWWGIceWall(
  world: World,
  bossId: number,
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  phase.timer -= deltaMs;
  if (phase.timer > 0) return;

  phase.timer = WWG_ICE_WALL_COOLDOWN_MS;

  const bossPos = world.getComponent(bossId, PositionComponent);
  if (!bossPos) return;

  // Freeze the row the boss is currently on
  const frozenRow = Math.round(bossPos.gridY);
  const gridCols = (phase.phaseData['gridCols'] as number | undefined) ?? 24;

  for (let col = 0; col < gridCols; col++) {
    addIceCell(col, frozenRow, WWG_ICE_WALL_DURATION_MS);
  }

  // Signal repath via phaseData — GameScene reads this and triggers PathManager repath
  phase.phaseData = {
    ...phase.phaseData,
    repathRequest: true,
    frozenRow,
  };
}

// ─── Night King implementation ────────────────────────────────────────────────

/** Tracks which Night King entities have already entered DRAGON phase */
const nkDragonTransitioned = new Set<number>();

/** Tracks which Night King entities have already entered LAST_STAND phase */
const nkLastStandEntered = new Set<number>();

/**
 * CORRUPTION phase: periodically corrupts (disables) towers within range.
 * Transitions to DRAGON at 50% HP.
 */
function processNKCorruption(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  // Phase transition check
  if (health.current / health.max <= NK_DRAGON_THRESHOLD && !nkDragonTransitioned.has(bossId)) {
    nkDragonTransitioned.add(bossId);
    phase.current = 'DRAGON';
    phase.timer = 0;
    phase.phaseData = { wightSpawnTimer: 3000 };
    return;
  }

  phase.timer -= deltaMs;
  if (phase.timer > 0) return;

  phase.timer = NK_CORRUPTION_COOLDOWN_MS;

  // Corrupt all towers within range
  const bossPos = world.getComponent(bossId, PositionComponent);
  if (!bossPos) return;

  const towers = world.query(PositionComponent, AttackComponent, TowerDataComponent);
  for (const towerId of towers) {
    const towerPos = world.getComponent(towerId, PositionComponent)!;
    const dist = Math.sqrt(
      (bossPos.gridX - towerPos.gridX) ** 2 +
      (bossPos.gridY - towerPos.gridY) ** 2,
    );
    if (dist <= NK_CORRUPTION_RANGE) {
      const existing = world.getComponent(towerId, TowerDisabledComponent);
      if (existing) {
        existing.remainingMs = Math.max(existing.remainingMs, NK_CORRUPTION_DISABLE_MS);
      } else {
        world.addComponent(towerId, TowerDisabledComponent, { remainingMs: NK_CORRUPTION_DISABLE_MS });
      }
    }
  }
}

/**
 * DRAGON phase: Night King mounts dragon (becomes flying), spawns wight minions.
 * Transitions to LAST_STAND at 15% HP.
 */
function processNKDragon(
  world: World,
  bossId: number,
  health: { current: number; max: number },
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  enemyData: import('../ecs/components/EnemyData').EnemyDataData,
  deltaMs: number,
): void {
  // Mark as flying on first entry
  if (!enemyData.isFlying) {
    enemyData.isFlying = true;
  }

  // Phase transition check
  if (health.current / health.max <= NK_LAST_STAND_THRESHOLD && !nkLastStandEntered.has(bossId)) {
    nkLastStandEntered.add(bossId);
    enemyData.isFlying = false;

    // Stop movement — boss anchors at current position (near nexus)
    const pos = world.getComponent(bossId, PositionComponent);
    const movement = world.getComponent(bossId, MovementComponent);
    if (movement && pos) {
      movement.path = [[Math.round(pos.gridX), Math.round(pos.gridY)]];
      movement.pathIndex = 0;
    }

    phase.current = 'LAST_STAND';
    phase.timer = NK_LAST_STAND_SPAWN_MS;
    phase.phaseData = { wightWave: 0 };
    return;
  }

  // Tick wight spawn timer
  const wightSpawnTimer = ((phase.phaseData['wightSpawnTimer'] as number | undefined) ?? 3000) - deltaMs;
  if (wightSpawnTimer <= 0) {
    // Signal wight spawn — GameScene reads phaseData['spawnWights'] to create entities
    phase.phaseData = {
      ...phase.phaseData,
      wightSpawnTimer: 3000,
      spawnWights: (phase.phaseData['spawnWights'] as number | undefined ?? 0) + 1,
    };
  } else {
    phase.phaseData = { ...phase.phaseData, wightSpawnTimer };
  }
}

/**
 * LAST_STAND phase: Night King is stationary at nexus, spawning wight waves every 5s.
 * This is a DPS race — defeat the Night King before wights overwhelm the nexus.
 */
function processNKLastStand(
  _world: World,
  _bossId: number,
  phase: import('../ecs/components/BossPhase').BossPhaseData,
  deltaMs: number,
): void {
  phase.timer -= deltaMs;
  if (phase.timer > 0) return;

  phase.timer = NK_LAST_STAND_SPAWN_MS;

  // Signal GameScene to spawn a wight wave
  const wightWave = ((phase.phaseData['wightWave'] as number | undefined) ?? 0) + 1;
  phase.phaseData = {
    ...phase.phaseData,
    wightWave,
    spawnWightWave: wightWave,
  };
}

/** Exported for testing: clears module-level tracking state */
export function _resetBossAIState(): void {
  initialisedBosses.clear();
  horcruxSpawnedByBoss.clear();
  wwgSlowedTowersLastFrame.clear();
  nkDragonTransitioned.clear();
  nkLastStandEntered.clear();
}

/** Exported constants for tests */
export {
  // Balrog
  FLIGHT_HP_THRESHOLD, FLIGHT_CYCLE_MS, LANDING_DURATION_MS, FLIGHT_WAYPOINTS,
  // Basilisk
  BASILISK_PETRIFY_THRESHOLD, BURROW_CYCLE_MS, BURROW_DURATION_MS, BURROW_ADVANCE_CELLS,
  PETRIFY_WARN_MS, PETRIFY_DISABLE_MS, PETRIFY_COOLDOWN_MS,
  // Voldemort
  VOLDEMORT_HORCRUX_THRESHOLD, VOLDEMORT_DESPERATE_THRESHOLD, VOLDEMORT_TELEPORT_MS,
  HORCRUX_COUNT, HORCRUX_HP, TOWER_KILL_COOLDOWN_MS,
  // White Walker General
  WWG_ICE_WALL_THRESHOLD, WWG_RESURRECT_RANGE, WWG_RESURRECT_HP_FRACTION,
  WWG_SLOW_AURA_RANGE, WWG_SLOW_MULTIPLIER, WWG_ICE_WALL_DURATION_MS, WWG_ICE_WALL_COOLDOWN_MS,
  // Night King
  NK_DRAGON_THRESHOLD, NK_LAST_STAND_THRESHOLD, NK_CORRUPTION_DISABLE_MS,
  NK_CORRUPTION_RANGE, NK_CORRUPTION_COOLDOWN_MS, NK_LAST_STAND_SPAWN_MS,
};
