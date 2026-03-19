import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env['JWT_SECRET'] ?? 'dev-secret-change-me',
);
const TOKEN_EXPIRY = '24h';

export async function signToken(playerId: string): Promise<string> {
  return new SignJWT({ playerId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ playerId: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  if (typeof payload['playerId'] !== 'string') {
    throw new Error('Invalid token payload');
  }
  return { playerId: payload['playerId'] };
}
