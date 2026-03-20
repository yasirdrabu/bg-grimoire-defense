/**
 * ParticlePresets — plain-object particle configs.
 *
 * Deliberately free of Phaser dependency so they can be imported in tests
 * and used as typed constants. The RenderSystem or GameScene passes these
 * configs when creating Phaser ParticleEmitter instances.
 *
 * All numeric values are in screen pixels unless otherwise noted.
 */

export interface ParticleConfig {
  /** Tint colour applied to each particle (0xRRGGBB). */
  tint: number;
  /** Starting alpha (0-1). Fades to 0 over lifespan. */
  alpha: { start: number; end: number };
  /** Particle speed range in px/s. */
  speed: { min: number; max: number };
  /** Scale range over the particle's lifetime. */
  scale: { start: number; end: number };
  /** Lifespan in milliseconds. */
  lifespan: number;
  /** Particle quantity per emission burst. */
  quantity: number;
  /** Emitter angle range (degrees, 0 = right, counterclockwise). */
  angle: { min: number; max: number };
  /** Gravity in px/s² (positive = down). */
  gravityY: number;
  /** Texture key to use (from Phaser's texture cache). Falls back to a coloured square. */
  textureKey: string;
}

// ---------------------------------------------------------------------------
// Status / element effects
// ---------------------------------------------------------------------------

export const PARTICLE_PRESETS = {
  /** Ice / frost slowing effect — blue-white snowflakes drifting down. */
  frost: {
    tint: 0x88ddff,
    alpha: { start: 0.8, end: 0 },
    speed: { min: 20, max: 50 },
    scale: { start: 0.4, end: 0.1 },
    lifespan: 800,
    quantity: 6,
    angle: { min: 80, max: 100 },
    gravityY: 40,
    textureKey: 'particle_snowflake',
  } satisfies ParticleConfig,

  /** Fire burning effect — orange-red sparks rising up. */
  flame: {
    tint: 0xff6600,
    alpha: { start: 1, end: 0 },
    speed: { min: 40, max: 90 },
    scale: { start: 0.5, end: 0 },
    lifespan: 600,
    quantity: 8,
    angle: { min: 250, max: 290 },
    gravityY: -60,
    textureKey: 'particle_flame',
  } satisfies ParticleConfig,

  /** Poison cloud — green bubbles floating upward. */
  poison: {
    tint: 0x55cc44,
    alpha: { start: 0.7, end: 0 },
    speed: { min: 15, max: 35 },
    scale: { start: 0.3, end: 0.05 },
    lifespan: 1200,
    quantity: 5,
    angle: { min: 260, max: 280 },
    gravityY: -20,
    textureKey: 'particle_bubble',
  } satisfies ParticleConfig,

  // ---------------------------------------------------------------------------
  // Impact effects
  // ---------------------------------------------------------------------------

  /** Physical hit — white/grey sparks. */
  impact_physical: {
    tint: 0xdddddd,
    alpha: { start: 1, end: 0 },
    speed: { min: 60, max: 140 },
    scale: { start: 0.3, end: 0 },
    lifespan: 250,
    quantity: 6,
    angle: { min: 0, max: 360 },
    gravityY: 80,
    textureKey: 'particle_spark',
  } satisfies ParticleConfig,

  /** Fire projectile impact — explosion of orange embers. */
  impact_fire: {
    tint: 0xff8800,
    alpha: { start: 1, end: 0 },
    speed: { min: 80, max: 200 },
    scale: { start: 0.6, end: 0 },
    lifespan: 400,
    quantity: 12,
    angle: { min: 0, max: 360 },
    gravityY: 60,
    textureKey: 'particle_flame',
  } satisfies ParticleConfig,

  // ---------------------------------------------------------------------------
  // Tower / muzzle effects
  // ---------------------------------------------------------------------------

  /** Brief white flash at tower barrel when it fires. */
  muzzle_flash: {
    tint: 0xffffff,
    alpha: { start: 1, end: 0 },
    speed: { min: 5, max: 20 },
    scale: { start: 0.8, end: 0 },
    lifespan: 120,
    quantity: 4,
    angle: { min: 0, max: 360 },
    gravityY: 0,
    textureKey: 'particle_flash',
  } satisfies ParticleConfig,

  // ---------------------------------------------------------------------------
  // Upgrade / fusion effects
  // ---------------------------------------------------------------------------

  /** Tier-A upgrade burst (Tolkien / blue arcane). */
  upgrade_burst_a: {
    tint: 0x4488ff,
    alpha: { start: 1, end: 0 },
    speed: { min: 50, max: 150 },
    scale: { start: 0.5, end: 0 },
    lifespan: 700,
    quantity: 20,
    angle: { min: 0, max: 360 },
    gravityY: -30,
    textureKey: 'particle_star',
  } satisfies ParticleConfig,

  /** Tier-B upgrade burst (Wizarding World / red). */
  upgrade_burst_b: {
    tint: 0xff3344,
    alpha: { start: 1, end: 0 },
    speed: { min: 50, max: 150 },
    scale: { start: 0.5, end: 0 },
    lifespan: 700,
    quantity: 20,
    angle: { min: 0, max: 360 },
    gravityY: -30,
    textureKey: 'particle_star',
  } satisfies ParticleConfig,

  // ---------------------------------------------------------------------------
  // UI / reward effects
  // ---------------------------------------------------------------------------

  /** Gold coins that float toward the HUD gold counter on enemy kill. */
  gold_coin: {
    tint: 0xffd700,
    alpha: { start: 1, end: 0 },
    speed: { min: 30, max: 80 },
    scale: { start: 0.4, end: 0.2 },
    lifespan: 900,
    quantity: 3,
    angle: { min: 240, max: 300 },
    gravityY: -50,
    textureKey: 'particle_coin',
  } satisfies ParticleConfig,

  /** Star sparkle shown during score breakdown star reveal. */
  star_chime: {
    tint: 0xffee44,
    alpha: { start: 1, end: 0 },
    speed: { min: 60, max: 160 },
    scale: { start: 0.6, end: 0 },
    lifespan: 800,
    quantity: 16,
    angle: { min: 0, max: 360 },
    gravityY: -20,
    textureKey: 'particle_star',
  } satisfies ParticleConfig,
} as const;

export type ParticlePresetKey = keyof typeof PARTICLE_PRESETS;
