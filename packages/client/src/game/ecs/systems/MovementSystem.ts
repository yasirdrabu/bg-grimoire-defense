import type { World } from '@grimoire/shared';
import {
  SEPARATION_WEIGHT, PATH_FOLLOWING_WEIGHT,
  SEPARATION_RADIUS, WAYPOINT_THRESHOLD,
} from '@grimoire/shared';
import { PositionComponent } from '../components/Position';
import { MovementComponent } from '../components/Movement';

export function movementSystem(world: World, dt: number): void {
  const dtSec = dt / 1000;
  const entities = world.query(PositionComponent, MovementComponent);

  // Collect positions for separation steering
  const positions: { id: number; x: number; y: number }[] = [];
  for (const id of entities) {
    const pos = world.getComponent(id, PositionComponent)!;
    positions.push({ id, x: pos.gridX, y: pos.gridY });
  }

  for (const id of entities) {
    const pos = world.getComponent(id, PositionComponent)!;
    const mov = world.getComponent(id, MovementComponent)!;

    if (mov.path.length === 0 || mov.pathIndex >= mov.path.length) continue;

    const target = mov.path[mov.pathIndex]!;
    const dx = target[0] - pos.gridX;
    const dy = target[1] - pos.gridY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Check if reached waypoint
    if (dist < WAYPOINT_THRESHOLD) {
      mov.pathIndex++;
      if (mov.pathIndex >= mov.path.length) continue;
    }

    // Path-following direction
    const currentTarget = mov.path[Math.min(mov.pathIndex, mov.path.length - 1)]!;
    const pdx = currentTarget[0] - pos.gridX;
    const pdy = currentTarget[1] - pos.gridY;
    const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
    let pathDirX = pDist > 0 ? pdx / pDist : 0;
    let pathDirY = pDist > 0 ? pdy / pDist : 0;

    // Separation steering
    let sepX = 0;
    let sepY = 0;
    for (const other of positions) {
      if (other.id === id) continue;
      const sdx = pos.gridX - other.x;
      const sdy = pos.gridY - other.y;
      const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sDist < SEPARATION_RADIUS && sDist > 0.001) {
        sepX += sdx / sDist / sDist;
        sepY += sdy / sDist / sDist;
      }
    }

    // Combine steering
    const dirX = pathDirX * PATH_FOLLOWING_WEIGHT + sepX * SEPARATION_WEIGHT;
    const dirY = pathDirY * PATH_FOLLOWING_WEIGHT + sepY * SEPARATION_WEIGHT;

    // Normalize
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    const normX = len > 0 ? dirX / len : 0;
    const normY = len > 0 ? dirY / len : 0;

    // Apply movement
    const speed = mov.speed * mov.slowMultiplier * dtSec;
    pos.gridX += normX * speed;
    pos.gridY += normY * speed;
  }
}
