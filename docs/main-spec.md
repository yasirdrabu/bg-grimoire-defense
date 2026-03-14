# CLAUDE.md — Grimoire Defense

## Project Identity

**Grimoire Defense** is a browser-based tower defense game where players defend a Nexus against enemies drawn from Tolkien, the Wizarding World, and Westeros. Towers shape enemy pathing (hybrid maze-builder). Dual currency (Gold + Essence), branching upgrades with cross-universe fusion, and a multi-layered competitive scoring engine.

This file is the authoritative build guide. Read it fully before any task.

See also: `docs/specs/2026-03-14-gameplay-rendering-design.md` for the gameplay rendering spec — isometric rendering pipeline, scene management, camera/input, per-frame game loop, enemy movement, and visual feedback systems.

---

## Tech Stack

### Frontend (Game Client)
- **Engine**: Phaser 3.80+ (WebGL primary, Canvas fallback)
- **Language**: TypeScript 5.x (strict mode)
- **Bundler**: Vite 6 with code splitting per Act/biome
- **State**: Zustand for UI state, Phaser registry for game-world state
- **Audio**: Howler.js (wraps Web Audio API with HTML5 fallback)
- **Pathfinding**: pathfinding.js (A* on grid) running in a Web Worker
- **UI Overlay**: Preact (lightweight React-compatible) for HUD, menus, leaderboards — mounted on top of the Phaser canvas via DOM overlay
- **Styling**: TailwindCSS v4 for all UI overlay components
- **Animation**: Spine runtime for Phaser (tower/boss anims) + Phaser particle emitters

### Backend (Lightweight Services)
- **Runtime**: Node.js 22 + Hono (ultralight web framework)
- **Database**: SQLite via better-sqlite3 (single-file, zero-ops for MVP) — migration path to Turso (libSQL) for production
- **Auth**: Simple JWT with email/password + optional OAuth (Google, Discord) via arctic library
- **Session**: Stateless JWT — no server-side sessions
- **Hosting**: Single VPS (Hetzner/Fly.io) or Cloudflare Workers + D1 for production
- **API Style**: REST with JSON. No GraphQL.

