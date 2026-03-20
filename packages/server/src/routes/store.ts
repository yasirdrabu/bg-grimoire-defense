import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { storeItems, playerPurchases, playerEquipped, players } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createStoreRouter(db: DB): Hono {
  const router = new Hono();

  // GET /api/store/items?category=
  router.get('/items', (c) => {
    const category = c.req.query('category');

    const rows = db.select().from(storeItems).all();
    const filtered = category
      ? rows.filter((item) => item.category === category && item.active)
      : rows.filter((item) => item.active);

    return c.json({ items: filtered });
  });

  // POST /api/store/purchase  { item_id }  (authed)
  router.post('/purchase', authMiddleware, async (c) => {
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
    const itemId = input['item_id'];
    if (typeof itemId !== 'string' || itemId.trim().length === 0) {
      return c.json({ error: 'item_id is required' }, 400);
    }

    // Check item exists and is active
    const item = db
      .select()
      .from(storeItems)
      .where(eq(storeItems.id, itemId))
      .get();

    if (!item || !item.active) {
      return c.json({ error: 'Item not found' }, 404);
    }

    // Check for duplicate purchase
    const existing = db
      .select()
      .from(playerPurchases)
      .where(
        and(
          eq(playerPurchases.playerId, playerId),
          eq(playerPurchases.itemId, itemId),
        ),
      )
      .get();

    if (existing) {
      return c.json({ error: 'Item already purchased' }, 409);
    }

    // Check player has enough coins
    const player = db.select().from(players).where(eq(players.id, playerId)).get();
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    if (player.coins < item.priceCoins) {
      return c.json({ error: 'Insufficient coins' }, 402);
    }

    // Deduct coins and create purchase record
    const newCoins = player.coins - item.priceCoins;
    db.update(players)
      .set({ coins: newCoins, updatedAt: new Date().toISOString() })
      .where(eq(players.id, playerId))
      .run();

    const purchaseId = generateId();
    db.insert(playerPurchases)
      .values({
        id: purchaseId,
        playerId,
        itemId,
      })
      .run();

    const purchase = db
      .select()
      .from(playerPurchases)
      .where(eq(playerPurchases.id, purchaseId))
      .get();

    return c.json({ purchase, remaining_coins: newCoins }, 201);
  });

  // GET /api/store/my-items  (authed)
  router.get('/my-items', authMiddleware, (c) => {
    const playerId = c.get('playerId');

    const purchases = db
      .select()
      .from(playerPurchases)
      .where(eq(playerPurchases.playerId, playerId))
      .all();

    return c.json({ purchases });
  });

  // PUT /api/store/equip  { slot, item_id }  (authed)
  router.put('/equip', authMiddleware, async (c) => {
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
    const slot = input['slot'];
    const itemId = input['item_id'];

    if (typeof slot !== 'string' || slot.trim().length === 0) {
      return c.json({ error: 'slot is required' }, 400);
    }
    if (typeof itemId !== 'string' || itemId.trim().length === 0) {
      return c.json({ error: 'item_id is required' }, 400);
    }

    // Verify item is owned
    const owned = db
      .select()
      .from(playerPurchases)
      .where(
        and(
          eq(playerPurchases.playerId, playerId),
          eq(playerPurchases.itemId, itemId),
        ),
      )
      .get();

    if (!owned) {
      return c.json({ error: 'Item not owned' }, 403);
    }

    // Upsert equipped slot (delete old, insert new)
    db.delete(playerEquipped)
      .where(
        and(
          eq(playerEquipped.playerId, playerId),
          eq(playerEquipped.slot, slot),
        ),
      )
      .run();

    db.insert(playerEquipped)
      .values({ playerId, slot, itemId })
      .run();

    const equipped = db
      .select()
      .from(playerEquipped)
      .where(
        and(
          eq(playerEquipped.playerId, playerId),
          eq(playerEquipped.slot, slot),
        ),
      )
      .get();

    return c.json({ equipped });
  });

  return router;
}
