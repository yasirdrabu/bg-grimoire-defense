import { describe, it, expect, beforeEach } from 'vitest';
import { ComboTracker } from '../ComboTracker';

describe('ComboTracker', () => {
  let tracker: ComboTracker;

  beforeEach(() => {
    tracker = new ComboTracker();
  });

  it('should start with zero combo', () => {
    expect(tracker.comboCount).toBe(0);
    expect(tracker.getMultiplier()).toBe(1);
  });

  it('should increment combo on kill within window', () => {
    tracker.registerKill(0);
    tracker.registerKill(1000);
    expect(tracker.comboCount).toBe(2);
    expect(tracker.getMultiplier()).toBe(1); // < 5 threshold
  });

  it('should return 2x multiplier at 5 kills', () => {
    for (let i = 0; i < 5; i++) tracker.registerKill(i * 200);
    expect(tracker.getMultiplier()).toBe(2);
  });

  it('should return 3x multiplier at 10 kills', () => {
    for (let i = 0; i < 10; i++) tracker.registerKill(i * 200);
    expect(tracker.getMultiplier()).toBe(3);
  });

  it('should return 5x multiplier at 25 kills', () => {
    for (let i = 0; i < 25; i++) tracker.registerKill(i * 80);
    expect(tracker.getMultiplier()).toBe(5);
  });

  it('should return 10x multiplier at 50 kills', () => {
    for (let i = 0; i < 50; i++) tracker.registerKill(i * 40);
    expect(tracker.getMultiplier()).toBe(10);
  });

  it('should break combo after window expires', () => {
    tracker.registerKill(0);
    tracker.tick(3000); // past 2500ms window
    expect(tracker.comboCount).toBe(0);
  });

  it('should not break combo if within window', () => {
    tracker.registerKill(0);
    tracker.tick(2000); // still within 2500ms window
    expect(tracker.comboCount).toBe(1);
  });

  it('should reset combo on reset()', () => {
    tracker.registerKill(0);
    tracker.registerKill(500);
    tracker.reset();
    expect(tracker.comboCount).toBe(0);
    expect(tracker.lastKillTime).toBe(-1);
  });

  it('should extend window on each new kill', () => {
    tracker.registerKill(0);
    tracker.registerKill(2000); // close to window expiry but still within
    tracker.tick(4000); // 2000ms after last kill — within new window
    expect(tracker.comboCount).toBe(2);
  });

  it('should expire if tick is past last kill + window', () => {
    tracker.registerKill(0);
    tracker.registerKill(2000);
    tracker.tick(4600); // 2600ms after last kill at 2000 => expired
    expect(tracker.comboCount).toBe(0);
  });
});
