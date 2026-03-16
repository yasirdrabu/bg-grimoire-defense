import { describe, it, expect, beforeEach } from 'vitest';
import { GameWorld } from '../../World';
import { inputSystem } from '../InputSystem';
import { useGameStore } from '../../../../stores/useGameStore';
import { usePlayerStore } from '../../../../stores/usePlayerStore';
import { TowerDataComponent } from '../../components/TowerData';
import { PositionComponent } from '../../components/Position';
import { AttackComponent } from '../../components/Attack';
import { RenderableComponent } from '../../components/Renderable';
import { FIRST_FUSION_ESSENCE } from '@grimoire/shared';

describe('InputSystem', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  it('should set game speed from SET_SPEED action', () => {
    const world = new GameWorld();
    useGameStore.getState().dispatch({ type: 'SET_SPEED', speed: 2 });

    inputSystem(world, 16);
    expect(useGameStore.getState().gameSpeed).toBe(2);
  });

  it('should toggle pause from TOGGLE_PAUSE action', () => {
    const world = new GameWorld();
    expect(useGameStore.getState().isPaused).toBe(false);

    useGameStore.getState().dispatch({ type: 'TOGGLE_PAUSE' });
    inputSystem(world, 16);
    expect(useGameStore.getState().isPaused).toBe(true);

    useGameStore.getState().dispatch({ type: 'TOGGLE_PAUSE' });
    inputSystem(world, 16);
    expect(useGameStore.getState().isPaused).toBe(false);
  });

  it('should set sendWaveEarlyFlag from SEND_WAVE_EARLY action', () => {
    const world = new GameWorld();
    useGameStore.getState().dispatch({ type: 'SEND_WAVE_EARLY' });

    inputSystem(world, 16);
    expect(useGameStore.getState().sendWaveEarlyFlag).toBe(true);
  });

  it('should drain all actions in one pass', () => {
    const world = new GameWorld();
    useGameStore.getState().dispatch({ type: 'SET_SPEED', speed: 3 });
    useGameStore.getState().dispatch({ type: 'SEND_WAVE_EARLY' });

    inputSystem(world, 16);
    expect(useGameStore.getState().gameSpeed).toBe(3);
    expect(useGameStore.getState().sendWaveEarlyFlag).toBe(true);
    expect(useGameStore.getState().pendingActions).toHaveLength(0);
  });

  it('should handle empty action queue gracefully', () => {
    const world = new GameWorld();
    expect(() => inputSystem(world, 16)).not.toThrow();
  });
});

/** Helper: create a Tier-2 tower entity with the required ECS components */
function createTier2Tower(
  world: GameWorld,
  towerId: string,
  gridX: number,
  gridY: number,
): number {
  const id = world.createEntity();
  world.addComponent(id, TowerDataComponent, { towerId, tier: 2, totalInvestment: 0, isFusion: false });
  world.addComponent(id, PositionComponent, { gridX, gridY });
  world.addComponent(id, AttackComponent, {
    range: 3,
    damage: 20,
    damageType: 'physical',
    attackSpeed: 1,
    cooldownRemaining: 0,
    targetId: null,
    targetingMode: 'nearest',
    projectileType: 'arrow',
    canTargetAir: false,
  });
  world.addComponent(id, RenderableComponent, { spriteKey: towerId, visible: true });
  return id;
}

describe('InputSystem – FUSE_TOWERS discovery wiring', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    // Reset discoveredFusions
    usePlayerStore.setState({ discoveredFusions: new Set() });
    // Give player enough essence to perform a fusion (essenceCost = 25, start with 100)
    useGameStore.setState({ essence: 100 });
  });

  it('awards FIRST_FUSION_ESSENCE bonus on first discovery', () => {
    const world = new GameWorld();
    const essenceBefore = useGameStore.getState().essence;

    const idA = createTier2Tower(world, 'elven_archer_spire', 0, 0);
    const idB = createTier2Tower(world, 'dwarven_cannon', 1, 0);

    useGameStore.getState().dispatch({ type: 'FUSE_TOWERS', towerIdA: String(idA), towerIdB: String(idB) });
    inputSystem(world, 16);

    const essenceAfter = useGameStore.getState().essence;
    // Deducted essenceCost (25) then awarded FIRST_FUSION_ESSENCE (25), net 0 for this recipe
    expect(essenceAfter).toBe(essenceBefore - 25 + FIRST_FUSION_ESSENCE);
    expect(usePlayerStore.getState().discoveredFusions.has('explosive_arrow')).toBe(true);
  });

  it('does NOT award bonus on a repeated fusion', () => {
    const world = new GameWorld();

    // Pre-mark the fusion as already discovered
    usePlayerStore.getState().discoverFusion('explosive_arrow');

    const idA = createTier2Tower(world, 'elven_archer_spire', 0, 0);
    const idB = createTier2Tower(world, 'dwarven_cannon', 1, 0);

    const essenceBefore = useGameStore.getState().essence;
    useGameStore.getState().dispatch({ type: 'FUSE_TOWERS', towerIdA: String(idA), towerIdB: String(idB) });
    inputSystem(world, 16);

    const essenceAfter = useGameStore.getState().essence;
    // Only the recipe cost is deducted, no bonus
    expect(essenceAfter).toBe(essenceBefore - 25);
  });

  it('records the fusion in discoveredFusions after first use', () => {
    const world = new GameWorld();
    expect(usePlayerStore.getState().discoveredFusions.size).toBe(0);

    const idA = createTier2Tower(world, 'elven_archer_spire', 0, 0);
    const idB = createTier2Tower(world, 'dwarven_cannon', 1, 0);

    useGameStore.getState().dispatch({ type: 'FUSE_TOWERS', towerIdA: String(idA), towerIdB: String(idB) });
    inputSystem(world, 16);

    expect(usePlayerStore.getState().discoveredFusions.size).toBe(1);
    expect(usePlayerStore.getState().discoveredFusions.has('explosive_arrow')).toBe(true);
  });
});
