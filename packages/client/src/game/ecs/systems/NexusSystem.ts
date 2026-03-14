import type { World } from '@grimoire/shared';
import { PositionComponent } from '../components/Position';
import { MovementComponent } from '../components/Movement';
import { EnemyDataComponent } from '../components/EnemyData';
import { useGameStore } from '../../../stores/useGameStore';

export function nexusSystem(
  world: World,
  _dt: number,
  nexusX: number,
  nexusY: number,
): void {
  const entities = world.query(PositionComponent, MovementComponent, EnemyDataComponent);
  const NEXUS_THRESHOLD = 0.5; // grid cells

  for (const id of entities) {
    const pos = world.getComponent(id, PositionComponent)!;
    const mov = world.getComponent(id, MovementComponent)!;

    // Check if enemy has reached end of path or is near nexus
    const atEndOfPath = mov.pathIndex >= mov.path.length;
    const dist = Math.sqrt((pos.gridX - nexusX) ** 2 + (pos.gridY - nexusY) ** 2);
    const nearNexus = dist < NEXUS_THRESHOLD;

    if (atEndOfPath || nearNexus) {
      // Deduct nexus HP
      const state = useGameStore.getState();
      const newHP = state.nexusHP - 1;
      useGameStore.setState({
        nexusHP: newHP,
        isGameOver: newHP <= 0,
      });

      // Destroy enemy (no gold reward)
      world.destroyEntity(id);
    }
  }
}