### Monorepo Structure
```
grimoire-defense/
├── CLAUDE.md                    # THIS FILE
├── package.json                 # Workspace root
├── turbo.json                   # Turborepo config
├── packages/
│   ├── shared/                  # Shared types, constants, game data
│   │   ├── src/
│   │   │   ├── types/           # TypeScript interfaces shared across client & server
│   │   │   │   ├── tower.ts
│   │   │   │   ├── enemy.ts
│   │   │   │   ├── level.ts
│   │   │   │   ├── score.ts
│   │   │   │   ├── player.ts
│   │   │   │   └── fusion.ts
│   │   │   ├── data/            # Game data as typed constants (towers, enemies, levels, fusions)
│   │   │   │   ├── towers.ts
│   │   │   │   ├── enemies.ts
│   │   │   │   ├── levels.ts
│   │   │   │   ├── fusions.ts
│   │   │   │   └── scoring.ts
│   │   │   ├── constants.ts     # Grid sizes, currency caps, timing constants, tile dimensions (TILE_W, TILE_H), rendering constants (FLYING_DEPTH_OFFSET)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── client/                  # Phaser game + Preact UI
│   │   ├── src/
│   │   │   ├── main.ts          # Entry point — boot Phaser, mount Preact overlay
│   │   │   ├── game/
│   │   │   │   ├── config.ts    # Phaser game config
│   │   │   │   ├── scenes/
│   │   │   │   │   ├── BootScene.ts         # Asset preloading, splash
│   │   │   │   │   ├── HubScene.ts          # Campaign map + tab navigation (profile, grimoire, store, leaderboard)
│   │   │   │   │   ├── GameScene.ts         # THE core gameplay scene (isometric renderer)
│   │   │   │   │   ├── BossIntroScene.ts    # Cinematic boss entrance overlay
│   │   │   │   │   └── ScoreBreakdownScene.ts # Post-level scoring screen
│   │   │   │   ├── ecs/
│   │   │   │   │   ├── components/          # ECS components
│   │   │   │   │   │   ├── Position.ts
│   │   │   │   │   │   ├── Health.ts
│   │   │   │   │   │   ├── Movement.ts
│   │   │   │   │   │   ├── Attack.ts
│   │   │   │   │   │   ├── TowerData.ts
│   │   │   │   │   │   ├── EnemyData.ts
│   │   │   │   │   │   ├── Renderable.ts
│   │   │   │   │   │   └── StatusEffects.ts
│   │   │   │   │   ├── systems/             # ECS systems (run each frame, see gameplay-rendering-spec for execution order)
│   │   │   │   │   │   ├── InputSystem.ts       # Drains Zustand action queue
│   │   │   │   │   │   ├── WaveSystem.ts
│   │   │   │   │   │   ├── MovementSystem.ts
│   │   │   │   │   │   ├── TargetingSystem.ts
│   │   │   │   │   │   ├── AttackSystem.ts
│   │   │   │   │   │   ├── ProjectileSystem.ts
│   │   │   │   │   │   ├── StatusEffectSystem.ts
│   │   │   │   │   │   ├── DeathSystem.ts
│   │   │   │   │   │   ├── NexusSystem.ts       # Nexus HP deduction, game-over check
│   │   │   │   │   │   ├── ScoreSystem.ts
│   │   │   │   │   │   └── RenderSystem.ts      # Y-sort, sprite sync, health bars
│   │   │   │   │   └── World.ts             # ECS world container
│   │   │   │   ├── towers/
│   │   │   │   │   ├── TowerFactory.ts      # Creates tower entities from data
│   │   │   │   │   ├── TowerPlacement.ts    # Placement validation + ghost preview
│   │   │   │   │   ├── TowerUpgrade.ts      # Upgrade + branch logic
│   │   │   │   │   └── FusionEngine.ts      # Adjacency check, recipe lookup, hybrid spawn
│   │   │   │   ├── enemies/
│   │   │   │   │   ├── EnemyFactory.ts      # Creates enemy entities from wave data
│   │   │   │   │   ├── EnemyAI.ts           # FSM for enemy behaviors
│   │   │   │   │   └── BossAI.ts            # Multi-phase boss state machines
│   │   │   │   ├── pathfinding/
│   │   │   │   │   ├── PathWorker.ts        # Web Worker for A* computation
│   │   │   │   │   ├── PathManager.ts       # Cache, invalidation, request queue
│   │   │   │   │   └── pathfinding.worker.ts # The actual worker script
│   │   │   │   ├── economy/
│   │   │   │   │   ├── GoldManager.ts       # Gold earn/spend/interest
│   │   │   │   │   └── EssenceManager.ts    # Essence earn/spend
│   │   │   │   ├── scoring/
│   │   │   │   │   ├── ComboTracker.ts      # Chain kill detection (1.5s window)
│   │   │   │   │   ├── SpeedBonus.ts        # Par time tracking per wave
│   │   │   │   │   ├── StylePoints.ts       # Fusion kills, snipes, overkill
│   │   │   │   │   └── ScoreAggregator.ts   # Final score computation
│   │   │   │   ├── vfx/
│   │   │   │   │   ├── ParticlePresets.ts   # Fire, ice, magic, holy particle configs
│   │   │   │   │   ├── ScreenShake.ts
│   │   │   │   │   └── DamageNumbers.ts     # Floating damage text
│   │   │   │   └── audio/
│   │   │   │       ├── AudioManager.ts      # Howler.js wrapper, spatial audio
│   │   │   │       └── MusicLayers.ts       # Dynamic music intensity
│   │   │   ├── ui/                          # Preact overlay components
│   │   │   │   ├── App.tsx                  # Root Preact app
│   │   │   │   ├── hud/
│   │   │   │   │   ├── TopBar.tsx           # Wave, score, HP, currencies
│   │   │   │   │   ├── TowerPanel.tsx       # Build menu (right side)
│   │   │   │   │   ├── WavePreview.tsx      # Bottom bar upcoming enemies
│   │   │   │   │   ├── SpeedControls.tsx    # 1x/2x/3x + pause
│   │   │   │   │   ├── TowerInfo.tsx        # Selected tower details
│   │   │   │   │   └── ComboDisplay.tsx     # Combo multiplier popup
│   │   │   │   ├── hub/                   # HubScene tab panels (Preact overlays)
│   │   │   │   │   ├── LevelDetail.tsx    # Level info panel on node click
│   │   │   │   │   ├── Settings.tsx       # Settings modal overlay
│   │   │   │   │   ├── Leaderboard.tsx
│   │   │   │   │   └── Profile.tsx
│   │   │   │   ├── grimoire/
│   │   │   │   │   ├── GrimoireBook.tsx     # Collection / encyclopedia
│   │   │   │   │   └── FusionLog.tsx        # Discovered fusions
│   │   │   │   ├── store/
│   │   │   │   │   ├── CosmeticStore.tsx    # Skins, themes, etc.
│   │   │   │   │   └── SeasonPass.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       ├── Tooltip.tsx
│   │   │   │       └── ParchmentPanel.tsx   # Themed container
│   │   │   ├── stores/                      # Zustand stores
│   │   │   │   ├── useGameStore.ts          # Gold, essence, wave, score
│   │   │   │   ├── usePlayerStore.ts        # Profile, settings, unlocks
│   │   │   │   └── useUIStore.ts            # Panel visibility, selections
│   │   │   ├── api/
│   │   │   │   └── client.ts               # Fetch wrapper for backend API
│   │   │   └── assets/                      # Asset manifests (actual files in public/)
│   │   │       └── manifest.ts
│   │   ├── public/
│   │   │   ├── sprites/                     # TexturePacker atlases per biome
│   │   │   │   ├── middle-earth/
│   │   │   │   ├── wizarding/
│   │   │   │   └── westeros/
│   │   │   ├── tilemaps/                    # Tiled JSON exports per level
│   │   │   ├── audio/
│   │   │   │   ├── music/
│   │   │   │   └── sfx/
│   │   │   └── ui/                          # UI textures (parchment, frames)
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── server/                  # Lightweight backend
│       ├── src/
│       │   ├── index.ts         # Hono app entry, middleware, routes
│       │   ├── db/
│       │   │   ├── schema.ts    # SQLite schema (Drizzle ORM definitions)
│       │   │   ├── migrate.ts   # Migration runner
│       │   │   └── seed.ts      # Seed data (levels, store items)
│       │   ├── routes/
│       │   │   ├── auth.ts      # POST /auth/register, /auth/login, /auth/refresh
│       │   │   ├── profile.ts   # GET/PUT /profile, GET /profile/:id
│       │   │   ├── leaderboard.ts # GET /leaderboard/:levelId, GET /leaderboard/campaign
│       │   │   ├── scores.ts    # POST /scores (submit), GET /scores/my
│       │   │   ├── sessions.ts  # POST /sessions/start, PUT /sessions/:id/end
│       │   │   ├── store.ts     # GET /store/items, POST /store/purchase
│       │   │   ├── grimoire.ts  # GET /grimoire (unlocked fusions, bestiary)
│       │   │   └── health.ts    # GET /health
│       │   ├── middleware/
│       │   │   ├── auth.ts      # JWT verification middleware
│       │   │   ├── rateLimit.ts # Simple in-memory rate limiter
│       │   │   └── cors.ts
│       │   ├── services/
│       │   │   ├── ScoreService.ts     # Score validation + anti-cheat
│       │   │   ├── LeaderboardService.ts
│       │   │   ├── SessionService.ts
│       │   │   ├── StoreService.ts
│       │   │   └── ProfileService.ts
│       │   └── utils/
│       │       ├── jwt.ts
│       │       ├── hash.ts      # Password hashing (bcrypt)
│       │       └── anticheat.ts # Score hash validation
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── tools/
│   ├── level-editor/            # (Future) Custom Tiled integration scripts
│   └── sprite-pipeline/         # TexturePacker CLI scripts
│
├── .github/
│   └── workflows/
│       ├── ci.yml               # Lint, typecheck, test
│       └── deploy.yml           # Build + deploy
├── .env.example
├── .gitignore
└── README.md
```

