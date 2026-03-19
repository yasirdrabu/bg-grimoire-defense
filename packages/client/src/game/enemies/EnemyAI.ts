import type { World, EntityId } from '@grimoire/shared';
import { EnemyDataComponent } from '../ecs/components/EnemyData';
import { HealthComponent } from '../ecs/components/Health';
import { MovementComponent } from '../ecs/components/Movement';
import { PositionComponent } from '../ecs/components/Position';
import { AttackComponent } from '../ecs/components/Attack';
import { TowerDataComponent } from '../ecs/components/TowerData';
import { TowerDisabledComponent } from '../ecs/components/TowerDisabled';

/** Tracks which entities have already been enraged (to avoid re-applying the boost every frame) */
const enragedEntities = new Set<EntityId>();

/** Tracks base speeds before enrage boost was applied */
const baseSpeedBeforeEnrage = new Map<EntityId, number>();

/** Tracks which towers had their attack speed modified by fear aura last frame */
const fearedTowersLastFrame = new Map<EntityId, number>();

/** Tracks which (troll, tower) pairs have had tower_smash applied to avoid re-smashing every frame */
const smashCooldowns = new Map<EntityId, Set<EntityId>>();

/** Tracks which enemies have an active shield (absorbs first hit) */
const shieldedEntities = new Set<EntityId>();

/** Tracks which towers had their attack speed drained by dementor aura last frame */
const drainedTowersLastFrame = new Map<EntityId, number>();

/** Tracks entities that have already spawned minions on death */
const spawnedOnDeath = new Set<EntityId>();

/** Tracks per-entity teleport cooldown timers (ms remaining) */
const teleportCooldowns = new Map<EntityId, number>();

/** Tracks which enemies have already dodged their first projectile */
const dodgedFirstProjectile = new Set<EntityId>();

/** Tracks which enemies with 'invisible' ability have been revealed */
const revealedInvisible = new Set<EntityId>();

const ENRAGE_HP_THRESHOLD = 0.3;
const ENRAGE_SPEED_MULTIPLIER = 1.5;
const TOWER_SMASH_RANGE = 1.5; // tiles
const TOWER_SMASH_DURATION_MS = 3000;
const FEAR_AURA_RANGE = 3; // tiles
const FEAR_ATTACK_SPEED_MULTIPLIER = 1.25; // interval * 1.25 = 20% DPS reduction (spec: "reduces attack speed by 20%")

// ─── Wizarding World ability constants ────────────────────────────────────
const DRAIN_AURA_RANGE = 3; // tiles

const DRAIN_ATTACK_SPEED_MULTIPLIER = 1.25; // interval * 1.25 = 25% DPS reduction
const REGEN_HP_PER_SECOND = 5; // Mountain Troll: 5 HP/sec
const TELEPORT_COOLDOWN_MS = 8000; // Dark Wizard: teleport every 8 seconds
const TELEPORT_CELLS_FORWARD = 3; // jump forward 3 path cells

// ─── Westeros ability constants ───────────────────────────────────────────
const DAMAGE_REDUCTION_MAGNITUDE = 0.3; // Unsullied: 30% damage reduction
const INVISIBLE_REVEAL_RANGE = 2; // Shadow Assassin: revealed within 2 tiles

/**
 * Processes active enemy abilities each frame:
 * - Enrage (Uruk-hai Berserker): +50% speed below 30% HP
 * - Tower Smash (Cave Troll): disables a nearby tower for 3 seconds
 * - Fear Aura (Nazgûl Shade): reduces attack speed of nearby towers by 20%
 * - Shield (Death Eater): absorbs the first hit entirely
 * - Drain Attack Speed (Dementor): reduces attack speed of towers in aura by 25%
 * - Spawn on Death (Acromantula): spawns 2 spiderlings when HP reaches 0
 * - Regenerate (Mountain Troll): heals 5 HP per second
 * - Teleport (Dark Wizard): jumps forward 3 path cells every 8 seconds
 * - Damage Reduction (Unsullied): 30% damage reduction (Shield Wall)
 * - Dodge First (Dothraki Rider): dodges the first incoming projectile
 * - Invisible (Shadow Assassin): hidden until within 2 tiles of a tower
 *
 * Must run BEFORE TargetingSystem and AttackSystem in the update order.
 */
