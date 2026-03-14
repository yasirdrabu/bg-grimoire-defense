# Phase 6: Store, Polish & Launch — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cosmetics store, full audio implementation, VFX polish, boss cinematics, accessibility audit, performance optimization, and production deployment.

**Architecture:** Store is a simple CRUD service — coins earned through gameplay, spent on cosmetics with no gameplay impact. Audio uses Howler.js with sprite sheets for SFX and layered tracks for music. VFX uses Phaser particle emitters with presets. Deployment: Fly.io for server, Cloudflare Pages for client.

**Tech Stack:** Same as previous phases + Howler.js, TexturePacker (asset pipeline)

---

## Task 1: Store Backend + UI

**Files:**
- Create: `packages/server/src/routes/store.ts`
- Create: `packages/server/src/services/StoreService.ts`
- Create: `packages/client/src/ui/store/CosmeticStore.tsx`
- Create: `packages/client/src/ui/store/SeasonPass.tsx`
- Test: `packages/server/src/__tests__/store.test.ts`

- [ ] **Step 1: Write failing tests** — GET /api/store/items, POST /api/store/purchase (deduct coins, prevent duplicate), GET /api/store/my-items, PUT /api/store/equip
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement StoreService** — list items, purchase (coin check + deduct), equip to slot
- [ ] **Step 4: Implement store routes**
- [ ] **Step 5: Implement CosmeticStore.tsx** — grid of items, filter by category, purchase flow, equip button
- [ ] **Step 6: Implement SeasonPass.tsx** — progress bar, tier rewards (cosmetics-only)
- [ ] **Step 7: Run tests to verify they pass**
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add cosmetics store with purchase, equip, and season pass UI"
```

---

## Task 2: Audio System

**Files:**
- Create: `packages/client/src/game/audio/AudioManager.ts`
- Create: `packages/client/src/game/audio/MusicLayers.ts`

- [ ] **Step 1: Implement AudioManager** — Howler.js wrapper, SFX sprite sheet loading, volume controls, mute toggle
- [ ] **Step 2: Add tower fire SFX** — unique sound per tower type, triggered by AttackSystem
- [ ] **Step 3: Add enemy death SFX** — varies by enemy type
- [ ] **Step 4: Add combo audio cue** — rising pitch for 3+ kill chains
- [ ] **Step 5: Implement MusicLayers** — per-biome background music, dynamic boss music (layers added when boss spawns)
- [ ] **Step 6: Add wave transition SFX** — horn/alarm on wave start, triumphant chime on clear
- [ ] **Step 7: Add UI SFX** — button clicks, tower placement, upgrade, star rating chime
- [ ] **Step 8: Wire volume settings** — Settings.tsx controls AudioManager volume
- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add audio system with per-tower SFX, biome music, and combo cues"
```

---

## Task 3: VFX Polish

**Files:**
- Create: `packages/client/src/game/vfx/ParticlePresets.ts`
- Create: `packages/client/src/game/vfx/ScreenShake.ts`
- Create: `packages/client/src/game/vfx/DamageNumbers.ts`

- [ ] **Step 1: Implement ParticlePresets** — status effect particles (frost, flame, poison, curse, fear), impact bursts, muzzle flashes, tower upgrade particles
- [ ] **Step 2: Implement ScreenShake** — micro shake (1-2px, 50ms) for Tier 3 heavy hits, configurable intensity
- [ ] **Step 3: Implement DamageNumbers** — floating text at hit location, color-coded by damage type, critical hits 1.5x scale with overshoot tween, fade out over 1s
- [ ] **Step 4: Add kill confirmation VFX** — death animation (dissolve/collapse/explosion), gold coin particle toward HUD counter
- [ ] **Step 5: Add tower upgrade feedback** — white flash → color-coded burst → sprite swap, range circle pulse
- [ ] **Step 6: Add wave transition VFX** — "Wave X/Y" text pulse, interest gold popup animation
- [ ] **Step 7: Wire reduced motion mode** — skip screen shake, reduce particle density
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add VFX polish — particles, screen shake, damage numbers, kill feedback"
```

---

## Task 4: Boss Cinematics (BossIntroScene)

**Files:**
- Create: `packages/client/src/game/scenes/BossIntroScene.ts`

- [ ] **Step 1: Implement BossIntroScene** — 3-5 second cinematic overlay before boss levels
- [ ] **Step 2: Create intro sequences** for each boss — dramatic camera pan, boss name/title card, thematic SFX
- [ ] **Step 3: Wire scene flow** — HubScene detects boss level → BossIntroScene → GameScene
- [ ] **Step 4: Add fixed 5-second countdown after intro** before boss wave spawns
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add BossIntroScene with cinematic intros for all 6 bosses"
```

