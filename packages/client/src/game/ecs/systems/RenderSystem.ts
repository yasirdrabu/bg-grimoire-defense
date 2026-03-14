import type { World } from '@grimoire/shared';
import { FLYING_DEPTH_OFFSET, LAYER_ENTITIES_BASE } from '@grimoire/shared';
import { PositionComponent } from '../components/Position';
import { RenderableComponent } from '../components/Renderable';
import { EnemyDataComponent } from '../components/EnemyData';
import { gridToScreen } from '../../utils/isoMath';

/**
 * RenderSystem — the ONLY system that touches Phaser APIs.
 * Updates sprite positions and depth sorting each frame.
 */
export function renderSystem(
  world: World,
  _dt: number,
  mapOffsetX: number,
  mapOffsetY: number,
  scene?: unknown, // Phaser.Scene, typed as unknown for testability
): void {
  const entities = world.query(PositionComponent, RenderableComponent);

  for (const id of entities) {
    const pos = world.getComponent(id, PositionComponent)!;
    const renderable = world.getComponent(id, RenderableComponent)!;

    if (!renderable.sprite || !renderable.visible) continue;

    // Convert grid → screen coordinates
    const { screenX, screenY } = gridToScreen(pos.gridX, pos.gridY, mapOffsetX, mapOffsetY);

    // Update Phaser sprite position
    const sprite = renderable.sprite as { x: number; y: number; setDepth: (d: number) => void };
    sprite.x = screenX + 64; // center of tile
    sprite.y = screenY + 32; // center of tile

    // Y-sort depth
    const isFlying = world.getComponent(id, EnemyDataComponent)?.isFlying ?? false;
    const depth = LAYER_ENTITIES_BASE + screenY + (isFlying ? FLYING_DEPTH_OFFSET : 0);
    sprite.setDepth(depth);
  }
}
