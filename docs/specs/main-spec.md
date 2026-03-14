# Grimoire Defense — Architecture & Game Design Spec

## Project Identity

**Grimoire Defense** is a browser-based isometric tower defense game where players defend a Nexus against enemies drawn from Tolkien, the Wizarding World, and Westeros. Towers shape enemy pathing (hybrid maze-builder). Dual currency (Gold + Essence), branching upgrades with cross-universe fusion, and a multi-layered competitive scoring engine.

This file is the authoritative build guide. Read it fully before any task.

See also: `docs/specs/2026-03-14-gameplay-rendering-design.md` for the gameplay rendering spec — isometric rendering pipeline, scene management, camera/input, per-frame game loop, enemy movement, and visual feedback systems.

---

## Tech Stack

### Frontend (Game Client)

- **Engine**: Phaser 3.80+ (WebGL primary, Canvas fallback)
- **Language**: TypeScript 5.x (strict mode)
- **Bundler**: Vite 6 with code splitting per Act/biome
- **State**: Zustand for UI-facing state projections; ECS components are source of truth for in-game entity state
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

```text
grimoire-defense/
├── package.json                 # Workspace root
├── turbo.json                   # Turborepo config
├── packages/
│   ├── shared/                  # Shared types, constants, game data, scoring logic
│   │   ├── src/
│   │   │   ├── types/           # TypeScript interfaces shared across client & server
│   │   │   │   ├── tower.ts
│   │   │   │   ├── enemy.ts
│   │   │   │   ├── level.ts
│   │   │   │   ├── score.ts
│   │   │   │   ├── player.ts
│   │   │   │   ├── fusion.ts
│   │   │   │   └── ecs.ts       # Entity, Component, System, World interfaces
│   │   │   ├── data/            # Game data as typed constants (towers, enemies, levels, fusions)
│   │   │   │   ├── towers.ts
│   │   │   │   ├── enemies.ts
│   │   │   │   ├── levels.ts
│   │   │   │   ├── fusions.ts
│   │   │   │   └── scoring.ts
│   │   │   ├── logic/           # Pure game logic (Phaser-free, testable, shared with server)
│   │   │   │   ├── ComboTracker.ts
│   │   │   │   ├── ScoreAggregator.ts
│   │   │   │   ├── GoldManager.ts
│   │   │   │   └── EssenceManager.ts
│   │   │   ├── constants.ts     # Grid sizes, currency caps, timing, tile dimensions (TILE_W, TILE_H), FLYING_DEPTH_OFFSET
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
│   │   │   │   │   ├── HubScene.ts          # Campaign map (Phaser canvas) + tab navigation (Preact overlays)
│   │   │   │   │   ├── GameScene.ts         # Core gameplay scene (isometric renderer)
│   │   │   │   │   ├── BossIntroScene.ts    # Cinematic boss entrance overlay
│   │   │   │   │   └── ScoreBreakdownScene.ts # Post-level scoring screen
│   │   │   │   ├── ecs/
│   │   │   │   │   ├── types.ts             # Entity ID type, Component interface, System interface
│   │   │   │   │   ├── World.ts             # ECS world: entity registry, component stores, query engine
│   │   │   │   │   ├── components/          # ECS components (plain data objects)
│   │   │   │   │   │   ├── Position.ts
│   │   │   │   │   │   ├── Health.ts
│   │   │   │   │   │   ├── Movement.ts
│   │   │   │   │   │   ├── Attack.ts
│   │   │   │   │   │   ├── TowerData.ts
│   │   │   │   │   │   ├── EnemyData.ts
│   │   │   │   │   │   ├── Renderable.ts    # Holds Phaser Sprite reference
│   │   │   │   │   │   ├── Projectile.ts     # Target ID, speed, damage, effect
│   │   │   │   │   │   ├── StatusEffects.ts
│   │   │   │   │   │   └── BossPhase.ts     # FSM state for boss entities
│   │   │   │   │   └── systems/             # ECS systems (see gameplay-rendering-spec for execution order)
│   │   │   │   │       ├── InputSystem.ts       # Drains Zustand action queue
│   │   │   │   │       ├── WaveSystem.ts
│   │   │   │   │       ├── MovementSystem.ts
│   │   │   │   │       ├── TargetingSystem.ts
│   │   │   │   │       ├── AttackSystem.ts
│   │   │   │   │       ├── ProjectileSystem.ts
│   │   │   │   │       ├── StatusEffectSystem.ts
│   │   │   │   │       ├── DeathSystem.ts
│   │   │   │   │       ├── NexusSystem.ts
│   │   │   │   │       ├── ScoreSystem.ts
│   │   │   │   │       └── RenderSystem.ts      # ONLY system that touches Phaser
│   │   │   │   ├── towers/
│   │   │   │   │   ├── TowerFactory.ts
│   │   │   │   │   ├── TowerPlacement.ts
│   │   │   │   │   ├── TowerUpgrade.ts
│   │   │   │   │   └── FusionEngine.ts
│   │   │   │   ├── enemies/
│   │   │   │   │   ├── EnemyFactory.ts
│   │   │   │   │   └── EnemyAI.ts
│   │   │   │   ├── pathfinding/
│   │   │   │   │   ├── PathManager.ts       # Cache, invalidation, request queue, debounce
│   │   │   │   │   ├── pathfinding.worker.ts
│   │   │   │   │   └── protocol.ts          # Typed worker message protocol
│   │   │   │   ├── economy/
│   │   │   │   │   ├── GoldManager.ts       # Delegates to shared/logic/GoldManager
│   │   │   │   │   └── EssenceManager.ts
│   │   │   │   ├── scoring/
│   │   │   │   │   ├── SpeedBonus.ts
│   │   │   │   │   └── StylePoints.ts
│   │   │   │   ├── vfx/
│   │   │   │   │   ├── ParticlePresets.ts
│   │   │   │   │   ├── ScreenShake.ts
│   │   │   │   │   └── DamageNumbers.ts
│   │   │   │   └── audio/
│   │   │   │       ├── AudioManager.ts
│   │   │   │       └── MusicLayers.ts
│   │   │   ├── ui/                          # Preact overlay components
│   │   │   │   ├── App.tsx
│   │   │   │   ├── hud/
│   │   │   │   │   ├── TopBar.tsx
│   │   │   │   │   ├── TowerPanel.tsx
│   │   │   │   │   ├── WavePreview.tsx
│   │   │   │   │   ├── SpeedControls.tsx
│   │   │   │   │   ├── TowerInfo.tsx
│   │   │   │   │   └── ComboDisplay.tsx
│   │   │   │   ├── hub/
│   │   │   │   │   ├── LevelDetail.tsx
│   │   │   │   │   ├── Settings.tsx
│   │   │   │   │   ├── Leaderboard.tsx
│   │   │   │   │   └── Profile.tsx
│   │   │   │   ├── grimoire/
│   │   │   │   │   ├── GrimoireBook.tsx
│   │   │   │   │   └── FusionLog.tsx
│   │   │   │   ├── store/
│   │   │   │   │   ├── CosmeticStore.tsx
│   │   │   │   │   └── SeasonPass.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       ├── Tooltip.tsx
│   │   │   │       └── ParchmentPanel.tsx
│   │   │   ├── stores/                      # Zustand stores (derived projections of ECS state)
│   │   │   │   ├── useGameStore.ts
│   │   │   │   ├── usePlayerStore.ts
│   │   │   │   └── useUIStore.ts
│   │   │   ├── api/
│   │   │   │   └── client.ts
│   │   │   └── assets/
│   │   │       └── manifest.ts
│   │   ├── public/
│   │   │   ├── sprites/                     # TexturePacker atlases per biome
│   │   │   │   ├── middle-earth/
│   │   │   │   ├── wizarding/
│   │   │   │   └── westeros/
│   │   │   ├── tilemaps/
│   │   │   ├── audio/
│   │   │   │   ├── music/
│   │   │   │   └── sfx/
│   │   │   └── ui/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── server/
│       ├── src/
│       │   ├── index.ts
│       │   ├── db/
│       │   │   ├── schema.ts
│       │   │   ├── migrate.ts
│       │   │   └── seed.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── profile.ts
│       │   │   ├── leaderboard.ts
│       │   │   ├── scores.ts
│       │   │   ├── sessions.ts
│       │   │   ├── store.ts
│       │   │   ├── grimoire.ts
│       │   │   └── health.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── rateLimit.ts
│       │   │   └── cors.ts
│       │   ├── services/
│       │   │   ├── ScoreService.ts     # Uses shared/logic/ScoreAggregator for validation
│       │   │   ├── LeaderboardService.ts
│       │   │   ├── SessionService.ts
│       │   │   ├── StoreService.ts
│       │   │   └── ProfileService.ts
│       │   └── utils/
│       │       ├── jwt.ts
│       │       ├── hash.ts
│       │       └── anticheat.ts
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── tools/
│   ├── level-editor/
│   └── sprite-pipeline/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Architecture Principles

1. **Shared types are the contract.** All interfaces in `packages/shared/src/types/` are the single source of truth for both client and server. Never duplicate type definitions.

2. **Game data is code, not config files.** Tower stats, enemy stats, level definitions, fusion recipes — all live as typed TypeScript constants in `packages/shared/src/data/`. Compile-time validation of all game balance data.

3. **ECS for game entities, FSM for complex behaviors.** Enemies and towers are ECS entities (data-oriented, system-driven). Boss AI uses FSM state stored as a `BossPhase` ECS component — not standalone OOP classes. All systems except RenderSystem are Phaser-free and unit-testable.

4. **Pathfinding never blocks the main thread.** All A* computation runs in a Web Worker via a typed message protocol. PathManager queues requests, caches results, and invalidates on tower placement changes.

5. **Preact overlay for all non-game-world UI.** The Phaser canvas renders the game world and the HubScene campaign map. All HUD, menus, tooltips, and panels are Preact components in a DOM layer above the canvas. Communication is via Zustand stores (ECS systems project state to Zustand; Preact reads reactively).

6. **Backend is deliberately minimal.** SQLite for storage, Hono for routing, JWT for auth. Drizzle for schema definition and type-safe queries only. The server does four things: auth, profiles, leaderboards, and store purchases. Game logic lives entirely on the client. Scoring logic lives in `packages/shared/src/logic/` so the server can reuse it for anti-cheat validation.

---

## ECS Contract

Custom lightweight ECS — no framework dependency. At this scale (hundreds of entities, not thousands), simplicity beats performance optimization.

```typescript
// packages/shared/src/types/ecs.ts

