/**
 * FireCellSystem — tracks which grid cells are on fire.
 *
 * Fire cells are:
 * - Unbuildable (tower placement should check isOnFire before placing)
 * - Active for 15 seconds (FIRE_DURATION_MS)
 * - Towers on fire cells are continuously disabled (TowerDisabledComponent)
 *
 * This module is pure state — no Phaser dependencies.
 */

import type { World } from '@grimoire/shared';
import { TowerDataComponent } from '../components/TowerData';
import { PositionComponent } from '../components/Position';
import { TowerDisabledComponent } from '../components/TowerDisabled';

export const FIRE_DURATION_MS = 15_000;

interface FireCell {
  remainingMs: number;
}

/** Keyed by "gridX,gridY" */
const fireCells = new Map<string, FireCell>();

function cellKey(gridX: number, gridY: number): string {
  return `${gridX},${gridY}`;
}

/** Add or refresh a fire cell at the given grid coordinates. */
export function addFireCell(gridX: number, gridY: number): void {
  const key = cellKey(gridX, gridY);
  const existing = fireCells.get(key);
  if (existing) {
    // Refresh timer
    existing.remainingMs = FIRE_DURATION_MS;
  } else {
    fireCells.set(key, { remainingMs: FIRE_DURATION_MS });
  }
}

/** Returns true if the given cell is currently on fire. */
export function isOnFire(gridX: number, gridY: number): boolean {
  return fireCells.has(cellKey(gridX, gridY));
}

/** Returns a copy of the current fire cells map (keyed by "gridX,gridY"). */
export function getFireCells(): Map<string, { remainingMs: number }> {
  return new Map(fireCells);
}

/**
 * Tick down all fire cell timers by deltaMs.
 * Removes cells whose timer has expired.
 */
export function tickFireCells(deltaMs: number): void {
  for (const [key, cell] of fireCells) {
    cell.remainingMs -= deltaMs;
    if (cell.remainingMs <= 0) {
      fireCells.delete(key);
    }
  }
}

/** Resets all fire cells — used for test isolation. */
export function resetFireCells(): void {
  fireCells.clear();
  fireDamageAccumulator = 0;
}

/** Accumulates deltaMs to apply tower disable every 1000ms */
let fireDamageAccumulator = 0;

const FIRE_DISABLE_INTERVAL_MS = 1000;
const FIRE_DISABLE_DURATION_MS = 1000;

/**
 * Disables towers on fire cells by adding/refreshing TowerDisabledComponent.
 * Should be called from GameScene after tickFireCells.
 */
export function damageFireTowers(world: World, deltaMs: number): void {
  fireDamageAccumulator += deltaMs;
  if (fireDamageAccumulator < FIRE_DISABLE_INTERVAL_MS) return;
  fireDamageAccumulator -= FIRE_DISABLE_INTERVAL_MS;

  if (fireCells.size === 0) return;

  const towers = world.query(TowerDataComponent, PositionComponent);
  for (const id of towers) {
    const pos = world.getComponent(id, PositionComponent)!;
    if (!isOnFire(pos.gridX, pos.gridY)) continue;

    const existing = world.getComponent(id, TowerDisabledComponent);
    if (existing) {
      existing.remainingMs = FIRE_DISABLE_DURATION_MS;
    } else {
      world.addComponent(id, TowerDisabledComponent, { remainingMs: FIRE_DISABLE_DURATION_MS });
    }
  }
}