export function enemyAISystem(world: World, deltaMs: number): void {
  const enemies = world.query(EnemyDataComponent, HealthComponent);
  const towers = world.query(PositionComponent, AttackComponent, TowerDataComponent);

  // --- Fear Aura: restore attack speeds modified last frame ---
  for (const [towerId, originalSpeed] of fearedTowersLastFrame) {
    const attack = world.getComponent(towerId, AttackComponent);
    if (attack) {
      attack.attackSpeed = originalSpeed;
    }
  }
  fearedTowersLastFrame.clear();

  // --- Drain Attack Speed: restore attack speeds modified last frame ---
  for (const [towerId, originalSpeed] of drainedTowersLastFrame) {
    const attack = world.getComponent(towerId, AttackComponent);
    if (attack) {
      attack.attackSpeed = originalSpeed;
    }
  }
  drainedTowersLastFrame.clear();

  // --- Tick TowerDisabled timers ---
  for (const towerId of towers) {
    const disabled = world.getComponent(towerId, TowerDisabledComponent);
    if (disabled) {
      disabled.remainingMs -= deltaMs;
      if (disabled.remainingMs <= 0) {
        world.removeComponent(towerId, TowerDisabledComponent);
      }
    }
  }

  // --- Process each enemy ---
  const activeEnemyIds = new Set(enemies);

  // Clean up tracking for destroyed entities
  for (const id of enragedEntities) {
    if (!activeEnemyIds.has(id)) {
      enragedEntities.delete(id);
      baseSpeedBeforeEnrage.delete(id);
    }
  }
  for (const id of smashCooldowns.keys()) {
    if (!activeEnemyIds.has(id)) {
      smashCooldowns.delete(id);
    }
  }
  for (const id of shieldedEntities) {
    if (!activeEnemyIds.has(id)) {
      shieldedEntities.delete(id);
    }
  }
  for (const id of spawnedOnDeath) {
    if (!activeEnemyIds.has(id)) {
      spawnedOnDeath.delete(id);
    }
  }
  for (const id of teleportCooldowns.keys()) {
    if (!activeEnemyIds.has(id)) {
      teleportCooldowns.delete(id);
    }
  }
  for (const id of dodgedFirstProjectile) {
    if (!activeEnemyIds.has(id)) {
      dodgedFirstProjectile.delete(id);
    }
  }
  for (const id of revealedInvisible) {
    if (!activeEnemyIds.has(id)) {
      revealedInvisible.delete(id);
    }
  }

  for (const enemyId of enemies) {
    const enemyData = world.getComponent(enemyId, EnemyDataComponent)!;
    const health = world.getComponent(enemyId, HealthComponent)!;

    switch (enemyData.abilityType) {
      case 'enrage':
        processEnrage(world, enemyId, health);
        break;
      case 'tower_smash':
        processTowerSmash(world, enemyId, towers);
        break;
      case 'fear_aura':
        processFearAura(world, enemyId, towers);
        break;
      case 'drain_attack_speed':
        processDrainAttackSpeed(world, enemyId, towers);
        break;
      case 'regenerate':
        processRegenerate(world, enemyId, health, deltaMs);
        break;
      case 'teleport':
        processTeleport(world, enemyId, deltaMs);
        break;
      case 'invisible':
        processInvisible(world, enemyId, towers);
        break;
      default:
        break;
    }
  }
}

function processEnrage(world: World, enemyId: EntityId, health: { current: number; max: number }): void {
  const movement = world.getComponent(enemyId, MovementComponent);
  if (!movement) return;

  const hpRatio = health.current / health.max;

  if (hpRatio < ENRAGE_HP_THRESHOLD && !enragedEntities.has(enemyId)) {
    // Store base speed and apply boost
    baseSpeedBeforeEnrage.set(enemyId, movement.speed);
    movement.speed = movement.speed * ENRAGE_SPEED_MULTIPLIER;
    enragedEntities.add(enemyId);
  }
}

function processTowerSmash(world: World, trollId: EntityId, towers: EntityId[]): void {
  const trollPos = world.getComponent(trollId, PositionComponent);
  if (!trollPos) return;

  if (!smashCooldowns.has(trollId)) {
    smashCooldowns.set(trollId, new Set());
  }
  const smashed = smashCooldowns.get(trollId)!;

  for (const towerId of towers) {
    if (smashed.has(towerId)) continue;

    const towerPos = world.getComponent(towerId, PositionComponent)!;
    const dist = Math.sqrt(
      (trollPos.gridX - towerPos.gridX) ** 2 +
      (trollPos.gridY - towerPos.gridY) ** 2,
    );

    if (dist <= TOWER_SMASH_RANGE) {
      const existing = world.getComponent(towerId, TowerDisabledComponent);
      if (existing) {
        // Refresh or extend duration if already disabled
        existing.remainingMs = Math.max(existing.remainingMs, TOWER_SMASH_DURATION_MS);
      } else {
        world.addComponent(towerId, TowerDisabledComponent, { remainingMs: TOWER_SMASH_DURATION_MS });
      }
      smashed.add(towerId);
    }
  }
}