type EntityId = number;

// Components are plain data objects — no methods, no Phaser dependencies
interface Position { gridX: number; gridY: number; }
interface Health { current: number; max: number; }
interface Movement { speed: number; path: [number, number][]; pathIndex: number; slowMultiplier: number; gridVersion: number; }
interface Projectile { targetId: EntityId; speed: number; damage: number; damageType: string; statusEffect?: { type: string; duration: number; magnitude: number }; }
// ... etc

// World owns component stores and provides queries
interface World {
  createEntity(): EntityId;
  destroyEntity(id: EntityId): void;
  addComponent<T>(id: EntityId, type: ComponentType<T>, data: T): void;
  getComponent<T>(id: EntityId, type: ComponentType<T>): T | undefined;
  removeComponent<T>(id: EntityId, type: ComponentType<T>): void;
  query(...types: ComponentType[]): EntityId[];  // returns entities that have ALL listed components
}

// Systems are functions, not classes. All except RenderSystem are Phaser-free.
type System = (world: World, dt: number) => void;
```

**Component storage**: `Map<EntityId, ComponentData>` per component type. Simple and sufficient for this entity count.

**Phaser integration**: The `Renderable` component holds a `Phaser.GameObjects.Sprite` reference. Only `RenderSystem` reads this component — it syncs ECS `Position` to Phaser sprite screen coordinates and manages depth sorting. All other systems operate on pure data components.

---

## State Ownership

Three state domains with clear ownership:

| Domain | Owner | Purpose |
|--------|-------|---------|
| Entity state | ECS components | Position, health, attack cooldowns, status effects — all in-game entity data |
| Game session state | Zustand `useGameStore` | Derived projections: gold, essence, wave, score, nexusHP. Written by ScoreSystem/WaveSystem/NexusSystem each frame. Read by Preact. |
| Player meta state | Zustand `usePlayerStore` | Profile, settings, unlocks, equipped cosmetics. Persists across scenes. Synced with server API. |
| UI state | Zustand `useUIStore` | Panel visibility, selected tower, build mode, hover state. Ephemeral. |

**Action queue**: Preact → Phaser communication uses a typed action queue in `useGameStore`:

```typescript
type GameAction =
  | { type: 'BUILD_TOWER'; towerType: string; gridX: number; gridY: number }
  | { type: 'UPGRADE_TOWER'; towerId: string; branch: 'A' | 'B' }
  | { type: 'SELL_TOWER'; towerId: string }
  | { type: 'FUSE_TOWERS'; towerIdA: string; towerIdB: string }
  | { type: 'SEND_WAVE_EARLY' }
  | { type: 'SET_SPEED'; speed: 1 | 2 | 3 }
  | { type: 'TOGGLE_PAUSE' };

