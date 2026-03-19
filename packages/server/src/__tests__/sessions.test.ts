import { describe, it, expect, beforeEach } from 'vitest';
import type { Hono } from 'hono';
import { createTestApp, registerAndLogin, json, validEndPayload } from './helpers.js';

describe('POST /api/sessions/start', () => {
  let app: Hono;
  let token: string;

  beforeEach(async () => {
    app = createTestApp();
    ({ token } = await registerAndLogin(app));
  });

  it('creates a session and returns session_id', async () => {
    const res = await app.request('/api/sessions/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level_id: 'level-1', difficulty: 'normal' }),
    });

    expect(res.status).toBe(201);
    const body = await json<{ session_id: string }>(res);
    expect(typeof body.session_id).toBe('string');
    expect(body.session_id.length).toBeGreaterThan(0);
  });

  it('returns 400 when level_id is missing', async () => {
    const res = await app.request('/api/sessions/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ difficulty: 'normal' }),
    });

    expect(res.status).toBe(400);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/level_id/i);
  });

  it('returns 400 when difficulty is missing', async () => {
    const res = await app.request('/api/sessions/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level_id: 'level-1' }),
    });

    expect(res.status).toBe(400);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/difficulty/i);
  });

  it('returns 401 without a token', async () => {
    const res = await app.request('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level_id: 'level-1', difficulty: 'normal' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/sessions/:id/end', () => {
  let app: Hono;
  let token: string;
  let sessionId: string;

  beforeEach(async () => {
    app = createTestApp();
    ({ token } = await registerAndLogin(app));

    const startRes = await app.request('/api/sessions/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level_id: 'level-1', difficulty: 'normal' }),
    });
    const startBody = await json<{ session_id: string }>(startRes);
    sessionId = startBody.session_id;
  });

  it('ends a session with valid score and stats', async () => {
    const res = await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEndPayload()),
    });

    expect(res.status).toBe(200);
    const body = await json<{
      session: Record<string, unknown>;
      leaderboard_rank: number | null;
    }>(res);
    expect(body.session).toBeDefined();
    expect(body.session['status']).toBe('completed');
    expect(body.session['totalScore']).toBeGreaterThan(0);
    expect(body.session['scoreHash']).toBeDefined();
    // First submission should have a rank
    expect(typeof body.leaderboard_rank).toBe('number');
  });

  it('recomputes total_score server-side (ignores client total)', async () => {
    const payload = validEndPayload();
    // Score components sum to: 10000+2000+500+300+1000+500 = 14300
    const res = await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const body = await json<{ session: Record<string, unknown> }>(res);
    expect(body.session['totalScore']).toBe(14300);
  });

  it('rejects a session end with implausible stats (towers_built = 0)', async () => {
    const res = await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        validEndPayload({ stats: { towers_built: 0 } }),
      ),
    });

    expect(res.status).toBe(422);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/plausibility/i);
  });

  it('rejects a session end with a score that exceeds max plausible', async () => {
    // MAX_POINTS_PER_WAVE = 50000, waves_completed = 5 → max = 250000
    const res = await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        validEndPayload({
          score_breakdown: {
            base_score: 300000,
            combo_score: 0,
            speed_score: 0,
            style_score: 0,
            perfect_wave_bonus: 0,
            nexus_health_bonus: 0,
          },
        }),
      ),
    });

    expect(res.status).toBe(422);
  });

  it('returns 404 for an unknown session id', async () => {
    const res = await app.request('/api/sessions/nonexistent/end', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEndPayload()),
    });

    expect(res.status).toBe(404);
  });

  it('returns 403 when another player tries to end the session', async () => {
    const { token: otherToken } = await registerAndLogin(app, {
      email: 'other@example.com',
      username: 'otherplayer',
    });

    const res = await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${otherToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEndPayload()),
    });

    expect(res.status).toBe(403);
  });

  it('returns 409 when ending an already-completed session', async () => {
    // End once
    await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEndPayload()),
    });

    // End again
    const res = await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEndPayload()),
    });

    expect(res.status).toBe(409);
  });

  it('returns null leaderboard_rank when score does not improve personal best', async () => {
    // Submit a high score first
    const highPayload = validEndPayload({
      score_breakdown: {
        base_score: 20000,
        combo_score: 5000,
        speed_score: 1000,
        style_score: 500,
        perfect_wave_bonus: 2000,
        nexus_health_bonus: 1000,
      },
    });

    await app.request(`/api/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(highPayload),
    });

    // Start a new session for the second attempt
    const startRes2 = await app.request('/api/sessions/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level_id: 'level-1', difficulty: 'normal' }),
    });
    const { session_id: sessionId2 } = await json<{ session_id: string }>(startRes2);

    // Submit a lower score
    const res = await app.request(`/api/sessions/${sessionId2}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEndPayload()),
    });

    expect(res.status).toBe(200);
    const body = await json<{ leaderboard_rank: number | null }>(res);
    expect(body.leaderboard_rank).toBeNull();
  });
});

describe('GET /api/scores/my', () => {
  let app: Hono;
  let token: string;

  beforeEach(async () => {
    app = createTestApp();
    ({ token } = await registerAndLogin(app));

    // Create and end a session
    const startRes = await app.request('/api/sessions/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level_id: 'level-1', difficulty: 'normal' }),
    });
    const { session_id } = await json<{ session_id: string }>(startRes);

    await app.request(`/api/sessions/${session_id}/end`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEndPayload()),
    });
  });

  it('returns the player sessions list', async () => {
    const res = await app.request('/api/scores/my', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = await json<{ sessions: unknown[] }>(res);
    expect(Array.isArray(body.sessions)).toBe(true);
    expect(body.sessions.length).toBeGreaterThanOrEqual(1);
  });

  it('returns 401 without a token', async () => {
    const res = await app.request('/api/scores/my');
    expect(res.status).toBe(401);
  });
});
