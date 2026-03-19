import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { TowerPanel } from '../hud/TowerPanel';

describe('TowerPanel', () => {
  beforeEach(() => {
    cleanup();
    useGameStore.setState({ gold: 200, isGameOver: false });
    useUIStore.setState({ inputMode: 'idle', buildTowerType: null });
  });

  it('renders all 5 Middle-earth tower buttons', () => {
    render(<TowerPanel />);
    // TowerPanel filters to middle_earth universe; cost labels are unique in that set
    expect(screen.getByText('100g')).toBeTruthy();
    expect(screen.getByText('200g')).toBeTruthy();
    expect(screen.getByText('300g')).toBeTruthy();
    expect(screen.getByText('150g')).toBeTruthy();
    expect(screen.getByText('250g')).toBeTruthy();
  });

  it('dims towers the player cannot afford', () => {
    useGameStore.setState({ gold: 100 });
    const { container } = render(<TowerPanel />);
    const archer = container.querySelector('[data-tower-id="elven_archer_spire"]');
    const ballista = container.querySelector('[data-tower-id="gondorian_ballista"]');
    expect(archer?.classList.contains('hud-btn-disabled')).toBe(false);
    expect(ballista?.classList.contains('hud-btn-disabled')).toBe(true);
  });

  it('highlights active build mode tower', () => {
    useUIStore.setState({ inputMode: 'build', buildTowerType: 'istari_crystal' });
    const { container } = render(<TowerPanel />);
    const crystal = container.querySelector('[data-tower-id="istari_crystal"]');
    expect(crystal?.classList.contains('hud-btn-active')).toBe(true);
  });

  it('enters build mode on click', () => {
    render(<TowerPanel />);
    const archer = screen.getByText('100g').closest('[data-tower-id]')!;
    fireEvent.click(archer);
    const ui = useUIStore.getState();
    expect(ui.inputMode).toBe('build');
    expect(ui.buildTowerType).toBe('elven_archer_spire');
  });

  it('disables all buttons when game is over', () => {
    useGameStore.setState({ gold: 9999, isGameOver: true });
    const { container } = render(<TowerPanel />);
    const buttons = container.querySelectorAll('[data-tower-id]');
    buttons.forEach((btn) => {
      expect(btn.classList.contains('hud-btn-disabled')).toBe(true);
    });
  });
});
