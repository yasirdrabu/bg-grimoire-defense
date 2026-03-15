import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { TowerInfo } from '../hud/TowerInfo';

const SAMPLE_TOWER = {
  id: 'tower-1', name: 'Elven Archer Spire', tier: 1, damage: 15,
  attackSpeed: 0.8, range: 4, special: null as string | null,
  upgradeCostA: 60, upgradeCostB: null as number | null, sellRefund: 50,
};

describe('TowerInfo', () => {
  beforeEach(() => {
    cleanup();
    useGameStore.setState({ gold: 500, isGameOver: false, selectedTowerData: SAMPLE_TOWER, pendingActions: [] });
    useUIStore.setState({ inputMode: 'selected', selectedTowerId: 'tower-1' });
  });

  it('renders nothing when no tower is selected', () => {
    useGameStore.setState({ selectedTowerData: null });
    const { container } = render(<TowerInfo />);
    expect(container.innerHTML).toBe('');
  });

  it('shows tower name and stats', () => {
    render(<TowerInfo />);
    expect(screen.getByText('Elven Archer Spire')).toBeTruthy();
    expect(screen.getByText('DMG 15')).toBeTruthy();
    expect(screen.getByText('SPD 0.8s')).toBeTruthy();
    expect(screen.getByText('RNG 4')).toBeTruthy();
  });

  it('dispatches UPGRADE_TOWER on upgrade click', () => {
    render(<TowerInfo />);
    const upgradeBtn = screen.getByText('Upgrade A').closest('button')!;
    fireEvent.click(upgradeBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'UPGRADE_TOWER', towerId: 'tower-1', branch: 'A' });
  });

  it('dispatches SELL_TOWER on sell click', () => {
    render(<TowerInfo />);
    const sellBtn = screen.getByText('Sell').closest('button')!;
    fireEvent.click(sellBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'SELL_TOWER', towerId: 'tower-1' });
  });

  it('deselects tower on close click', () => {
    render(<TowerInfo />);
    fireEvent.click(screen.getByText('\u2715'));
    expect(useUIStore.getState().inputMode).toBe('idle');
  });

  it('dims upgrade button when unaffordable', () => {
    useGameStore.setState({ gold: 10 });
    render(<TowerInfo />);
    const upgradeBtn = screen.getByText('Upgrade A').closest('button')!;
    expect(upgradeBtn.classList.contains('hud-btn-disabled')).toBe(true);
  });
});
