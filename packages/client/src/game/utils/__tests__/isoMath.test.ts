import { describe, it, expect } from 'vitest';
import { gridToScreen, screenToGrid } from '../isoMath';
import { TILE_W, TILE_H } from '@grimoire/shared';

describe('isoMath', () => {
  it('should convert grid (0,0) to screen origin with no offset', () => {
    const { screenX, screenY } = gridToScreen(0, 0, 0, 0);
    expect(screenX).toBe(0);
    expect(screenY).toBe(0);
  });

  it('should convert grid (1,0) correctly', () => {
    const { screenX, screenY } = gridToScreen(1, 0, 0, 0);
    expect(screenX).toBe(TILE_W / 2);
    expect(screenY).toBe(TILE_H / 2);
  });

  it('should convert grid (0,1) correctly', () => {
    const { screenX, screenY } = gridToScreen(0, 1, 0, 0);
    expect(screenX).toBe(-TILE_W / 2);
    expect(screenY).toBe(TILE_H / 2);
  });

  it('should apply map offset', () => {
    const { screenX, screenY } = gridToScreen(0, 0, 100, 200);
    expect(screenX).toBe(100);
    expect(screenY).toBe(200);
  });

  it('should round-trip grid → screen → grid for various positions', () => {
    const testCases = [
      [0, 0], [5, 3], [10, 10], [0, 14], [19, 0], [19, 14],
    ] as const;

    for (const [gx, gy] of testCases) {
      const { screenX, screenY } = gridToScreen(gx, gy, 0, 0);
      // gridToScreen returns top vertex of diamond; center is at (screenX, screenY + TILE_H/2)
      const { gridX, gridY } = screenToGrid(
        screenX,
        screenY + TILE_H / 2,
        0, 0, 0, 0,
      );
      expect(gridX).toBe(gx);
      expect(gridY).toBe(gy);
    }
  });

  it('should handle screen to grid with camera scroll', () => {
    // Tile (0,0) center is at screen (0, TILE_H/2) = (0, 32)
    // With camera scroll of (50, 50), click must be at (-50 + 0, -50 + 32) to hit (0,0)
    // But clickX can't be negative in practice, so test tile (3,1) instead
    const { screenX, screenY } = gridToScreen(3, 1, 0, 0);
    const scrollX = 50;
    const scrollY = 50;
    const { gridX, gridY } = screenToGrid(
      screenX - scrollX,
      screenY + TILE_H / 2 - scrollY,
      scrollX, scrollY,
      0, 0,
    );
    expect(gridX).toBe(3);
    expect(gridY).toBe(1);
  });
});
