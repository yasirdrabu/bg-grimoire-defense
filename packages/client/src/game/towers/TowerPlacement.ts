/**
 * Tower placement validation — checks grid state and path validity.
 * Pure logic, no Phaser dependency.
 */

/** Check if a cell is available for building (not occupied, within bounds) */
export function canPlace(
  grid: number[][],
  gridX: number,
  gridY: number,
): boolean {
  if (gridY < 0 || gridY >= grid.length) return false;
  const row = grid[gridY];
  if (!row || gridX < 0 || gridX >= row.length) return false;
  return row[gridX] === 0;
}

/** Clone grid and mark a cell as blocked */
export function cloneGridWithBlock(
  grid: number[][],
  gridX: number,
  gridY: number,
): number[][] {
  const clone = grid.map((row) => [...row]);
  if (clone[gridY]) {
    clone[gridY]![gridX] = 1;
  }
  return clone;
}

/** Create an empty grid */
export function createGrid(cols: number, rows: number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
}