interface GameStore {
  // Projected state (written by ECS systems, read by Preact)
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

  // Action queue (written by Preact, drained by InputSystem)
  pendingActions: GameAction[];
  dispatch: (action: GameAction) => void;

  // Lifecycle
  resetGameState: () => void;  // called on GameScene.shutdown()
}
```

```typescript
// useUIStore — ephemeral UI state (see gameplay-rendering spec §3 for input states)
interface UIStore {
  inputMode: 'idle' | 'build' | 'selected';
  selectedTowerId: string | null;
  buildTowerType: string | null;
  hoveredEntityId: string | null;
  activeTab: 'none' | 'profile' | 'grimoire' | 'store' | 'leaderboard';
  showPathOverlay: boolean;
}
```

**Scene transitions**: `GameScene.shutdown()` calls `resetGameState()` to clear game-specific state. `ScoreBreakdownScene` captures score data before the reset by reading it during `GameScene`'s pre-shutdown phase. `usePlayerStore` persists across all scenes.

**Concurrency note**: Zustand's `set` is synchronous in Preact (not batched like React 18). Phaser's `InputSystem` reads `pendingActions` and clears it in the same RAF tick. No race conditions. If Preact is ever swapped for React, this assumption must be revisited.

---

## Game Economy

### Gold

| Parameter | Value | Notes |
|-----------|-------|-------|
| Starting gold | 650 (Act 1), 800 (Act 2), 1000 (Act 3) | Enough for 3 cheap + 1 medium tower |
| Kill gold | `enemy.goldReward` (defined per enemy type) | See enemy stat tables |
| Wave clear bonus | `25 + (waveIndex * 5)` | Escalating income |
| Interest per wave | 10% of banked gold, rounded down, capped at 50g | Applied at WAVE_CLEAR |
| Sell refund | 75% of total investment (base + all upgrades) | Essence spent on fusion is NOT refunded |
| Tower costs | See tower data tables below | |

**Economy invariant**: By end of Wave 3, a player who kills all enemies should afford their 4th tower. Work backward from tower costs to validate enemy gold rewards.

### Essence

| Source | Amount | Notes |
|--------|--------|-------|
| Boss kill | 50 (mid-boss), 100 (act boss) | Primary source |
| Perfect wave (no nexus damage) | 10 | Consistent drip |
| Combo of 25+ kills | 5 per occurrence | Skill reward |
| First fusion discovery | 25 (one-time) | Exploration incentive |

| Spending | Cost | Notes |
|----------|------|-------|
| Tier 3 branch upgrade | 50-100 per tower | Primary sink |
| Activate fusion | 25 per fusion | |
| Nexus Shield (active ability) | 100 | Blocks next 3 HP of nexus damage, once per level |

### Premium Currency (Coins)

Coins are **cosmetics-only** — no gameplay advantage. Earning path: first completion of each level = 10 coins, 4-star completion = 25 coins, weekly challenge = 50 coins. Real-money purchase available but never required.

---

## Tower Data Framework

Each universe has 5 towers following a cost/role archetype:

| Role | Base Cost | Description |
|------|-----------|-------------|
| Cheap DPS | 100g | Fast attack, low damage. Bread-and-butter tower. |
| Medium DPS | 200g | Balanced attack speed and damage. |
| Expensive DPS | 300g | Slow but heavy-hitting. High single-target damage. |
| Utility | 150g | Crowd control (slow, stun, debuff). Low damage. |
| Specialist | 250g | Unique mechanic (splash, chain lightning, buff aura). |

**Upgrade costs**: Tier 2 = 60% of base cost. Tier 3 branch = 100% of base cost + 50-100 Essence.

**Attack feedback**: Every tower has a `fireAnimation` (recoil frames, muzzle particle), a unique fire SFX, and a projectile type defined in tower data. Tier 3 towers trigger micro screen-shake (1-2px, 50ms) on heavy hits.

### Middle-earth Towers (Act 1)

| Tower | Role | Cost | Range | Attack Speed | Damage | Special |
|-------|------|------|-------|-------------|--------|---------|
| Elven Archer Spire | Cheap DPS | 100g | 4 tiles | 0.8s | 15 | Long range, fast shots. **Can target air.** |
| Gondorian Ballista | Expensive DPS | 300g | 3.5 tiles | 2.5s | 80 | Piercing (hits 2 enemies in line). Ground only. |
| Dwarven Cannon | Specialist | 250g | 3 tiles | 2.0s | 40 (splash) | 1.5-tile splash radius. Ground only. |
| Istari Crystal | Utility | 150g | 3 tiles | 1.5s | 10 | 30% slow for 2s. **Can target air.** |
| Ent Watchtower | Medium DPS | 200g | 2.5 tiles | 1.2s | 30 | Roots (brief stun) at Tier 2+. Ground only. |

`canTargetAir` defaults to `false`. Each universe should have at least 2 air-capable towers to ensure boss flight phases are winnable.

*(Wizarding World and Westeros towers follow the same archetype pattern — defined during Act 2/3 implementation.)*

---

## Enemy Data Framework

### Scaling Model

- Base stats defined per enemy type (HP, speed, gold reward)
- Per-level multiplier: `1 + (levelIndexWithinAct * 0.25)` — so Level 5 enemies have 2x the HP of Level 1 enemies
- Cross-act jump: 2x multiplier between acts (Act 2 enemies start at 2x Act 1 base, Act 3 at 4x)

### Middle-earth Enemies (Act 1)

| Enemy | Base HP | Speed | Gold Reward | Ability |
|-------|---------|-------|-------------|---------|
| Orc Grunt | 50 | 1.0 | 8g | None (tutorial enemy) |
| Goblin Runner | 30 | 1.8 | 6g | Fast, low HP |
| Uruk-hai Berserker | 120 | 0.7 | 15g | Enrage: +50% speed below 30% HP |
| Cave Troll | 300 | 0.4 | 25g | Tower Smash: disables a tower for 3s on passing |
| Nazgûl Shade | 80 | 1.2 | 20g | Fear Aura: reduces attack speed of nearby towers by 20% |

### Max Enemy Count

Target ceiling: 40 enemies alive simultaneously on regular waves, up to 60 on convergence levels. Steering separation is O(n²) but feasible up to ~100 enemies at <0.1ms per frame.

---

## Wave Composition

### Structure

| Act | Waves per Level | Target Level Duration |
|-----|----------------|----------------------|
| Act 1 (Levels 1-5) | 10-15 waves | 8-12 minutes |
| Act 2 (Levels 7-11) | 15-20 waves | 12-18 minutes |
| Act 3 (Levels 13-17) | 18-25 waves | 15-22 minutes |
| Convergence (6, 12, 18) | 20-25 waves | 20-25 minutes |

**Total campaign**: ~5-6 hours first playthrough.

### Wave Rhythm Template (12-wave level example)

| Waves | Pattern | Purpose |
|-------|---------|---------|
| 1-2 | Single enemy type, 8-10 enemies | Intro, establish economy |
| 3 | Mixed types, 12-15 enemies | First challenge |
| 4 | Fewer enemies (6-8), slightly tougher | Breather, encourage upgrades |
| 5-6 | Escalation, 15-20 enemies | Pressure ramp |
| 7 | Curveball (flying enemies or split spawn) | Force adaptation |
| 8 | Breather, 8-10 enemies | Recovery |
| 9-10 | Heavy assault, 25-30 enemies | Peak difficulty |
| 11 | Elite wave: few (3-5) but very strong enemies | DPS check |
| 12 | Boss + minion escort | Climax |

### Pre-Wave Countdown

Formula: `baseCountdown - (waveIndex * reductionPerWave)`, minimum 8 seconds.

| Act | Base Countdown | Reduction/Wave |
|-----|---------------|----------------|
| Act 1 | 25s | 1s |
| Act 2 | 20s | 1s |
| Act 3 | 15s | 0.5s |

Boss waves get a fixed 5-second countdown after BossIntroScene. Wave-clear pause: 2 seconds for interest calculation + gold popup, then immediately start next countdown.

---

## Boss Encounters

Each boss has a multi-phase FSM stored as a `BossPhase` ECS component. Bosses alter the battlefield — they are not just "big enemies with more HP."

### Act 1: Balrog (Level 5)

- **HP**: 2000 (base). **Phases**: 2.
- **Phase 1 (WALKING)**: Follows path. Leaves fire trail on cells it crosses — fire cells deal damage to towers and are unbuildable for 15 seconds. Player must adapt maze around burning cells.
- **Phase 2 (FLIGHT, at 50% HP)**: Flies in a figure-8 pattern above the map. Fire breath attack damages towers below. Only air-targeting towers can hit. Periodically lands (3s vulnerability window), then takes off again.
- **Reward**: 100 Essence + Grimoire hint for a fire-related fusion recipe.

### Act 2: Basilisk (Level 11 mid-boss)

- **HP**: 3500. **Phases**: 2.
- **Phase 1 (TUNNELING)**: Alternates between walking the path and burrowing underground (untargetable for 3s), emerging at a random point further along the path. Unpredictable positioning forces broad tower coverage.
- **Phase 2 (PETRIFY, at 40% HP)**: Petrify gaze — periodically targets the nearest tower and disables it for 5 seconds (stone VFX). Cycle: gaze charge-up (1.5s warning animation) → petrify → 8s cooldown.
- **Reward**: 50 Essence.

### Act 2: Voldemort (Level 12 Convergence)

- **HP**: 5000. **Phases**: 3.
- **Phase 1 (TELEPORT)**: Teleports between path waypoints every 4 seconds instead of walking. Immune to slow effects.
- **Phase 2 (HORCRUXES, at 60% HP)**: Gains a damage shield. Spawns 7 Horcrux minions (weak, 100HP each) that run toward the nexus. Each Horcrux killed removes one shield layer. Must kill all 7 to damage Voldemort again.
- **Phase 3 (DESPERATE, at 20% HP)**: Teleport frequency doubles. Casts Avada Kedavra at random towers (instant kill, 10s cooldown). Final push.
- **Reward**: 100 Essence + guaranteed fusion recipe unlock.

### Act 3: White Walker General (Level 17 mid-boss)

- **HP**: 6000. **Phases**: 2.
- **Phase 1 (RESURRECT)**: Walks the path with a resurrection aura — enemies that die within 2 tiles of the General are resurrected as undead versions with 50% HP. Also applies a 25% attack speed slow to towers within 2 tiles.
- **Phase 2 (ICE WALL, at 50% HP)**: Periodically freezes a row of cells, creating temporary walls (10s duration) that force path recalculation. Player must have alternative paths or enemies pile up.
- **Reward**: 50 Essence.

### Act 3: Night King (Level 18 Final Boss)

- **HP**: 8000. **Phases**: 3.
- **Phase 1 (CORRUPTION)**: Walks the path. Towers within 2 cells of the Night King's position become "corrupted" — they switch allegiance and attack other towers for 8 seconds, then revert. Forced sell-and-rebuild if corrupted towers are in critical positions.
- **Phase 2 (DRAGON, at 50% HP)**: Mounts an undead dragon and flies. Strafing ice breath along the path damages all enemies and towers in a line. Spawns wight minions from the air.
- **Phase 3 (LAST STAND, at 15% HP)**: Dismounts at the nexus location. Stops moving. Spawns waves of wights every 5 seconds. Must be killed before wights overwhelm the nexus. DPS race.
- **Reward**: 100 Essence + exclusive "Nightslayer" title cosmetic.

---

## Fusion System

### Adjacency Rules

- Fusion requires two towers of specific types at **Tier 2 or higher**, placed **orthogonally adjacent** (4-directional, not diagonal).
- Both towers are consumed. A single hybrid fusion tower spawns in the cell of the first tower. The other cell becomes empty.
- Fusion costs **25 Essence** to activate.
- Strategic tension: you sacrifice two functional towers and a buildable cell for one powerful hybrid.

### Discovery

Three discovery vectors:

1. **Grimoire hints**: Undiscovered fusions appear as silhouetted entries with cryptic flavor text ("When the flame of Gondor meets the ice of the Wall…").
2. **Adjacency shimmer**: When two towers that *could* fuse are placed adjacent, a subtle particle connection appears between them. Clicking either tower shows a "Fuse" button.
3. **Boss rewards**: Defeating bosses reveals specific fusion hints in the Grimoire.

### Fusion Tiers

| Tier | Count | Power | Discovery |
|------|-------|-------|-----------|
| Intra-universe | 9 (3 per universe) | Moderate — strong within the biome | Easiest to discover, hinted in Grimoire from start |
| Cross-universe | 18 (pairs across 2 universes) | Powerful — unique attack patterns | Harder to discover, hints unlocked by boss kills |
| Convergence | 3 (one tower from each universe) | Game-changing — unique abilities | Only discoverable in Convergence levels (6, 12, 18) |

### What Makes Fusion Towers Special

Fusion towers are NOT "parent stats combined." Each has a **unique mechanic** unavailable on either parent:

| Archetype | Example | Mechanic |
|-----------|---------|----------|
| AoE Hybrid | Elven Archer + Dwarven Cannon | Explosive arrows — single-target projectiles that detonate on impact for splash damage |
| Burst Hybrid | Gondorian Ballista + Wizarding tower | Piercing spell bolt — passes through all enemies in a line, dealing full damage to each |
| CC Hybrid | Istari Crystal + Westeros tower | Frostfire field — creates a persistent AoE zone that slows and damages over time |
| Support Hybrid | Ent Watchtower + Wizarding tower | Enchanted canopy — buffs attack speed of all towers within 2-tile radius by 25% |

---

## Scoring System

### Star Rating

| Stars | Requirement |
|-------|-------------|
| 1 | Complete the level (nexus HP > 0) |
| 2 | Score ≥ 40% of level's theoretical maximum |
| 3 | Score ≥ 70% of theoretical maximum |
| 4 | Score ≥ 95% of theoretical maximum |

Star thresholds are displayed on the level detail panel so players know what to aim for.

### Score Components

**Base Score**: `enemies_killed * enemy_base_score_value` — defined per enemy type.

**Combo Score**: Kills within a 2.5-second window (game time, scales with game speed) chain into combos.

```typescript
// packages/shared/src/logic/ComboTracker.ts
const COMBO_WINDOW = 2500; // ms in game time

