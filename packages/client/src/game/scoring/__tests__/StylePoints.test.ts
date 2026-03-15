import { describe, it, expect } from 'vitest';
import { getStylePoints, createStyleAction } from '../StylePoints';
import type { StyleAction } from '@grimoire/shared';

describe('StylePoints', () => {
  describe('getStylePoints', () => {
    it('should return 50 points for fusion_kill', () => {
      expect(getStylePoints('fusion_kill')).toBe(50);
    });

    it('should return 25 points for snipe', () => {
      expect(getStylePoints('snipe')).toBe(25);
    });

    it('should return 10 points for overkill', () => {
      expect(getStylePoints('overkill')).toBe(10);
    });

    it('should return 30 points for first_blood', () => {
      expect(getStylePoints('first_blood')).toBe(30);
    });

    it('should return 100 points for clean_wave', () => {
      expect(getStylePoints('clean_wave')).toBe(100);
    });

    it('should return 200 points for maze_master', () => {
      expect(getStylePoints('maze_master')).toBe(200);
    });
  });

  describe('createStyleAction', () => {
    it('should create a StyleAction with correct type and points for fusion_kill', () => {
      const action: StyleAction = createStyleAction('fusion_kill');
      expect(action.type).toBe('fusion_kill');
      expect(action.points).toBe(50);
    });

    it('should create a StyleAction with correct type and points for clean_wave', () => {
      const action: StyleAction = createStyleAction('clean_wave');
      expect(action.type).toBe('clean_wave');
      expect(action.points).toBe(100);
    });

    it('should create a StyleAction with correct type and points for maze_master', () => {
      const action: StyleAction = createStyleAction('maze_master');
      expect(action.type).toBe('maze_master');
      expect(action.points).toBe(200);
    });

    it('should be readonly — type and points should not be mutated', () => {
      const action = createStyleAction('snipe');
      expect(Object.isFrozen(action)).toBe(true);
    });
  });
});
