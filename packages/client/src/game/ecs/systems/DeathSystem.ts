import type { World } from '@grimoire/shared';
import { HealthComponent } from '../components/Health';
import { EnemyDataComponent } from '../components/EnemyData';
import { useGameStore } from '../../../stores/useGameStore';

export function deathSystem(world: World, _dt: number): void {
  const entities = world.query(HealthComponent, EnemyDataComponent);

  for (const id of entities) {
    const health = world.getComponent(id, HealthComponent)!;
    if (health.current > 0) continue;

    const enemyData = world.getComponent(id, EnemyDataComponent)!;

    // Award gold and score
    const state = useGameStore.getState();
    useGameStore.setState({
      gold: state.gold + enemyData.goldReward,
      score: state.score + enemyData.scoreValue,
    });

    // Destroy entity
    world.destroyEntity(id);
  }
}
