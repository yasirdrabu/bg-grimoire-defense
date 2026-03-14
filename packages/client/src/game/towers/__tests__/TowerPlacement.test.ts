import { describe, it, expect } from 'vitest';
import { canPlace, cloneGridWithBlock, createGrid } from '../TowerPlacement';

describe('TowerPlacement', () => {
  it('should allow placement on empty cell', () => {
    const grid = createGrid(10, 10);
    expect(canPlace(grid, 5, 5)).toBe(true);
  });

  it('should reject placement on occupied cell', () => {
    const grid = createGrid(10, 10);
    grid[5]![5] = 1;
    expect(canPlace(grid, 5, 5)).toBe(false);
  });

  it('should reject placement out of bounds', () => {
    const grid = createGrid(10, 10);
    expect(canPlace(grid, -1, 0)).toBe(false);
    expect(canPlace(grid, 0, -1)).toBe(false);
    expect(canPlace(grid, 10, 0)).toBe(false);
    expect(canPlace(grid, 0, 10)).toBe(false);
  });

  it('should clone grid with blocked cell', () => {
    const grid = createGrid(5, 5);
    const clone = cloneGridWithBlock(grid, 2, 2);
    expect(clone[2]![2]).toBe(1);
    expect(grid[2]![2]).toBe(0); // original unchanged
  });
});
