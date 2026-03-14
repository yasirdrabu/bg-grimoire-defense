# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable single-screen isometric TD prototype with one tower, one enemy, maze-building, pathfinding, and visible projectiles.

**Architecture:** Phaser 3 game engine with custom lightweight ECS (entities as IDs, components as plain data Maps, systems as pure functions). Pathfinding runs in a Web Worker via typed message protocol. Zustand bridges Phaser ↔ Preact. All shared types/constants in `packages/shared`.

**Tech Stack:** Phaser 3.80+, TypeScript 5.x strict, Vite 6, pnpm workspaces, Turborepo, Vitest, Zustand, Preact, pathfinding.js

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (workspace root)
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/client/package.json`
- Create: `packages/client/tsconfig.json`
- Create: `packages/client/vite.config.ts`
- Create: `packages/client/index.html`
- Create: `packages/client/src/main.ts`
- Create: `packages/server/package.json`
- Create: `packages/server/tsconfig.json`
- Create: `packages/server/src/index.ts`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Initialize root workspace**

```json
// package.json
{
  "name": "grimoire-defense",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.7.0"
  }
}
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "typecheck": { "dependsOn": ["^build"] },
    "test": {},
    "lint": {}
  }
}
```

- [ ] **Step 2: Create shared package**

```json
// packages/shared/package.json
{
  "name": "@grimoire/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 3: Create client package with Phaser + Vite**

```json
// packages/client/package.json
{
  "name": "@grimoire/client",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@grimoire/shared": "workspace:*",
    "phaser": "^3.80.0",
    "preact": "^10.25.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.9.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

- [ ] **Step 4: Create server package stub**

```json
// packages/server/package.json
{
  "name": "@grimoire/server",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@grimoire/shared": "workspace:*",
    "hono": "^4.6.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "vitest": "^3.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 5: Create .gitignore and .env.example**
- [ ] **Step 6: Run `pnpm install` and verify workspace resolution**

Run: `pnpm install`
Expected: All three workspace packages resolve, no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold pnpm monorepo with shared, client, server packages"
```

---

## Task 2: Shared Types & Constants

**Files:**
- Create: `packages/shared/src/types/ecs.ts`
- Create: `packages/shared/src/types/tower.ts`
- Create: `packages/shared/src/types/enemy.ts`
- Create: `packages/shared/src/types/level.ts`
- Create: `packages/shared/src/types/score.ts`
- Create: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Write ECS type interfaces**

```typescript
// packages/shared/src/types/ecs.ts
export type EntityId = number;

export type ComponentType<T = unknown> = {
  readonly name: string;
  readonly _phantom?: T;
};

export interface World {
  createEntity(): EntityId;
  destroyEntity(id: EntityId): void;
  addComponent<T>(id: EntityId, type: ComponentType<T>, data: T): void;
  getComponent<T>(id: EntityId, type: ComponentType<T>): T | undefined;
  removeComponent<T>(id: EntityId, type: ComponentType<T>): void;
  query(...types: ComponentType[]): EntityId[];
}

export type System = (world: World, dt: number) => void;
```

- [ ] **Step 2: Write tower, enemy, level, score type interfaces** (from spec)

- [ ] **Step 3: Write constants**

```typescript
// packages/shared/src/constants.ts
export const TILE_W = 128;
export const TILE_H = 64;
export const FLYING_DEPTH_OFFSET = 10000;
export const DEFAULT_GRID_COLS = 20;
export const DEFAULT_GRID_ROWS = 15;
export const COMBO_WINDOW_MS = 2500;
export const MAX_GAME_SPEED = 3;
export const SELL_REFUND_RATIO = 0.75;
export const INTEREST_RATE = 0.1;
export const INTEREST_CAP = 50;
export const WAVE_CLEAR_PAUSE_MS = 2000;
```

- [ ] **Step 4: Create barrel exports**
- [ ] **Step 5: Run typecheck**

Run: `pnpm --filter @grimoire/shared typecheck`
Expected: PASS, no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared types (ECS, tower, enemy, level, score) and constants"
```

---

## Task 3: Game Data — Elven Archer Spire + Orc Grunt

**Files:**
- Create: `packages/shared/src/data/towers.ts`
- Create: `packages/shared/src/data/enemies.ts`
- Create: `packages/shared/src/data/index.ts`
- Test: `packages/shared/src/__tests__/data.test.ts`

- [ ] **Step 1: Write the failing test for tower data validation**

```typescript
// packages/shared/src/__tests__/data.test.ts
import { describe, it, expect } from 'vitest';
import { TOWERS } from '../data/towers';

describe('Tower data', () => {
  it('should have Elven Archer Spire with correct archetype', () => {
    const archer = TOWERS['elven_archer_spire'];
    expect(archer).toBeDefined();
    expect(archer.cost).toBe(100);
    expect(archer.range).toBe(4);
    expect(archer.attackSpeed).toBe(0.8);
    expect(archer.damage).toBe(15);
    expect(archer.canTargetAir).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @grimoire/shared test`
Expected: FAIL — module not found.

- [ ] **Step 3: Write tower data for all 5 Middle-earth towers**

```typescript
// packages/shared/src/data/towers.ts
import type { TowerDefinition } from '../types/tower';

export const TOWERS: Record<string, TowerDefinition> = {
  elven_archer_spire: {
    id: 'elven_archer_spire',
    name: 'Elven Archer Spire',
    universe: 'middle_earth',
    role: 'cheap_dps',
    cost: 100,
    range: 4,
    attackSpeed: 0.8,
    damage: 15,
    damageType: 'physical',
    canTargetAir: true,
    projectileType: 'arrow',
    upgradeCostTier2: 60,
    upgradeCostTier3: 100,
    essenceCostTier3: 50,
  },
  // ... remaining 4 towers
};
```

- [ ] **Step 4: Write enemy data for all 5 Middle-earth enemies**
- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @grimoire/shared test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/shared/src/data/ packages/shared/src/__tests__/
git commit -m "feat: add Middle-earth tower and enemy data with validation tests"
```

---

## Task 4: ECS World Implementation

**Files:**
- Create: `packages/client/src/game/ecs/World.ts`
- Create: `packages/client/src/game/ecs/types.ts`
- Create: `packages/client/src/game/ecs/components/Position.ts`
- Create: `packages/client/src/game/ecs/components/Health.ts`
- Create: `packages/client/src/game/ecs/components/Movement.ts`
- Create: `packages/client/src/game/ecs/components/Attack.ts`
- Create: `packages/client/src/game/ecs/components/TowerData.ts`
- Create: `packages/client/src/game/ecs/components/EnemyData.ts`
- Create: `packages/client/src/game/ecs/components/Renderable.ts`
- Create: `packages/client/src/game/ecs/components/Projectile.ts`
- Create: `packages/client/src/game/ecs/components/index.ts`
- Test: `packages/client/src/game/ecs/__tests__/World.test.ts`

- [ ] **Step 1: Write failing tests for World**

```typescript
describe('ECS World', () => {
  it('should create entities with incrementing IDs', () => {
    const world = new GameWorld();
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    expect(e2).toBe(e1 + 1);
  });

  it('should add and retrieve components', () => {
    const world = new GameWorld();
    const entity = world.createEntity();
    world.addComponent(entity, PositionComponent, { gridX: 5, gridY: 3 });
    const pos = world.getComponent(entity, PositionComponent);
    expect(pos).toEqual({ gridX: 5, gridY: 3 });
  });

  it('should query entities by component types', () => {
    const world = new GameWorld();
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    world.addComponent(e1, PositionComponent, { gridX: 0, gridY: 0 });
    world.addComponent(e1, HealthComponent, { current: 100, max: 100 });
    world.addComponent(e2, PositionComponent, { gridX: 1, gridY: 1 });
    const results = world.query(PositionComponent, HealthComponent);
    expect(results).toEqual([e1]);
  });

  it('should destroy entities and clean up components', () => {
    const world = new GameWorld();
    const entity = world.createEntity();
    world.addComponent(entity, PositionComponent, { gridX: 0, gridY: 0 });
    world.destroyEntity(entity);
    expect(world.getComponent(entity, PositionComponent)).toBeUndefined();
    expect(world.query(PositionComponent)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement GameWorld class**

Use `Map<string, Map<EntityId, unknown>>` for component storage. Query iterates the smallest component set and filters.

- [ ] **Step 4: Define all component types** (Position, Health, Movement, Attack, TowerData, EnemyData, Renderable, Projectile)
- [ ] **Step 5: Run tests to verify they pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: implement ECS World with component storage and query engine"
```

---

## Task 5: Phaser Boilerplate — BootScene + GameScene Shell

**Files:**
- Create: `packages/client/src/game/config.ts`
- Create: `packages/client/src/game/scenes/BootScene.ts`
- Create: `packages/client/src/game/scenes/GameScene.ts`
- Create: `packages/client/src/game/utils/isoMath.ts`
- Modify: `packages/client/src/main.ts`
- Modify: `packages/client/index.html`
- Test: `packages/client/src/game/utils/__tests__/isoMath.test.ts`

- [ ] **Step 1: Write failing tests for isoMath**

```typescript
import { gridToScreen, screenToGrid } from '../isoMath';
import { TILE_W, TILE_H } from '@grimoire/shared';

describe('isoMath', () => {
  it('should convert grid (0,0) to screen origin + offset', () => {
    const { screenX, screenY } = gridToScreen(0, 0, 0, 0);
    expect(screenX).toBe(0);
    expect(screenY).toBe(0);
  });

  it('should round-trip grid → screen → grid', () => {
    const gx = 5, gy = 3;
    const { screenX, screenY } = gridToScreen(gx, gy, 0, 0);
    const { gridX, gridY } = screenToGrid(screenX + TILE_W / 2, screenY + TILE_H / 2, 0, 0, 0, 0);
    expect(gridX).toBe(gx);
    expect(gridY).toBe(gy);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement isoMath utilities** (gridToScreen, screenToGrid per spec formulas)
- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Create Phaser game config**

```typescript
// packages/client/src/game/config.ts
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [BootScene, GameScene],
  render: { pixelArt: false, antialias: true },
};
```

- [ ] **Step 6: Implement BootScene** (placeholder — transitions to GameScene)
- [ ] **Step 7: Implement GameScene shell** — create ECS World, draw a 20×15 isometric grid overlay using Phaser Graphics, initialize camera bounds
- [ ] **Step 8: Wire main.ts entry point** — boot Phaser game, mount Preact container div
- [ ] **Step 9: Run `pnpm --filter @grimoire/client dev` and verify grid renders**
- [ ] **Step 10: Commit**

```bash
git commit -m "feat: add Phaser boilerplate with isometric grid rendering"
```

---

## Task 6: Procedural Sprite Generator

**Files:**
- Create: `packages/client/src/game/utils/SpriteGenerator.ts`
- Create: `packages/client/src/game/utils/colors.ts`

All game visuals are code-generated — no external art assets needed. Each tower, enemy, projectile, and tile type gets a distinct procedural sprite baked to a Phaser texture at boot time. Swap for real art later by replacing `generateTexture()` calls with `scene.load.atlas()`.

- [ ] **Step 1: Create color palette constants**

```typescript
// packages/client/src/game/utils/colors.ts
export const TOWER_COLORS = {
  elven_archer_spire: 0x44AA44,    // green — tall spire
  gondorian_ballista: 0x8888CC,    // steel blue — wide platform
  dwarven_cannon: 0xCC8844,        // bronze — squat barrel
  istari_crystal: 0xAA44CC,        // purple — crystal shard
  ent_watchtower: 0x228822,        // dark green — organic tree shape
} as const;

export const ENEMY_COLORS = {
  orc_grunt: 0x667744,             // green-brown
  goblin_runner: 0x88AA44,         // lime — small, fast
  uruk_hai_berserker: 0x554433,    // dark brown — large
  cave_troll: 0x777777,            // gray — very large
  nazgul_shade: 0x220033,          // dark purple — wispy
} as const;

export const PROJECTILE_COLORS = {
  arrow: 0xCCCC00,
  fireball: 0xFF4400,
  cannonball: 0x888888,
  spell_bolt: 0x8844FF,
  root_thorn: 0x44AA22,
} as const;

export const TILE_COLORS = {
  grass: 0x557733,
  stone: 0x888888,
  water: 0x334488,
  blocked: 0x443322,
  nexus: 0xFFDD44,
  spawn: 0xCC4444,
  buildable_hover: 0x44FF44,
  invalid_hover: 0xFF4444,
} as const;
```

- [ ] **Step 2: Implement SpriteGenerator — isometric tile textures**

```typescript
// packages/client/src/game/utils/SpriteGenerator.ts

/** Generate an isometric diamond tile texture */
function generateIsometricTile(
  scene: Phaser.Scene,
  key: string,
  fillColor: number,
  strokeColor?: number,
): void {
  const g = scene.add.graphics();
  const hw = 64; // TILE_W / 2
  const hh = 32; // TILE_H / 2

  g.fillStyle(fillColor, 1);
  g.beginPath();
  g.moveTo(hw, 0);
  g.lineTo(hw * 2, hh);
  g.lineTo(hw, hh * 2);
  g.lineTo(0, hh);
  g.closePath();
  g.fillPath();

  if (strokeColor !== undefined) {
    g.lineStyle(1, strokeColor, 0.5);
    g.strokePath();
  }

  g.generateTexture(key, 128, 64);
  g.destroy();
}
```

- [ ] **Step 3: Implement tower sprite generation**

Each tower role gets a distinct silhouette so players can read the maze at a glance:
- **Cheap DPS (Archer)**: tall narrow spire with pointed top
- **Expensive DPS (Ballista)**: wide platform with horizontal crossbar
- **Specialist (Cannon)**: squat base with barrel/circle on top
- **Utility (Crystal)**: diamond/shard shape, translucent
- **Medium DPS (Ent)**: organic tree shape with crown

```typescript
function generateTowerSprite(
  scene: Phaser.Scene,
  key: string,
  color: number,
  shape: 'spire' | 'platform' | 'barrel' | 'crystal' | 'tree',
): void {
  const g = scene.add.graphics();
  const w = 48, h = 64;

  // Isometric base diamond
  g.fillStyle(0x555555);
  g.fillPoints([
    { x: w/2, y: h - 8 },
    { x: w, y: h - 16 },
    { x: w/2, y: h - 24 },
    { x: 0, y: h - 16 },
  ], true);

  g.fillStyle(color);
  switch (shape) {
    case 'spire':
      g.fillRect(w/2 - 5, 8, 10, h - 32);
      g.fillTriangle(w/2 - 8, 8, w/2, 0, w/2 + 8, 8);
      break;
    case 'platform':
      g.fillRect(4, h/2 - 8, w - 8, 12);
      g.fillRect(w/2 - 3, h/2 - 20, 6, 12);
      break;
    case 'barrel':
      g.fillRect(w/2 - 10, h/2 - 6, 20, 16);
      g.fillCircle(w/2, h/2 - 10, 8);
      break;
    case 'crystal':
      g.fillPoints([
        { x: w/2, y: 4 },
        { x: w/2 + 10, y: h/2 },
        { x: w/2, y: h - 28 },
        { x: w/2 - 10, y: h/2 },
      ], true);
      break;
    case 'tree':
      g.fillRect(w/2 - 4, h/2 - 4, 8, 20);
      g.fillCircle(w/2, h/2 - 10, 14);
      break;
  }

  g.generateTexture(key, w, h);
  g.destroy();
}
```

- [ ] **Step 4: Implement enemy sprite generation**

Enemies use colored circles/diamonds with size indicating threat level:

```typescript
function generateEnemySprite(
  scene: Phaser.Scene,
  key: string,
  color: number,
  radius: number,
): void {
  const g = scene.add.graphics();
  const size = radius * 2 + 4;

  // Body
  g.fillStyle(color);
  g.fillCircle(size / 2, size / 2, radius);

  // Direction indicator (forward-facing notch)
  g.fillStyle(0xFFFFFF, 0.6);
  g.fillTriangle(
    size / 2, size / 2 - radius + 2,
    size / 2 - 3, size / 2 - radius + 8,
    size / 2 + 3, size / 2 - radius + 8,
  );

  g.generateTexture(key, size, size);
  g.destroy();
}
```

- [ ] **Step 5: Implement projectile + nexus + ghost sprite generation**

```typescript
function generateProjectile(scene: Phaser.Scene, key: string, color: number, size: number): void {
  const g = scene.add.graphics();
  g.fillStyle(color);
  g.fillCircle(size, size, size);
  g.generateTexture(key, size * 2, size * 2);
  g.destroy();
}

function generateNexusSprite(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  // Glowing diamond
  g.fillStyle(0xFFDD44);
  g.fillPoints([
    { x: 24, y: 0 }, { x: 48, y: 24 },
    { x: 24, y: 48 }, { x: 0, y: 24 },
  ], true);
  g.fillStyle(0xFFFFFF, 0.5);
  g.fillCircle(24, 24, 8);
  g.generateTexture('nexus', 48, 48);
  g.destroy();
}
```

- [ ] **Step 6: Create master `generateAllSprites(scene)` function**

```typescript
export function generateAllSprites(scene: Phaser.Scene): void {
  // Tiles
  generateIsometricTile(scene, 'tile_grass', TILE_COLORS.grass, 0x446622);
  generateIsometricTile(scene, 'tile_stone', TILE_COLORS.stone, 0x666666);
  generateIsometricTile(scene, 'tile_water', TILE_COLORS.water, 0x223366);
  generateIsometricTile(scene, 'tile_blocked', TILE_COLORS.blocked);
  generateIsometricTile(scene, 'tile_hover_valid', TILE_COLORS.buildable_hover);
  generateIsometricTile(scene, 'tile_hover_invalid', TILE_COLORS.invalid_hover);

  // Towers
  generateTowerSprite(scene, 'elven_archer_spire', TOWER_COLORS.elven_archer_spire, 'spire');
  generateTowerSprite(scene, 'gondorian_ballista', TOWER_COLORS.gondorian_ballista, 'platform');
  generateTowerSprite(scene, 'dwarven_cannon', TOWER_COLORS.dwarven_cannon, 'barrel');
  generateTowerSprite(scene, 'istari_crystal', TOWER_COLORS.istari_crystal, 'crystal');
  generateTowerSprite(scene, 'ent_watchtower', TOWER_COLORS.ent_watchtower, 'tree');

  // Enemies
  generateEnemySprite(scene, 'orc_grunt', ENEMY_COLORS.orc_grunt, 10);
  generateEnemySprite(scene, 'goblin_runner', ENEMY_COLORS.goblin_runner, 7);
  generateEnemySprite(scene, 'uruk_hai_berserker', ENEMY_COLORS.uruk_hai_berserker, 13);
  generateEnemySprite(scene, 'cave_troll', ENEMY_COLORS.cave_troll, 18);
  generateEnemySprite(scene, 'nazgul_shade', ENEMY_COLORS.nazgul_shade, 11);

  // Projectiles
  generateProjectile(scene, 'proj_arrow', PROJECTILE_COLORS.arrow, 3);
  generateProjectile(scene, 'proj_fireball', PROJECTILE_COLORS.fireball, 5);
  generateProjectile(scene, 'proj_cannonball', PROJECTILE_COLORS.cannonball, 4);
  generateProjectile(scene, 'proj_spell_bolt', PROJECTILE_COLORS.spell_bolt, 4);
  generateProjectile(scene, 'proj_root_thorn', PROJECTILE_COLORS.root_thorn, 3);

  // Nexus
  generateNexusSprite(scene);
}
```

- [ ] **Step 7: Call `generateAllSprites()` in BootScene.create()**

Wire into BootScene so all textures are available before GameScene starts.

- [ ] **Step 8: Run `pnpm dev` and verify sprites render on the isometric grid**

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add procedural sprite generator for towers, enemies, tiles, projectiles"
```

---

## Task 7: Pathfinding Web Worker

**Files:**
- Create: `packages/client/src/game/pathfinding/protocol.ts`
- Create: `packages/client/src/game/pathfinding/pathfinding.worker.ts`
- Create: `packages/client/src/game/pathfinding/PathManager.ts`
- Test: `packages/client/src/game/pathfinding/__tests__/PathManager.test.ts`

- [ ] **Step 1: Write the typed worker protocol** (WorkerRequest, WorkerResponse — exact types from spec)

- [ ] **Step 2: Write failing tests for PathManager**

```typescript
describe('PathManager', () => {
  it('should find a path on an open grid', async () => {
    const pm = new PathManager();
    const grid = createOpenGrid(10, 10);
    const path = await pm.findPath(grid, 0, 0, 9, 9);
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([9, 9]);
  });

  it('should validate placement blocks no path', async () => {
    const pm = new PathManager();
    // Create grid where blocking (1,0) would cut the only path
    const grid = createCorridorGrid();
    const valid = await pm.validatePlacement(grid, [[0, 0]], [9, 9]);
    expect(valid).toBe(false);
  });

  it('should cache results by grid version', async () => {
    const pm = new PathManager();
    const grid = createOpenGrid(10, 10);
    const path1 = await pm.findPath(grid, 0, 0, 9, 9);
    const path2 = await pm.findPath(grid, 0, 0, 9, 9);
    expect(path2).toEqual(path1); // cache hit
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

- [ ] **Step 4: Implement pathfinding.worker.ts**

Use `pathfinding.js` Grid + AStarFinder. Handle `FIND_PATH`, `VALIDATE_PLACEMENT`, `BATCH_VALIDATE` message types.

- [ ] **Step 5: Implement PathManager**

Promise-based request map, 500ms per-request timeout, grid version cache, worker crash recovery via `onerror`.

- [ ] **Step 6: Run tests to verify they pass**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add pathfinding Web Worker with typed protocol and PathManager cache"
```

---

## Task 8: Zustand Stores

**Files:**
- Create: `packages/client/src/stores/useGameStore.ts`
- Create: `packages/client/src/stores/useUIStore.ts`
- Create: `packages/client/src/stores/usePlayerStore.ts`
- Create: `packages/client/src/stores/index.ts`
- Test: `packages/client/src/stores/__tests__/useGameStore.test.ts`

- [ ] **Step 1: Write failing test for useGameStore action dispatch**

```typescript
describe('useGameStore', () => {
  it('should queue and drain actions', () => {
    const store = useGameStore.getState();
    store.dispatch({ type: 'BUILD_TOWER', towerType: 'elven_archer_spire', gridX: 5, gridY: 3 });
    expect(useGameStore.getState().pendingActions).toHaveLength(1);
  });

  it('should reset game state', () => {
    const store = useGameStore.getState();
    useGameStore.setState({ gold: 999, wave: 5 });
    store.resetGameState();
    expect(useGameStore.getState().gold).toBe(650);
    expect(useGameStore.getState().wave).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement all three Zustand stores** (GameStore with action queue, UIStore with input modes, PlayerStore stub)
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Zustand stores (game, UI, player) with action queue"
```

---

## Task 9: Tower Placement with Ghost Preview + Path Validation

**Files:**
- Create: `packages/client/src/game/towers/TowerPlacement.ts`
- Create: `packages/client/src/game/towers/TowerFactory.ts`
- Modify: `packages/client/src/game/scenes/GameScene.ts` — wire input handling
- Test: `packages/client/src/game/towers/__tests__/TowerPlacement.test.ts`

- [ ] **Step 1: Write failing test for placement validation**

```typescript
describe('TowerPlacement', () => {
  it('should reject placement on occupied cell', () => {
    const grid = createGridWithTower(5, 3);
    expect(canPlace(grid, 5, 3)).toBe(false);
  });

  it('should reject placement that blocks all paths', async () => {
    const grid = createCorridorGrid();
    const result = await validatePlacement(grid, 1, 0, spawns, nexus, pathManager);
    expect(result).toBe(false);
  });

  it('should accept valid placement', async () => {
    const grid = createOpenGrid(10, 10);
    const result = await validatePlacement(grid, 5, 5, [[0, 0]], [9, 9], pathManager);
    expect(result).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement TowerPlacement** — grid clone, mark blocked, validate all spawn-to-nexus paths
- [ ] **Step 4: Implement TowerFactory** — creates ECS entity with Position, Attack, TowerData, Renderable components
- [ ] **Step 5: Wire ghost preview in GameScene** — translucent sprite follows cursor, green/red tint, range circle
- [ ] **Step 6: Run tests to verify they pass**
- [ ] **Step 7: Visually test in browser** — enter build mode, see ghost, place tower, grid updates
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add tower placement with ghost preview and path validation"
```

---

## Task 10: Enemy Spawning + Movement

**Files:**
- Create: `packages/client/src/game/enemies/EnemyFactory.ts`
- Create: `packages/client/src/game/ecs/systems/MovementSystem.ts`
- Create: `packages/client/src/game/ecs/systems/RenderSystem.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/MovementSystem.test.ts`

- [ ] **Step 1: Write failing test for MovementSystem**

```typescript
describe('MovementSystem', () => {
  it('should advance enemy along path', () => {
    const world = new GameWorld();
    const enemy = world.createEntity();
    world.addComponent(enemy, PositionComponent, { gridX: 0, gridY: 0 });
    world.addComponent(enemy, MovementComponent, {
      speed: 1.0,
      path: [[0, 0], [1, 0], [2, 0]],
      pathIndex: 0,
      slowMultiplier: 1,
      gridVersion: 0,
    });
    movementSystem(world, 1000); // 1 second
    const pos = world.getComponent(enemy, PositionComponent)!;
    expect(pos.gridX).toBeGreaterThan(0);
  });

  it('should apply separation steering between nearby enemies', () => {
    const world = new GameWorld();
    // Two enemies at same position — should push apart
    const e1 = createEnemyAt(world, 5, 5);
    const e2 = createEnemyAt(world, 5, 5);
    movementSystem(world, 16);
    const p1 = world.getComponent(e1, PositionComponent)!;
    const p2 = world.getComponent(e2, PositionComponent)!;
    expect(p1.gridX).not.toEqual(p2.gridX);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement MovementSystem** — path following + separation steering (weight 0.2 sep, 0.8 path)
- [ ] **Step 4: Implement EnemyFactory** — creates ECS entity with Position, Health, Movement, EnemyData, Renderable
- [ ] **Step 5: Implement RenderSystem** — Y-sort entity layer, convert Position grid→screen, update sprite positions
- [ ] **Step 6: Run tests to verify they pass**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add enemy spawning, movement system with steering, and render system"
```

---

## Task 11: Core Combat Systems

**Files:**
- Create: `packages/client/src/game/ecs/systems/TargetingSystem.ts`
- Create: `packages/client/src/game/ecs/systems/AttackSystem.ts`
- Create: `packages/client/src/game/ecs/systems/ProjectileSystem.ts`
- Create: `packages/client/src/game/ecs/systems/DeathSystem.ts`
- Create: `packages/client/src/game/ecs/systems/NexusSystem.ts`
- Create: `packages/client/src/game/ecs/systems/InputSystem.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/TargetingSystem.test.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/AttackSystem.test.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/ProjectileSystem.test.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/DeathSystem.test.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/NexusSystem.test.ts`

- [ ] **Step 1: Write failing test for TargetingSystem**

```typescript
describe('TargetingSystem', () => {
  it('should acquire nearest enemy within range', () => {
    const world = new GameWorld();
    const tower = createTowerAt(world, 5, 5, { range: 4 });
    const enemy = createEnemyAt(world, 6, 5);
    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBe(enemy);
  });

  it('should not target enemies out of range', () => {
    const world = new GameWorld();
    const tower = createTowerAt(world, 0, 0, { range: 2 });
    createEnemyAt(world, 10, 10);
    targetingSystem(world, 16);
    const attack = world.getComponent(tower, AttackComponent)!;
    expect(attack.targetId).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement TargetingSystem** — query towers with Attack, find nearest enemy with Position within range
- [ ] **Step 4: Write failing test for AttackSystem** — cooldown tick, spawn projectile entity on fire
- [ ] **Step 5: Implement AttackSystem**
- [ ] **Step 6: Write failing test for ProjectileSystem** — move toward target, apply damage on hit
- [ ] **Step 7: Implement ProjectileSystem**
- [ ] **Step 8: Write failing test for DeathSystem** — destroy entity when Health ≤ 0, award gold
- [ ] **Step 9: Implement DeathSystem**
- [ ] **Step 10: Write failing test for NexusSystem** — deduct HP when enemy reaches nexus
- [ ] **Step 11: Implement NexusSystem**
- [ ] **Step 12: Implement InputSystem** — drain pendingActions from useGameStore
- [ ] **Step 13: Run all system tests**

Run: `pnpm --filter @grimoire/client test`
Expected: ALL PASS

- [ ] **Step 14: Commit**

```bash
git commit -m "feat: add core combat systems (targeting, attack, projectile, death, nexus, input)"
```

---

## Task 12: Wire Game Loop + End-to-End Playtest

**Files:**
- Modify: `packages/client/src/game/scenes/GameScene.ts` — wire all systems in update()

- [ ] **Step 1: Wire GameScene.update()** — call all 11 systems in spec order (Input → Wave → Movement → Targeting → Attack → Projectile → Status → Death → Nexus → Score → Render)

- [ ] **Step 2: Add simple wave spawning** — spawn 10 Orc Grunts from spawn point with 0.5s interval

- [ ] **Step 3: Add nexus sprite and game-over detection**

- [ ] **Step 4: Visual playtest** — run `pnpm dev`, place towers, watch enemies path, towers shoot, enemies die, nexus takes damage

- [ ] **Step 5: Fix any integration issues** discovered during playtest

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: wire full game loop — playable prototype with one tower and one enemy type"
```

---

## Phase 1 Checkpoint

At completion, you should have:
- Monorepo with shared/client/server packages
- Working ECS with component storage and queries
- Isometric grid rendering (20×15)
- Pathfinding in Web Worker with cache
- Tower placement with ghost preview and path validation
- Enemy movement with steering behaviors
- Full combat loop: targeting → attack → projectile → damage → death
- Nexus HP and game-over detection
- Zustand stores bridging Phaser ↔ Preact
- All systems unit-tested with mock World

**Next:** Phase 2 — Core Systems (economy, upgrades, scoring, HUD)
