import { COMBO_WINDOW_MS } from '../constants';
import { COMBO_MULTIPLIERS } from '../types/score';

/**
 * Tracks kill combos and returns the appropriate score multiplier.
 * A combo is a sequence of kills where each kill occurs within COMBO_WINDOW_MS
 * of the previous one.
 */
export class ComboTracker {
  private _comboCount: number = 0;
  private _lastKillTime: number = -1;

  get comboCount(): number {
    return this._comboCount;
  }

  get lastKillTime(): number {
    return this._lastKillTime;
  }

  /**
   * Register a kill at the given timestamp. Resets the combo window.
   */
  registerKill(timestampMs: number): void {
    this._comboCount++;
    this._lastKillTime = timestampMs;
  }

  /**
   * Advance the tracker to the current time.
   * If the combo window has expired since the last kill, resets the combo.
   */
  tick(currentTimeMs: number): void {
    if (this._lastKillTime < 0) return;
    if (currentTimeMs - this._lastKillTime > COMBO_WINDOW_MS) {
      this.reset();
    }
  }

  /**
   * Returns the current score multiplier based on comboCount and COMBO_MULTIPLIERS tiers.
   */
  getMultiplier(): number {
    for (const tier of COMBO_MULTIPLIERS) {
      if (this._comboCount >= tier.threshold) {
        return tier.multiplier;
      }
    }
    return 1;
  }

  /**
   * Resets the combo counter and last kill time.
   */
  reset(): void {
    this._comboCount = 0;
    this._lastKillTime = -1;
  }
}
