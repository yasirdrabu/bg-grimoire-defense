import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// players
// ---------------------------------------------------------------------------
export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  title: text('title'),
  borderStyle: text('border_style'),
  coins: integer('coins').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

// ---------------------------------------------------------------------------
// player_progress
// ---------------------------------------------------------------------------
export const playerProgress = sqliteTable('player_progress', {
  id: text('id').primaryKey(),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  levelId: text('level_id').notNull(),
  difficulty: text('difficulty').notNull(),
  bestScore: integer('best_score').notNull().default(0),
  stars: integer('stars').notNull().default(0),
  bestCombo: integer('best_combo').notNull().default(0),
  bestSpeedBonus: integer('best_speed_bonus').notNull().default(0),
  timesCompleted: integer('times_completed').notNull().default(0),
  fastestClearMs: integer('fastest_clear_ms'),
  completedAt: text('completed_at'),
});

// ---------------------------------------------------------------------------
// fusion_discoveries
// ---------------------------------------------------------------------------
export const fusionDiscoveries = sqliteTable('fusion_discoveries', {
  id: text('id').primaryKey(),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  fusionId: text('fusion_id').notNull(),
  discoveredAt: text('discovered_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

// ---------------------------------------------------------------------------
// game_sessions
// ---------------------------------------------------------------------------
export const gameSessions = sqliteTable('game_sessions', {
  id: text('id').primaryKey(),
  playerId: text('player_id').references(() => players.id, {
    onDelete: 'set null',
  }),
  levelId: text('level_id').notNull(),
  difficulty: text('difficulty').notNull(),
  status: text('status').notNull().default('in_progress'),
  startedAt: text('started_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  endedAt: text('ended_at'),
  durationMs: integer('duration_ms'),
  wavesCompleted: integer('waves_completed').notNull().default(0),
  totalWaves: integer('total_waves').notNull().default(0),
  baseScore: integer('base_score').notNull().default(0),
  comboScore: integer('combo_score').notNull().default(0),
  speedScore: integer('speed_score').notNull().default(0),
  styleScore: integer('style_score').notNull().default(0),
  perfectWaveBonus: integer('perfect_wave_bonus').notNull().default(0),
  nexusHealthBonus: integer('nexus_health_bonus').notNull().default(0),
  totalScore: integer('total_score').notNull().default(0),
  scoreHash: text('score_hash'),
  clientVersion: text('client_version'),
  towersBuilt: integer('towers_built').notNull().default(0),
  towersFused: integer('towers_fused').notNull().default(0),
  enemiesKilled: integer('enemies_killed').notNull().default(0),
  goldEarned: integer('gold_earned').notNull().default(0),
  essenceEarned: integer('essence_earned').notNull().default(0),
  maxCombo: integer('max_combo').notNull().default(0),
  nexusHpRemaining: integer('nexus_hp_remaining').notNull().default(0),
});

// ---------------------------------------------------------------------------
// leaderboard
// ---------------------------------------------------------------------------
export const leaderboard = sqliteTable(
  'leaderboard',
  {
    id: text('id').primaryKey(),
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    levelId: text('level_id').notNull(),
    difficulty: text('difficulty').notNull(),
    score: integer('score').notNull(),
    rank: integer('rank'),
    sessionId: text('session_id').references(() => gameSessions.id, {
      onDelete: 'set null',
    }),
    achievedAt: text('achieved_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (table) => [
    index('idx_leaderboard_level_score').on(
      table.levelId,
      table.difficulty,
      table.score,
    ),
    index('idx_leaderboard_player').on(table.playerId),
  ],
);

// ---------------------------------------------------------------------------
// store_items
// ---------------------------------------------------------------------------
export const storeItems = sqliteTable('store_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  priceCoins: integer('price_coins').notNull(),
  previewImageUrl: text('preview_image_url'),
  metadata: text('metadata'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

// ---------------------------------------------------------------------------
// player_purchases
// ---------------------------------------------------------------------------
export const playerPurchases = sqliteTable('player_purchases', {
  id: text('id').primaryKey(),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  itemId: text('item_id')
    .notNull()
    .references(() => storeItems.id, { onDelete: 'cascade' }),
  purchasedAt: text('purchased_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

// ---------------------------------------------------------------------------
// player_equipped
// ---------------------------------------------------------------------------
export const playerEquipped = sqliteTable('player_equipped', {
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  slot: text('slot').notNull(),
  itemId: text('item_id')
    .notNull()
    .references(() => storeItems.id, { onDelete: 'cascade' }),
});
