import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { createApp } from '../index.js';
import type { Hono } from 'hono';

export function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

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

export function createTestApp(): Hono {
  const db = createTestDb();
  return createApp(db);
}

export async function json<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

/** Register a player and return { token, playerId } */
export async function registerAndLogin(
  app: Hono,
  opts: { email?: string; username?: string; password?: string } = {},
): Promise<{ token: string; playerId: string }> {
  const email = opts.email ?? 'test@example.com';
  const username = opts.username ?? 'testplayer';
  const password = opts.password ?? 'password123';

  const res = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  const body = await json<{ token: string; player: { id: string } }>(res);
  return { token: body.token, playerId: body.player.id };
}

/** Build a valid session end payload */
export function validEndPayload(overrides?: {
  score_breakdown?: Record<string, unknown>;
  stats?: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    score_breakdown: {
      base_score: 10000,
      combo_score: 2000,
      speed_score: 500,
      style_score: 300,
      perfect_wave_bonus: 1000,
      nexus_health_bonus: 500,
      ...(overrides?.score_breakdown ?? {}),
    },
    stats: {
      waves_completed: 5,
      total_waves: 10,
      towers_built: 3,
      towers_fused: 1,
      enemies_killed: 50,
      gold_earned: 2000,
      essence_earned: 30,
      max_combo: 10,
      nexus_hp_remaining: 80,
      duration_ms: 120_000,
      ...(overrides?.stats ?? {}),
    },
  };
}
