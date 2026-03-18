import { describe, it, expect, beforeEach } from 'vitest';
import { canPlace, cloneGridWithBlock, createGrid } from '../TowerPlacement';
import { addFireCell, resetFireCells } from '../../ecs/systems/FireCellSystem';

describe('TowerPlacement', () => {
  beforeEach(() => {
    resetFireCells();
  });

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

  it('should reject placement on a fire cell', () => {
    const grid = createGrid(10, 10);
    addFireCell(3, 4);
    expect(canPlace(grid, 3, 4)).toBe(false);
  });

  it('should allow placement adjacent to a fire cell', () => {
    const grid = createGrid(10, 10);
    addFireCell(3, 4);
    expect(canPlace(grid, 4, 4)).toBe(true);
  });

  it('should allow placement on a cell after its fire expires', () => {
    const grid = createGrid(10, 10);
    addFireCell(3, 4);
    expect(canPlace(grid, 3, 4)).toBe(false);
    resetFireCells();
    expect(canPlace(grid, 3, 4)).toBe(true);
  });
});
