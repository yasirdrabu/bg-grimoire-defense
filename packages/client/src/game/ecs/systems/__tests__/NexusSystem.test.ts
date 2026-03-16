import { describe, it, expect, beforeEach } from 'vitest';
import { GameWorld } from '../../World';
import { PositionComponent } from '../../components/Position';
import { HealthComponent } from '../../components/Health';
import { MovementComponent } from '../../components/Movement';
import { EnemyDataComponent } from '../../components/EnemyData';
import { nexusSystem } from '../NexusSystem';
import { useGameStore } from '../../../../stores/useGameStore';

function createEnemy(world: GameWorld, x: number, y: number, pathIndex = 0, pathLength = 10) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, HealthComponent, { current: 100, max: 100 });
  const path: [number, number][] = Array.from({ length: pathLength }, (_, i) => [i, y]);
  world.addComponent(id, MovementComponent, {
    speed: 1, path, pathIndex, slowMultiplier: 1, gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'test', goldReward: 5, scoreValue: 10, abilityType: 'none', isFlying: false, isBoss: false,
  });
  return id;
}

describe('NexusSystem', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useGameStore.setState({ nexusHP: 5, maxNexusHP: 5 });
  });

  it('should not damage nexus if enemy is far away and has path remaining', () => {
    const world = new GameWorld();
    createEnemy(world, 0, 0, 0, 10);

    nexusSystem(world, 16, 19, 7);
    expect(useGameStore.getState().nexusHP).toBe(5);
  });

  it('should damage nexus when enemy reaches end of path', () => {
    const world = new GameWorld();
    createEnemy(world, 5, 5, 999, 5); // pathIndex past end

    nexusSystem(world, 16, 19, 7);
    expect(useGameStore.getState().nexusHP).toBe(4);
  });

  it('should damage nexus when enemy is near nexus position', () => {
    const world = new GameWorld();
    createEnemy(world, 19.1, 7.1, 0, 10);

    nexusSystem(world, 16, 19, 7);
    expect(useGameStore.getState().nexusHP).toBe(4);
  });

  it('should destroy the enemy after reaching nexus', () => {
    const world = new GameWorld();
    createEnemy(world, 19, 7, 999, 5);

    nexusSystem(world, 16, 19, 7);
    expect(world.query(EnemyDataComponent)).toHaveLength(0);
  });

  it('should set isGameOver when nexus HP reaches 0', () => {
    const world = new GameWorld();
    useGameStore.setState({ nexusHP: 1 });
    createEnemy(world, 19, 7, 999, 5);

    nexusSystem(world, 16, 19, 7);
    expect(useGameStore.getState().nexusHP).toBe(0);
    expect(useGameStore.getState().isGameOver).toBe(true);
  });

  it('should handle multiple enemies reaching nexus in one frame', () => {
    const world = new GameWorld();
    createEnemy(world, 19, 7, 999, 5);
    createEnemy(world, 18.8, 7, 999, 5);

    nexusSystem(world, 16, 19, 7);
    expect(useGameStore.getState().nexusHP).toBe(3);
    expect(world.query(EnemyDataComponent)).toHaveLength(0);
  });

  it('should not set isGameOver if nexus still has HP', () => {
    const world = new GameWorld();
    createEnemy(world, 19, 7, 999, 5);

    nexusSystem(world, 16, 19, 7);
    expect(useGameStore.getState().isGameOver).toBe(false);
  });
});