---

## Architecture Principles

1. **Shared types are the contract.** All interfaces in `packages/shared/src/types/` are the single source of truth for both client and server. Never duplicate type definitions.

2. **Game data is code, not config files.** Tower stats, enemy stats, level definitions, fusion recipes — all live as typed TypeScript constants in `packages/shared/src/data/`. This means compile-time validation of all game balance data.

3. **ECS for game entities, FSM for complex behaviors.** Enemies and towers are ECS entities (data-oriented, system-driven). Boss AI and multi-phase enemies use finite state machines composed as ECS components.

4. **Pathfinding never blocks the main thread.** All A* computation runs in a Web Worker. The PathManager on the main thread queues requests, caches results, and invalidates on tower placement changes.

5. **Preact overlay for all UI.** The Phaser canvas handles the game world exclusively. All HUD, menus, tooltips, and panels are Preact components rendered in a DOM layer above the canvas. Communication between Phaser and Preact is via Zustand stores (Phaser writes to store, Preact reads reactively).

6. **Backend is deliberately minimal.** SQLite for storage, Hono for routing, JWT for auth. No ORM magic — Drizzle is used for schema definition and type-safe queries only. The server does four things: auth, profiles, leaderboards, and store purchases. Game logic lives entirely on the client.

---

## Database Schema

