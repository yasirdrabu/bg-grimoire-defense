import { Hono } from 'hono';
import { eq, and, gte, desc } from 'drizzle-orm';
import { createHmac } from 'node:crypto';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { gameSessions, leaderboard, playerProgress } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { aggregateScore, validateScorePlausibility } from '@grimoire/shared';
import { validatePlausibility } from '../utils/anticheat.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;

const SCORE_HMAC_SECRET = process.env['SCORE_HMAC_SECRET'] ?? 'dev-score-secret-change-me';
const SESSION_RATE_LIMIT = 10; // max sessions per hour per player
const SESSION_MAX_DURATION_MS = 60 * 60 * 1000; // 1 hour

function generateId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function computeScoreHash(sessionId: string, totalScore: number): string {
  return createHmac('sha256', SCORE_HMAC_SECRET)
    .update(`${sessionId}|${totalScore}`)
    .digest('hex');
}

function calcStars(wavesCompleted: number, totalWaves: number, nexusHpRemaining: number): number {
  if (wavesCompleted < totalWaves) return 1;
  if (nexusHpRemaining <= 0) return 1;
  if (nexusHpRemaining < 50) return 2;
  if (nexusHpRemaining < 100) return 3;
  return 3;
}

export function createSessionRouter(db: DB): Hono {
  const router = new Hono();

  // POST /api/sessions/start
  router.post('/start', authMiddleware, async (c) => {
    const playerId = c.get('playerId');

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (typeof body !== 'object' || body === null) {
      return c.json({ error: 'Invalid request body' }, 400);
    }

    const input = body as Record<string, unknown>;

    if (typeof input['level_id'] !== 'string' || input['level_id'].trim().length === 0) {
      return c.json({ error: 'Missing required field: level_id' }, 400);
    }
    if (typeof input['difficulty'] !== 'string' || input['difficulty'].trim().length === 0) {
      return c.json({ error: 'Missing required field: difficulty' }, 400);
    }

    const levelId = input['level_id'].trim();
    const difficulty = input['difficulty'].trim();

    // Rate limit: max 10 sessions per hour
    const oneHourAgo = new Date(Date.now() - SESSION_MAX_DURATION_MS).toISOString();
    const recentSessions = db
      .select()
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.playerId, playerId),
          gte(gameSessions.startedAt, oneHourAgo),
        ),
      )
      .all();

    if (recentSessions.length >= SESSION_RATE_LIMIT) {
      return c.json({ error: 'Rate limit exceeded: too many sessions started this hour' }, 429);
    }

    const sessionId = generateId();
    db.insert(gameSessions)
      .values({
        id: sessionId,
        playerId,
        levelId,
        difficulty,
        status: 'in_progress',
      })
      .run();

    return c.json({ session_id: sessionId }, 201);
  });

  // PUT /api/sessions/:id/end
  router.put('/:id/end', authMiddleware, async (c) => {
    const playerId = c.get('playerId');
    const sessionId = c.req.param('id');

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (typeof body !== 'object' || body === null) {
      return c.json({ error: 'Invalid request body' }, 400);
    }

    const input = body as Record<string, unknown>;

    // Validate score_breakdown
    const sb = input['score_breakdown'];
    if (typeof sb !== 'object' || sb === null) {
      return c.json({ error: 'Missing required field: score_breakdown' }, 400);
    }
    const breakdown = sb as Record<string, unknown>;

    // Validate stats
    const statsRaw = input['stats'];
    if (typeof statsRaw !== 'object' || statsRaw === null) {
      return c.json({ error: 'Missing required field: stats' }, 400);
    }
    const stats = statsRaw as Record<string, unknown>;

    // Helper to read integer field with fallback
    function intField(obj: Record<string, unknown>, key: string): number {
      const val = obj[key];
      return typeof val === 'number' ? Math.floor(val) : 0;
    }

    const scoreInput = {
      baseScore: intField(breakdown, 'base_score'),
      comboScore: intField(breakdown, 'combo_score'),
      speedScore: intField(breakdown, 'speed_score'),
      styleScore: intField(breakdown, 'style_score'),
      perfectWaveBonus: intField(breakdown, 'perfect_wave_bonus'),
      nexusHealthBonus: intField(breakdown, 'nexus_health_bonus'),
    };

    const wavesCompleted = intField(stats, 'waves_completed');
    const totalWaves = intField(stats, 'total_waves');
    const towersBuilt = intField(stats, 'towers_built');
    const towersFused = intField(stats, 'towers_fused');
    const enemiesKilled = intField(stats, 'enemies_killed');
    const goldEarned = intField(stats, 'gold_earned');
    const essenceEarned = intField(stats, 'essence_earned');
    const maxCombo = intField(stats, 'max_combo');
    const nexusHpRemaining = intField(stats, 'nexus_hp_remaining');
    const durationMs = intField(stats, 'duration_ms');

    // Look up session
    const session = db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .get();

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    if (session.playerId !== playerId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    if (session.status !== 'in_progress') {
      return c.json({ error: 'Session is not active' }, 409);
    }

    // Check session expiry (1 hour)
    const sessionAge = Date.now() - new Date(session.startedAt).getTime();
    if (sessionAge > SESSION_MAX_DURATION_MS) {
      db.update(gameSessions)
        .set({ status: 'expired', endedAt: new Date().toISOString() })
        .where(eq(gameSessions.id, sessionId))
        .run();
      return c.json({ error: 'Session has expired' }, 410);
    }

    // Server-side score recomputation
    const recomputedScore = aggregateScore(scoreInput);

    // Validate score plausibility via shared logic
    const scoreIsPlausible = validateScorePlausibility(recomputedScore, wavesCompleted);
    if (!scoreIsPlausible) {
      return c.json({ error: 'Score failed plausibility check' }, 422);
    }

    // Additional server-side plausibility checks
    const plausibility = validatePlausibility({
      durationMs,
      wavesCompleted,
      totalWaves,
      enemiesKilled,
      maxCombo,
      totalScore: recomputedScore.totalScore,
      towersBuilt,
    });

    if (!plausibility.valid) {
      return c.json(
        { error: 'Stats failed plausibility check', detail: plausibility.reason },
        422,
      );
    }

    const scoreHash = computeScoreHash(sessionId, recomputedScore.totalScore);
    const endedAt = new Date().toISOString();

    db.update(gameSessions)
      .set({
        status: 'completed',
        endedAt,
        durationMs,
        wavesCompleted,
        totalWaves,
        baseScore: recomputedScore.baseScore,
        comboScore: recomputedScore.comboScore,
        speedScore: recomputedScore.speedScore,
        styleScore: recomputedScore.styleScore,
        perfectWaveBonus: recomputedScore.perfectWaveBonus,
        nexusHealthBonus: recomputedScore.nexusHealthBonus,
        totalScore: recomputedScore.totalScore,
        scoreHash,
        towersBuilt,
        towersFused,
        enemiesKilled,
        goldEarned,
        essenceEarned,
        maxCombo,
        nexusHpRemaining,
      })
      .where(eq(gameSessions.id, sessionId))
      .run();

    // Upsert leaderboard if this beats existing best for level+difficulty
    const existingEntry = db
      .select()
      .from(leaderboard)
      .where(
        and(
          eq(leaderboard.playerId, playerId),
          eq(leaderboard.levelId, session.levelId),
          eq(leaderboard.difficulty, session.difficulty),
        ),
      )
      .get();

    let leaderboardRank: number | null = null;

    if (!existingEntry || recomputedScore.totalScore > existingEntry.score) {
      if (existingEntry) {
        db.update(leaderboard)
          .set({
            score: recomputedScore.totalScore,
            sessionId,
            achievedAt: endedAt,
          })
          .where(eq(leaderboard.id, existingEntry.id))
          .run();
      } else {
        const entryId = generateId();
        db.insert(leaderboard)
          .values({
            id: entryId,
            playerId,
            levelId: session.levelId,
            difficulty: session.difficulty,
            score: recomputedScore.totalScore,
            sessionId,
          })
          .run();
      }

      // Compute player's current rank for this level+difficulty
      const betterScores = db
        .select()
        .from(leaderboard)
        .where(
          and(
            eq(leaderboard.levelId, session.levelId),
            eq(leaderboard.difficulty, session.difficulty),
          ),
        )
        .all()
        .filter((e) => e.score > recomputedScore.totalScore);

      leaderboardRank = betterScores.length + 1;
    }

    // Update player_progress best records
    const existingProgress = db
      .select()
      .from(playerProgress)
      .where(
        and(
          eq(playerProgress.playerId, playerId),
          eq(playerProgress.levelId, session.levelId),
          eq(playerProgress.difficulty, session.difficulty),
        ),
      )
      .get();

    const stars = calcStars(wavesCompleted, totalWaves, nexusHpRemaining);

    if (!existingProgress) {
      db.insert(playerProgress)
        .values({
          id: generateId(),
          playerId,
          levelId: session.levelId,
          difficulty: session.difficulty,
          bestScore: recomputedScore.totalScore,
          stars,
          bestCombo: maxCombo,
          bestSpeedBonus: recomputedScore.speedScore,
          timesCompleted: wavesCompleted === totalWaves ? 1 : 0,
          fastestClearMs: wavesCompleted === totalWaves ? durationMs : undefined,
          completedAt: wavesCompleted === totalWaves ? endedAt : undefined,
        })
        .run();
    } else {
      const isCompleted = wavesCompleted === totalWaves;
      db.update(playerProgress)
        .set({
          bestScore: Math.max(existingProgress.bestScore, recomputedScore.totalScore),
          stars: Math.max(existingProgress.stars, stars),
          bestCombo: Math.max(existingProgress.bestCombo, maxCombo),
          bestSpeedBonus: Math.max(existingProgress.bestSpeedBonus, recomputedScore.speedScore),
          timesCompleted: isCompleted
            ? existingProgress.timesCompleted + 1
            : existingProgress.timesCompleted,
          fastestClearMs:
            isCompleted &&
            (existingProgress.fastestClearMs === null || durationMs < existingProgress.fastestClearMs)
              ? durationMs
              : existingProgress.fastestClearMs,
          completedAt: isCompleted ? endedAt : existingProgress.completedAt,
        })
        .where(eq(playerProgress.id, existingProgress.id))
        .run();
    }

    const updatedSession = db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .get();

    return c.json({
      session: updatedSession,
      leaderboard_rank: leaderboardRank,
    });
  });

  return router;
}

export function createScoreRouter(db: DB): Hono {
  const router = new Hono();

  // GET /api/scores/my?level_id=&difficulty=
  router.get('/my', authMiddleware, (c) => {
    const playerId = c.get('playerId');
    const levelIdFilter = c.req.query('level_id');
    const difficultyFilter = c.req.query('difficulty');

    let query = db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.playerId, playerId))
      .$dynamic();

    if (levelIdFilter) {
      query = query.where(
        and(eq(gameSessions.playerId, playerId), eq(gameSessions.levelId, levelIdFilter)),
      );
    }

    if (difficultyFilter) {
      query = query.where(
        and(eq(gameSessions.playerId, playerId), eq(gameSessions.difficulty, difficultyFilter)),
      );
    }

    const sessions = query
      .orderBy(desc(gameSessions.startedAt))
      .all();

    return c.json({ sessions });
  });

  return router;
}
