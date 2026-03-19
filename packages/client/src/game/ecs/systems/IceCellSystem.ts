/**
 * IceCellSystem — tracks which grid cells are frozen by ice.
 *
 * Ice cells are:
 * - Impassable (pathfinding must route around them)
 * - Active for a configurable duration (default ICE_DURATION_MS)
 * - Enemies cannot walk through ice cells — forces repath
 *
 * This module is pure state — no Phaser dependencies.
 * Pattern mirrors FireCellSystem.
 */

export const ICE_DURATION_MS = 10_000;

interface IceCell {
  remainingMs: number;
}

/** Keyed by "gridX,gridY" */
const iceCells = new Map<string, IceCell>();

function cellKey(gridX: number, gridY: number): string {
  return `${gridX},${gridY}`;
}

/** Add or refresh an ice cell at the given grid coordinates with a given duration. */
export function addIceCell(gridX: number, gridY: number, durationMs: number = ICE_DURATION_MS): void {
  const key = cellKey(gridX, gridY);
  const existing = iceCells.get(key);
  if (existing) {
    existing.remainingMs = Math.max(existing.remainingMs, durationMs);
  } else {
    iceCells.set(key, { remainingMs: durationMs });
  }
}

/** Returns true if the given cell is currently frozen. */
export function isIceFrozen(gridX: number, gridY: number): boolean {
  return iceCells.has(cellKey(gridX, gridY));
}

/** Returns a copy of the current ice cells map (keyed by "gridX,gridY"). */
export function getIceCells(): Map<string, { remainingMs: number }> {
  return new Map(iceCells);
}

/**
 * Tick down all ice cell timers by deltaMs.
 * Removes cells whose timer has expired.
 * Returns true if any cells expired this tick (signals repath may be needed).
 */
export function tickIceCells(deltaMs: number): boolean {
  let anyExpired = false;
  for (const [key, cell] of iceCells) {
    cell.remainingMs -= deltaMs;
    if (cell.remainingMs <= 0) {
      iceCells.delete(key);
      anyExpired = true;
    }
  }
  return anyExpired;
}

/** Resets all ice cells — used for test isolation. */
export function resetIceCells(): void {
  iceCells.clear();
}