```sql
-- Players
CREATE TABLE players (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  title TEXT DEFAULT 'Apprentice',           -- cosmetic title
  border_style TEXT DEFAULT 'default',       -- leaderboard border cosmetic
  coins INTEGER DEFAULT 0,                   -- premium currency (real money)
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Player progress (per-level best scores and stars)
CREATE TABLE player_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  level_id TEXT NOT NULL,                    -- matches level key in shared/data
  best_score INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,                   -- 0-4 (4 = perfect)
  best_combo INTEGER DEFAULT 0,
  best_speed_bonus REAL DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  fastest_clear_ms INTEGER,
  completed_at TEXT,
  UNIQUE(player_id, level_id)
);

-- Fusion discoveries (per player)
CREATE TABLE fusion_discoveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  fusion_id TEXT NOT NULL,                   -- matches fusion key in shared/data
  discovered_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, fusion_id)
);

-- Game sessions (tracks active and completed games)
CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  player_id TEXT NOT NULL REFERENCES players(id),
  level_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',              -- active | completed | abandoned
  started_at TEXT DEFAULT (datetime('now')),
  ended_at TEXT,
  duration_ms INTEGER,
  waves_completed INTEGER DEFAULT 0,
  total_waves INTEGER,

  -- Scoring breakdown (populated on completion)
  base_score INTEGER DEFAULT 0,
  combo_score INTEGER DEFAULT 0,
  speed_score INTEGER DEFAULT 0,
  style_score INTEGER DEFAULT 0,
  perfect_wave_bonus INTEGER DEFAULT 0,
  nexus_health_bonus INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,

  -- Anti-cheat
  score_hash TEXT,                            -- HMAC of score components
  client_version TEXT,

  -- Gameplay stats
  towers_built INTEGER DEFAULT 0,
  towers_fused INTEGER DEFAULT 0,
  enemies_killed INTEGER DEFAULT 0,
  gold_earned INTEGER DEFAULT 0,
  essence_earned INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  nexus_hp_remaining INTEGER DEFAULT 0
);

-- Leaderboard (materialized from game_sessions for fast reads)
CREATE TABLE leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  level_id TEXT NOT NULL,                    -- 'campaign' for total
  score INTEGER NOT NULL,
  rank INTEGER,                              -- computed on insert/update
  session_id TEXT REFERENCES game_sessions(id),
  achieved_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, level_id)
);
CREATE INDEX idx_leaderboard_level_score ON leaderboard(level_id, score DESC);
CREATE INDEX idx_leaderboard_player ON leaderboard(player_id);

-- Store items (cosmetics catalog)
CREATE TABLE store_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,                    -- tower_skin | map_theme | border | title | season_pass
  price_coins INTEGER NOT NULL,              -- premium currency cost
  preview_image_url TEXT,
  metadata TEXT,                             -- JSON blob for item-specific data
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Player purchases
CREATE TABLE player_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  item_id TEXT NOT NULL REFERENCES store_items(id),
  purchased_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, item_id)
);

-- Player equipped cosmetics
CREATE TABLE player_equipped (
  player_id TEXT NOT NULL REFERENCES players(id),
  slot TEXT NOT NULL,                        -- tower_skin:<tower_id> | map_theme | border | title
  item_id TEXT NOT NULL REFERENCES store_items(id),
  PRIMARY KEY(player_id, slot)
);
```

