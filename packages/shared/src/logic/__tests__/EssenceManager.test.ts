import { describe, it, expect } from 'vitest';
import {
  getBossEssence,
  getPerfectWaveEssence,
  getComboEssence,
  getFirstFusionEssence,
} from '../EssenceManager';

describe('EssenceManager', () => {
  describe('getBossEssence', () => {
    it('should return 0 for a non-boss enemy', () => {
      expect(getBossEssence({ isBoss: false })).toBe(0);
    });

    it('should return 0 for a boss with no bossEssenceReward defined', () => {
      expect(getBossEssence({ isBoss: true })).toBe(0);
    });

    it('should return 50 for a mini-boss', () => {
      expect(getBossEssence({ isBoss: true, bossEssenceReward: 50 })).toBe(50);
    });

    it('should return 100 for an act boss', () => {
      expect(getBossEssence({ isBoss: true, bossEssenceReward: 100 })).toBe(100);
    });

    it('should return 0 when bossEssenceReward is defined but isBoss is false', () => {
      expect(getBossEssence({ isBoss: false, bossEssenceReward: 50 })).toBe(0);
    });
  });

  describe('getPerfectWaveEssence', () => {
    it('should return 10 for a perfect wave', () => {
      expect(getPerfectWaveEssence()).toBe(10);
    });
  });

  describe('getComboEssence', () => {
    it('should return 0 when combo is below threshold (< 25)', () => {
      expect(getComboEssence(0)).toBe(0);
      expect(getComboEssence(24)).toBe(0);
    });

    it('should return 5 when combo is exactly at threshold (25)', () => {
      expect(getComboEssence(25)).toBe(5);
    });

    it('should return 5 when combo is above threshold (> 25)', () => {
      expect(getComboEssence(50)).toBe(5);
      expect(getComboEssence(100)).toBe(5);
    });
  });

  describe('getFirstFusionEssence', () => {
    it('should return 25 for first fusion discovery', () => {
      expect(getFirstFusionEssence()).toBe(25);
    });
  });
});
