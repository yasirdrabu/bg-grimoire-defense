import type { World } from '@grimoire/shared';
import { getKillGold, getBossEssence } from '@grimoire/shared';
import { HealthComponent } from '../components/Health';
import { EnemyDataComponent } from '../components/EnemyData';
import { useGameStore } from '../../../stores/useGameStore';
import { getComboTracker, getElapsedMs } from './ScoreSystem';
import { audioManager } from '../../audio/AudioManager';

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

    // Play enemy death SFX
    audioManager.playEnemyDeath(enemyData.enemyType);

    // Register kill with combo tracker
    const tracker = getComboTracker();
    tracker.registerKill(getElapsedMs());

    // Play combo SFX at 3+ chain
    const currentCombo = useGameStore.getState().comboCount;
    if (currentCombo >= 3) {
      audioManager.playComboHit(currentCombo);
    }

    // Destroy entity
    world.destroyEntity(id);
  }
}
