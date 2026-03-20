import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import type { Hono } from 'hono';
import { createTestDb, json, registerAndLogin } from './helpers.js';
import { createApp } from '../index.js';
import { storeItems, players } from '../db/schema.js';

type TestDb = ReturnType<typeof createTestDb>;

/** Create an app with a pre-seeded store item and return app + ids */
function setupWithItem(
  itemOpts: {
    id?: string;
    name?: string;
    description?: string;
    category?: string;
    priceCoins?: number;
    active?: boolean;
  } = {},
): { app: Hono; db: TestDb; itemId: string } {
  const db = createTestDb();
  const itemId = itemOpts.id ?? 'item-test-1';

  db.insert(storeItems)
    .values({
      id: itemId,
      name: itemOpts.name ?? 'Test Border',
      description: itemOpts.description ?? 'A test border cosmetic',
      category: itemOpts.category ?? 'borders',
      priceCoins: itemOpts.priceCoins ?? 100,
      active: itemOpts.active ?? true,
    })
    .run();

  const app = createApp(db);
  return { app, db, itemId };
}

function setCoins(db: TestDb, playerId: string, coins: number): void {
  db.update(players).set({ coins }).where(eq(players.id, playerId)).run();
}

// ---------------------------------------------------------------------------
// GET /api/store/items
// ---------------------------------------------------------------------------

describe('GET /api/store/items', () => {
  it('returns empty list when no items seeded', async () => {
    const db = createTestDb();
    const app = createApp(db);
    const res = await app.request('/api/store/items');
    expect(res.status).toBe(200);
    const body = await json<{ items: unknown[] }>(res);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items).toHaveLength(0);
  });

  it('returns seeded active items', async () => {
    const { app, itemId } = setupWithItem({ priceCoins: 200 });
    const res = await app.request('/api/store/items');
    expect(res.status).toBe(200);
    const body = await json<{ items: Array<Record<string, unknown>> }>(res);
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    const item = body.items.find((i) => i['id'] === itemId);
    expect(item).toBeDefined();
    expect(item!['priceCoins']).toBe(200);
  });

  it('filters by category', async () => {
    const db = createTestDb();
    db.insert(storeItems).values({ id: 'border-1', name: 'Border', description: 'desc', category: 'borders', priceCoins: 50, active: true }).run();
    db.insert(storeItems).values({ id: 'title-1', name: 'Title', description: 'desc', category: 'titles', priceCoins: 75, active: true }).run();
    const app = createApp(db);

    const res = await app.request('/api/store/items?category=borders');
    expect(res.status).toBe(200);
    const body = await json<{ items: Array<Record<string, unknown>> }>(res);
    expect(body.items.every((i) => i['category'] === 'borders')).toBe(true);
    expect(body.items.find((i) => i['id'] === 'border-1')).toBeDefined();
    expect(body.items.find((i) => i['id'] === 'title-1')).toBeUndefined();
  });

  it('excludes inactive items', async () => {
    const db = createTestDb();
    db.insert(storeItems).values({ id: 'inactive-1', name: 'Inactive', description: 'desc', category: 'borders', priceCoins: 50, active: false }).run();
    const app = createApp(db);

    const res = await app.request('/api/store/items');
    expect(res.status).toBe(200);
    const body = await json<{ items: Array<Record<string, unknown>> }>(res);
    expect(body.items.find((i) => i['id'] === 'inactive-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// POST /api/store/purchase
// ---------------------------------------------------------------------------

describe('POST /api/store/purchase', () => {
  let app: Hono;
  let token: string;
  let playerId: string;
  let itemId: string;
  let db: TestDb;

  beforeEach(async () => {
    const setup = setupWithItem({ priceCoins: 100 });
    app = setup.app;
    db = setup.db;
    itemId = setup.itemId;
    ({ token, playerId } = await registerAndLogin(app));
    setCoins(db, playerId, 500);
  });

  it('deducts coins and returns purchase', async () => {
    const res = await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });

    expect(res.status).toBe(201);
    const body = await json<{ purchase: Record<string, unknown>; remaining_coins: number }>(res);
    expect(body.purchase['itemId']).toBe(itemId);
    expect(body.purchase['playerId']).toBe(playerId);
    expect(body.remaining_coins).toBe(400); // 500 - 100
  });

  it('rejects duplicate purchase', async () => {
    await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });

    const res = await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });

    expect(res.status).toBe(409);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/already purchased/i);
  });

  it('rejects purchase when insufficient coins', async () => {
    setCoins(db, playerId, 50); // less than priceCoins (100)

    const res = await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });

    expect(res.status).toBe(402);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/insufficient/i);
  });

  it('returns 401 without token', async () => {
    const res = await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 404 for nonexistent item', async () => {
    const res = await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: 'no-such-item' }),
    });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /api/store/my-items
