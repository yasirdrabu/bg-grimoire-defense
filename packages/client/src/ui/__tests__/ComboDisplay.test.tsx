import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { ComboDisplay } from '../hud/ComboDisplay';

describe('ComboDisplay', () => {
  beforeEach(() => {
    useGameStore.setState({ comboCount: 0, comboMultiplier: 1 });
  });

  it('is hidden when comboCount < 2', () => {
    useGameStore.setState({ comboCount: 1 });
    const { container } = render(<ComboDisplay />);
    expect(container.innerHTML).toBe('');
  });

  it('renders when comboCount >= 2', () => {
    useGameStore.setState({ comboCount: 5, comboMultiplier: 1.5 });
    render(<ComboDisplay />);
    expect(screen.getByText('5× COMBO')).toBeTruthy();
    expect(screen.getByText('×1.5 multiplier')).toBeTruthy();
  });
});
