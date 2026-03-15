import { describe, it, expect } from 'vitest';
import { aggregateScore, validateScorePlausibility } from '../ScoreAggregator';
import type { ScoreBreakdown } from '../../types/score';

describe('ScoreAggregator', () => {
  describe('aggregateScore', () => {
    it('should sum all components into totalScore', () => {
      const breakdown = aggregateScore({
        baseScore: 1000,
        comboScore: 500,
        speedScore: 200,
        styleScore: 150,
        perfectWaveBonus: 100,
        nexusHealthBonus: 50,
      });

      expect(breakdown.totalScore).toBe(2000);
    });

    it('should preserve all component values', () => {
      const input = {
        baseScore: 100,
        comboScore: 50,
        speedScore: 25,
        styleScore: 75,
        perfectWaveBonus: 30,
        nexusHealthBonus: 20,
      };
      const result = aggregateScore(input);
      expect(result.baseScore).toBe(100);
      expect(result.comboScore).toBe(50);
      expect(result.speedScore).toBe(25);
      expect(result.styleScore).toBe(75);
      expect(result.perfectWaveBonus).toBe(30);
      expect(result.nexusHealthBonus).toBe(20);
    });

    it('should handle all-zero breakdown', () => {
      const result = aggregateScore({
        baseScore: 0,
        comboScore: 0,
        speedScore: 0,
        styleScore: 0,
        perfectWaveBonus: 0,
        nexusHealthBonus: 0,
      });
      expect(result.totalScore).toBe(0);
    });

    it('should return the correct type matching ScoreBreakdown', () => {
      const result = aggregateScore({
        baseScore: 500,
        comboScore: 200,
        speedScore: 100,
        styleScore: 50,
        perfectWaveBonus: 0,
        nexusHealthBonus: 0,
      });
      // totalScore should be a number
      expect(typeof result.totalScore).toBe('number');
    });
  });

  describe('validateScorePlausibility', () => {
    it('should return true for a plausible score', () => {
      const score: ScoreBreakdown = {
        baseScore: 1000,
        comboScore: 500,
        speedScore: 200,
        styleScore: 100,
        perfectWaveBonus: 100,
        nexusHealthBonus: 50,
        totalScore: 1950,
      };
      expect(validateScorePlausibility(score, 10)).toBe(true);
    });

    it('should return false for negative totalScore', () => {
      const score: ScoreBreakdown = {
        baseScore: -100,
        comboScore: 0,
        speedScore: 0,
        styleScore: 0,
        perfectWaveBonus: 0,
        nexusHealthBonus: 0,
        totalScore: -100,
      };
      expect(validateScorePlausibility(score, 5)).toBe(false);
    });

    it('should return false when totalScore does not match sum of components', () => {
      const score: ScoreBreakdown = {
        baseScore: 1000,
        comboScore: 500,
        speedScore: 200,
        styleScore: 100,
        perfectWaveBonus: 100,
        nexusHealthBonus: 50,
        totalScore: 999999, // tampered
      };
      expect(validateScorePlausibility(score, 10)).toBe(false);
    });

    it('should return false for impossibly high score per wave', () => {
      // 1 million points on wave 1 is not plausible
      const score: ScoreBreakdown = {
        baseScore: 1000000,
        comboScore: 0,
        speedScore: 0,
        styleScore: 0,
        perfectWaveBonus: 0,
        nexusHealthBonus: 0,
        totalScore: 1000000,
      };
      expect(validateScorePlausibility(score, 1)).toBe(false);
    });

    it('should return true for reasonable score scaled to wave count', () => {
      // 10 waves, 5000 total — totally reasonable
      const score: ScoreBreakdown = {
        baseScore: 4000,
        comboScore: 500,
        speedScore: 200,
        styleScore: 200,
        perfectWaveBonus: 100,
        nexusHealthBonus: 0,
        totalScore: 5000,
      };
      expect(validateScorePlausibility(score, 10)).toBe(true);
    });
  });
});
