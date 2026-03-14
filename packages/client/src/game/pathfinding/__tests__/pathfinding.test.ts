import { describe, it, expect } from 'vitest';

/**
 * Pathfinding logic tests — test the A* algorithm directly
 * without Web Worker infrastructure (which requires a browser environment).
 * PathManager integration is tested visually in the browser.
 */

// Import PF directly to test pathfinding logic
import PF from 'pathfinding';

function findPath(
  gridData: number[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): [number, number][] {
  const grid = new PF.Grid(gridData);
  const finder = new PF.AStarFinder({ allowDiagonal: false });
  return finder.findPath(startX, startY, endX, endY, grid) as [number, number][];
}

function createOpenGrid(cols: number, rows: number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
}

describe('Pathfinding (A* logic)', () => {
  it('should find a path on an open grid', () => {
    const grid = createOpenGrid(10, 10);
    const path = findPath(grid, 0, 0, 9, 9);
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([9, 9]);
  });

  it('should find no path when completely blocked', () => {
    const grid = createOpenGrid(5, 5);
    // Block column 2 entirely
    for (let row = 0; row < 5; row++) {
      grid[row]![2] = 1;
    }
    const path = findPath(grid, 0, 0, 4, 4);
    expect(path).toHaveLength(0);
  });

  it('should path around obstacles', () => {
    const grid = createOpenGrid(5, 5);
    // Block middle row except edges
    grid[2]![1] = 1;
    grid[2]![2] = 1;
    grid[2]![3] = 1;
    const path = findPath(grid, 2, 0, 2, 4);
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual([2, 4]);
    // Path should go around the wall
    expect(path.length).toBeGreaterThan(5);
  });

  it('should validate tower placement blocks path', () => {
    // Create a corridor: row 0 is walkable, rest blocked except exit
    const grid = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0],
    ];
    // Path exists: (0,0) → (4,0) → down to (4,4)
    const pathBefore = findPath(grid, 0, 0, 4, 4);
    expect(pathBefore.length).toBeGreaterThan(0);

    // Block (4,0) — cuts off the only path
    grid[0]![4] = 1;
    const pathAfter = findPath(grid, 0, 0, 4, 4);
    expect(pathAfter).toHaveLength(0);
  });

  it('should handle 20x15 grid within performance budget', () => {
    const grid = createOpenGrid(20, 15);
    // Add some obstacles
    for (let i = 2; i < 13; i++) {
      grid[5]![i] = 1;
      grid[10]![i] = 1;
    }

    const start = performance.now();
    const path = findPath(grid, 0, 0, 19, 14);
    const elapsed = performance.now() - start;

    expect(path.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(5); // < 5ms budget
  });
});
