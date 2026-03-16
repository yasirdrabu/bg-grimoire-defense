import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../useGameStore';

describe('useGameStore - extended', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  describe('projectSelectedTower', () => {
    it('should project tower data into store', () => {
      const towerData = {
        id: '42',
        name: 'Elven Archer Spire',
        tier: 2,
        damage: 25,
        attackSpeed: 0.8,
        range: 5,
        special: 'pierce',
        upgradeCostA: 150,
        upgradeCostAEssence: 50,
        upgradeCostB: 200,
        upgradeCostBEssence: 50,
        upgradeNameA: 'Eagle Eye',
        upgradeNameB: 'Storm of Arrows',
        upgradeDescA: 'Critical hit 15%',
        upgradeDescB: 'Multishot (2 targets)',
        sellRefund: 75,
      };

      useGameStore.getState().projectSelectedTower(towerData);
      expect(useGameStore.getState().selectedTowerData).toEqual(towerData);
    });

    it('should overwrite previous tower selection', () => {
      useGameStore.getState().projectSelectedTower({
        id: '1', name: 'Tower A', tier: 1, damage: 10, attackSpeed: 1, range: 3,
        special: null, upgradeCostA: null, upgradeCostAEssence: null,
        upgradeCostB: null, upgradeCostBEssence: null,
        upgradeNameA: null, upgradeNameB: null, upgradeDescA: null, upgradeDescB: null,
        sellRefund: 50,
      });
      useGameStore.getState().projectSelectedTower({
        id: '2', name: 'Tower B', tier: 2, damage: 20, attackSpeed: 0.5, range: 4,
        special: 'splash', upgradeCostA: 100, upgradeCostAEssence: 50,
        upgradeCostB: null, upgradeCostBEssence: null,
        upgradeNameA: 'Branch A', upgradeNameB: null, upgradeDescA: 'Some ability', upgradeDescB: null,
        sellRefund: 100,
      });

      expect(useGameStore.getState().selectedTowerData!.id).toBe('2');
      expect(useGameStore.getState().selectedTowerData!.name).toBe('Tower B');
    });
  });

  describe('clearSelectedTower', () => {
    it('should clear selected tower data', () => {
      useGameStore.getState().projectSelectedTower({
        id: '1', name: 'Tower', tier: 1, damage: 10, attackSpeed: 1, range: 3,
        special: null, upgradeCostA: null, upgradeCostAEssence: null,
        upgradeCostB: null, upgradeCostBEssence: null,
        upgradeNameA: null, upgradeNameB: null, upgradeDescA: null, upgradeDescB: null,
        sellRefund: 50,
      });
      useGameStore.getState().clearSelectedTower();
      expect(useGameStore.getState().selectedTowerData).toBeNull();
    });
  });

  describe('wave state', () => {
    it('should default to pre wave state', () => {
      expect(useGameStore.getState().waveState).toBe('pre_wave');
    });

    it('should update wave state', () => {
      useGameStore.setState({ waveState: 'spawning' });
      expect(useGameStore.getState().waveState).toBe('spawning');

      useGameStore.setState({ waveState: 'active' });
      expect(useGameStore.getState().waveState).toBe('active');

      useGameStore.setState({ waveState: 'wave_clear' });
      expect(useGameStore.getState().waveState).toBe('wave_clear');
    });

    it('should store next wave enemies', () => {
      const enemies = [
        { enemyType: 'orc_grunt', count: 10 },
        { enemyType: 'goblin_runner', count: 5 },
      ];
      useGameStore.setState({ nextWaveEnemies: enemies });
      expect(useGameStore.getState().nextWaveEnemies).toEqual(enemies);
    });
  });

  describe('sendWaveEarlyFlag', () => {
    it('should default to false', () => {
      expect(useGameStore.getState().sendWaveEarlyFlag).toBe(false);
    });

    it('should be settable and clearable', () => {
      useGameStore.setState({ sendWaveEarlyFlag: true });
      expect(useGameStore.getState().sendWaveEarlyFlag).toBe(true);

      useGameStore.setState({ sendWaveEarlyFlag: false });
      expect(useGameStore.getState().sendWaveEarlyFlag).toBe(false);
    });
  });

  describe('resetGameState', () => {
    it('should reset all game state including selectedTowerData', () => {
      useGameStore.setState({
        gold: 9999,
        wave: 5,
        score: 5000,
        waveState: 'active',
        sendWaveEarlyFlag: true,
        isGameOver: true,
        gameSpeed: 3,
      });
      useGameStore.getState().projectSelectedTower({
        id: '1', name: 'Tower', tier: 1, damage: 10, attackSpeed: 1, range: 3,
        special: null, upgradeCostA: null, upgradeCostAEssence: null,
        upgradeCostB: null, upgradeCostBEssence: null,
        upgradeNameA: null, upgradeNameB: null, upgradeDescA: null, upgradeDescB: null,
        sellRefund: 50,
      });

      useGameStore.getState().resetGameState();

      const state = useGameStore.getState();
      expect(state.gold).toBe(650);
      expect(state.wave).toBe(0);
      expect(state.score).toBe(0);
      expect(state.waveState).toBe('pre_wave');
      expect(state.sendWaveEarlyFlag).toBe(false);
      expect(state.isGameOver).toBe(false);
      expect(state.gameSpeed).toBe(1);
      expect(state.selectedTowerData).toBeNull();
      expect(state.pendingActions).toHaveLength(0);
    });
  });

  describe('dispatch ordering', () => {
    it('should preserve action order', () => {
      const { dispatch } = useGameStore.getState();
      dispatch({ type: 'SET_SPEED', speed: 2 });
      dispatch({ type: 'TOGGLE_PAUSE' });
      dispatch({ type: 'SEND_WAVE_EARLY' });

      const actions = useGameStore.getState().drainActions();
      expect(actions[0]!.type).toBe('SET_SPEED');
      expect(actions[1]!.type).toBe('TOGGLE_PAUSE');
      expect(actions[2]!.type).toBe('SEND_WAVE_EARLY');
    });
  });
});