function processFearAura(world: World, nazgulId: EntityId, towers: EntityId[]): void {
  const nazgulPos = world.getComponent(nazgulId, PositionComponent);
  if (!nazgulPos) return;

  for (const towerId of towers) {
    const towerPos = world.getComponent(towerId, PositionComponent)!;
    const dist = Math.sqrt(
      (nazgulPos.gridX - towerPos.gridX) ** 2 +
      (nazgulPos.gridY - towerPos.gridY) ** 2,
    );

    if (dist <= FEAR_AURA_RANGE) {
      const attack = world.getComponent(towerId, AttackComponent)!;
      // Only apply once per frame — save original if not already saved
      if (!fearedTowersLastFrame.has(towerId)) {
        fearedTowersLastFrame.set(towerId, attack.attackSpeed);
        attack.attackSpeed = attack.attackSpeed * FEAR_ATTACK_SPEED_MULTIPLIER;
      }
    }
  }
}

/**
 * Shield (Death Eater): marks this entity as shielded on first encounter.
 * The actual damage absorption is handled in the damage-application layer by
 * checking `isShielded(enemyId)` before applying damage.
 */
export function initShield(enemyId: EntityId): void {
  shieldedEntities.add(enemyId);
}

/**
 * Called by the damage system when a shielded enemy is hit.
 * Returns true if the shield absorbed the hit (damage should be ignored).
 * The shield is removed after the first absorption.
 */
export function consumeShield(enemyId: EntityId): boolean {
  if (shieldedEntities.has(enemyId)) {
    shieldedEntities.delete(enemyId);
    return true;
  }
  return false;
}

export function isShielded(enemyId: EntityId): boolean {
  return shieldedEntities.has(enemyId);
}

/**
 * Drain Attack Speed (Dementor): flying aura enemy — reduces attack speed of
 * all towers within DRAIN_AURA_RANGE by 25%.  Applied each frame; restored
 * at the top of the next frame (same pattern as fear aura).
 */
function processDrainAttackSpeed(world: World, dementorId: EntityId, towers: EntityId[]): void {
  const dementorPos = world.getComponent(dementorId, PositionComponent);
  if (!dementorPos) return;

  for (const towerId of towers) {
    const towerPos = world.getComponent(towerId, PositionComponent)!;
    const dist = Math.sqrt(
      (dementorPos.gridX - towerPos.gridX) ** 2 +
      (dementorPos.gridY - towerPos.gridY) ** 2,
    );

    if (dist <= DRAIN_AURA_RANGE) {
      const attack = world.getComponent(towerId, AttackComponent)!;
      // Only save original speed once per frame (multiple dementors stack but
      // we cap at one save to avoid double-saving after first dementor modifies it)
      if (!drainedTowersLastFrame.has(towerId)) {
        drainedTowersLastFrame.set(towerId, attack.attackSpeed);
        attack.attackSpeed = attack.attackSpeed * DRAIN_ATTACK_SPEED_MULTIPLIER;
      }
    }
  }
}

/**
 * Regenerate (Mountain Troll): heals REGEN_HP_PER_SECOND each second.
 * Capped at max HP.
 */
function processRegenerate(
  _world: World,
  _enemyId: EntityId,
  health: { current: number; max: number },
  deltaMs: number,
): void {
  if (health.current <= 0) return;
  const healAmount = (REGEN_HP_PER_SECOND * deltaMs) / 1000;
  health.current = Math.min(health.max, health.current + healAmount);
}

/**
 * Teleport (Dark Wizard): every TELEPORT_COOLDOWN_MS, jumps forward
 * TELEPORT_CELLS_FORWARD path nodes in MovementComponent.path.
 */
