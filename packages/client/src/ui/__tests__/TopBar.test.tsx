import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { TopBar } from '../hud/TopBar';

describe('TopBar', () => {
  beforeEach(() => {
    cleanup();
    useGameStore.setState({
      gold: 500, essence: 25, wave: 3, totalWaves: 10,
      nexusHP: 3, maxNexusHP: 5, score: 1240,
    });
  });

  it('displays gold amount', () => {
    render(<TopBar />);
    expect(screen.getByText('500')).toBeTruthy();
  });

  it('displays essence amount', () => {
    render(<TopBar />);
    expect(screen.getByText('25')).toBeTruthy();
  });

  it('displays wave counter', () => {
    render(<TopBar />);
    expect(screen.getByText(/WAVE 3 \/ 10/)).toBeTruthy();
  });

  it('displays nexus HP', () => {
    render(<TopBar />);
    expect(screen.getByText('3/5')).toBeTruthy();
  });

  it('displays score', () => {
    render(<TopBar />);
    expect(screen.getByText('1,240')).toBeTruthy();
  });
});
