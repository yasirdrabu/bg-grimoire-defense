import type { World } from '@grimoire/shared';
import { useGameStore } from '../../../stores/useGameStore';

export function inputSystem(world: World, _dt: number): void {
  const actions = useGameStore.getState().drainActions();

  for (const action of actions) {
    switch (action.type) {
      case 'SET_SPEED':
        useGameStore.setState({ gameSpeed: action.speed });
        break;

      case 'TOGGLE_PAUSE':
        useGameStore.setState((state) => ({ isPaused: !state.isPaused }));
        break;

      case 'BUILD_TOWER':
        // Handled by GameScene directly (needs PathManager + grid access)
        break;

      case 'SEND_WAVE_EARLY':
        useGameStore.setState({ sendWaveEarlyFlag: true });
        break;

      case 'UPGRADE_TOWER':
      case 'SELL_TOWER':
      case 'FUSE_TOWERS':
        // Will be handled in Phase 2
        break;
    }
  }
}
