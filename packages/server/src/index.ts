import { Hono } from 'hono';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './db/schema.js';
import { db as defaultDb } from './db/connection.js';
import { createAuthRouter } from './routes/auth.js';
import { createProfileRouter } from './routes/profile.js';
import { createSessionRouter, createScoreRouter } from './routes/sessions.js';
import { createLeaderboardRouter } from './routes/leaderboard.js';
import { authMiddleware } from './middleware/auth.js';
import { createCorsMiddleware } from './middleware/cors.js';
import { createRateLimiter } from './middleware/rateLimit.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;

export function createApp(db: DB = defaultDb): Hono {
  const app = new Hono();

  // CORS middleware (must be first)
  app.use(createCorsMiddleware());

  // Rate limiter: 100 requests per minute (60000 ms) per IP
  app.use(createRateLimiter({ windowMs: 60000, max: 100 }));

  app.get('/api/health', (c) => c.json({ status: 'ok' }));

  // Auth routes (public)
  app.route('/api/auth', createAuthRouter(db));

  // Profile routes
  app.route('/api/profile', createProfileRouter(db));

  // Session & score routes
  app.route('/api/sessions', createSessionRouter(db));
  app.route('/api/scores', createScoreRouter(db));

  // Leaderboard routes
  app.route('/api/leaderboard', createLeaderboardRouter(db));

  // Example protected route — demonstrates authMiddleware usage
  app.get('/api/me', authMiddleware, (c) => {
    const playerId = c.get('playerId');
    return c.json({ playerId });
  });

  return app;
}

const app = createApp();
export default app;

// Export rate limiter for granular use
export { createRateLimiter } from './middleware/rateLimit.js';