// ---------------------------------------------------------------------------

describe('GET /api/store/my-items', () => {
  let app: Hono;
  let token: string;
  let playerId: string;
  let itemId: string;
  let db: TestDb;

  beforeEach(async () => {
    const setup = setupWithItem({ priceCoins: 100 });
    app = setup.app;
    db = setup.db;
    itemId = setup.itemId;
    ({ token, playerId } = await registerAndLogin(app));
    setCoins(db, playerId, 500);
  });

  it('returns empty list when nothing purchased', async () => {
    const res = await app.request('/api/store/my-items', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await json<{ purchases: unknown[] }>(res);
    expect(body.purchases).toHaveLength(0);
  });

  it('returns purchased items after a purchase', async () => {
    await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });

    const res = await app.request('/api/store/my-items', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await json<{ purchases: Array<Record<string, unknown>> }>(res);
    expect(body.purchases).toHaveLength(1);
    expect(body.purchases[0]!['itemId']).toBe(itemId);
  });

  it('returns 401 without token', async () => {
    const res = await app.request('/api/store/my-items');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/store/equip
// ---------------------------------------------------------------------------

describe('PUT /api/store/equip', () => {
  let app: Hono;
  let token: string;
  let playerId: string;
  let itemId: string;
  let db: TestDb;

  beforeEach(async () => {
    const setup = setupWithItem({ category: 'borders', priceCoins: 100 });
    app = setup.app;
    db = setup.db;
    itemId = setup.itemId;
    ({ token, playerId } = await registerAndLogin(app));
    setCoins(db, playerId, 500);

    // Purchase the item so it can be equipped
    await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
  });

  it('equips owned item to a slot', async () => {
    const res = await app.request('/api/store/equip', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: 'border', item_id: itemId }),
    });

    expect(res.status).toBe(200);
    const body = await json<{ equipped: Record<string, unknown> }>(res);
    expect(body.equipped['slot']).toBe('border');
    expect(body.equipped['itemId']).toBe(itemId);
  });

  it('replaces previously equipped item in same slot', async () => {
    // Seed and purchase a second item
    db.insert(storeItems).values({ id: 'item-2', name: 'Border 2', description: 'desc', category: 'borders', priceCoins: 50, active: true }).run();
    setCoins(db, playerId, 500);
    await app.request('/api/store/purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: 'item-2' }),
    });

    // Equip first item
    await app.request('/api/store/equip', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: 'border', item_id: itemId }),
    });

    // Equip second item to same slot — should replace
    const res = await app.request('/api/store/equip', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: 'border', item_id: 'item-2' }),
    });

    expect(res.status).toBe(200);
    const body = await json<{ equipped: Record<string, unknown> }>(res);
    expect(body.equipped['itemId']).toBe('item-2');
  });

  it('rejects equip for unowned item', async () => {
    db.insert(storeItems).values({ id: 'unowned-item', name: 'Unowned', description: 'desc', category: 'borders', priceCoins: 999, active: true }).run();

    const res = await app.request('/api/store/equip', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: 'border', item_id: 'unowned-item' }),
    });

    expect(res.status).toBe(403);
    const body = await json<{ error: string }>(res);
    expect(body.error).toMatch(/not owned/i);
  });

  it('returns 401 without token', async () => {
    const res = await app.request('/api/store/equip', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: 'border', item_id: itemId }),
    });
    expect(res.status).toBe(401);
  });
});