// Multiplier tiers
combo >= 50 → 10x
combo >= 25 → 5x
combo >= 10 → 3x
combo >= 5  → 2x
combo < 5   → 1x

// Combo break: when window expires without a kill, combo resets to 0.
// Visual: multiplier display shatters with a break SFX.
```

**Speed Bonus** (per wave): `max(0, (parTime - actualTime) / parTime * 1000)` points. Each wave has a `parTime` defined in level data. Sending next wave early adds remaining countdown seconds as bonus: `remainingCountdown * 10` points.

**Style Points**:

| Action | Points | Definition |
|--------|--------|------------|
| Fusion Kill | 50 | Kill with a fusion tower |
| Snipe | 25 | Kill enemy at >90% of tower's max range |
| Overkill | 10 | Deal ≥2x enemy's remaining HP in a single hit |
| First Blood | 30 | First kill of each wave |
| Clean Wave | 100 | No enemies reach nexus during this wave |
| Maze Master | 200/wave | Enemy path length > 200% of minimum possible path |

**Nexus Health Bonus**: `nexusHP_remaining / maxNexusHP * 500` — up to 500 points for a perfect nexus. `maxNexusHP` is difficulty-dependent (Story: 8, Normal: 5, Heroic: 3 — see "Difficulty Modes"). The ratio normalizes across difficulties, so Heroic players are not penalized for having fewer HP.

**Perfect Wave Bonus**: 50 points per wave where nexus takes zero damage (stacks with Clean Wave).

### Combo Display Escalation

| Combo Tier | Visual Treatment |
|------------|-----------------|
| 1-4 kills | White text, normal size |
| 5-9 kills (2x) | Yellow text, slightly larger |
| 10-24 kills (3x) | Orange text, pulsing |
| 25-49 kills (5x) | Red text, screen-edge glow |
| 50+ kills (10x) | Red + gold text, full screen border pulse, escalating SFX pitch |

Combo break: multiplier text shatters with a satisfying break sound. Motivates players to maintain chains.

---

## Tutorial & Onboarding

Three-level guided onboarding (Level 1-3 of Act 1):

### Level 1: "The Shire Falls" — Maze-Building

1. Forced placement: highlight a specific cell, prompt player to place an Elven Archer Spire
2. After placement, the enemy path visually updates — glowing trail shows the new route
3. Prompt second tower placement that creates a longer path
4. Text callout: "Enemies take the shortest path — shape their route with your towers!"
5. Remaining waves play freely with minimal enemies (Orc Grunts only)

### Level 2: "Bree Under Siege" — Economy & Upgrades

1. After Wave 2, prompt to upgrade a tower (upgrade UI highlights with tutorial arrow)
2. Interest mechanic explained via tooltip on gold counter: "Bank gold between waves to earn interest!"
3. Sell mechanic introduced when player runs low on gold

### Level 3: "Weathertop" — Fusion Introduction

1. Two specific tower types are required to be placed adjacent
2. Adjacency shimmer triggers → "Fuse" button appears → tutorial prompt explains fusion
3. Grimoire entry unlocked with animation
4. After Level 3, all tutorial scaffolding disappears permanently

### Path Visualization (always available)

- **Current path**: faint dotted line on the grid overlay showing where enemies will walk (toggleable via hotkey)
- **Build mode preview**: when ghost tower is positioned, a secondary path line shows where enemies *would* walk if the tower were placed. Updates in real-time as ghost moves.
- **Maze rating**: when enemy path exceeds 150% of minimum path length, a "Great Maze!" indicator appears briefly. Feeds into Maze Master style points.

---

## Difficulty Modes

Selected at level start. Affects enemy stats and starting resources, not wave composition.

| Mode | Enemy HP | Starting Gold | Nexus HP | Leaderboard |
|------|----------|---------------|----------|-------------|
| Story | 70% | +25% bonus | 8 | Shared |
| Normal | 100% | Baseline | 5 | Shared |
| Heroic | 130% | -10% | 3 | Separate (exclusive) |

Heroic mode gates exclusive cosmetics: "Heroic" border style and title unlocked on 4-star Heroic completions.

---

## Replay Systems

### Challenge Modifiers (per level, unlocked after first completion)

Each level has 2-3 optional modifiers. Completing with a modifier active earns a separate star rating and bonus coins.

Examples: "No Utility Towers", "Double Speed Enemies", "Limited Gold (50% starting)", "Fragile Nexus (1 HP)".

### Weekly Challenge

A specific level + preset modifier combination, rotated weekly. Separate weekly leaderboard. Completion awards 50 coins.

---

## Game Feel & Juice

### Tower Attack Feedback

Every tower has:
- Fire animation: recoil frames + muzzle particle preset (defined in tower data as `fireAnimation`)
- Unique fire SFX per tower type
- Tier 3 heavy hits: micro screen-shake (1-2px, 50ms)

### Kill Confirmation

- Per-enemy death animation (dissolve, collapse, boss explosion)
- Gold coin particle flies from death location toward the gold counter in HUD
- Kill SFX varies by enemy type
- Combo kills (3+): rising-pitch audio cue reinforcing the chain

### Wave Transitions

- Wave start: biome-specific horn/alarm SFX + "Wave X/Y" text pulse
- Wave clear: triumphant chime + gold interest popup animation ("+12 interest")

### Tower Upgrade Feedback

- Brief white flash → color-coded particle burst → sprite swap to upgraded version
- Branch A vs B have distinct visual language (e.g., blue vs red aura) so players can read their maze at a glance
- Satisfying "level up" SFX

---

## Anti-Cheat Strategy

Since the game runs client-side, we cannot prevent cheating entirely. The strategy is **deterrence + detection**:

1. **Score Validation (Server-Side)**: The client submits raw score components (base, combo, speed, style, etc.). The server recomputes the total using `shared/logic/ScoreAggregator` and compares. Additionally, the server computes `score_hash = HMAC-SHA256(SCORE_HMAC_SECRET, sessionId + "|" + totalScore)` and stores it in the `game_sessions` table — this is a server-side integrity seal, not a client-provided value. The client does NOT know `SCORE_HMAC_SECRET`. Mismatches between client-submitted total and server-computed total flag the score for review.

2. **Plausibility Checks**: The server validates that:
   - `duration_ms` >= minimum possible clear time for the level
   - `enemies_killed` matches expected count for `waves_completed`
   - `max_combo` <= `enemies_killed`
   - `total_score` <= theoretical maximum for the level
   - `towers_built` > 0

3. **Session Binding**: Scores can only be submitted against an active session started via API. Sessions auto-expire after 1 hour.

4. **Rate Limiting**: Max 1 score submission per minute per player. Max 10 sessions per hour.

---

## Pathfinding Web Worker Protocol

Typed message protocol between main thread and worker:

```typescript
// packages/client/src/game/pathfinding/protocol.ts

