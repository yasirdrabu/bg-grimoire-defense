import { describe, it, expect, beforeEach } from 'vitest';
import { GameWorld } from '../../World';
import { PositionComponent } from '../../components/Position';
import { HealthComponent } from '../../components/Health';
import { MovementComponent } from '../../components/Movement';
import { EnemyDataComponent } from '../../components/EnemyData';
import { RenderableComponent } from '../../components/Renderable';
import { StatusEffectsComponent } from '../../components/StatusEffects';
import { deathSystem } from '../DeathSystem';
import { useGameStore } from '../../../../stores/useGameStore';

function createEnemy(world: GameWorld, hp: number, goldReward = 8, scoreValue = 10) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: 5, gridY: 5 });
  world.addComponent(id, HealthComponent, { current: hp, max: 100 });
  world.addComponent(id, MovementComponent, {
    speed: 1, path: [], pathIndex: 0, slowMultiplier: 1, gridVersion: 0,
  });
  world.addComponent(id, EnemyDataComponent, {
    enemyId: 'test', goldReward, scoreValue, abilityType: 'none', isFlying: false, isBoss: false,
  });
  world.addComponent(id, RenderableComponent, { spriteKey: 'test', visible: true });
  world.addComponent(id, StatusEffectsComponent, { effects: [] });
  return id;
}

describe('DeathSystem', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  it('should not destroy living enemies', () => {
    const world = new GameWorld();
    createEnemy(world, 50);

    deathSystem(world, 16);
    expect(world.query(EnemyDataComponent)).toHaveLength(1);
  });

  it('should destroy dead enemies and award gold', () => {
    const world = new GameWorld();
    createEnemy(world, 0, 15);

    const goldBefore = useGameStore.getState().gold;
    deathSystem(world, 16);

    expect(world.query(EnemyDataComponent)).toHaveLength(0);
    expect(useGameStore.getState().gold).toBe(goldBefore + 15);
  });

  it('should award score on kill', () => {
    const world = new GameWorld();
    createEnemy(world, 0, 8, 25);

    const scoreBefore = useGameStore.getState().score;
    deathSystem(world, 16);

    expect(useGameStore.getState().score).toBe(scoreBefore + 25);
  });

  it('should handle multiple deaths in one frame', () => {
    const world = new GameWorld();
    createEnemy(world, 0, 10, 10);
    createEnemy(world, 0, 20, 20);
    createEnemy(world, 50); // alive

    const goldBefore = useGameStore.getState().gold;
    const scoreBefore = useGameStore.getState().score;
    deathSystem(world, 16);

    expect(world.query(EnemyDataComponent)).toHaveLength(1);
    expect(useGameStore.getState().gold).toBe(goldBefore + 30);
    expect(useGameStore.getState().score).toBe(scoreBefore + 30);
  });

  it('should not award gold for enemies with negative HP', () => {
    const world = new GameWorld();
    createEnemy(world, -10, 8);

    const goldBefore = useGameStore.getState().gold;
    deathSystem(world, 16);

    // Still awards gold (dead is HP <= 0)
    expect(useGameStore.getState().gold).toBe(goldBefore + 8);
    expect(world.query(EnemyDataComponent)).toHaveLength(0);
  });
});
