import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { TowerInfo } from '../hud/TowerInfo';

const SAMPLE_TOWER_TIER1 = {
  id: 'tower-1', name: 'Elven Archer Spire', tier: 1, damage: 15,
  attackSpeed: 0.8, range: 4, special: null as string | null,
  upgradeCostA: 60, upgradeCostAEssence: null as number | null,
  upgradeCostB: null as number | null, upgradeCostBEssence: null as number | null,
  upgradeNameA: null as string | null, upgradeNameB: null as string | null,
  upgradeDescA: null as string | null, upgradeDescB: null as string | null,
  sellRefund: 50,
};

const SAMPLE_TOWER_TIER2 = {
  id: 'tower-1', name: 'Elven Archer Spire', tier: 2, damage: 19.5,
  attackSpeed: 0.72, range: 4.5, special: null as string | null,
  upgradeCostA: 100, upgradeCostAEssence: 50 as number | null,
  upgradeCostB: 100, upgradeCostBEssence: 50 as number | null,
  upgradeNameA: 'Eagle Eye' as string | null,
  upgradeNameB: 'Storm of Arrows' as string | null,
  upgradeDescA: 'Critical hit 15%' as string | null,
  upgradeDescB: 'Multishot (2 targets)' as string | null,
  sellRefund: 80,
};

describe('TowerInfo', () => {
  beforeEach(() => {
    cleanup();
    useGameStore.setState({
      gold: 500, essence: 100, isGameOver: false,
      selectedTowerData: SAMPLE_TOWER_TIER1, pendingActions: [],
    });
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

  it('shows single "Upgrade" button (no branch label) for tier 1 tower', () => {
    render(<TowerInfo />);
    expect(screen.getByText('Upgrade')).toBeTruthy();
    expect(screen.queryByText('Upgrade A')).toBeNull();
    expect(screen.queryByText('Upgrade B')).toBeNull();
  });

  it('dispatches UPGRADE_TOWER with branch A on tier 1 upgrade click', () => {
    render(<TowerInfo />);
    const upgradeBtn = screen.getByText('Upgrade').closest('button')!;
    fireEvent.click(upgradeBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'UPGRADE_TOWER', towerId: 'tower-1', branch: 'A' });
  });

  it('shows branch A and B buttons with branch names for tier 2 tower', () => {
    useGameStore.setState({ selectedTowerData: SAMPLE_TOWER_TIER2 });
    render(<TowerInfo />);
    expect(screen.getByText('Eagle Eye')).toBeTruthy();
    expect(screen.getByText('Storm of Arrows')).toBeTruthy();
    expect(screen.queryByText('Upgrade')).toBeNull();
  });

  it('shows essence cost on tier 2 branch buttons', () => {
    useGameStore.setState({ selectedTowerData: SAMPLE_TOWER_TIER2 });
    render(<TowerInfo />);
    const essenceCosts = screen.getAllByText('+50e');
    expect(essenceCosts.length).toBe(2); // one for each branch
  });

  it('shows branch ability description for tier 2 tower', () => {
    useGameStore.setState({ selectedTowerData: SAMPLE_TOWER_TIER2 });
    render(<TowerInfo />);
    expect(screen.getByText('Critical hit 15%')).toBeTruthy();
    expect(screen.getByText('Multishot (2 targets)')).toBeTruthy();
  });

  it('dispatches UPGRADE_TOWER with branch A on tier 2 branch A click', () => {
    useGameStore.setState({ selectedTowerData: SAMPLE_TOWER_TIER2 });
    render(<TowerInfo />);
    const branchABtn = screen.getByText('Eagle Eye').closest('button')!;
    fireEvent.click(branchABtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'UPGRADE_TOWER', towerId: 'tower-1', branch: 'A' });
  });

  it('dispatches UPGRADE_TOWER with branch B on tier 2 branch B click', () => {
    useGameStore.setState({ selectedTowerData: SAMPLE_TOWER_TIER2 });
    render(<TowerInfo />);
    const branchBBtn = screen.getByText('Storm of Arrows').closest('button')!;
    fireEvent.click(branchBBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'UPGRADE_TOWER', towerId: 'tower-1', branch: 'B' });
  });

  it('dims tier 2 branch buttons when essence is insufficient', () => {
    useGameStore.setState({ selectedTowerData: SAMPLE_TOWER_TIER2, gold: 500, essence: 10 });
    render(<TowerInfo />);
    const branchABtn = screen.getByText('Eagle Eye').closest('button')!;
    const branchBBtn = screen.getByText('Storm of Arrows').closest('button')!;
    expect(branchABtn.classList.contains('hud-btn-disabled')).toBe(true);
    expect(branchBBtn.classList.contains('hud-btn-disabled')).toBe(true);
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

  it('dims upgrade button when unaffordable (tier 1)', () => {
    useGameStore.setState({ gold: 10 });
    render(<TowerInfo />);
    const upgradeBtn = screen.getByText('Upgrade').closest('button')!;
    expect(upgradeBtn.classList.contains('hud-btn-disabled')).toBe(true);
  });
});