---

## API Routes

### Auth
```
POST   /api/auth/register      { email, username, password } → { token, player }
POST   /api/auth/login          { email, password }           → { token, player }
POST   /api/auth/refresh        { token }                     → { token }
```

### Profile
```
GET    /api/profile             → { player, progress[], fusions[], equipped }
PUT    /api/profile             { display_name?, avatar_url? } → { player }
GET    /api/profile/:id         → { player (public fields), progress[], stats }
```

### Scores & Sessions
```
POST   /api/sessions/start      { level_id }                  → { session_id }
PUT    /api/sessions/:id/end    { score_breakdown, stats, score_hash } → { session, leaderboard_rank? }
GET    /api/scores/my            ?level_id=                    → { sessions[] }
```

### Leaderboard
```
GET    /api/leaderboard/:levelId ?page=&limit=                → { entries[], total, player_rank? }
GET    /api/leaderboard/campaign ?page=&limit=                → { entries[], total, player_rank? }
```

### Store
```
GET    /api/store/items          ?category=                    → { items[] }
POST   /api/store/purchase       { item_id }                   → { purchase, remaining_coins }
GET    /api/store/my-items                                     → { purchases[] }
PUT    /api/store/equip          { slot, item_id }             → { equipped }
```

### Grimoire
```
GET    /api/grimoire                                           → { discovered_fusions[], bestiary_progress }
POST   /api/grimoire/discover    { fusion_id }                 → { discovery, essence_bonus }
```

---

## Anti-Cheat Strategy

Since the game runs client-side, we cannot prevent cheating entirely. The strategy is **deterrence + detection**:

1. **Score Hash**: When a session ends, the client computes an HMAC-SHA256 of the score components using a rotating salt derived from the session ID:
   ```
   hash = HMAC(session_id + base_score + combo_score + speed_score + style_score + waves + duration, SECRET)
   ```
   The server recomputes and compares. Mismatches flag the score for review.

2. **Plausibility Checks**: The server validates that:
   - `duration_ms` is >= minimum possible clear time for the level
   - `enemies_killed` matches expected count for `waves_completed`
   - `max_combo` is <= `enemies_killed`
   - `total_score` is <= theoretical maximum for the level
   - `towers_built` is > 0

3. **Session Binding**: Scores can only be submitted against an active session that was started via API. Sessions auto-expire after 1 hour.

