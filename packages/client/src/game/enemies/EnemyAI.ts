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

const ENRAGE_HP_THRESHOLD = 0.3;
const ENRAGE_SPEED_MULTIPLIER = 1.5;
const TOWER_SMASH_RANGE = 1.5; // tiles
const TOWER_SMASH_DURATION_MS = 3000;
const FEAR_AURA_RANGE = 3; // tiles
const FEAR_ATTACK_SPEED_MULTIPLIER = 1.25; // 25% slower = ~20% less DPS

/**
 * Processes active enemy abilities each frame:
 * - Enrage (Uruk-hai Berserker): +50% speed below 30% HP
 * - Tower Smash (Cave Troll): disables a nearby tower for 3 seconds
 * - Fear Aura (Nazgûl Shade): reduces attack speed of nearby towers by 20%
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

/** Exported for testing: clears module-level tracking state */
export function _resetEnemyAIState(): void {
  enragedEntities.clear();
  baseSpeedBeforeEnrage.clear();
  fearedTowersLastFrame.clear();
  smashCooldowns.clear();
}