type WorkerRequest =
  | { id: number; type: 'FIND_PATH'; gridData: number[][]; startX: number; startY: number; endX: number; endY: number }
  | { id: number; type: 'VALIDATE_PLACEMENT'; gridData: number[][]; spawns: [number, number][]; nexus: [number, number] }
  | { id: number; type: 'BATCH_VALIDATE'; gridData: number[][]; cells: [number, number][]; spawns: [number, number][]; nexus: [number, number] };

type WorkerResponse =
  | { id: number; type: 'PATH_RESULT'; path: [number, number][] }
  | { id: number; type: 'VALIDATION_RESULT'; valid: boolean; paths: Record<string, [number, number][]> }
  | { id: number; type: 'BATCH_RESULT'; results: Record<string, boolean> }
  | { id: number; type: 'ERROR'; message: string };
```

**PathManager responsibilities**:
- Promise-based request map: `Map<number, { resolve, reject, timestamp }>`.
- Per-request timeout: 500ms. If a single request takes longer, its promise is rejected and logged as a warning. Enemies continue on their last known path.
- `onerror` handler on Worker instance. If worker crashes: terminate, spawn a new Worker, re-issue pending requests.
- `VALIDATE_PLACEMENT` batches all spawn-to-nexus checks in a single message so the worker reuses the grid instance.
- `BATCH_VALIDATE` pre-computes buildability for all candidate cells in one message. Used on build-mode enter (see gameplay-rendering spec §3 "Build-Mode Hover Optimization"). Returns `Record<string, boolean>` keyed by `"gridX,gridY"`.
- **Build-mode hover debounce**: mouse-to-grid conversion is debounced to 100ms. Hover lookups are O(1) from the `BATCH_VALIDATE` cache.

---

## Asset Loading Strategy

Three loading tiers:

| Tier | When | What | Target Size |
|------|------|------|-------------|
| Boot | BootScene.preload() | UI sprites, shared fonts, audio sprite manifests, hub map tileset | < 2MB |
| Level | Fade-to-black transition to GameScene | Biome sprite atlas + level tilemap + biome music | < 5MB per biome |
| On-demand | First access | Store item previews, profile avatars | Lazy |

**Loading UX**: During the fade-to-black transition, the screen stays black with a progress bar until all level assets are loaded. Only fade in once ready. No time-boxed fade.

**Asset retention**: After `GameScene.shutdown()`, biome assets stay cached for potential replay or same-biome next level. Only evict when a different biome loads (e.g., transitioning from Middle-earth to Wizarding World).

---

## Error Handling

### Network Failures

- Score submission failure: cache game session locally (localStorage). Queue submissions with exponential backoff retry. Show non-blocking "offline" indicator.
- Session start failure: allow offline play. Queue session creation. Scores submitted when connection restored.

### Web Worker Crash

- PathManager's `onerror` handler terminates the crashed worker, spawns a new one, re-issues pending requests.
- Watchdog timeout (2s): separate from the per-request 500ms timeout — fires if the worker has not responded to *any* message for 2 seconds, indicating a crash or hang. Terminate worker, spawn a new one, re-issue all pending requests.

### Asset Load Failure

- Use Phaser's `LoaderPlugin` error events. On failure for critical assets (tilemap, sprite atlas): show retry button.
- Non-critical failures (particles, audio): continue with fallback/placeholder. Log warning.

---

## Testing Strategy

### Testable Without Phaser

All ECS systems except RenderSystem accept a `World` interface with no Phaser dependency. This enables:

- **System unit tests**: Construct a World, add entities with known components, run a system with a fixed `dt`, assert resulting component state.
- **Integration tests**: Run the full system pipeline (INPUT → WAVE → MOVEMENT → ... → SCORE) on a mock World and validate end state.
- **Deterministic replay**: Given same initial state + same `dt` sequence, the game loop produces identical results.

### Test Targets

| Layer | Tool | What to Test |
|-------|------|-------------|
| `shared/logic` | Vitest | ComboTracker, ScoreAggregator, GoldManager, EssenceManager |
| `shared/data` | Vitest | Tower/enemy data validation, cost curve invariants, scaling model |
| ECS systems | Vitest | Each system in isolation with mock World |
| Pathfinding | Vitest | PathManager cache invalidation, worker protocol, edge cases |
| API routes | Vitest + Supertest | All endpoints, auth flow, score validation |
| Visual/E2E | Manual (MVP) | Add Playwright for menu flows post-launch |

---

## Database Schema

```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  title TEXT DEFAULT 'Apprentice',
  border_style TEXT DEFAULT 'default',
  coins INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE player_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  level_id TEXT NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  best_score INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  best_combo INTEGER DEFAULT 0,
  best_speed_bonus REAL DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  fastest_clear_ms INTEGER,
  completed_at TEXT,
  UNIQUE(player_id, level_id, difficulty)
);

