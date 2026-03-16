import { describe, it, expect } from 'vitest';
import { GameWorld } from '../../World';
import { PositionComponent } from '../../components/Position';
import { MovementComponent } from '../../components/Movement';
import { movementSystem } from '../MovementSystem';

function createMover(world: GameWorld, x: number, y: number, path: [number, number][], speed = 1) {
  const id = world.createEntity();
  world.addComponent(id, PositionComponent, { gridX: x, gridY: y });
  world.addComponent(id, MovementComponent, {
    speed, path, pathIndex: 0, slowMultiplier: 1, gridVersion: 0,
  });
  return id;
}

describe('MovementSystem', () => {
  it('should not move entity with empty path', () => {
    const world = new GameWorld();
    const id = createMover(world, 5, 5, []);

    movementSystem(world, 500);
    const pos = world.getComponent(id, PositionComponent)!;
    expect(pos.gridX).toBe(5);
    expect(pos.gridY).toBe(5);
  });

  it('should not move entity at end of path', () => {
    const world = new GameWorld();
    const id = world.createEntity();
    world.addComponent(id, PositionComponent, { gridX: 10, gridY: 5 });
    world.addComponent(id, MovementComponent, {
      speed: 1,
      path: [[0, 5], [5, 5], [10, 5]],
      pathIndex: 3, // past end
      slowMultiplier: 1,
      gridVersion: 0,
    });

    movementSystem(world, 500);
    const pos = world.getComponent(id, PositionComponent)!;
    expect(pos.gridX).toBe(10);
  });

  it('should apply slowMultiplier to movement speed', () => {
    const world = new GameWorld();
    const normalId = createMover(world, 0, 0, [[10, 0]], 2);
    const slowedId = createMover(world, 0, 1, [[10, 1]], 2);
    world.getComponent(slowedId, MovementComponent)!.slowMultiplier = 0.5;

    movementSystem(world, 500);
    const normalPos = world.getComponent(normalId, PositionComponent)!;
    const slowedPos = world.getComponent(slowedId, PositionComponent)!;

    expect(slowedPos.gridX).toBeCloseTo(normalPos.gridX * 0.5, 1);
  });

  it('should stop moving when stunned (slowMultiplier = 0)', () => {
    const world = new GameWorld();
    const id = createMover(world, 5, 5, [[10, 5]]);
    world.getComponent(id, MovementComponent)!.slowMultiplier = 0;

    movementSystem(world, 1000);
    const pos = world.getComponent(id, PositionComponent)!;
    expect(pos.gridX).toBe(5);
    expect(pos.gridY).toBe(5);
  });

  it('should advance pathIndex when reaching a waypoint', () => {
    const world = new GameWorld();
    const id = world.createEntity();
    // Start very close to waypoint[0]
    world.addComponent(id, PositionComponent, { gridX: 0.05, gridY: 0 });
    world.addComponent(id, MovementComponent, {
      speed: 2,
      path: [[0, 0], [5, 0], [10, 0]],
      pathIndex: 0,
      slowMultiplier: 1,
      gridVersion: 0,
    });

    movementSystem(world, 100);
    const mov = world.getComponent(id, MovementComponent)!;
    expect(mov.pathIndex).toBeGreaterThanOrEqual(1);
  });
});
