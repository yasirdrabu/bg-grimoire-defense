import { Hono } from 'hono';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { leaderboard, players } from '../db/schema.js';
import { verifyToken } from '../utils/jwt.js';

type Schema = typeof schema;
type DB = BetterSQLite3Database<Schema>;

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;

function parsePagination(
  pageStr: string | undefined,
  limitStr: string | undefined,
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
  const limit = Math.min(
    MAX_PAGE_LIMIT,
    Math.max(1, parseInt(limitStr ?? String(DEFAULT_PAGE_LIMIT), 10) || DEFAULT_PAGE_LIMIT),
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/** Attempt to extract playerId from Authorization header without enforcing it. */
async function optionalPlayerId(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const payload = await verifyToken(authHeader.slice(7));
    return payload.playerId;
  } catch {
    return null;
  }
}

export function createLeaderboardRouter(db: DB): Hono {
  const router = new Hono();

  // GET /api/leaderboard/campaign?difficulty=normal&page=1&limit=20
  // This must be defined before /:levelId to avoid matching "campaign" as a level id
  router.get('/campaign', async (c) => {
    const difficulty = c.req.query('difficulty') ?? 'normal';
    const { page, limit, offset } = parsePagination(
      c.req.query('page'),
      c.req.query('limit'),
    );

    // Sum best scores per player for the given difficulty across all levels
    const campaignRows = db
      .select({
        playerId: leaderboard.playerId,
        totalScore: sql<number>`SUM(${leaderboard.score})`.as('total_score'),
        displayName: players.displayName,
        username: players.username,
        avatarUrl: players.avatarUrl,
        title: players.title,
        borderStyle: players.borderStyle,
      })
      .from(leaderboard)
      .innerJoin(players, eq(leaderboard.playerId, players.id))
      .where(eq(leaderboard.difficulty, difficulty))
      .groupBy(leaderboard.playerId)
      .orderBy(desc(sql`SUM(${leaderboard.score})`))
      .all();

    const total = campaignRows.length;
    const paged = campaignRows.slice(offset, offset + limit);

    const entries = paged.map((row, idx) => ({
      rank: offset + idx + 1,
      player_id: row.playerId,
      display_name: row.displayName,
      username: row.username,
      avatar_url: row.avatarUrl,
      title: row.title,
      border_style: row.borderStyle,
      score: row.totalScore,
    }));

    // Optional: player's own rank
    const authHeader = c.req.header('Authorization');
    const playerId = await optionalPlayerId(authHeader);

    let playerRank: number | null = null;
    if (playerId) {
      const playerRow = campaignRows.findIndex((r) => r.playerId === playerId);
      if (playerRow !== -1) {
        playerRank = playerRow + 1;
      }
    }

    return c.json({ entries, total, page, limit, player_rank: playerRank });
  });

  // GET /api/leaderboard/:levelId?difficulty=normal&page=1&limit=20
  router.get('/:levelId', async (c) => {
    const levelId = c.req.param('levelId');
    const difficulty = c.req.query('difficulty') ?? 'normal';
    const { page, limit, offset } = parsePagination(
      c.req.query('page'),
      c.req.query('limit'),
    );

    const countRows = db
      .select({ total: count() })
      .from(leaderboard)
      .where(
        and(
          eq(leaderboard.levelId, levelId),
          eq(leaderboard.difficulty, difficulty),
        ),
      )
      .all();

    const total = countRows[0]?.total ?? 0;

    const rows = db
      .select({
        id: leaderboard.id,
        playerId: leaderboard.playerId,
        score: leaderboard.score,
        rank: leaderboard.rank,
        sessionId: leaderboard.sessionId,
        achievedAt: leaderboard.achievedAt,
        displayName: players.displayName,
        username: players.username,
        avatarUrl: players.avatarUrl,
        title: players.title,
        borderStyle: players.borderStyle,
      })
      .from(leaderboard)
      .innerJoin(players, eq(leaderboard.playerId, players.id))
      .where(
        and(
          eq(leaderboard.levelId, levelId),
          eq(leaderboard.difficulty, difficulty),
        ),
      )
      .orderBy(desc(leaderboard.score))
      .limit(limit)
      .offset(offset)
      .all();

    const entries = rows.map((row, idx) => ({
      rank: offset + idx + 1,
      player_id: row.playerId,
      display_name: row.displayName,
      username: row.username,
      avatar_url: row.avatarUrl,
      title: row.title,
      border_style: row.borderStyle,
      score: row.score,
      session_id: row.sessionId,
      achieved_at: row.achievedAt,
    }));

    // Optional: player's own rank
    const authHeader = c.req.header('Authorization');
    const playerId = await optionalPlayerId(authHeader);

    let playerRank: number | null = null;
    if (playerId) {
      const allRows = db
        .select({ playerId: leaderboard.playerId, score: leaderboard.score })
        .from(leaderboard)
        .where(
          and(
            eq(leaderboard.levelId, levelId),
            eq(leaderboard.difficulty, difficulty),
          ),
        )
        .orderBy(desc(leaderboard.score))
        .all();

      const idx = allRows.findIndex((r) => r.playerId === playerId);
      if (idx !== -1) {
        playerRank = idx + 1;
      }
    }

    return c.json({ entries, total, page, limit, player_rank: playerRank });
  });

  return router;
}
