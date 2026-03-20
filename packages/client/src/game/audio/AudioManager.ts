/**
 * AudioManager — singleton wrapping Howler.js for all in-game sound.
 *
 * Current state: all play methods are no-ops that log to console.debug.
 * Drop Howl instances into the private fields below when audio assets arrive.
 * The public API is fully stable and wired throughout the game already.
 */

// Howler is installed; import it now so bundler includes it and it's ready
// to instantiate Howl objects when assets are available.
import { Howler } from 'howler';

// ---------------------------------------------------------------------------
// SFX sprite-sheet keys (used to look up sprites in future Howl instances)
// ---------------------------------------------------------------------------
const SFX_TOWER_FIRE: Record<string, string> = {
  elven_archer_spire: 'sfx_arrow_fire',
  gondorian_ballista: 'sfx_ballista_fire',
  ent_watchtower: 'sfx_nature_blast',
  istari_crystal: 'sfx_magic_bolt',
  dwarven_cannon: 'sfx_cannon_boom',
};

const SFX_ENEMY_DEATH: Record<string, string> = {
  orc_grunt: 'sfx_orc_death',
  goblin_runner: 'sfx_goblin_death',
  uruk_hai_berserker: 'sfx_uruk_death',
  cave_troll: 'sfx_troll_death',
  nazgul: 'sfx_nazgul_death',
  balrog: 'sfx_balrog_death',
  basilisk: 'sfx_serpent_death',
  dementor: 'sfx_dementor_death',
  death_eater: 'sfx_death_eater_death',
  voldemort: 'sfx_voldemort_death',
  white_walker: 'sfx_walker_death',
  wight: 'sfx_wight_death',
  white_walker_general: 'sfx_walker_death',
  night_king: 'sfx_night_king_death',
};

// Pitch multipliers for combo cues (index = combo tier, 3+)
const COMBO_PITCH: number[] = [1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3];

class AudioManager {
  private sfxVolume = 0.7;
  private musicVolume = 0.5;
  private isMuted = false;

  // Placeholder: once audio files exist, populate these Howl instances.
  // private sfxHowl: Howl | null = null;
  // private musicHowl: Howl | null = null;

  constructor() {
    // Sync Howler global mute with our muted state
    Howler.mute(this.isMuted);
  }

  // ---------------------------------------------------------------------------
  // SFX — tower
  // ---------------------------------------------------------------------------

  playTowerFire(towerType: string): void {
    const key = SFX_TOWER_FIRE[towerType] ?? 'sfx_generic_fire';
    console.debug('[AudioManager] playTowerFire', towerType, key);
    // TODO: this.sfxHowl?.play(key);
  }

  playTowerPlace(): void {
    console.debug('[AudioManager] playTowerPlace');
    // TODO: this.sfxHowl?.play('sfx_tower_place');
  }

  playUpgrade(): void {
    console.debug('[AudioManager] playUpgrade');
    // TODO: this.sfxHowl?.play('sfx_upgrade');
  }

  // ---------------------------------------------------------------------------
  // SFX — enemies
  // ---------------------------------------------------------------------------

  playEnemyDeath(enemyType: string): void {
    const key = SFX_ENEMY_DEATH[enemyType] ?? 'sfx_generic_death';
    console.debug('[AudioManager] playEnemyDeath', enemyType, key);
    // TODO: this.sfxHowl?.play(key);
  }

  // ---------------------------------------------------------------------------
  // SFX — combo
  // ---------------------------------------------------------------------------

  playComboHit(comboCount: number): void {
    const tier = Math.min(comboCount - 3, COMBO_PITCH.length - 1);
    const pitch = COMBO_PITCH[Math.max(tier, 0)] ?? 1.0;
    console.debug('[AudioManager] playComboHit', comboCount, 'pitch', pitch);
    // TODO: const id = this.sfxHowl?.play('sfx_combo_hit');
    // TODO: if (id !== undefined) this.sfxHowl?.rate(pitch, id);
  }

  // ---------------------------------------------------------------------------
  // SFX — wave / UI
  // ---------------------------------------------------------------------------

  playWaveStart(): void {
    console.debug('[AudioManager] playWaveStart');
    // TODO: this.sfxHowl?.play('sfx_wave_start');
  }

  playWaveClear(): void {
    console.debug('[AudioManager] playWaveClear');
    // TODO: this.sfxHowl?.play('sfx_wave_clear');
  }

  playButtonClick(): void {
    console.debug('[AudioManager] playButtonClick');
    // TODO: this.sfxHowl?.play('sfx_button_click');
  }

  /** Called for each star shown during score breakdown (index 0-3). */
  playStarChime(starIndex: number): void {
    console.debug('[AudioManager] playStarChime', starIndex);
    // TODO: const id = this.sfxHowl?.play('sfx_star_chime');
    // TODO: if (id !== undefined) this.sfxHowl?.rate(1 + starIndex * 0.07, id);
  }

  // ---------------------------------------------------------------------------
  // Music
  // ---------------------------------------------------------------------------

  playBiomeMusic(biome: string): void {
    console.debug('[AudioManager] playBiomeMusic', biome);
    // TODO: this.musicHowl?.stop();
    // TODO: this.musicHowl = new Howl({ src: [`/audio/music/${biome}.ogg`], loop: true, volume: this.musicVolume });
    // TODO: this.musicHowl.play();
  }

  playBossMusic(): void {
    console.debug('[AudioManager] playBossMusic');
    // TODO: crossfade to boss track
  }

  stopMusic(): void {
    console.debug('[AudioManager] stopMusic');
    // TODO: this.musicHowl?.fade(this.musicVolume, 0, 1000);
  }

  // ---------------------------------------------------------------------------
  // Volume controls
  // ---------------------------------------------------------------------------

  setSFXVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    console.debug('[AudioManager] setSFXVolume', this.sfxVolume);
    // TODO: this.sfxHowl?.volume(this.sfxVolume);
  }

  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    console.debug('[AudioManager] setMusicVolume', this.musicVolume);
    // TODO: this.musicHowl?.volume(this.musicVolume);
  }

  /** Mirrors the master volume slider (0-1). Scales both sfx and music. */
  setMasterVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    Howler.volume(clamped);
    console.debug('[AudioManager] setMasterVolume', clamped);
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    console.debug('[AudioManager] toggleMute', this.isMuted);
  }

  get muted(): boolean {
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