CREATE TABLE fusion_discoveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  fusion_id TEXT NOT NULL,
  discovered_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, fusion_id)
);

CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  player_id TEXT NOT NULL REFERENCES players(id),
  level_id TEXT NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'active',
  started_at TEXT DEFAULT (datetime('now')),
  ended_at TEXT,
  duration_ms INTEGER,
  waves_completed INTEGER DEFAULT 0,
  total_waves INTEGER,

  base_score INTEGER DEFAULT 0,
  combo_score INTEGER DEFAULT 0,
  speed_score INTEGER DEFAULT 0,
  style_score INTEGER DEFAULT 0,
  perfect_wave_bonus INTEGER DEFAULT 0,
  nexus_health_bonus INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,

  score_hash TEXT,
  client_version TEXT,

  towers_built INTEGER DEFAULT 0,
  towers_fused INTEGER DEFAULT 0,
  enemies_killed INTEGER DEFAULT 0,
  gold_earned INTEGER DEFAULT 0,
  essence_earned INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  nexus_hp_remaining INTEGER DEFAULT 0
);

CREATE TABLE leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  level_id TEXT NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  score INTEGER NOT NULL,
  rank INTEGER,
  session_id TEXT REFERENCES game_sessions(id),
  achieved_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, level_id, difficulty)
);
CREATE INDEX idx_leaderboard_level_score ON leaderboard(level_id, difficulty, score DESC);
CREATE INDEX idx_leaderboard_player ON leaderboard(player_id);

