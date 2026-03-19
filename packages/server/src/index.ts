import { Hono } from 'hono';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './db/schema.js';
import { db as defaultDb } from './db/connection.js';
import { createAuthRouter } from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;

export function createApp(db: DB = defaultDb): Hono {
  const app = new Hono();

  app.get('/api/health', (c) => c.json({ status: 'ok' }));

  // Auth routes (public)
  const authRouter = createAuthRouter(db);
  app.route('/api/auth', authRouter);

  // Example protected route — demonstrates authMiddleware usage
  app.get('/api/me', authMiddleware, (c) => {
    const playerId = c.get('playerId');
    return c.json({ playerId });
  });

  return app;
}

const app = createApp();
export default app;
