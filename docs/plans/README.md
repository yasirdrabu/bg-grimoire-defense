# Grimoire Defense — Execution Plan

Six-phase execution plan derived from the [main spec](../specs/main-spec.md) and [gameplay rendering spec](../specs/2026-03-14-gameplay-rendering-design.md).

Each phase produces a working, testable checkpoint. Phases are sequential — each builds on the previous.

## Phases

| Phase | Name | Focus | Checkpoint |
|-------|------|-------|------------|
| [1](phase-1-foundation.md) | **Foundation** | Monorepo, ECS, isometric grid, pathfinding, one tower + one enemy, game loop | Playable single-screen prototype |
| [2](phase-2-core-systems.md) | **Core Systems** | Economy, scoring, waves, all Act 1 towers/enemies, HUD, tutorial | Act 1 Level 1 fully playable |
| [3](phase-3-upgrades-and-fusion.md) | **Upgrades & Fusion** | Tier 3 branches, fusion engine, Act 1 levels 2-5, Balrog boss, HubScene | Full Act 1 with boss and hub |
| [4](phase-4-backend-and-persistence.md) | **Backend & Persistence** | Auth, profiles, score submission, anti-cheat, leaderboards, offline resilience | Persistent multiplayer-ready |
| [5](phase-5-acts-2-and-3.md) | **Acts 2 & 3** | Wizarding + Westeros content, 4 bosses, 30 fusions, challenges | Full 18-level campaign |
| [6](phase-6-polish-and-launch.md) | **Polish & Launch** | Store, audio, VFX, accessibility, performance, deployment | Launch-ready product |

## Approach

- **TDD**: Write failing test → implement → verify → commit
- **ECS architecture**: Entities as IDs, components as plain data, systems as pure functions (Phaser-free except RenderSystem)
- **Phaser 3.80+** for rendering, **Preact** for all UI, **Zustand** as the bridge
- **Pathfinding in Web Worker** — never blocks main thread
- **Shared package** is the single source of truth for types, constants, and game data
- **Frequent commits** with conventional commit messages

## Tech Stack

Phaser 3.80+ · TypeScript 5.x strict · Vite 6 · pnpm workspaces · Turborepo · Preact · Zustand · TailwindCSS v4 · pathfinding.js · Howler.js · Hono · SQLite · Drizzle ORM · Vitest