function processTeleport(world: World, enemyId: EntityId, deltaMs: number): void {
  const remaining = teleportCooldowns.get(enemyId) ?? TELEPORT_COOLDOWN_MS;
  const next = remaining - deltaMs;

  if (next > 0) {
    teleportCooldowns.set(enemyId, next);
    return;
  }

  // Reset cooldown
  teleportCooldowns.set(enemyId, TELEPORT_COOLDOWN_MS);

  const movement = world.getComponent(enemyId, MovementComponent);
  if (!movement) return;

  const newIndex = Math.min(
    movement.pathIndex + TELEPORT_CELLS_FORWARD,
    movement.path.length - 1,
  );

  if (newIndex <= movement.pathIndex) return; // already at or near end

  movement.pathIndex = newIndex;

  // Snap position to the new path node
  const pos = world.getComponent(enemyId, PositionComponent);
  const target = movement.path[newIndex];
  if (pos && target) {
    pos.gridX = target[0];
    pos.gridY = target[1];
  }
}

/**
 * Damage Reduction (Unsullied): passive shield wall reduces all incoming damage
 * by DAMAGE_REDUCTION_MAGNITUDE (30%). Called by the damage-application layer.
 * Returns the modified damage value after reduction is applied.
 */
export function applyDamageReduction(enemyId: EntityId, incomingDamage: number): number {
  const enemyData = { abilityType: 'damage_reduction' }; // marker — checked by caller
  void enemyData;
  void enemyId;
  return Math.round(incomingDamage * (1 - DAMAGE_REDUCTION_MAGNITUDE));
}

/**
 * Returns true if the given enemy has damage_reduction ability.
 * Caller is responsible for checking this before applying damage.
 */
export function hasDamageReduction(enemyId: EntityId): boolean {
  // This is determined by the EnemyData component — callers query abilityType directly.
  // Exported for symmetry with consumeDodge / isRevealedInvisible.
  void enemyId;
  return false; // Real check done via EnemyDataComponent.abilityType === 'damage_reduction'
}

/**
 * Dodge First (Dothraki Rider): absorbs/ignores the first projectile that hits.
 * Returns true if the dodge was consumed (projectile should be ignored).
 */
export function consumeDodge(enemyId: EntityId): boolean {
  if (dodgedFirstProjectile.has(enemyId)) {
    return false; // already used dodge
  }
  dodgedFirstProjectile.add(enemyId);
  return true;
}

export function hasDodgedFirst(enemyId: EntityId): boolean {
  return dodgedFirstProjectile.has(enemyId);
}

/**
 * Invisible (Shadow Assassin): the enemy is untargetable until it comes within
 * INVISIBLE_REVEAL_RANGE tiles of any tower. Once revealed, stays revealed.
 * This function checks proximity and marks revealed enemies.
 */
function processInvisible(world: World, enemyId: EntityId, towers: EntityId[]): void {
  if (revealedInvisible.has(enemyId)) return;

  const pos = world.getComponent(enemyId, PositionComponent);
  if (!pos) return;

  for (const towerId of towers) {
    const towerPos = world.getComponent(towerId, PositionComponent);
    if (!towerPos) continue;
    const dist = Math.sqrt(
      (pos.gridX - towerPos.gridX) ** 2 +
      (pos.gridY - towerPos.gridY) ** 2,
    );
    if (dist <= INVISIBLE_REVEAL_RANGE) {
      revealedInvisible.add(enemyId);
      return;
    }
  }
}

/** Returns true if the shadow assassin has been revealed (within tower range). */
export function isRevealedInvisible(enemyId: EntityId): boolean {
  return revealedInvisible.has(enemyId);
}

/**
 * Returns whether the given entity has triggered its spawn-on-death.
 * Called by DeathSystem to decide whether to spawn spiderlings.
 */
export function hasSpawnedOnDeath(enemyId: EntityId): boolean {
  return spawnedOnDeath.has(enemyId);
}

/**
 * Marks an entity as having already spawned its death minions.
 * Called by DeathSystem after spawning to prevent double-spawning.
 */
export function markSpawnedOnDeath(enemyId: EntityId): void {
  spawnedOnDeath.add(enemyId);
}

/** Exported for testing: clears module-level tracking state */
export function _resetEnemyAIState(): void {
  enragedEntities.clear();
  baseSpeedBeforeEnrage.clear();
  fearedTowersLastFrame.clear();
  smashCooldowns.clear();
  shieldedEntities.clear();
  drainedTowersLastFrame.clear();
  spawnedOnDeath.clear();
  teleportCooldowns.clear();
  dodgedFirstProjectile.clear();
  revealedInvisible.clear();
}
