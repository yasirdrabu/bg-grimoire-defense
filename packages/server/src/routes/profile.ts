import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { players, playerProgress, fusionDiscoveries } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;
type PlayerRow = typeof players.$inferSelect;

function omitPasswordHash(player: PlayerRow): Omit<PlayerRow, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...rest } = player;
  return rest;
}

export function createProfileRouter(db: DB): Hono {
  const router = new Hono();

  // GET /api/profile — authenticated: own profile + progress + fusions
  router.get('/', authMiddleware, (c) => {
    const playerId = c.get('playerId');

    const player = db.select().from(players).where(eq(players.id, playerId)).get();
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    const progress = db
      .select()
      .from(playerProgress)
      .where(eq(playerProgress.playerId, playerId))
      .all();

    const fusions = db
      .select()
      .from(fusionDiscoveries)
      .where(eq(fusionDiscoveries.playerId, playerId))
      .all();

    return c.json({ player: omitPasswordHash(player), progress, fusions });
  });

  // PUT /api/profile — authenticated: update display_name
  router.put('/', authMiddleware, async (c) => {
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

    if ('display_name' in input) {
      const displayName = input['display_name'];
      if (typeof displayName !== 'string' || displayName.trim().length === 0) {
        return c.json({ error: 'display_name must be a non-empty string' }, 400);
      }
      if (displayName.length > 50) {
        return c.json({ error: 'display_name must be 50 characters or fewer' }, 400);
      }

      db.update(players)
        .set({
          displayName: displayName.trim(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(players.id, playerId))
        .run();
    }

    const updated = db.select().from(players).where(eq(players.id, playerId)).get();
    if (!updated) {
      return c.json({ error: 'Player not found' }, 404);
    }

    return c.json({ player: omitPasswordHash(updated) });
  });

  // GET /api/profile/:id — public: player info + progress (no fusions, no email)
  router.get('/:id', (c) => {
    const { id } = c.req.param();

    const player = db.select().from(players).where(eq(players.id, id)).get();
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    const progress = db
      .select()
      .from(playerProgress)
      .where(eq(playerProgress.playerId, id))
      .all();

    // Public view: omit sensitive fields
    const { passwordHash: _ph, email: _email, ...publicPlayer } = player;

    return c.json({ player: publicPlayer, progress });
  });

  return router;
}
