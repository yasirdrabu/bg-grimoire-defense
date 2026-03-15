import type { LevelDefinition, WaveDefinition, WaveEnemyGroup } from '@grimoire/shared';
import { MIN_COUNTDOWN_SECONDS, WAVE_CLEAR_PAUSE_MS } from '@grimoire/shared';

// ─── Public types ─────────────────────────────────────────────────────────────

export type WaveState = 'pre_wave' | 'spawning' | 'active' | 'wave_clear' | 'level_complete';

export type WaveSystemEvent =
  | { type: 'SPAWN_ENEMY'; enemyType: string }
  | { type: 'WAVE_STARTED'; waveIndex: number }
  | { type: 'WAVE_CLEARED'; waveIndex: number }
  | { type: 'APPLY_INTEREST' }
  | { type: 'LEVEL_COMPLETE' };

// ─── Internal helpers ─────────────────────────────────────────────────────────

interface SpawnGroupState {
  /** Index into WaveDefinition.enemies array */
  groupIndex: number;
  /** How many of this group have already been spawned */
  spawned: number;
  /** Accumulated ms since last spawn in this group */
  timer: number;
  /** Has the first enemy of this group been emitted? */
  startedFirstSpawn: boolean;
}

// ─── WaveSystem class ─────────────────────────────────────────────────────────

/**
 * Stateful wave manager. Returns events on each tick that the caller (GameScene)
 * processes. WaveSystem never creates ECS entities — it emits SPAWN_ENEMY events
 * and lets GameScene handle the actual entity/sprite creation.
 */
export class WaveSystem {
  private readonly levelDef: LevelDefinition;

  private state: WaveState = 'pre_wave';
  private waveIndex = 0;

  // PRE_WAVE phase
  private countdownMs = 0;
  private interestApplied = false;

  // SPAWNING phase
  private spawnGroupStates: SpawnGroupState[] = [];

  // WAVE_CLEAR phase
  private clearTimer = 0;

  constructor(levelDef: LevelDefinition) {
    this.levelDef = levelDef;
    this.initPreWave();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Advance the wave system by `deltaMs` milliseconds.
   * Returns the list of events that occurred during this tick.
   * `aliveEnemyCount` is provided by the caller (count of living enemies in ECS).
   */
  tick(deltaMs: number, aliveEnemyCount: number): WaveSystemEvent[] {
    const events: WaveSystemEvent[] = [];

    switch (this.state) {
      case 'pre_wave':
        this.tickPreWave(deltaMs, events);
        break;
      case 'spawning':
        this.tickSpawning(deltaMs, aliveEnemyCount, events);
        break;
      case 'active':
        this.tickActive(aliveEnemyCount, events);
        break;
      case 'wave_clear':
        this.tickWaveClear(deltaMs, events);
        break;
      case 'level_complete':
        // Terminal state — nothing to do
        break;
    }

    return events;
  }

  /** Skip the PRE_WAVE countdown and begin spawning immediately. */
  sendWaveEarly(): void {
    if (this.state === 'pre_wave') {
      this.countdownMs = MIN_COUNTDOWN_SECONDS * 1000; // mark countdown as done
    }
  }

  getCurrentWaveIndex(): number {
    return this.waveIndex;
  }

  getState(): WaveState {
    return this.state;
  }

  reset(): void {
    this.state = 'pre_wave';
    this.waveIndex = 0;
    this.initPreWave();
  }

  // ─── Private state handlers ──────────────────────────────────────────────────

  private initPreWave(): void {
    this.countdownMs = 0;
    this.interestApplied = false;
    this.spawnGroupStates = [];
    this.clearTimer = 0;
  }

  private tickPreWave(deltaMs: number, events: WaveSystemEvent[]): void {
    // Emit APPLY_INTEREST once at the start of each PRE_WAVE phase
    if (!this.interestApplied) {
      this.interestApplied = true;
      events.push({ type: 'APPLY_INTEREST' });
    }

    this.countdownMs += deltaMs;

    if (this.countdownMs >= MIN_COUNTDOWN_SECONDS * 1000) {
      this.enterSpawning(events);
    }
  }

  private enterSpawning(events: WaveSystemEvent[]): void {
    this.state = 'spawning';
    events.push({ type: 'WAVE_STARTED', waveIndex: this.waveIndex });

    const waveDef = this.currentWaveDef();
    this.spawnGroupStates = waveDef.enemies.map((_group: WaveEnemyGroup, i: number) => ({
      groupIndex: i,
      spawned: 0,
      timer: 0,
      // The first enemy of each group is spawned immediately on wave start
      // We set startedFirstSpawn=false so that the spawning tick handles it
      startedFirstSpawn: false,
    }));
  }

  private tickSpawning(
    deltaMs: number,
    aliveEnemyCount: number,
    events: WaveSystemEvent[],
  ): void {
    const waveDef = this.currentWaveDef();

    for (const groupState of this.spawnGroupStates) {
      const groupDef = waveDef.enemies[groupState.groupIndex]!;
      if (groupState.spawned >= groupDef.count) continue;

      if (!groupState.startedFirstSpawn) {
        // First enemy of each group: spawn immediately when the group is reached
        groupState.startedFirstSpawn = true;
        groupState.spawned++;
        events.push({ type: 'SPAWN_ENEMY', enemyType: groupDef.type });
        groupState.timer = 0;
        continue;
      }

      groupState.timer += deltaMs;

      while (groupState.timer >= groupDef.interval && groupState.spawned < groupDef.count) {
        groupState.timer -= groupDef.interval;
        groupState.spawned++;
        events.push({ type: 'SPAWN_ENEMY', enemyType: groupDef.type });
      }
    }

    // Check if all groups are fully spawned
    const stillRemaining = this.spawnGroupStates.reduce((sum, gs) => {
      const groupDef = waveDef.enemies[gs.groupIndex]!;
      return sum + (groupDef.count - gs.spawned);
    }, 0);

    if (stillRemaining <= 0) {
      // Check if we can transition immediately
      if (aliveEnemyCount <= 0) {
        this.enterWaveClear(events);
      } else {
        this.state = 'active';
      }
    }
  }

  private tickActive(aliveEnemyCount: number, events: WaveSystemEvent[]): void {
    if (aliveEnemyCount <= 0) {
      this.enterWaveClear(events);
    }
  }

  private enterWaveClear(events: WaveSystemEvent[]): void {
    this.state = 'wave_clear';
    this.clearTimer = 0;
    events.push({ type: 'WAVE_CLEARED', waveIndex: this.waveIndex });
  }

  private tickWaveClear(deltaMs: number, events: WaveSystemEvent[]): void {
    this.clearTimer += deltaMs;

    if (this.clearTimer >= WAVE_CLEAR_PAUSE_MS) {
      const isLastWave = this.waveIndex >= this.levelDef.waves.length - 1;
      if (isLastWave) {
        this.state = 'level_complete';
        events.push({ type: 'LEVEL_COMPLETE' });
      } else {
        this.waveIndex++;
        this.state = 'pre_wave';
        this.initPreWave();
      }
    }
  }

  private currentWaveDef(): WaveDefinition {
    return this.levelDef.waves[this.waveIndex]!;
  }
}