4. **Rate Limiting**: Max 1 score submission per minute per player. Max 10 sessions per hour.

---

## Phaser ↔ Preact Communication

```typescript
// Zustand store acts as the bridge
// packages/client/src/stores/useGameStore.ts

interface GameStore {
  // State (written by Phaser systems, read by Preact)
  gold: number;
  essence: number;
  wave: number;
  totalWaves: number;
  nexusHP: number;
  maxNexusHP: number;
  score: number;
  comboCount: number;
  comboMultiplier: number;
  gameSpeed: 1 | 2 | 3;
  isPaused: boolean;
  selectedTowerId: string | null;

  // Actions (called by Preact, consumed by Phaser)
  setGameSpeed: (speed: 1 | 2 | 3) => void;
  togglePause: () => void;
  selectTower: (id: string | null) => void;
  requestBuildTower: (towerType: string, gridX: number, gridY: number) => void;
  requestUpgradeTower: (towerId: string, branch: 'A' | 'B') => void;
  requestSellTower: (towerId: string) => void;
  requestFusion: (towerIdA: string, towerIdB: string) => void;
  sendWaveEarly: () => void;
}

// Phaser GameScene reads action queue each frame:
// if (store.getState().pendingActions.length > 0) { processActions(); }
```

---

## Build Phases — What to Build and When

### Phase 1: Foundation (Week 1-2)
**Goal**: Playable grid with one tower, one enemy, pathfinding.

Build order:
1. Monorepo setup: `pnpm` workspaces, Turborepo, shared tsconfig
2. `packages/shared`: Define `Tower`, `Enemy`, `Level`, `Score` types. Add data for 1 tower (Elven Archer Spire) and 1 enemy (Orc Grunt)
3. `packages/client`: Phaser boilerplate — BootScene loads a placeholder tilemap, GameScene renders a 20x15 isometric grid (128×64 tiles, see gameplay rendering spec for coordinate system and render layers)
4. Pathfinding Web Worker: Implement A* grid, PathManager with cache invalidation
5. Tower placement: Click grid → validate (path still exists?) → place tower → enemies repath
6. Enemy spawning: Simple wave of 10 Orc Grunts walking the shortest path
7. Targeting + attack: Tower picks nearest enemy in range, fires projectile, enemy takes damage and dies
8. Nexus HP: Enemies that reach the end reduce HP. HP hits 0 → game over

**Checkpoint**: A single-screen tower defense prototype. One tower type, one enemy type, functional maze-building.

### Phase 2: Core Systems (Week 3-4)
**Goal**: Full economy, upgrades, scoring, multiple towers and enemies.

Build order:
1. Gold economy: Earn on kill, spend to build, interest per wave, sell for 75% refund
2. Essence economy: Earn on boss kill, perfect wave, combos
3. All 5 Middle-earth towers with Tier 1-2 upgrades
4. All 5 Middle-earth enemies with abilities (Enrage, Tower Smash, Fear Aura)
5. Wave system: Defined waves per level with enemy composition, spawn timing, par times
6. Scoring engine: ComboTracker, SpeedBonus, StylePoints, ScoreAggregator
7. Preact HUD: TopBar (gold, essence, wave, score, HP), TowerPanel (build menu), WavePreview

**Checkpoint**: Act 1 Level 1 ("The Shire Falls") is fully playable with scoring.

### Phase 3: Upgrade Branches & Fusion (Week 5-6)
**Goal**: Full upgrade tree, fusion system, all Act 1 content.

Build order:
1. Tier 3 branching upgrade paths for all Middle-earth towers
2. Fusion engine: Adjacency detection, recipe lookup table, hybrid tower spawning
3. First 3 fusion recipes (Middle-earth + placeholder cross-universe)
4. Fusion discovery animation + Grimoire entry
5. Levels 2-5 of Act 1 with distinct tilemaps, wave compositions, and the Balrog boss
6. Boss AI: Multi-phase FSM for Balrog (fire trail → flight phase)
7. Post-level ScoreBreakdownScene with star ratings

