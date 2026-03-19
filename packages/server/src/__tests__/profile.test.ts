import { describe, it, expect, beforeEach } from 'vitest';
import type { Hono } from 'hono';
import { createTestApp, registerAndLogin, json } from './helpers.js';

describe('GET /api/profile', () => {
  let app: Hono;
  let token: string;
  let playerId: string;

  beforeEach(async () => {
    app = createTestApp();
    ({ token, playerId } = await registerAndLogin(app));
  });

  it('returns player, progress, and fusions for authenticated user', async () => {
    const res = await app.request('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = await json<{
      player: Record<string, unknown>;
      progress: unknown[];
      fusions: unknown[];
    }>(res);
    expect(body.player).toBeDefined();
    expect(body.player['id']).toBe(playerId);
    expect(body.player).not.toHaveProperty('passwordHash');
    expect(body.player).not.toHaveProperty('password_hash');
    expect(Array.isArray(body.progress)).toBe(true);
    expect(Array.isArray(body.fusions)).toBe(true);
  });

  it('returns 401 without a token', async () => {
    const res = await app.request('/api/profile');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/profile', () => {
  let app: Hono;
  let token: string;

  beforeEach(async () => {
    app = createTestApp();
    ({ token } = await registerAndLogin(app));
  });

  it('updates display_name successfully', async () => {
    const res = await app.request('/api/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ display_name: 'New Display Name' }),
    });

    expect(res.status).toBe(200);
    const body = await json<{ player: Record<string, unknown> }>(res);
    expect(body.player['displayName']).toBe('New Display Name');
  });

  it('rejects empty display_name', async () => {
    const res = await app.request('/api/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ display_name: '   ' }),
    });

    expect(res.status).toBe(400);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/display_name/i);
  });

  it('rejects display_name longer than 50 characters', async () => {
    const res = await app.request('/api/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ display_name: 'A'.repeat(51) }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    const res = await app.request('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: 'Hacker' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/profile/:id', () => {
  let app: Hono;
  let playerId: string;

  beforeEach(async () => {
    app = createTestApp();
    ({ playerId } = await registerAndLogin(app));
  });

  it('returns public player info without email or password', async () => {
    const res = await app.request(`/api/profile/${playerId}`);

    expect(res.status).toBe(200);
    const body = await json<{ player: Record<string, unknown>; progress: unknown[] }>(res);
    expect(body.player['id']).toBe(playerId);
    expect(body.player).not.toHaveProperty('email');
    expect(body.player).not.toHaveProperty('passwordHash');
    expect(body.player).not.toHaveProperty('password_hash');
    expect(Array.isArray(body.progress)).toBe(true);
  });

  it('returns 404 for unknown player id', async () => {
    const res = await app.request('/api/profile/nonexistent-id');
    expect(res.status).toBe(404);
  });
});
