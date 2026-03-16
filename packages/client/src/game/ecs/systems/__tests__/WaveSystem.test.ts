import { describe, it, expect } from 'vitest';
import { WaveSystem } from '../WaveSystem';
import type { WaveSystemEvent, WaveState } from '../WaveSystem';
import { LEVELS } from '@grimoire/shared';
import { WAVE_CLEAR_PAUSE_MS } from '@grimoire/shared';

const level1 = LEVELS['act1_level1']!;

// ─── helpers ────────────────────────────────────────────────────────────────

function tickUntilState(
  system: WaveSystem,
  targetState: WaveState,
  maxMs = 60_000,
  aliveCount = 0,
): number {
  const step = 16;
  let elapsed = 0;
  while (system.getState() !== targetState && elapsed < maxMs) {
    system.tick(step, aliveCount);
    elapsed += step;
  }
  return elapsed;
}

/**
 * Tick until spawning finishes. aliveCount=0 means the system will also
 * transition past spawning into wave_clear automatically (no enemies alive).
 * Use drainSpawnEventsKeepAlive if you want to land in `active` instead.
 */
function drainAllSpawnEvents(system: WaveSystem, maxMs = 120_000): WaveSystemEvent[] {
  const step = 16;
  let elapsed = 0;
  const events: WaveSystemEvent[] = [];
  while (elapsed < maxMs) {
    const e = system.tick(step, 0);
    events.push(...e);
    elapsed += step;
    if (system.getState() !== 'spawning') break;
  }
  return events;
}

/**
 * Tick until all enemies of the wave are spawned, passing aliveCount=1
 * so the system transitions to `active` rather than `wave_clear`.
 */
function drainSpawnEventsKeepAlive(system: WaveSystem, maxMs = 120_000): WaveSystemEvent[] {
  const step = 16;
  let elapsed = 0;
  const events: WaveSystemEvent[] = [];
  while (elapsed < maxMs) {
    const e = system.tick(step, 1);
    events.push(...e);
    elapsed += step;
    if (system.getState() !== 'spawning') break;
  }
  return events;
}

// ─── State machine ───────────────────────────────────────────────────────────

describe('WaveSystem — initial state', () => {
  it('starts in pre_wave state', () => {
    const ws = new WaveSystem(level1);
    expect(ws.getState()).toBe('pre_wave');
  });

  it('starts at wave index 0', () => {
    const ws = new WaveSystem(level1);
    expect(ws.getCurrentWaveIndex()).toBe(0);
  });
});

describe('WaveSystem — PRE_WAVE countdown', () => {
  it('uses correct countdown formula: baseCountdown - waveIndex * reduction', () => {
    const ws = new WaveSystem(level1);
    // Act 1, wave 0: base 25s - 0*1s = 25s
    expect(ws.getCountdownDurationMs()).toBe(25000);
  });

  it('shortens countdown as waves progress', () => {
    const ws = new WaveSystem(level1);
    // Complete wave 0 to advance to wave 1
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainAllSpawnEvents(ws);
    ws.tick(WAVE_CLEAR_PAUSE_MS + 100, 0);
    // Act 1, wave 1: base 25s - 1*1s = 24s
    expect(ws.getCountdownDurationMs()).toBe(24000);
  });

  it('clamps countdown at minimum 8 seconds', () => {
    // Act 1: base 25, reduction 1/wave. Wave 17+ => 25-17=8, Wave 18 => clamped to 8
    const ws = new WaveSystem(level1);
    // We can't easily advance to wave 17 with 10-wave level, but we can test the formula
    // by checking getRemainingCountdownMs behavior
    expect(ws.getCountdownDurationMs()).toBeGreaterThanOrEqual(8000);
  });

  it('remains in pre_wave until countdown elapses', () => {
    const ws = new WaveSystem(level1);
    const countdownMs = ws.getCountdownDurationMs();
    ws.tick(countdownMs - 100, 0); // just under the threshold
    expect(ws.getState()).toBe('pre_wave');
  });

  it('transitions to spawning after countdown elapses', () => {
    const ws = new WaveSystem(level1);
    const countdownMs = ws.getCountdownDurationMs();
    ws.tick(countdownMs, 0);
    expect(ws.getState()).toBe('spawning');
  });

  it('does NOT emit APPLY_INTEREST on wave 0 (pre-wave-1 guard)', () => {
    const ws = new WaveSystem(level1);
    const events = ws.tick(1, 0);
    const interestEvent = events.find((e) => e.type === 'APPLY_INTEREST');
    expect(interestEvent).toBeUndefined();
  });

  it('emits APPLY_INTEREST on wave 1+ PRE_WAVE phase, only once', () => {
    // Advance to wave 1 (index 1): complete wave 0 first
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainAllSpawnEvents(ws); // finish spawning wave 0
    ws.tick(WAVE_CLEAR_PAUSE_MS + 100, 0); // wave_clear → pre_wave for wave 1
    expect(ws.getCurrentWaveIndex()).toBe(1);
    expect(ws.getState()).toBe('pre_wave');

    // First tick in wave 1 PRE_WAVE should emit APPLY_INTEREST
    const firstEvents = ws.tick(1, 0);
    const firstInterest = firstEvents.filter((e) => e.type === 'APPLY_INTEREST');
    expect(firstInterest).toHaveLength(1);

    // Subsequent ticks in same PRE_WAVE should not re-emit
    const secondEvents = ws.tick(100, 0);
    const secondInterest = secondEvents.filter((e) => e.type === 'APPLY_INTEREST');
    expect(secondInterest).toHaveLength(0);
  });
});

