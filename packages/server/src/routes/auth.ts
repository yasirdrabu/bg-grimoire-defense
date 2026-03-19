import { Hono } from 'hono';
import { eq, or } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { players } from '../db/schema.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken, verifyToken } from '../utils/jwt.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;

type PlayerRow = typeof players.$inferSelect;

function omitPasswordHash(
  player: PlayerRow,
): Omit<PlayerRow, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...rest } = player;
  return rest;
}

function generateId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function createAuthRouter(db: DB): Hono {
  const router = new Hono();

  // POST /register
  router.post('/register', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body) ||
      !('username' in body) ||
      !('password' in body)
    ) {
      return c.json({ error: 'Missing required fields: email, username, password' }, 400);
    }

    const { email, username, password } = body as Record<string, unknown>;

    if (typeof email !== 'string' || !isValidEmail(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    if (
      typeof username !== 'string' ||
      username.length < 3 ||
      username.length > 20
    ) {
      return c.json({ error: 'Username must be 3–20 characters' }, 400);
    }

    if (typeof password !== 'string' || password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Check uniqueness
    const existing = db
      .select()
      .from(players)
      .where(
        or(
          eq(players.email, email.toLowerCase()),
          eq(players.username, username),
        ),
      )
      .get();

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return c.json({ error: 'Email already in use' }, 409);
      }
      return c.json({ error: 'Username already taken' }, 409);
    }

    const id = generateId();
    const passwordHash = await hashPassword(password);

    db.insert(players)
      .values({
        id,
        email: email.toLowerCase(),
        username,
        passwordHash,
        displayName: username,
      })
      .run();

    const player = db
      .select()
      .from(players)
      .where(eq(players.id, id))
      .get();

    if (!player) {
      return c.json({ error: 'Failed to create player' }, 500);
    }

    const token = await signToken(id);
    return c.json({ token, player: omitPasswordHash(player) }, 201);
  });

  // POST /login
  router.post('/login', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body) ||
      !('password' in body)
    ) {
      return c.json({ error: 'Missing required fields: email, password' }, 400);
    }

    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return c.json({ error: 'Invalid credentials' }, 400);
    }

    const player = db
      .select()
      .from(players)
      .where(eq(players.email, email.toLowerCase()))
      .get();

    if (!player) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const passwordMatches = await comparePassword(password, player.passwordHash);
    if (!passwordMatches) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = await signToken(player.id);
    return c.json({ token, player: omitPasswordHash(player) });
  });

  // POST /refresh
  router.post('/refresh', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (
      typeof body !== 'object' ||
      body === null ||
      !('token' in body)
    ) {
      return c.json({ error: 'Missing required field: token' }, 400);
    }

    const { token } = body as Record<string, unknown>;

    if (typeof token !== 'string') {
      return c.json({ error: 'Invalid token' }, 400);
    }

    try {
      const payload = await verifyToken(token);
      const newToken = await signToken(payload.playerId);
      return c.json({ token: newToken });
    } catch {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
  });

  return router;
}
