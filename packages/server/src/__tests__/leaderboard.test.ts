import { describe, it, expect, beforeEach } from 'vitest';
import type { Hono } from 'hono';
import { createTestApp, registerAndLogin, json, validEndPayload } from './helpers.js';

/** Helper: register, start, and end a session returning the token */
async function seedScore(
  app: Hono,
  opts: {
    email: string;
    username: string;
    levelId?: string;
    difficulty?: string;
    baseScore?: number;
  },
): Promise<{ token: string; playerId: string }> {
  const { token, playerId } = await registerAndLogin(app, {
    email: opts.email,
    username: opts.username,
  });

  const startRes = await app.request('/api/sessions/start', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      level_id: opts.levelId ?? 'level-1',
      difficulty: opts.difficulty ?? 'normal',
    }),
  });
  const { session_id } = await json<{ session_id: string }>(startRes);

  await app.request(`/api/sessions/${session_id}/end`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      validEndPayload({
        score_breakdown: {
          base_score: opts.baseScore ?? 10000,
          combo_score: 0,
          speed_score: 0,
          style_score: 0,
          perfect_wave_bonus: 0,
          nexus_health_bonus: 0,
        },
      }),
    ),
  });

  return { token, playerId };
}

describe('GET /api/leaderboard/:levelId', () => {
  let app: Hono;

  beforeEach(async () => {
    app = createTestApp();

    // Seed three players with different scores on level-1 normal
    await seedScore(app, { email: 'p1@x.com', username: 'player1', baseScore: 30000 });
    await seedScore(app, { email: 'p2@x.com', username: 'player2', baseScore: 20000 });
    await seedScore(app, { email: 'p3@x.com', username: 'player3', baseScore: 10000 });
  });

  it('returns entries ordered by score descending', async () => {
    const res = await app.request('/api/leaderboard/level-1?difficulty=normal');

    expect(res.status).toBe(200);
    const body = await json<{
      entries: Array<{ rank: number; score: number; username: string }>;
      total: number;
    }>(res);

    expect(body.total).toBe(3);
    expect(body.entries.length).toBe(3);
    expect(body.entries[0]!.score).toBe(30000);
    expect(body.entries[0]!.rank).toBe(1);
    expect(body.entries[1]!.score).toBe(20000);
    expect(body.entries[2]!.score).toBe(10000);
    expect(body.entries[2]!.rank).toBe(3);
  });

  it('respects pagination (limit + page)', async () => {
    const res = await app.request('/api/leaderboard/level-1?difficulty=normal&limit=2&page=1');

    expect(res.status).toBe(200);
    const body = await json<{
      entries: unknown[];
      total: number;
      page: number;
      limit: number;
    }>(res);
    expect(body.entries.length).toBe(2);
    expect(body.total).toBe(3);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(2);
  });

  it('returns second page correctly', async () => {
    const res = await app.request('/api/leaderboard/level-1?difficulty=normal&limit=2&page=2');

    expect(res.status).toBe(200);
    const body = await json<{ entries: unknown[]; total: number }>(res);
    expect(body.entries.length).toBe(1);
    expect(body.total).toBe(3);
  });

  it('includes player_rank for authenticated user', async () => {
    const { token } = await seedScore(app, {
      email: 'ranked@x.com',
      username: 'rankedplayer',
      baseScore: 25000,
    });

    const res = await app.request('/api/leaderboard/level-1?difficulty=normal', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = await json<{ player_rank: number | null }>(res);
    expect(typeof body.player_rank).toBe('number');
    // 30000 > 25000 > 20000, so rank should be 2
    expect(body.player_rank).toBe(2);
  });

  it('returns player_rank null for unauthenticated request', async () => {
    const res = await app.request('/api/leaderboard/level-1?difficulty=normal');

    const body = await json<{ player_rank: number | null }>(res);
    expect(body.player_rank).toBeNull();
  });

  it('returns empty entries for unknown level', async () => {
    const res = await app.request('/api/leaderboard/unknown-level?difficulty=normal');

    expect(res.status).toBe(200);
    const body = await json<{ entries: unknown[]; total: number }>(res);
    expect(body.entries.length).toBe(0);
    expect(body.total).toBe(0);
  });
});

describe('GET /api/leaderboard/campaign', () => {
  let app: Hono;

  beforeEach(async () => {
    app = createTestApp();

    // player1 has scores on level-1 and level-2 → total 35000
    const { token: t1 } = await registerAndLogin(app, {
      email: 'c1@x.com',
      username: 'cplayer1',
    });

    for (const [lvl, score] of [
      ['level-1', 20000],
      ['level-2', 15000],
    ] as const) {
      const startRes = await app.request('/api/sessions/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t1}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ level_id: lvl, difficulty: 'normal' }),
      });
      const { session_id } = await json<{ session_id: string }>(startRes);
      await app.request(`/api/sessions/${session_id}/end`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${t1}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(
          validEndPayload({
            score_breakdown: {
              base_score: score,
              combo_score: 0,
              speed_score: 0,
              style_score: 0,
              perfect_wave_bonus: 0,
              nexus_health_bonus: 0,
            },
          }),
        ),
      });
    }

    // player2 only has level-1 → total 10000
    await seedScore(app, { email: 'c2@x.com', username: 'cplayer2', baseScore: 10000 });
  });

  it('returns players ranked by total score across all levels', async () => {
    const res = await app.request('/api/leaderboard/campaign?difficulty=normal');

    expect(res.status).toBe(200);
    const body = await json<{
      entries: Array<{ username: string; score: number; rank: number }>;
      total: number;
    }>(res);
    expect(body.total).toBe(2);
    expect(body.entries[0]!.score).toBe(35000);
    expect(body.entries[0]!.rank).toBe(1);
    expect(body.entries[1]!.score).toBe(10000);
    expect(body.entries[1]!.rank).toBe(2);
  });

  it('paginates campaign results', async () => {
    const res = await app.request('/api/leaderboard/campaign?difficulty=normal&limit=1&page=1');

    expect(res.status).toBe(200);
    const body = await json<{ entries: unknown[]; total: number }>(res);
    expect(body.entries.length).toBe(1);
    expect(body.total).toBe(2);
  });
});
