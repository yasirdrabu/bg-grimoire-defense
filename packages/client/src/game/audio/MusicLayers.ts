/**
 * MusicLayers — manages layered / adaptive music.
 *
 * Handles crossfades between biome tracks and dynamically adds a boss layer
 * on top of the base track when a boss encounter begins.
 *
 * Current state: stub — all methods are no-ops that log to console.debug.
 * Wire real Howl instances (one per layer) when audio assets are available.
 */

interface MusicLayer {
  /** Identifier for the track currently loaded into this layer. */
  trackId: string;
  /** Whether this layer is currently audible. */
  active: boolean;
}

class MusicLayers {
  private baseLayer: MusicLayer = { trackId: '', active: false };
  private bossLayer: MusicLayer = { trackId: '', active: false };

  // TODO: private baseHowl: Howl | null = null;
  // TODO: private bossHowl: Howl | null = null;

  /**
   * Start or switch to the given biome's base music track.
   * If a track is already playing, it stops immediately (use crossfadeTo for smooth transitions).
   */
  setBaseTrack(biome: string): void {
    this.baseLayer = { trackId: `music_${biome}`, active: true };
    console.debug('[MusicLayers] setBaseTrack', biome);
    // TODO:
    // this.baseHowl?.stop();
    // this.baseHowl = new Howl({ src: [`/audio/music/${biome}_base.ogg`], loop: true });
    // this.baseHowl.play();
  }

  /**
   * Overlay a boss-themed music layer on top of the current base track.
   * Both tracks play simultaneously (base becomes quieter via volume duck).
   */
  addBossLayer(): void {
    this.bossLayer.active = true;
    console.debug('[MusicLayers] addBossLayer');
    // TODO:
    // this.bossHowl = new Howl({ src: ['/audio/music/boss_layer.ogg'], loop: true, volume: 0 });
    // this.bossHowl.play();
    // this.bossHowl.fade(0, 1, 2000);
    // this.baseHowl?.fade(this.baseHowl.volume(), 0.3, 2000); // duck base
  }

  /**
   * Remove the boss layer and restore the base track to full volume.
   */
  removeBossLayer(): void {
    this.bossLayer.active = false;
    console.debug('[MusicLayers] removeBossLayer');
    // TODO:
    // this.bossHowl?.fade(1, 0, 1500);
    // setTimeout(() => this.bossHowl?.stop(), 1500);
    // this.baseHowl?.fade(this.baseHowl.volume(), 1, 1500); // restore base
  }

  /**
   * Smooth crossfade from the current base track to a new biome track.
   * @param biome - target biome identifier
   * @param durationMs - total crossfade duration in milliseconds
   */
  crossfadeTo(biome: string, durationMs: number): void {
    console.debug('[MusicLayers] crossfadeTo', biome, durationMs);
    // TODO:
    // const outgoing = this.baseHowl;
    // this.baseHowl = new Howl({ src: [`/audio/music/${biome}_base.ogg`], loop: true, volume: 0 });
    // this.baseHowl.play();
    // this.baseHowl.fade(0, 1, durationMs);
    // outgoing?.fade(outgoing.volume(), 0, durationMs);
    // setTimeout(() => outgoing?.stop(), durationMs);
    this.baseLayer = { trackId: `music_${biome}`, active: true };
  }

  /** Returns identifiers for currently active layers (for debugging/tests). */
  getActiveLayerIds(): string[] {
    const ids: string[] = [];
    if (this.baseLayer.active) ids.push(this.baseLayer.trackId);
    if (this.bossLayer.active) ids.push('boss_layer');
    return ids;
  }
}

export const musicLayers = new MusicLayers();
