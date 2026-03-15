import { describe, it, expect } from 'vitest';
import { calculateSpeedBonus, calculateEarlySendBonus } from '../SpeedBonus';

describe('SpeedBonus', () => {
  describe('calculateSpeedBonus', () => {
    it('should return 0 when clear time equals par time', () => {
      expect(calculateSpeedBonus(60000, 60000)).toBe(0);
    });

    it('should return 0 when clear time exceeds par time', () => {
      expect(calculateSpeedBonus(70000, 60000)).toBe(0);
    });

    it('should return 250 for clearing in half the par time', () => {
      // (60000 - 30000) / 60000 * 500 = 250
      expect(calculateSpeedBonus(30000, 60000)).toBe(250);
    });

    it('should return max 500 for clearing in zero time', () => {
      expect(calculateSpeedBonus(0, 60000)).toBe(500);
    });

    it('should floor the result', () => {
      // (60000 - 40001) / 60000 * 500 = 166.658... => floor = 166
      expect(calculateSpeedBonus(40001, 60000)).toBe(166);
    });

    it('should return 500 for a very fast clear', () => {
      // 1ms clear on 60s par => floor((60000-1)/60000*500) = floor(499.99...) = 499
      expect(calculateSpeedBonus(1, 60000)).toBe(499);
    });

    it('should handle exact maximum bonus (clear at 0)', () => {
      expect(calculateSpeedBonus(0, 120000)).toBe(500);
    });
  });

  describe('calculateEarlySendBonus', () => {
    it('should return 0 for 0 remaining ms', () => {
      expect(calculateEarlySendBonus(0)).toBe(0);
    });

    it('should return 10 per whole second remaining', () => {
      expect(calculateEarlySendBonus(5000)).toBe(50);
    });

    it('should floor partial seconds', () => {
      expect(calculateEarlySendBonus(5999)).toBe(50); // floor(5999/1000) = 5 => 50
    });

    it('should return 0 for less than 1 second remaining', () => {
      expect(calculateEarlySendBonus(999)).toBe(0);
    });

    it('should return 80 for 8 seconds remaining', () => {
      expect(calculateEarlySendBonus(8000)).toBe(80);
    });
  });
});