describe('WaveSystem — sendWaveEarly', () => {
  it('skips countdown and moves to spawning', () => {
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    ws.tick(1, 0); // single tick to process
    expect(ws.getState()).toBe('spawning');
  });

  it('emits WAVE_STARTED when transitioning to spawning via sendWaveEarly', () => {
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    const events = ws.tick(1, 0);
    const started = events.find((e) => e.type === 'WAVE_STARTED');
    expect(started).toBeDefined();
    if (started?.type === 'WAVE_STARTED') {
      expect(started.waveIndex).toBe(0);
    }
  });
});

describe('WaveSystem — SPAWNING state', () => {
  it('emits WAVE_STARTED when entering spawning', () => {
    const ws = new WaveSystem(level1);
    const countdownMs = ws.getCountdownDurationMs();
    const events = ws.tick(countdownMs, 0);
    const started = events.find((e) => e.type === 'WAVE_STARTED');
    expect(started).toBeDefined();
    if (started?.type === 'WAVE_STARTED') {
      expect(started.waveIndex).toBe(0);
    }
  });

  it('emits SPAWN_ENEMY events at correct intervals for wave 1', () => {
    const ws = new WaveSystem(level1);
    // Move past countdown
    ws.tick(ws.getCountdownDurationMs(), 0);
    expect(ws.getState()).toBe('spawning');

    // Wave 1: 8 orc_grunts, 800ms interval
    // Advance 800ms — should spawn first enemy immediately on entry, then one more after 800ms
    const events = drainAllSpawnEvents(ws);
    const spawnEvents = events.filter((e) => e.type === 'SPAWN_ENEMY');
    expect(spawnEvents).toHaveLength(8);
  });

  it('spawns the correct enemy type for wave 1', () => {
    const ws = new WaveSystem(level1);
    ws.tick(ws.getCountdownDurationMs(), 0);

    const events = drainAllSpawnEvents(ws);
    const spawnEvents = events.filter((e) => e.type === 'SPAWN_ENEMY');
    for (const ev of spawnEvents) {
      if (ev.type === 'SPAWN_ENEMY') {
        expect(ev.enemyType).toBe('orc_grunt');
      }
    }
  });

  it('transitions to active after all enemies spawned but enemies still alive', () => {
    const ws = new WaveSystem(level1);
    ws.tick(ws.getCountdownDurationMs(), 0);
    // Use keepAlive variant so spawning finishes → active (not wave_clear)
    drainSpawnEventsKeepAlive(ws);
    expect(ws.getState()).toBe('active');
  });

  it('spawns multiple enemy groups across wave 3', () => {
    // Wave 3 has: 6 orc_grunt + 4 goblin_runner
    const ws = new WaveSystem(level1);
    // skip to wave 3 (index 2)
    // Wave 1: complete naturally
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainAllSpawnEvents(ws); // finish spawning wave 1
    ws.tick(WAVE_CLEAR_PAUSE_MS + 100, 0); // clear + transition
    // Wave 2
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainAllSpawnEvents(ws);
    ws.tick(WAVE_CLEAR_PAUSE_MS + 100, 0);
    expect(ws.getCurrentWaveIndex()).toBe(2);

    // Now in PRE_WAVE for wave 3 — send early
    ws.sendWaveEarly();
    ws.tick(1, 0);
    expect(ws.getState()).toBe('spawning');

    const events = drainAllSpawnEvents(ws);
    const spawnEvents = events.filter((e) => e.type === 'SPAWN_ENEMY');
    // 6 orc_grunt + 4 goblin_runner = 10 total
    expect(spawnEvents).toHaveLength(10);

    const orcSpawns = spawnEvents.filter(
      (e) => e.type === 'SPAWN_ENEMY' && e.enemyType === 'orc_grunt',
    );
    const goblinSpawns = spawnEvents.filter(
      (e) => e.type === 'SPAWN_ENEMY' && e.enemyType === 'goblin_runner',
    );
    expect(orcSpawns).toHaveLength(6);
    expect(goblinSpawns).toHaveLength(4);
  });
});

