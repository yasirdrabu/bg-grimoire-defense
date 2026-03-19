import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { createApp } from '../index.js';
import type { Hono } from 'hono';

// ------------------------------------------------------------------ helpers --

function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  // Run all migrations inline — mirrors migrate.ts but on the in-memory DB
  const statements = [
    `CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      title TEXT,
      border_style TEXT,
      coins INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS player_progress (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      level_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      best_score INTEGER NOT NULL DEFAULT 0,
      stars INTEGER NOT NULL DEFAULT 0,
      best_combo INTEGER NOT NULL DEFAULT 0,
      best_speed_bonus INTEGER NOT NULL DEFAULT 0,
      times_completed INTEGER NOT NULL DEFAULT 0,
      fastest_clear_ms INTEGER,
      completed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS fusion_discoveries (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      fusion_id TEXT NOT NULL,
      discovered_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      player_id TEXT REFERENCES players(id) ON DELETE SET NULL,
      level_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      ended_at TEXT,
      duration_ms INTEGER,
      waves_completed INTEGER NOT NULL DEFAULT 0,
      total_waves INTEGER NOT NULL DEFAULT 0,
      base_score INTEGER NOT NULL DEFAULT 0,
      combo_score INTEGER NOT NULL DEFAULT 0,
      speed_score INTEGER NOT NULL DEFAULT 0,
      style_score INTEGER NOT NULL DEFAULT 0,
      perfect_wave_bonus INTEGER NOT NULL DEFAULT 0,
      nexus_health_bonus INTEGER NOT NULL DEFAULT 0,
      total_score INTEGER NOT NULL DEFAULT 0,
      score_hash TEXT,
      client_version TEXT,
      towers_built INTEGER NOT NULL DEFAULT 0,
      towers_fused INTEGER NOT NULL DEFAULT 0,
      enemies_killed INTEGER NOT NULL DEFAULT 0,
      gold_earned INTEGER NOT NULL DEFAULT 0,
      essence_earned INTEGER NOT NULL DEFAULT 0,
      max_combo INTEGER NOT NULL DEFAULT 0,
      nexus_hp_remaining INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS leaderboard (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      level_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      rank INTEGER,
      session_id TEXT REFERENCES game_sessions(id) ON DELETE SET NULL,
      achieved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS store_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price_coins INTEGER NOT NULL,
      preview_image_url TEXT,
      metadata TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS player_purchases (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
      purchased_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS player_equipped (
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      slot TEXT NOT NULL,
      item_id TEXT NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
      PRIMARY KEY (player_id, slot)
    )`,
  ];

  for (const stmt of statements) {
    sqlite.prepare(stmt).run();
  }

  return drizzle(sqlite, { schema });
}

function createTestApp(): Hono {
  const db = createTestDb();
  return createApp(db);
}

async function json<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

// ------------------------------------------------------------------- tests --

describe('POST /api/auth/register', () => {
  let app: Hono;

  beforeEach(() => {
    app = createTestApp();
  });

  it('creates a player and returns a token', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(201);
    const body = await json<{ token: string; player: { email: string; username: string } }>(res);
    expect(typeof body.token).toBe('string');
    expect(body.player.email).toBe('test@example.com');
    expect(body.player.username).toBe('testuser');
    expect(body.player).not.toHaveProperty('passwordHash');
    expect(body.player).not.toHaveProperty('password_hash');
  });

  it('rejects duplicate email', async () => {
    const payload = {
      email: 'dupe@example.com',
      username: 'firstuser',
      password: 'password123',
    };
    await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, username: 'seconduser' }),
    });

    expect(res.status).toBe(409);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/email/i);
  });

  it('rejects duplicate username', async () => {
    const payload = {
      email: 'first@example.com',
      username: 'sameusername',
      password: 'password123',
    };
    await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, email: 'second@example.com' }),
    });

    expect(res.status).toBe(409);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/username/i);
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'short@example.com',
        username: 'shortpass',
        password: 'abc',
      }),
    });

    expect(res.status).toBe(400);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/password/i);
  });

  it('rejects a username shorter than 3 characters', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'valid@example.com',
        username: 'ab',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(400);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/username/i);
  });

  it('rejects an invalid email address', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        username: 'validuser',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(400);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/email/i);
  });
});

describe('POST /api/auth/login', () => {
  let app: Hono;

  beforeEach(async () => {
    app = createTestApp();
    // Seed a player
    await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'login@example.com',
        username: 'loginuser',
        password: 'correctpassword',
      }),
    });
  });

  it('returns a token for valid credentials', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'login@example.com',
        password: 'correctpassword',
      }),
    });

    expect(res.status).toBe(200);
    const body = await json<{ token: string; player: { username: string } }>(res);
    expect(typeof body.token).toBe('string');
    expect(body.player.username).toBe('loginuser');
    expect(body.player).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'login@example.com',
        password: 'wrongpassword',
      }),
    });

    expect(res.status).toBe(401);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/invalid/i);
  });

  it('rejects a non-existent email', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody@example.com',
        password: 'anypassword',
      }),
    });

    expect(res.status).toBe(401);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/invalid/i);
  });
});

describe('POST /api/auth/refresh', () => {
  let app: Hono;
  let token: string;

  beforeEach(async () => {
    app = createTestApp();
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'refresh@example.com',
        username: 'refreshuser',
        password: 'password123',
      }),
    });
    const body = await json<{ token: string }>(res);
    token = body.token;
  });

  it('returns a new token for a valid existing token', async () => {
    const res = await app.request('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    expect(res.status).toBe(200);
    const body = await json<{ token: string }>(res);
    expect(typeof body.token).toBe('string');
    // A JWT has three base64url segments separated by dots
    expect(body.token.split('.').length).toBe(3);
  });

  it('rejects an invalid token', async () => {
    const res = await app.request('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'this.is.not.valid' }),
    });

    expect(res.status).toBe(401);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/invalid/i);
  });
});

describe('authMiddleware — protected route', () => {
  let app: Hono;
  let token: string;

  beforeEach(async () => {
    app = createTestApp();
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'protected@example.com',
        username: 'protecteduser',
        password: 'password123',
      }),
    });
    const body = await json<{ token: string }>(res);
    token = body.token;
  });

  it('returns 401 without an Authorization header', async () => {
    const res = await app.request('/api/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a malformed token', async () => {
    const res = await app.request('/api/me', {
      headers: { Authorization: 'Bearer not.a.token' },
    });
    expect(res.status).toBe(401);
  });

  it('grants access with a valid Bearer token', async () => {
    const res = await app.request('/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await json<{ playerId: string }>(res);
    expect(typeof body.playerId).toBe('string');
  });
});
