import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../utils/jwt.js';

type AuthVariables = {
  playerId: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authorization = c.req.header('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authorization.slice(7);
    try {
      const payload = await verifyToken(token);
      c.set('playerId', payload.playerId);
      await next();
    } catch {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  },
);
