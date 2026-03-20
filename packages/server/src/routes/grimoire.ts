import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { fusionDiscoveries, playerProgress } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Essence bonus awarded for new fusion discovery
const FUSION_DISCOVERY_ESSENCE_BONUS = 50;

export function createGrimoireRouter(db: DB): Hono {
  const router = new Hono();

  // GET /api/grimoire  (authed)
  router.get('/', authMiddleware, (c) => {
    const playerId = c.get('playerId');

    const discoveredFusions = db
      .select()
      .from(fusionDiscoveries)
      .where(eq(fusionDiscoveries.playerId, playerId))
      .all();

    const progress = db
      .select()
      .from(playerProgress)
      .where(eq(playerProgress.playerId, playerId))
      .all();

    // Aggregate bestiary progress: total levels completed and total stars
    const bestiaryProgress = {
      levelsCompleted: progress.filter((p) => p.timesCompleted > 0).length,
      totalStars: progress.reduce((sum, p) => sum + p.stars, 0),
      totalFusionsDiscovered: discoveredFusions.length,
    };

    return c.json({ discovered_fusions: discoveredFusions, bestiary_progress: bestiaryProgress });
  });

  // POST /api/grimoire/discover  { fusion_id }  (authed)
  router.post('/discover', authMiddleware, async (c) => {
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
    const fusionId = input['fusion_id'];

    if (typeof fusionId !== 'string' || fusionId.trim().length === 0) {
      return c.json({ error: 'fusion_id is required' }, 400);
    }

    // Check if already discovered
    const existing = db
      .select()
      .from(fusionDiscoveries)
      .where(
        and(
          eq(fusionDiscoveries.playerId, playerId),
          eq(fusionDiscoveries.fusionId, fusionId),
        ),
      )
      .get();

    if (existing) {
      return c.json({ error: 'Fusion already discovered' }, 409);
    }

    const discoveryId = generateId();
    db.insert(fusionDiscoveries)
      .values({
        id: discoveryId,
        playerId,
        fusionId,
      })
      .run();

    const discovery = db
      .select()
      .from(fusionDiscoveries)
      .where(eq(fusionDiscoveries.id, discoveryId))
      .get();

    return c.json({ discovery, essence_bonus: FUSION_DISCOVERY_ESSENCE_BONUS }, 201);
  });

  return router;
}
