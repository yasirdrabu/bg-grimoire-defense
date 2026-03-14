# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grimoire Defense** is a browser-based tower defense game where players defend a Nexus against cross-universe enemies (Tolkien, Wizarding World, Westeros). Towers shape enemy pathing (hybrid maze-builder). Features dual currency (Gold + Essence), branching upgrades with cross-universe fusion, and competitive scoring.

Two spec documents drive development:
- `docs/specs/main-spec.md` — architecture, tech stack, monorepo structure, database schema, API routes, anti-cheat, build phases
- `docs/specs/2026-03-14-gameplay-rendering-design.md` — isometric rendering pipeline, scene flow, camera/input, game loop, enemy movement, visual feedback

## Commands

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

## Tech Stack

- **Game engine**: Phaser 3.80+ (WebGL/Canvas) with TypeScript 5.x strict mode
- **UI overlay**: Preact + TailwindCSS v4 rendered above Phaser canvas
- **State bridge**: Zustand stores (Phaser writes game state, Preact reads reactively)
- **Bundler**: Vite 6 with code splitting per Act/biome
- **Pathfinding**: pathfinding.js (A*) in a Web Worker — never blocks main thread
- **Audio**: Howler.js with sprite sheets for SFX
- **Animation**: Spine runtime for Phaser + particle emitters
- **Backend**: Node.js 22 + Hono, SQLite via better-sqlite3, Drizzle ORM, JWT auth
- **Testing**: Vitest for unit/integration, Supertest for API routes
- **Monorepo**: pnpm workspaces + Turborepo

## Architecture

```
packages/
├── shared/    # Types + game data constants (single source of truth for client & server)
├── client/    # Phaser game (game/) + Preact UI overlay (ui/) + Zustand stores (stores/)
└── server/    # Hono API: auth, profiles, leaderboards, scores, store, anti-cheat
```

### Key Architectural Rules

1. **Shared types are the contract** — all interfaces in `packages/shared/src/types/` are the single source of truth. Never duplicate type definitions.
2. **Game data is code, not config** — tower stats, enemy stats, level definitions, fusion recipes live as typed TypeScript constants in `packages/shared/src/data/`. Compile-time validation of all balance data.
3. **ECS for entities, FSM for complex behaviors** — enemies/towers are ECS entities; bosses use finite state machines as ECS components.
4. **Pathfinding never blocks main thread** — A* runs in Web Worker; PathManager queues requests and caches results keyed by grid version.
5. **Preact overlay for all UI** — Phaser canvas handles game world only. HUD, menus, tooltips are Preact components. Communication via Zustand stores.
6. **Backend is minimal** — auth, profiles, leaderboards, store purchases only. All game logic lives on the client.

### Phaser ↔ Preact Communication

Zustand stores act as the bridge: Phaser systems write game state (gold, wave, score, HP) to the store each frame. Preact components read reactively. UI actions (build tower, upgrade, pause) are queued in the store and consumed by Phaser's GameScene.

### Tower Placement Validation

Before placing: clone the grid, mark cell blocked, run A* from every spawn to nexus. Reject if any path is blocked. On success, increment grid version and broadcast repath to all enemies.

## Conventions

- **No `any`** — use `unknown` + type guards
- **No default exports** except Preact page components
- **Barrel exports** via `index.ts` in each directory
- **Naming**: PascalCase for types/classes/components, camelCase for functions/variables, SCREAMING_SNAKE for constants
- **File naming**: PascalCase for classes/components (`TowerFactory.ts`), camelCase for utilities (`anticheat.ts`)
- **Git branches**: `feat/`, `fix/`, `chore/` prefixes
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `perf:`, `test:`)
- **PR scope**: One feature or fix per PR, under 500 lines when possible

## Performance Budgets

- Initial JS bundle: < 300KB gzipped (excluding assets)
- Per-biome asset pack: < 5MB (lazy loaded)
- Frame budget: 16.6ms (60 FPS); pathfinding < 5ms for 30x20 grid
- API response: < 100ms p95