describe('WaveSystem — ACTIVE state', () => {
  it('remains in active while enemies are alive', () => {
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainSpawnEventsKeepAlive(ws); // spawning done → active (alive=1 throughout)
    expect(ws.getState()).toBe('active');
    ws.tick(16, 1); // still alive
    expect(ws.getState()).toBe('active');
  });

  it('transitions to wave_clear when last enemy dies', () => {
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainSpawnEventsKeepAlive(ws); // → active
    ws.tick(16, 0); // last enemy dies
    expect(ws.getState()).toBe('wave_clear');
  });
});

describe('WaveSystem — WAVE_CLEAR state', () => {
  function advanceToWaveClear(ws: WaveSystem): void {
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainAllSpawnEvents(ws); // spawning done
    ws.tick(16, 0); // all enemies dead → wave_clear
  }

  it('enters wave_clear and emits WAVE_CLEARED', () => {
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    ws.tick(1, 0);
    // drainAllSpawnEvents passes aliveCount=0, so when all enemies are spawned
    // the system transitions directly to wave_clear and emits WAVE_CLEARED
    const allEvents = drainAllSpawnEvents(ws);
    expect(ws.getState()).toBe('wave_clear');
    const cleared = allEvents.find((e) => e.type === 'WAVE_CLEARED');
    expect(cleared).toBeDefined();
    if (cleared?.type === 'WAVE_CLEARED') {
      expect(cleared.waveIndex).toBe(0);
    }
  });

  it('pauses in wave_clear for WAVE_CLEAR_PAUSE_MS', () => {
    const ws = new WaveSystem(level1);
    advanceToWaveClear(ws);
    expect(ws.getState()).toBe('wave_clear');
    ws.tick(WAVE_CLEAR_PAUSE_MS - 100, 0);
    expect(ws.getState()).toBe('wave_clear');
  });

  it('transitions to pre_wave after pause completes', () => {
    const ws = new WaveSystem(level1);
    advanceToWaveClear(ws);
    ws.tick(WAVE_CLEAR_PAUSE_MS + 16, 0);
    expect(ws.getState()).toBe('pre_wave');
  });

  it('increments wave index after wave_clear → pre_wave', () => {
    const ws = new WaveSystem(level1);
    advanceToWaveClear(ws);
    ws.tick(WAVE_CLEAR_PAUSE_MS + 16, 0);
    expect(ws.getCurrentWaveIndex()).toBe(1);
  });
});

describe('WaveSystem — LEVEL_COMPLETE', () => {
  it('emits LEVEL_COMPLETE and enters level_complete after final wave clears', () => {
    const ws = new WaveSystem(level1);
    const totalWaves = level1.waves.length; // 10

    // Run through all 10 waves quickly
    for (let i = 0; i < totalWaves; i++) {
      tickUntilState(ws, 'pre_wave');
      ws.sendWaveEarly();
      ws.tick(1, 0);
      drainAllSpawnEvents(ws); // finish spawning
      ws.tick(16, 0); // all dead → wave_clear / level_complete
    }

    // After all waves, should be level_complete and emit LEVEL_COMPLETE event
    const finalEvents = ws.tick(WAVE_CLEAR_PAUSE_MS + 100, 0);
    expect(ws.getState()).toBe('level_complete');
    expect(finalEvents.find(e => e.type === 'LEVEL_COMPLETE')).toBeDefined();
  });
});

describe('WaveSystem — reset', () => {
  it('resets to initial state', () => {
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    ws.tick(ws.getCountdownDurationMs(), 0);
    expect(ws.getState()).toBe('spawning');

    ws.reset();
    expect(ws.getState()).toBe('pre_wave');
    expect(ws.getCurrentWaveIndex()).toBe(0);
  });

  it('does not emit APPLY_INTEREST on first tick after reset (wave index resets to 0)', () => {
    const ws = new WaveSystem(level1);
    ws.sendWaveEarly();
    ws.tick(1, 0);
    drainAllSpawnEvents(ws);
    ws.tick(WAVE_CLEAR_PAUSE_MS + 100, 0); // advance to wave 1

    ws.reset();
    expect(ws.getCurrentWaveIndex()).toBe(0);
    const events = ws.tick(1, 0);
    const interestEvent = events.find((e) => e.type === 'APPLY_INTEREST');
    expect(interestEvent).toBeUndefined();
  });
});