**Checkpoint**: Full Act 1 (5 levels) playable with upgrades, fusion, boss fights, and scoring.

### Phase 4: Backend + Persistence (Week 7-8)
**Goal**: Server running, auth working, scores saved, leaderboards live.

Build order:
1. `packages/server`: Hono app, SQLite setup, Drizzle schema, migrations
2. Auth routes: register, login, JWT issuance/refresh
3. Profile routes: read/update profile, track progress
4. Session routes: start session, end session with score submission
5. Score validation service with anti-cheat checks
6. Leaderboard routes: per-level and campaign, with player rank
7. Client API layer: fetch wrapper with JWT auth headers
8. Connect client flow: login → play → submit score → see leaderboard

**Checkpoint**: Persistent player profiles, score submission, leaderboards.

### Phase 5: Acts 2 & 3 (Week 9-12)
**Goal**: Full 18-level campaign.

Build order:
1. Wizarding World: 5 towers, 5 enemies, Basilisk + Voldemort bosses
2. Levels 7-11 (Act 2) with unique mechanics (fog of war, multi-path, underground)
3. Westeros: 5 towers, 5 enemies, White Walker + Night King bosses
4. Levels 13-17 (Act 3) with unique mechanics (split path, resurrection, vertical map)
5. Convergence levels 6, 12, 18 with mixed enemies and mandatory fusion
6. All 30+ fusion recipes
7. Full Grimoire encyclopedia

**Checkpoint**: Complete campaign. All towers, enemies, fusions, levels.

### Phase 6: Store, Polish, Launch (Week 13-16)
**Goal**: Cosmetics store, audio, VFX polish, production deployment.

Build order:
1. Store backend: item catalog, purchase flow, equip system
2. Store UI: CosmeticStore, SeasonPass components
3. Audio: Howler.js integration, biome music tracks, SFX per tower/enemy, dynamic boss music
4. VFX polish: Particle presets for all damage types, screen shake, damage numbers
5. Boss cinematic intros (BossIntroScene)
6. Accessibility: colorblind mode, keyboard shortcuts, UI scale
7. Performance optimization: texture atlases, particle pooling, draw call batching
8. Production deployment: Fly.io (server), Cloudflare Pages (client), asset CDN
9. Lighthouse audit, load time optimization, code splitting verification

**Checkpoint**: Launch-ready product.

---

## Key Implementation Details

### Pathfinding Web Worker

```typescript
// packages/client/src/game/pathfinding/pathfinding.worker.ts
import { Grid, AStarFinder } from 'pathfinding';

self.onmessage = (e: MessageEvent) => {
  const { id, gridData, startX, startY, endX, endY } = e.data;
  const grid = new Grid(gridData);           // 0 = walkable, 1 = blocked
  const finder = new AStarFinder({ allowDiagonal: false });
  const path = finder.findPath(startX, startY, endX, endY, grid);
  self.postMessage({ id, path });
};
```

PathManager on main thread maintains a request queue and path cache keyed by `(startX,startY,endX,endY,gridVersion)`. Grid version increments on every tower place/sell. Stale cache entries are evicted on version change.

### Tower Placement Validation

Before placing a tower:
1. Check cell is empty and not on spawn/nexus
2. Temporarily mark cell as blocked in a cloned grid
3. Run pathfinding from every spawn point to nexus on the cloned grid
4. If ANY spawn has no valid path → reject placement, show red indicator
5. If all spawns have valid paths → commit placement, increment grid version, broadcast repath to all enemies

### Combo Tracking

