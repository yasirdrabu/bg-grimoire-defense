import { cors } from 'hono/cors';

export function createCorsMiddleware() {
  const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  return cors({ origin, credentials: true });
}
