/**
 * Seed script — inserts default store items and a development test player.
 * Run with: pnpm --filter @grimoire/server db:seed
 * Safe to re-run; uses INSERT OR IGNORE.
 */
import { db } from './connection.js';
import { storeItems, players } from './schema.js';

// ---------------------------------------------------------------------------
// Default store items (cosmetics)
// ---------------------------------------------------------------------------
const defaultStoreItems: (typeof storeItems.$inferInsert)[] = [
  {
    id: 'item_avatar_wizard',
    name: 'Wizard Avatar',
    description: 'A classic pointy-hat wizard portrait.',
    category: 'avatar',
    priceCoins: 500,
    previewImageUrl: null,
    metadata: JSON.stringify({ universe: 'tolkien' }),
    active: true,
  },
  {
    id: 'item_avatar_dragonrider',
    name: 'Dragon Rider Avatar',
    description: 'A rider atop a crimson dragon.',
    category: 'avatar',
    priceCoins: 750,
    previewImageUrl: null,
    metadata: JSON.stringify({ universe: 'westeros' }),
    active: true,
  },
  {
    id: 'item_border_golden',
    name: 'Golden Border',
    description: 'A shimmering gold frame for your profile card.',
    category: 'border',
    priceCoins: 300,
    previewImageUrl: null,
    metadata: JSON.stringify({ rarity: 'rare' }),
    active: true,
  },
  {
    id: 'item_border_arcane',
    name: 'Arcane Border',
    description: 'Pulsing arcane energy surrounds your profile.',
    category: 'border',
    priceCoins: 1000,
    previewImageUrl: null,
    metadata: JSON.stringify({ rarity: 'epic', animated: true }),
    active: true,
  },
  {
    id: 'item_title_archmage',
    name: 'Archmage',
    description: 'Display the title "Archmage" beneath your name.',
    category: 'title',
    priceCoins: 200,
    previewImageUrl: null,
    metadata: null,
    active: true,
  },
  {
    id: 'item_title_nexus_guardian',
    name: 'Nexus Guardian',
    description: 'Display the title "Nexus Guardian" — earned by the elite.',
    category: 'title',
    priceCoins: 1500,
    previewImageUrl: null,
    metadata: JSON.stringify({ prestige: true }),
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Development test player
// ---------------------------------------------------------------------------
const devPlayer: typeof players.$inferInsert = {
  id: 'player_dev_001',
  email: 'dev@grimoire.local',
  username: 'devplayer',
  // bcrypt hash of "password" — only used in development
  passwordHash:
    '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cgrlyTr59CPBM.o0N.LXURW',
  displayName: 'Dev Player',
  coins: 9999,
};

// ---------------------------------------------------------------------------
// Execute seed
// ---------------------------------------------------------------------------

// Insert store items — ignore conflicts so seed is idempotent
for (const item of defaultStoreItems) {
  db.insert(storeItems)
    .values(item)
    .onConflictDoNothing()
    .run();
}

// Insert dev player — ignore if already exists
db.insert(players)
  .values(devPlayer)
  .onConflictDoNothing()
  .run();

console.log(`Seeded ${defaultStoreItems.length} store items and 1 dev player.`);
