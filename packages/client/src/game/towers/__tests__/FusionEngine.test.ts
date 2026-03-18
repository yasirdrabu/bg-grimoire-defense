import { describe, it, expect } from 'vitest';
import { GameWorld } from '../../ecs/World';
import { findFusionRecipe, findFusablePairs, executeFusion } from '../FusionEngine';
import { PositionComponent } from '../../ecs/components/Position';
import { AttackComponent } from '../../ecs/components/Attack';
import { TowerDataComponent } from '../../ecs/components/TowerData';
import { RenderableComponent } from '../../ecs/components/Renderable';
import type { EntityId } from '@grimoire/shared';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function addTower(
  world: GameWorld,
  towerType: string,
  gridX: number,
  gridY: number,
  tier: 1 | 2 | 3 = 2,
): EntityId {
  const entity = world.createEntity();
  world.addComponent(entity, PositionComponent, { gridX, gridY });
  world.addComponent(entity, AttackComponent, {
    range: 3,
    damage: 20,
    damageType: 'physical',
    attackSpeed: 1.0,
    cooldownRemaining: 0,
    targetId: null,
    targetingMode: 'nearest',
    projectileType: 'arrow',
    canTargetAir: false,
  });
  world.addComponent(entity, TowerDataComponent, {
    towerId: towerType,
    tier,
    totalInvestment: 200,
    isFusion: false,
  });
  world.addComponent(entity, RenderableComponent, {
    spriteKey: towerType,
    visible: true,
  });
  return entity;
}

// ──────────────────────────────────────────────────────────────────────────────
// findFusionRecipe
// ──────────────────────────────────────────────────────────────────────────────