---

## Task 5: Accessibility Audit

- [ ] **Step 1: Color-independence check** — verify all color-coded elements have secondary indicators (shape, icon, pattern). Ghost placement has checkmark/X icons alongside green/red.
- [ ] **Step 2: Keyboard navigation** — verify all hotkeys work (1-5 tower select, Q/E cycle, Tab cycle towers, Space send wave, Escape cancel, V path overlay, P pause, +/- speed)
- [ ] **Step 3: Reduced motion mode** — verify screen shake disabled, particle density reduced
- [ ] **Step 4: UI scale** — verify 80%-120% scale works without layout breaks
- [ ] **Step 5: Game speed as motor accessibility** — verify 1x/2x/3x + pause all work correctly
- [ ] **Step 6: Fix any issues found**
- [ ] **Step 7: Commit**

```bash
git commit -m "fix: accessibility audit — color independence, keyboard nav, reduced motion"
```

---

## Task 6: Performance Optimization

- [ ] **Step 1: Texture atlases** — create TexturePacker atlases per biome, verify sprite batching reduces draw calls to < 200
- [ ] **Step 2: Grid overlay dirty-flag** — verify overlay only redraws on grid state change, not every frame
- [ ] **Step 3: Y-sort via Phaser Layer.sort()** — verify native implementation, not manual display list
- [ ] **Step 4: Entity layer isolation** — verify only alive enemies with Movement are iterated for separation
- [ ] **Step 5: Pathfinding benchmarks** — verify < 5ms for 30×20 grid, worker doesn't block main thread
- [ ] **Step 6: Bundle size audit** — verify < 300KB gzipped initial JS, per-biome code splitting works
- [ ] **Step 7: Particle pooling** — reuse particle emitters instead of creating/destroying
- [ ] **Step 8: Profile with Chrome DevTools** — 60 FPS on mid-range hardware (integrated GPU)
- [ ] **Step 9: Fix any performance bottlenecks**
- [ ] **Step 10: Commit**

```bash
git commit -m "perf: optimize texture atlases, particle pooling, bundle splitting"
```

---

## Task 7: Grimoire & Profile Routes

**Files:**
- Create: `packages/server/src/routes/grimoire.ts`
- Modify: `packages/client/src/ui/hub/Profile.tsx`
- Create: `packages/client/src/ui/hub/Leaderboard.tsx`

- [ ] **Step 1: Implement grimoire routes** — GET /api/grimoire (discovered fusions, bestiary), POST /api/grimoire/discover (first discovery bonus)
- [ ] **Step 2: Implement Profile.tsx** — player stats, progress overview, equipped cosmetics
- [ ] **Step 3: Implement Leaderboard.tsx** — per-level and campaign leaderboards with pagination, player rank highlight
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add grimoire routes, profile page, and leaderboard UI"
```

---

## Task 8: Production Deployment

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`
- Create: `Dockerfile` (server)

- [ ] **Step 1: Create CI workflow** — lint, typecheck, test on push to main and PRs
- [ ] **Step 2: Create Dockerfile for server** — Node.js 22 slim, copy built server + shared packages, SQLite data volume
- [ ] **Step 3: Deploy server to Fly.io** — configure fly.toml, persistent volume for SQLite
- [ ] **Step 4: Deploy client to Cloudflare Pages** — Vite build output, configure custom domain
- [ ] **Step 5: Configure environment variables** — JWT_SECRET, SCORE_HMAC_SECRET, CORS_ORIGIN, VITE_API_URL
- [ ] **Step 6: Set up asset CDN** — serve sprites/audio from Cloudflare CDN
- [ ] **Step 7: Lighthouse audit** — target > 90 performance score, verify load times
- [ ] **Step 8: Smoke test production** — register, play Level 1, submit score, check leaderboard
- [ ] **Step 9: Commit**

```bash
git commit -m "chore: add CI/CD pipelines and production deployment config"
```

---

## Phase 6 Checkpoint — Launch Ready

At completion, you should have:
- Cosmetics store with coins, purchases, and equip
- Full audio (per-tower SFX, biome music, combo cues, boss music)
- VFX polish (particles, screen shake, damage numbers, kill feedback)
- Boss cinematic intros
- Accessibility verified (color independence, keyboard, reduced motion, UI scale)
- Performance optimized (< 200 draw calls, < 300KB gzip, 60 FPS)
- Profile, leaderboard, grimoire UI complete
- CI/CD pipelines
- Production deployment (Fly.io + Cloudflare Pages)

**The game is launch-ready.**