```typescript
class ComboTracker {
  private kills: number[] = [];  // timestamps of recent kills
  private readonly WINDOW = 1500; // 1.5 seconds

  onKill(timestamp: number): { combo: number; multiplier: number } {
    this.kills = this.kills.filter(t => timestamp - t < this.WINDOW);
    this.kills.push(timestamp);
    const combo = this.kills.length;
    const multiplier =
      combo >= 50 ? 10 :
      combo >= 25 ? 5 :
      combo >= 10 ? 3 :
      combo >= 5 ? 2 : 1;
    return { combo, multiplier };
  }
}
```

### Boss FSM Example (Balrog)

```typescript
enum BalrogPhase { WALKING, FIRE_TRAIL, FLIGHT, DEATH }

class BalrogAI {
  phase = BalrogPhase.WALKING;
  hp: number;
  maxHp: number;

  update(dt: number) {
    switch (this.phase) {
      case BalrogPhase.WALKING:
        this.followPath(dt);
        this.leaveFireTrail();
        if (this.hp < this.maxHp * 0.5) {
          this.phase = BalrogPhase.FLIGHT;
          this.triggerFlightAnimation();
        }
        break;
      case BalrogPhase.FLIGHT:
        this.flyPattern(dt);          // circular/figure-8 above the map
        this.fireBreathAttack();       // damages towers below
        // Only air-targeting towers can hit during this phase
        break;
    }
  }
}
```

---

## Conventions

### Code Style
- **No `any`**. Use `unknown` + type guards if type is truly unknown.
- **No default exports** except for Preact page components.
- **Barrel exports** via `index.ts` in each directory.
- **Naming**: PascalCase for types/classes/components, camelCase for functions/variables, SCREAMING_SNAKE for constants.
- **File naming**: PascalCase for classes/components (`TowerFactory.ts`), camelCase for utilities (`anticheat.ts`).

### Git
- **Branch naming**: `feat/tower-fusion`, `fix/pathfinding-cache`, `chore/vite-upgrade`
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `perf:`, `test:`)
- **PR scope**: One feature or fix per PR. Keep PRs under 500 lines when possible.

### Testing
- **Unit tests**: Vitest for all `packages/shared` data validation, scoring math, pathfinding logic
- **Integration tests**: Vitest + Supertest for all API routes
- **No E2E in MVP**: Visual game testing is manual. Add Playwright for menu flows post-launch.

### Performance Budgets
- **Initial JS bundle**: < 300KB gzipped (excluding assets)
- **Per-biome asset pack**: < 5MB (lazy loaded)
- **Frame budget**: 16.6ms (60 FPS). Pathfinding must complete in < 5ms for 30x20 grid.
- **API response time**: < 100ms p95 for all endpoints

---

## Environment Variables

```env
# Server
PORT=3001
DATABASE_URL=./data/grimoire.db
JWT_SECRET=<random-64-char-hex>
SCORE_HMAC_SECRET=<random-64-char-hex>
CORS_ORIGIN=http://localhost:5173

# Client (prefixed VITE_)
VITE_API_URL=http://localhost:3001/api
VITE_GAME_VERSION=0.1.0
```

---

## Asset Pipeline

### Sprites
- Author in Aseprite or Photoshop at 2x resolution
- Export to TexturePacker → JSON hash atlas + PNG spritesheet
- Place in `packages/client/public/sprites/<biome>/`
- Reference via Phaser's atlas loader in BootScene

### Tilemaps
- Design in Tiled Map Editor (free)
- Export as JSON with embedded tilesets
- Place in `packages/client/public/tilemaps/`
- Each level has one tilemap JSON + one tileset PNG

### Audio
- Music: OGG Vorbis primary, MP3 fallback
- SFX: WebM (Opus) primary, MP3 fallback
- Use Howler.js sprite sheets for SFX (many sounds in one file, offset-based playback)

---

## Quick Start Commands

```bash
# Install
pnpm install

# Dev (runs client + server concurrently)
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Test
pnpm test

# Lint
pnpm lint

# Database reset
pnpm --filter server db:reset

# Database migrate
pnpm --filter server db:migrate
```
