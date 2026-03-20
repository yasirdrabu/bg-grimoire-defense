/**
 * DamageNumberManager — floating damage text over enemies.
 *
 * This is a pure data manager: it tracks active number entries with position,
 * velocity, alpha and scale. The RenderSystem or GameScene reads
 * `damageNumberManager.getActive()` each frame and renders them
 * (e.g. via Phaser BitmapText or Text objects that it manages separately).
 *
 * This keeps the manager free of a hard Phaser dependency so it is easily
 * unit-testable.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DamageType = 'physical' | 'fire' | 'ice' | 'poison' | 'arcane';

/** Colour codes by damage type (CSS-style hex strings for Phaser setText tint). */
export const DAMAGE_TYPE_COLORS: Record<DamageType, number> = {
  physical: 0xffffff,
  fire: 0xff8833,
  ice: 0x66ccff,
  poison: 0x55dd44,
  arcane: 0xcc88ff,
};

/** An active floating damage number entry. Mutable — manager updates it in-place. */
export interface DamageNumberEntry {
  /** Unique sequential id. */
  readonly id: number;
  /** Current world-space X position. */
  x: number;
  /** Current world-space Y position. */
  y: number;
  /** Formatted label text (e.g. "42" or "CRIT 84"). */
  readonly label: string;
  /** Tint colour (0xRRGGBB). */
  readonly color: number;
  /** Current alpha (0-1). Starts at 1, decreases to 0. */
  alpha: number;
  /** Current scale. Critical hits start >1 and bounce-in. */
  scale: number;
  /** Remaining time in ms before this entry is removed. */
  remainingMs: number;
  /** Whether the entry is a critical hit (influences starting scale). */
  readonly isCritical: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FLOAT_SPEED_PX_PER_MS = 0.035; // upward drift speed
const LIFESPAN_MS = 900;
const CRIT_LIFESPAN_MS = 1200;
const CRIT_SCALE_PEAK = 1.8;
const CRIT_OVERSHOOT_PHASE_MS = 120; // time for scale to settle from peak

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

export class DamageNumberManager {
  private entries: DamageNumberEntry[] = [];
  private nextId = 1;

  /**
   * Spawn a new floating damage number at world-space (x, y).
   *
   * @param x - world X origin
   * @param y - world Y origin
   * @param damage - raw damage value (shown as integer)
   * @param damageType - determines tint colour
   * @param isCritical - critical hits are larger and start with an overshoot
   */
  spawn(x: number, y: number, damage: number, damageType: string, isCritical: boolean): void {
    const type = (DAMAGE_TYPE_COLORS[damageType as DamageType] !== undefined)
      ? (damageType as DamageType)
      : 'physical';

    const label = isCritical ? `CRIT ${Math.round(damage)}` : String(Math.round(damage));
    const color = DAMAGE_TYPE_COLORS[type];
    const lifespan = isCritical ? CRIT_LIFESPAN_MS : LIFESPAN_MS;

    // Slight horizontal scatter so stacked hits don't fully overlap
    const scatterX = (Math.random() - 0.5) * 12;

    this.entries.push({
      id: this.nextId++,
      x: x + scatterX,
      y,
      label,
      color,
      alpha: 1,
      scale: isCritical ? CRIT_SCALE_PEAK : 1,
      remainingMs: lifespan,
      isCritical,
    });
  }

  /**
   * Advance all active entries by deltaMs.
   * Call this once per frame from the game loop.
   */
  update(deltaMs: number): void {
    const toRemove: number[] = [];

    for (const entry of this.entries) {
      entry.remainingMs -= deltaMs;

      if (entry.remainingMs <= 0) {
        toRemove.push(entry.id);
        continue;
      }

      // Float upward
      entry.y -= FLOAT_SPEED_PX_PER_MS * deltaMs;

      // Fade out in the last 40% of lifespan
      const lifespan = entry.isCritical ? CRIT_LIFESPAN_MS : LIFESPAN_MS;
      const elapsed = lifespan - entry.remainingMs;
      const fadeStart = lifespan * 0.6;
      if (elapsed > fadeStart) {
        entry.alpha = Math.max(0, 1 - (elapsed - fadeStart) / (lifespan - fadeStart));
      }

      // Crit scale: overshoot → settle to 1.5
      if (entry.isCritical) {
        const overshootProgress = Math.min(1, elapsed / CRIT_OVERSHOOT_PHASE_MS);
        // Ease from CRIT_SCALE_PEAK down to 1.5 during overshoot phase
        entry.scale = CRIT_SCALE_PEAK - (CRIT_SCALE_PEAK - 1.5) * overshootProgress;
      }
    }

    if (toRemove.length > 0) {
      const removeSet = new Set(toRemove);
      this.entries = this.entries.filter((e) => !removeSet.has(e.id));
    }
  }

  /** Returns a readonly snapshot of all currently active entries. */
  getActive(): readonly DamageNumberEntry[] {
    return this.entries;
  }

  /** Clear all entries (e.g. on scene shutdown). */
  clear(): void {
    this.entries = [];
  }
}

/** Shared instance — import this in GameScene and RenderSystem. */
export const damageNumberManager = new DamageNumberManager();