CREATE TABLE store_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price_coins INTEGER NOT NULL,
  preview_image_url TEXT,
  metadata TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE player_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id),
  item_id TEXT NOT NULL REFERENCES store_items(id),
  purchased_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, item_id)
);

CREATE TABLE player_equipped (
  player_id TEXT NOT NULL REFERENCES players(id),
  slot TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES store_items(id),
  PRIMARY KEY(player_id, slot)
);
```

---

## API Routes

### Auth

```text
POST   /api/auth/register      { email, username, password } → { token, player }
POST   /api/auth/login          { email, password }           → { token, player }
POST   /api/auth/refresh        { token }                     → { token }
```

### Profile

```text
GET    /api/profile             → { player, progress[], fusions[], equipped }
PUT    /api/profile             { display_name?, avatar_url? } → { player }
GET    /api/profile/:id         → { player (public fields), progress[], stats }
```

### Scores & Sessions

```text
POST   /api/sessions/start      { level_id, difficulty }      → { session_id }
PUT    /api/sessions/:id/end    { score_breakdown, stats }    → { session, leaderboard_rank? }
GET    /api/scores/my            ?level_id=&difficulty=        → { sessions[] }
```

### Leaderboard

```text
GET    /api/leaderboard/:levelId ?difficulty=&page=&limit=    → { entries[], total, player_rank? }
GET    /api/leaderboard/campaign ?difficulty=&page=&limit=    → { entries[], total, player_rank? }
```

### Store

```text
GET    /api/store/items          ?category=                    → { items[] }
POST   /api/store/purchase       { item_id }                   → { purchase, remaining_coins }
GET    /api/store/my-items                                     → { purchases[] }
PUT    /api/store/equip          { slot, item_id }             → { equipped }
```

### Grimoire

```text
GET    /api/grimoire                                           → { discovered_fusions[], bestiary_progress }
POST   /api/grimoire/discover    { fusion_id }                 → { discovery, essence_bonus }
```

---

## Accessibility

Designed in from the start, not deferred to polish phase:

- **Color-independent information**: All color-coded elements (damage types, placement validity, status effects) have a secondary indicator (shape, icon, or pattern). Ghost placement uses checkmark/X icons in addition to green/red tint.
- **Keyboard shortcuts**: Number keys for tower selection, Q/E to cycle towers, Tab to cycle placed towers, Space to send wave early.
- **Reduced motion mode**: Disables screen shake, reduces particle density.
- **Game speed control**: 1x/2x/3x + pause serves as inherent motor accessibility.
- **UI scale**: Adjustable in settings (80%-120%).

---

## Build Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Playable grid with one tower, one enemy, pathfinding.

1. Monorepo setup: pnpm workspaces, Turborepo, shared tsconfig
2. `packages/shared`: ECS type interfaces, Tower/Enemy/Level/Score types, data for Elven Archer Spire + Orc Grunt, constants (tile dimensions, economy)
3. `packages/client`: Phaser boilerplate — BootScene, GameScene with 20×15 isometric grid (128×64 tiles) — prototype size; final maps scale up to 30×20 (see gameplay-rendering spec §2 for FLYING_DEPTH_OFFSET sizing)
4. ECS World + core components (Position, Health, Movement, Attack, TowerData, EnemyData, Renderable)
5. Pathfinding Web Worker with typed protocol, PathManager with cache
6. Tower placement with ghost preview + path validation
7. Enemy spawning: simple wave of 10 Orc Grunts with smooth movement + steering
8. Core systems: MovementSystem, TargetingSystem, AttackSystem, ProjectileSystem, DeathSystem, NexusSystem, RenderSystem
9. Nexus HP + game-over flow

**Checkpoint**: Single-screen isometric TD prototype. One tower, one enemy, maze-building, visible projectiles.

### Phase 2: Core Systems (Week 3-4)

**Goal**: Full economy, upgrades, scoring, multiple towers and enemies, HUD.

1. Gold economy (GoldManager in shared/logic): kill gold, interest, sell refund
2. Essence economy (EssenceManager in shared/logic): boss/perfect-wave/combo earning, spending
3. All 5 Middle-earth towers with Tier 1-2 upgrades + attack feedback (fire anim, SFX)
4. All 5 Middle-earth enemies with abilities
5. Wave system with defined compositions, countdown timer, early send
6. Scoring engine: ComboTracker, SpeedBonus, StylePoints, ScoreAggregator (in shared/logic)
7. Preact HUD: TopBar, TowerPanel, WavePreview, SpeedControls, ComboDisplay
8. Tutorial scaffolding for Levels 1-3

**Checkpoint**: Act 1 Level 1 ("The Shire Falls") fully playable with scoring and tutorial.

### Phase 3: Upgrade Branches & Fusion (Week 5-6)

**Goal**: Full upgrade tree, fusion system, all Act 1 content.

1. Tier 3 branching upgrade paths with distinct visual language (A vs B)
2. Fusion engine: adjacency detection (4-directional), recipe lookup, hybrid tower spawning, Essence cost
3. First 3 intra-universe fusion recipes for Middle-earth
4. Fusion discovery animation + Grimoire entry + adjacency shimmer
5. Levels 2-5 of Act 1 with distinct tilemaps, wave compositions
6. Balrog boss AI (fire trail + flight phase FSM as BossPhase component)
7. ScoreBreakdownScene with animated star ratings
8. HubScene with campaign map, level nodes, tab navigation
9. Difficulty mode selection on level start

**Checkpoint**: Full Act 1 (5 levels + convergence setup) playable with upgrades, fusion, boss, scoring, hub.

### Phase 4: Backend + Persistence (Week 7-8)

**Goal**: Server running, auth working, scores saved, leaderboards live.

1. `packages/server`: Hono app, SQLite, Drizzle schema, migrations
2. Auth routes with JWT
3. Profile routes with progress tracking
4. Session routes with server-side score validation (using shared ScoreAggregator)
5. Leaderboard routes (per-level, per-difficulty, campaign)
6. Client API layer with offline score caching + retry
7. Connect full flow: login → hub → play → submit → leaderboard

**Checkpoint**: Persistent profiles, scores, leaderboards, offline resilience.

### Phase 5: Acts 2 & 3 (Week 9-12)

**Goal**: Full 18-level campaign.

1. Wizarding World: 5 towers, 5 enemies, Basilisk + Voldemort bosses
2. Levels 7-11 (Act 2)
3. Westeros: 5 towers, 5 enemies, White Walker + Night King bosses
4. Levels 13-17 (Act 3)
5. Convergence levels 6, 12, 18 with mixed enemies and mandatory fusion
6. All 30 fusion recipes (9 intra + 18 cross + 3 convergence)
7. Full Grimoire encyclopedia
8. Challenge modifiers + weekly challenge system

**Checkpoint**: Complete campaign with all content and replay systems.

### Phase 6: Store, Polish, Launch (Week 13-16)

**Goal**: Cosmetics store, audio, VFX polish, production deployment.

1. Store backend + UI (CosmeticStore, SeasonPass)
2. Audio: biome music, SFX per tower/enemy, dynamic boss music, combo SFX
3. VFX polish: particle presets, screen shake, damage numbers, death animations, upgrade VFX
4. Kill confirmation juice: gold coin particles, wave transition fanfare, combo escalation
5. Boss cinematic intros (BossIntroScene)
6. Accessibility audit: color-independence verification, keyboard nav, reduced motion
7. Performance: texture atlases, particle pooling, entity layer isolation for Y-sort
8. Production deployment: Fly.io (server), Cloudflare Pages (client), asset CDN
9. Lighthouse audit, load time optimization, code splitting verification

**Checkpoint**: Launch-ready product.

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

- Design in Tiled Map Editor (isometric orientation, 128×64 tile size)
- Export as JSON with embedded tilesets
- Place in `packages/client/public/tilemaps/`
- Each level has one tilemap JSON + one tileset PNG
- Use Phaser's built-in isometric tilemap support for base terrain rendering

### Audio

- Music: OGG Vorbis primary, MP3 fallback
- SFX: WebM (Opus) primary, MP3 fallback
- Use Howler.js sprite sheets for SFX (many sounds in one file, offset-based playback)

---

## Quick Start Commands

```bash
pnpm install                      # Install dependencies
pnpm dev                          # Run client + server concurrently
pnpm build                        # Build all packages
pnpm typecheck                    # Type check all packages
pnpm test                         # Run all tests (Vitest)
pnpm lint                         # Lint all packages
pnpm --filter server db:migrate   # Run database migrations
pnpm --filter server db:reset     # Reset database
pnpm --filter client dev          # Run client only
pnpm --filter server dev          # Run server only
```
