import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/preact';
import { useUIStore } from '../../stores/useUIStore';
import { useGameStore } from '../../stores/useGameStore';
import { BottomBar } from '../hud/BottomBar';

describe('BottomBar', () => {
  beforeEach(() => {
    cleanup();
    useUIStore.setState({ inputMode: 'idle', selectedTowerId: null, buildTowerType: null });
    useGameStore.setState({ gold: 500, isGameOver: false, selectedTowerData: null });
  });

  it('renders TowerPanel in idle mode', () => {
    render(<BottomBar />);
    expect(screen.getByText('100g')).toBeTruthy();
  });

  it('renders TowerPanel in build mode', () => {
    useUIStore.setState({ inputMode: 'build', buildTowerType: 'elven_archer_spire' });
    render(<BottomBar />);
    expect(screen.getByText('100g')).toBeTruthy();
  });

  it('renders TowerInfo in selected mode', () => {
    useUIStore.setState({ inputMode: 'selected', selectedTowerId: 'tower-1' });
    useGameStore.setState({
      selectedTowerData: {
        id: 'tower-1', name: 'Elven Archer Spire', tier: 1, damage: 15,
        attackSpeed: 0.8, range: 4, special: null, upgradeCostA: 60,
        upgradeCostB: null, sellRefund: 50,
      },
    });
    render(<BottomBar />);
    expect(screen.getByText('Elven Archer Spire')).toBeTruthy();
    expect(screen.getByText('DMG 15')).toBeTruthy();
  });
});
