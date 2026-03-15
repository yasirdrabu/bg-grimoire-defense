import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { SpeedControls } from '../hud/SpeedControls';

describe('SpeedControls', () => {
  beforeEach(() => {
    useGameStore.setState({ gameSpeed: 1, isPaused: false, isGameOver: false, pendingActions: [] });
  });

  it('highlights active speed', () => {
    const { container } = render(<SpeedControls />);
    const btn1 = container.querySelector('[data-speed="1"]');
    expect(btn1?.classList.contains('hud-btn-active')).toBe(true);
  });

  it('dispatches SET_SPEED on click', () => {
    const { container } = render(<SpeedControls />);
    const btn2 = container.querySelector('[data-speed="2"]')!;
    fireEvent.click(btn2);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'SET_SPEED', speed: 2 });
  });

  it('dispatches TOGGLE_PAUSE on pause click', () => {
    const { container } = render(<SpeedControls />);
    const pauseBtn = container.querySelector('[data-pause]')!;
    fireEvent.click(pauseBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'TOGGLE_PAUSE' });
  });

  it('disables all buttons when game is over', () => {
    useGameStore.setState({ isGameOver: true });
    const { container } = render(<SpeedControls />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn.classList.contains('hud-btn-disabled')).toBe(true);
    });
  });
});
