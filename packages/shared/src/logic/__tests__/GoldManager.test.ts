import { describe, it, expect } from 'vitest';
import {
  getKillGold,
  getWaveClearBonus,
  calculateInterest,
  getSellRefund,
  getStartingGold,
} from '../GoldManager';

describe('GoldManager', () => {
  it('should calculate kill gold from enemy data', () => {
    expect(getKillGold({ goldReward: 8 })).toBe(8);
  });

  it('should calculate wave clear bonus', () => {
    expect(getWaveClearBonus(0)).toBe(25);
    expect(getWaveClearBonus(5)).toBe(50);
  });

  it('should calculate interest capped at 50', () => {
    expect(calculateInterest(200)).toBe(20);
    expect(calculateInterest(600)).toBe(50); // capped
  });

  it('should calculate sell refund at 75%', () => {
    expect(getSellRefund(100, 60)).toBe(120); // 75% of (100 + 60)
  });

  it('should return correct starting gold per act', () => {
    expect(getStartingGold(1)).toBe(650);
    expect(getStartingGold(2)).toBe(800);
    expect(getStartingGold(3)).toBe(1000);
  });
});
