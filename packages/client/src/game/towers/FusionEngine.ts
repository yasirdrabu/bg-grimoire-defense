import type { World, EntityId, FusionRecipe } from '@grimoire/shared';
import { FUSIONS } from '@grimoire/shared';
import { TowerDataComponent } from '../ecs/components/TowerData';
import { PositionComponent } from '../ecs/components/Position';
import { AttackComponent } from '../ecs/components/Attack';
import { RenderableComponent } from '../ecs/components/Renderable';

/**
 * Look up a FusionRecipe for two tower types.
 * Order-independent: findFusionRecipe('a', 'b') === findFusionRecipe('b', 'a').
 * Returns null if no matching recipe exists.
 */
export function findFusionRecipe(towerTypeA: string, towerTypeB: string): FusionRecipe | null {
  for (const recipe of Object.values(FUSIONS)) {
    const [inputA, inputB] = recipe.inputs;
    if (
      (inputA === towerTypeA && inputB === towerTypeB) ||
      (inputA === towerTypeB && inputB === towerTypeA)
    ) {
      return recipe;
    }
  }
  return null;
}

export interface FusablePair {
  entityA: EntityId;
  entityB: EntityId;
  recipe: FusionRecipe;
}

/**
 * Query all tower entities in the world, check 4-directional (orthogonal)
 * adjacency, require both towers to be Tier 2+, and return every pair that
 * matches a known fusion recipe (de-duplicated).
 */
export function findFusablePairs(world: World): FusablePair[] {
  const towerIds = world.query(TowerDataComponent, PositionComponent);

  // Build a position map for O(1) neighbour lookup
  // Key: "gridX,gridY" → entityId
  const posMap = new Map<string, EntityId>();
  for (const id of towerIds) {
    const pos = world.getComponent(id, PositionComponent);
    if (pos) {
      posMap.set(`${pos.gridX},${pos.gridY}`, id);
    }
  }

  const pairs: FusablePair[] = [];
  // Track visited pairs to avoid duplicates (process only right/down neighbours)
  const seen = new Set<string>();

  const orthogonalOffsets: Array<[number, number]> = [
    [1, 0],  // right
    [0, 1],  // down
  ];

  for (const idA of towerIds) {
    const posA = world.getComponent(idA, PositionComponent);
    const dataA = world.getComponent(idA, TowerDataComponent);
    if (!posA || !dataA) continue;
    if (dataA.tier < 2) continue;

    for (const [dx, dy] of orthogonalOffsets) {
      const neighbourKey = `${posA.gridX + dx},${posA.gridY + dy}`;
      const idB = posMap.get(neighbourKey);
      if (idB === undefined) continue;

      const dataB = world.getComponent(idB, TowerDataComponent);
      if (!dataB) continue;
      if (dataB.tier < 2) continue;

      // Canonical pair key to prevent duplicates
      const pairKey = idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);

      const recipe = findFusionRecipe(dataA.towerId, dataB.towerId);
      if (!recipe) continue;

      pairs.push({ entityA: idA, entityB: idB, recipe });
    }
  }

  return pairs;
}

/**
 * Consume two tower entities and create a new fusion tower entity at entityA's
 * grid position. Returns the new entity's ID.
 *
 * Caller is responsible for:
 * - Deducting essence cost from the store
 * - Updating grid/pathfinding state
 * - Creating the Phaser sprite for the new entity (GameScene handles this)
 */
export function executeFusion(
  world: World,
  entityA: EntityId,
  entityB: EntityId,
  recipe: FusionRecipe,
): EntityId {
  // Capture entityA's position before destroying it
  const posA = world.getComponent(entityA, PositionComponent);
  if (!posA) {
    throw new Error(`executeFusion: entityA (${entityA}) has no PositionComponent`);
  }

  const { gridX, gridY } = posA;

  // Destroy both input towers
  world.destroyEntity(entityA);
  world.destroyEntity(entityB);

  // Create the fusion entity
  const newId = world.createEntity();

  world.addComponent(newId, PositionComponent, { gridX, gridY });

  world.addComponent(newId, AttackComponent, {
    range: recipe.stats.range,
    damage: recipe.stats.damage,
    damageType: recipe.stats.damageType,
    attackSpeed: recipe.stats.attackSpeed,
    cooldownRemaining: 0,
    targetId: null,
    targetingMode: 'nearest',
    projectileType: 'spell_bolt',
    canTargetAir: recipe.stats.canTargetAir,
    splashRadius: recipe.stats.splashRadius,
    pierceCount: recipe.stats.pierceCount,
    statusEffect: recipe.stats.statusEffect,
  });

  world.addComponent(newId, TowerDataComponent, {
    towerId: recipe.id,
    tier: 2,
    totalInvestment: 0,
    isFusion: true,
  });

  world.addComponent(newId, RenderableComponent, {
    spriteKey: recipe.id,
    visible: true,
  });

  return newId;
}
