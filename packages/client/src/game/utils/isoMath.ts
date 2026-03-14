import { TILE_W, TILE_H } from '@grimoire/shared';

/** Convert grid coordinates to isometric screen coordinates */
export function gridToScreen(
  gridX: number,
  gridY: number,
  mapOffsetX: number,
  mapOffsetY: number,
): { screenX: number; screenY: number } {
  return {
    screenX: (gridX - gridY) * (TILE_W / 2) + mapOffsetX,
    screenY: (gridX + gridY) * (TILE_H / 2) + mapOffsetY,
  };
}

/** Convert screen click position to grid coordinates */
export function screenToGrid(
  clickX: number,
  clickY: number,
  cameraScrollX: number,
  cameraScrollY: number,
  mapOffsetX: number,
  mapOffsetY: number,
): { gridX: number; gridY: number } {
  const localX = (clickX + cameraScrollX) - mapOffsetX;
  const localY = (clickY + cameraScrollY) - mapOffsetY;

  return {
    gridX: Math.floor(localX / TILE_W + localY / TILE_H),
    gridY: Math.floor(localY / TILE_H - localX / TILE_W),
  };
}
