import type { World } from '@grimoire/shared';
import { getKillGold, getBossEssence } from '@grimoire/shared';
import { HealthComponent } from '../components/Health';
import { EnemyDataComponent } from '../components/EnemyData';
import { useGameStore } from '../../../stores/useGameStore';
import { getComboTracker, getElapsedMs } from './ScoreSystem';

export function deathSystem(world: World, _dt: number): void {
  const entities = world.query(HealthComponent, EnemyDataComponent);

  for (const id of entities) {
    const health = world.getComponent(id, HealthComponent)!;
    if (health.current > 0) continue;

    const enemyData = world.getComponent(id, EnemyDataComponent)!;

    // Award gold, essence, and score
    const goldEarned = getKillGold(enemyData);
    const essenceEarned = getBossEssence(enemyData);
    const state = useGameStore.getState();
    useGameStore.setState({
      gold: state.gold + goldEarned,
      essence: state.essence + essenceEarned,
      score: state.score + enemyData.scoreValue,
    });

    // Register kill with combo tracker
    getComboTracker().registerKill(getElapsedMs());

    // Destroy entity
    world.destroyEntity(id);
  }
}