describe('findFusionRecipe', () => {
  it('finds correct recipe for a valid pair (canonical order)', () => {
    const recipe = findFusionRecipe('elven_archer_spire', 'dwarven_cannon');
    expect(recipe).not.toBeNull();
    expect(recipe?.id).toBe('explosive_arrow');
  });

  it('finds correct recipe regardless of argument order (reversed)', () => {
    const recipe = findFusionRecipe('dwarven_cannon', 'elven_archer_spire');
    expect(recipe).not.toBeNull();
    expect(recipe?.id).toBe('explosive_arrow');
  });

  it('finds enchanted_ballista recipe', () => {
    const recipe = findFusionRecipe('gondorian_ballista', 'istari_crystal');
    expect(recipe).not.toBeNull();
    expect(recipe?.id).toBe('enchanted_ballista');
  });

  it('finds enchanted_grove recipe (reversed)', () => {
    const recipe = findFusionRecipe('istari_crystal', 'ent_watchtower');
    expect(recipe).not.toBeNull();
    expect(recipe?.id).toBe('enchanted_grove');
  });

  it('returns null for a non-matching pair', () => {
    const recipe = findFusionRecipe('elven_archer_spire', 'ent_watchtower');
    expect(recipe).toBeNull();
  });

  it('returns null when both types are identical', () => {
    const recipe = findFusionRecipe('elven_archer_spire', 'elven_archer_spire');
    expect(recipe).toBeNull();
  });

  it('returns null for completely unknown tower types', () => {
    const recipe = findFusionRecipe('nonexistent_a', 'nonexistent_b');
    expect(recipe).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// findFusablePairs
// ──────────────────────────────────────────────────────────────────────────────

describe('findFusablePairs', () => {
  it('detects orthogonally adjacent towers that match a recipe', () => {
    const world = new GameWorld();
    const a = addTower(world, 'elven_archer_spire', 3, 5, 2);
    const b = addTower(world, 'dwarven_cannon', 4, 5, 2); // right neighbor

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]?.recipe.id).toBe('explosive_arrow');
    expect(new Set([pairs[0]?.entityA, pairs[0]?.entityB])).toEqual(new Set([a, b]));
  });

  it('detects vertically adjacent towers', () => {
    const world = new GameWorld();
    addTower(world, 'ent_watchtower', 5, 3, 2);
    addTower(world, 'istari_crystal', 5, 4, 2); // down neighbor

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]?.recipe.id).toBe('enchanted_grove');
  });

  it('rejects diagonal adjacency', () => {
    const world = new GameWorld();
    addTower(world, 'elven_archer_spire', 3, 3, 2);
    addTower(world, 'dwarven_cannon', 4, 4, 2); // diagonal — not adjacent

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(0);
  });

  it('rejects towers below Tier 2 (tier 1)', () => {
    const world = new GameWorld();
    addTower(world, 'elven_archer_spire', 3, 5, 1); // tier 1 — ineligible
    addTower(world, 'dwarven_cannon', 4, 5, 2);

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(0);
  });

  it('rejects both towers below Tier 2', () => {
    const world = new GameWorld();
    addTower(world, 'elven_archer_spire', 3, 5, 1);
    addTower(world, 'dwarven_cannon', 4, 5, 1);

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(0);
  });

  it('returns empty array when no towers are present', () => {
    const world = new GameWorld();
    expect(findFusablePairs(world)).toHaveLength(0);
  });

  it('returns empty array when no pairs match any recipe', () => {
    const world = new GameWorld();
    addTower(world, 'elven_archer_spire', 3, 5, 2);
    addTower(world, 'ent_watchtower', 4, 5, 2); // adjacent but no recipe

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(0);
  });

  it('does not return duplicate pairs for the same two towers', () => {
    // Two towers that are both left-right and potentially re-visited
    const world = new GameWorld();
    addTower(world, 'gondorian_ballista', 6, 6, 2);
    addTower(world, 'istari_crystal', 7, 6, 2);

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(1);
  });

  it('accepts tier 3 towers (tier 3 is also >= 2)', () => {
    const world = new GameWorld();
    addTower(world, 'elven_archer_spire', 3, 5, 3);
    addTower(world, 'dwarven_cannon', 4, 5, 3);

    const pairs = findFusablePairs(world);
    expect(pairs).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// executeFusion
// ──────────────────────────────────────────────────────────────────────────────

describe('executeFusion', () => {
  it('destroys both input entities', () => {
    const world = new GameWorld();
    const a = addTower(world, 'elven_archer_spire', 3, 5, 2);
    const b = addTower(world, 'dwarven_cannon', 4, 5, 2);

    const recipe = findFusionRecipe('elven_archer_spire', 'dwarven_cannon')!;
    executeFusion(world, a, b, recipe);

    expect(world.getComponent(a, TowerDataComponent)).toBeUndefined();
    expect(world.getComponent(b, TowerDataComponent)).toBeUndefined();
    expect(world.getComponent(a, PositionComponent)).toBeUndefined();
    expect(world.getComponent(b, PositionComponent)).toBeUndefined();
  });

  it('creates a new fusion entity at entityA position', () => {
    const world = new GameWorld();
    const a = addTower(world, 'elven_archer_spire', 3, 5, 2);
    const b = addTower(world, 'dwarven_cannon', 4, 5, 2);

    const recipe = findFusionRecipe('elven_archer_spire', 'dwarven_cannon')!;
    const newId = executeFusion(world, a, b, recipe);

    const pos = world.getComponent(newId, PositionComponent);
    expect(pos).toBeDefined();
    expect(pos?.gridX).toBe(3);
    expect(pos?.gridY).toBe(5);
  });

  it('new fusion entity has recipe stats in AttackComponent', () => {
    const world = new GameWorld();
    const a = addTower(world, 'elven_archer_spire', 3, 5, 2);
    const b = addTower(world, 'dwarven_cannon', 4, 5, 2);

    const recipe = findFusionRecipe('elven_archer_spire', 'dwarven_cannon')!;
    const newId = executeFusion(world, a, b, recipe);

    const attack = world.getComponent(newId, AttackComponent);
    expect(attack).toBeDefined();
    expect(attack?.damage).toBe(recipe.stats.damage);
    expect(attack?.range).toBe(recipe.stats.range);
    expect(attack?.attackSpeed).toBe(recipe.stats.attackSpeed);
    expect(attack?.damageType).toBe(recipe.stats.damageType);
    expect(attack?.canTargetAir).toBe(recipe.stats.canTargetAir);
    expect(attack?.splashRadius).toBe(recipe.stats.splashRadius);
  });

  it('new fusion entity TowerData marks isFusion true with recipe id', () => {
    const world = new GameWorld();
    const a = addTower(world, 'elven_archer_spire', 3, 5, 2);
    const b = addTower(world, 'dwarven_cannon', 4, 5, 2);

    const recipe = findFusionRecipe('elven_archer_spire', 'dwarven_cannon')!;
    const newId = executeFusion(world, a, b, recipe);

    const towerData = world.getComponent(newId, TowerDataComponent);
    expect(towerData).toBeDefined();
    expect(towerData?.isFusion).toBe(true);
    expect(towerData?.towerId).toBe(recipe.id);
    expect(towerData?.tier).toBe(2);
  });

  it('new fusion entity has a RenderableComponent with recipe id as sprite key', () => {
    const world = new GameWorld();
    const a = addTower(world, 'elven_archer_spire', 3, 5, 2);
    const b = addTower(world, 'dwarven_cannon', 4, 5, 2);

    const recipe = findFusionRecipe('elven_archer_spire', 'dwarven_cannon')!;
    const newId = executeFusion(world, a, b, recipe);

    const renderable = world.getComponent(newId, RenderableComponent);
    expect(renderable).toBeDefined();
    expect(renderable?.spriteKey).toBe(recipe.id);
    expect(renderable?.visible).toBe(true);
  });

  it('new entity ID is different from both destroyed entity IDs', () => {
    const world = new GameWorld();
    const a = addTower(world, 'gondorian_ballista', 1, 1, 2);
    const b = addTower(world, 'istari_crystal', 2, 1, 2);

    const recipe = findFusionRecipe('gondorian_ballista', 'istari_crystal')!;
    const newId = executeFusion(world, a, b, recipe);

    expect(newId).not.toBe(a);
    expect(newId).not.toBe(b);
  });

  it('carries over pierceCount from recipe stats', () => {
    const world = new GameWorld();
    const a = addTower(world, 'gondorian_ballista', 1, 1, 2);
    const b = addTower(world, 'istari_crystal', 2, 1, 2);

    const recipe = findFusionRecipe('gondorian_ballista', 'istari_crystal')!;
    const newId = executeFusion(world, a, b, recipe);

    const attack = world.getComponent(newId, AttackComponent);
    expect(attack?.pierceCount).toBe(3);
  });

  it('carries over statusEffect from recipe stats', () => {
    const world = new GameWorld();
    const a = addTower(world, 'ent_watchtower', 5, 5, 2);
    const b = addTower(world, 'istari_crystal', 6, 5, 2);

    const recipe = findFusionRecipe('ent_watchtower', 'istari_crystal')!;
    const newId = executeFusion(world, a, b, recipe);

    const attack = world.getComponent(newId, AttackComponent);
    expect(attack?.statusEffect).toBeDefined();
    expect(attack?.statusEffect?.type).toBe('slow');
    expect(attack?.statusEffect?.magnitude).toBe(0.5);
  });
});
