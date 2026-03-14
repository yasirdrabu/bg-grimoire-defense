# Gameplay Rendering & Scene Design Spec

Companion to `docs/specs/main-spec.md`. This document covers scene management, isometric rendering, camera, input, the per-frame game loop, enemy movement, HubScene, and visual feedback — everything the player sees and interacts with moment-to-moment.

Cross-references use section names from the main spec. When this document and the main spec conflict, the main spec wins.

---

## 1. Scene Graph & Flow

```text
BootScene (preload shared assets, splash)
    │
    ▼
HubScene (campaign map + tabs: profile, grimoire, store, leaderboard)
    │
    ├── [click level node] ──▶ GameScene (core gameplay)
    │                              │
    │                              ▼
    │                         ScoreBreakdownScene (post-level results)
    │                              │
    │                              └── [continue] ──▶ HubScene
    │
    ├── [boss level] ──▶ BossIntroScene (cinematic 3-5s) ──▶ GameScene
    │
    └── [settings gear] ──▶ SettingsOverlay (Preact modal, not a scene switch)
```

**Phaser scenes** (5 total): `BootScene`, `HubScene`, `GameScene`, `ScoreBreakdownScene`, `BossIntroScene`.
**Preact overlays** (not Phaser scenes): `SettingsOverlay`, all HUD components, tab panels (Profile, Grimoire, Store, Leaderboard).

### Scene Lifecycle

| Scene | Key Method | What Happens |
|-------|------------|--------------|
| BootScene | `preload()` | Load shared assets: UI sprites, fonts, audio sprite manifests, hub map tileset. Target < 2MB (see main spec "Asset Loading Strategy"). |
| HubScene | `create()` | Load campaign map tilemap, render level nodes with star ratings from `usePlayerStore`. Spawn Preact tab bar. |
| GameScene | `create()` | Load level-specific tilemap + biome sprite atlas. Initialize ECS `World` (see main spec "ECS Contract"). Spawn grid overlay. Wire `InputSystem` to drain `useGameStore.pendingActions`. |
| GameScene | `shutdown()` | Destroy ECS World. Call `useGameStore.resetGameState()`. Release level-specific assets (retain biome atlas in cache for replays — evict only on biome switch). |
| ScoreBreakdownScene | `create()` | Receives score data captured during `GameScene`'s pre-shutdown phase (before `resetGameState()`). Displays breakdown and star animation. |

### Scene Transitions

Fade-to-black tween: 300ms fade out → load next scene → 300ms fade in. This masks asset loading between scenes.

**Loading gate**: The fade-in does NOT begin until all required assets are loaded. During the black interval, a progress bar is visible. No time-boxed fade — we wait for assets. See main spec "Asset Loading Strategy" for per-tier budgets.

### Key Design Decisions

- **HubScene is the anchor** — a single hub with tab navigation keeps the player oriented. All non-gameplay UI (profile, grimoire, store, leaderboard) is accessible as Preact overlay tabs.
- **HubScene is a hybrid renderer** — Phaser renders the campaign map (tilemap, level node sprites, scrolling). Preact renders tab panels, tooltips, and level detail modals. The map dims (alpha overlay) when a Preact tab is open.
- **SettingsOverlay is a Preact modal**, not a Phaser scene — avoids unnecessary scene teardown/rebuild.
- **BossIntroScene** only triggers for levels where the wave definition includes a boss flag. Short cinematic (3-5s), then transitions to GameScene with boss entity data pre-loaded.

---

## 2. Isometric Rendering Pipeline

### Coordinate Systems

Two coordinate systems coexist:

- **Grid space (logical)** — flat 2D grid. All game logic (pathfinding, placement, collision, ECS Position component) operates here.
- **Screen space (isometric)** — diamond projection for visual rendering only. Only the `RenderSystem` (see main spec "ECS Contract") performs this conversion.

Tile dimensions: **128×64 pixels** (standard isometric 2:1 ratio). Defined as constants `TILE_W = 128`, `TILE_H = 64` in `packages/shared/src/constants.ts`.

Conversion formulas (grid → screen):

```text
screenX = (gridX - gridY) * TILE_W / 2 + mapOffsetX
screenY = (gridX + gridY) * TILE_H / 2 + mapOffsetY
```

Where `mapOffsetX`/`mapOffsetY` position the grid origin on the canvas (typically centering the map).

Inverse (screen click → grid cell):

```text
// First subtract camera scroll and map offset
localX = (clickX + cameraScrollX) - mapOffsetX
localY = (clickY + cameraScrollY) - mapOffsetY

// Then apply inverse isometric transform
gridX = floor(localX / TILE_W + localY / TILE_H)
gridY = floor(localY / TILE_H - localX / TILE_W)
```

Both conversions live in a utility module (`packages/client/src/game/utils/isoMath.ts`) and are used by `RenderSystem` (grid→screen) and the input handler (screen→grid).

### Tile Rendering: Hybrid Approach

- **Base terrain** from Tiled tilemaps — hand-authored per level with terrain types (grass, water, stone, cliffs), decoration layers, and marked walkable/blocked cells. Loaded via Phaser's built-in Tiled/JSON tilemap support (`this.make.tilemap()`), rendered with `createLayer()`. Provides visual richness and per-level identity.
- **Grid overlay** rendered programmatically on top using a Phaser `Graphics` object — shows buildable cells, path hints, hover highlights. **Dirty-flagged**: redrawn only when grid state changes (tower placed/sold, build mode entered/exited), not every frame. During build mode, the overlay also shows the pre-computed buildability map (see "Build-Mode Hover Optimization" below).

### Render Layer Stack (back to front)

Each layer is a separate Phaser `Layer` (or `Container` for Y-sorted content), set via `setDepth()`:

| Layer | Depth | Name | Content |
|-------|-------|------|---------|
| 0 | 0 | Terrain | Tilemap ground, water, cliffs (from Tiled) |
| 1 | 100 | Grid overlay | Buildable cells, path hints, hover highlight |
| 2 | 200 | Ground effects | Fire trails, ice patches, AoE indicators |
| 3 | 300-399 | Entities | Towers and enemies — **Y-sorted every frame** via Phaser `Layer` |
| 4 | 400 | Projectiles | Arrows, fireballs, spell bolts |
| 5 | 500 | VFX particles | Status effect particles, explosions, damage numbers |
| 6 | 600 | Health bars | Always rendered on top of entities |
| DOM | — | Preact HUD | TopBar, TowerPanel, WavePreview, ComboDisplay |

### Entity Depth Sorting

Entities on Layer 3 use a dedicated Phaser `Layer` container with depth-sort enabled. `RenderSystem` sets each sprite's depth within the layer:

```text
depth = screenY + (entity.isFlying ? FLYING_DEPTH_OFFSET : 0)
```

Phaser's `Layer.sort('depth')` handles the Y-sort automatically each frame. This is more performant than manually managing a flat display list.

`FLYING_DEPTH_OFFSET = 10000` is defined in `packages/shared/src/constants.ts` and must exceed the maximum `screenY` value for the largest supported map (30×20 grid at 64px tile height = max screenY of ~1600). Flying units always render above ground entities.

---

## 3. Camera & Input

### Camera

- **Fixed zoom** — no pinch/scroll zoom. Zoom level is tuned per map size (stored in level data) for consistent tile readability.
- **Panning**: edge-of-screen scroll (mouse near viewport edge), middle-mouse-button drag, and WASD/arrow keys.
- **Clamped to map bounds** with a small margin (0.5 tiles) — cannot scroll past map edges.
- **Initial position**: camera starts centered on the Nexus at level load, then smoothly pans (Phaser tween, ~1.5s) to show the first spawn point before wave 1 begins. Returns to player control after the pan completes.
- **Desktop-first**: this is a desktop browser game. Touch/mobile input is out of scope for MVP. If mobile support is added later, touch panning (drag) and tap-to-select would replace edge scroll and right-click respectively.

### Input Model: Click-to-Select with Ghost Preview

Three input states, managed by `useUIStore.inputMode`:

**Idle state** (`inputMode: 'idle'`):

- Cursor is default
- Hovering over a tower highlights it (outline glow via Phaser's pipeline/post-FX)
- Hovering over an enemy shows health bar tooltip
- Left-click on a placed tower → switch to Tower Selected state

**Build mode** (`inputMode: 'build'`, activated by clicking a tower type in `TowerPanel`):

- A translucent ghost sprite follows the cursor, snapping to grid cells
- **Green ghost** = valid placement (cell is empty, buildable, all paths remain valid)
- **Red ghost** = invalid (cell occupied, non-buildable, or would block all paths to nexus)
- Range circle shown around ghost to preview tower coverage area (drawn on Layer 2)
- Left-click confirms placement → dispatches `BUILD_TOWER` action to `useGameStore`
- Right-click or Escape cancels build mode → returns to idle
- Path preview line shows where enemies *would* walk if tower were placed (see main spec "Tutorial & Onboarding")

**Tower selected** (`inputMode: 'selected'`, set when clicking a placed tower):

- Contextual panel opens (`TowerInfo.tsx` Preact component) showing stats, upgrade branches (A/B), sell button, and fuse button (if adjacent tower qualifies)
- Range circle visible around selected tower
- Clicking elsewhere → deselects → returns to idle
- Upgrade/sell/fuse buttons dispatch the appropriate `GameAction` to `useGameStore`

**During waves:**

- All build/upgrade/sell/fuse interactions remain available — no "planning phase only" restriction
- Players can build under pressure

### Build-Mode Hover Optimization

Path validation per hover cell is expensive (Web Worker round-trip). Optimization:

1. On entering build mode, `PathManager.precomputeBuildability()` sends a `VALIDATE_PLACEMENT` batch to the worker for all empty, walkable cells.
2. Results are cached in a `Map<string, boolean>` keyed by `"gridX,gridY"`.
3. Hover lookups are O(1) from cache — no per-hover worker calls.
4. Cache is invalidated whenever the grid version changes (tower placed/sold during build mode).
5. Mouse position → grid cell conversion is debounced to 100ms to avoid redundant ghost sprite updates during fast mouse movement.

### Coordinate Conversion for Clicks

Screen click → subtract camera scroll → subtract map offset → apply inverse isometric transform → `floor()` to snap to nearest grid cell. See formulas in Section 2.

### Keyboard Shortcuts

See main spec "Accessibility" for the full list. Key bindings relevant to gameplay:

| Key | Action |
|-----|--------|
| 1-5 | Select tower type from build panel |
| Q / E | Cycle through tower types |
| Tab | Cycle through placed towers |
| Space | Send wave early |
| Escape | Cancel build mode / deselect tower |
| P | Toggle pause |
| +/- | Cycle game speed (1×/2×/3×) |

---

## 4. Game Loop & Frame Lifecycle

### GameScene.update(dt) — Per-Frame Pipeline

Every frame (16.6ms target at 60 FPS), systems execute in this order. All systems are plain functions conforming to `(world: World, dt: number) => void` (see main spec "ECS Contract"). Only `RenderSystem` touches Phaser APIs.

| Step | System | File | Responsibility |
|------|--------|------|----------------|
| 1 | INPUT | `InputSystem.ts` | Drain `useGameStore.pendingActions` queue. Process BUILD_TOWER, UPGRADE_TOWER, SELL_TOWER, FUSE_TOWERS, SEND_WAVE_EARLY, SET_SPEED, TOGGLE_PAUSE. |
| 2 | WAVE | `WaveSystem.ts` | Tick countdown timer, spawn enemies from wave definition, track wave state machine (PRE_WAVE → SPAWNING → ACTIVE → WAVE_CLEAR). |
| 3 | MOVEMENT | `MovementSystem.ts` | Advance enemies along paths with steering behaviors (separation + path-following), update `Position` components. |
| 4 | TARGETING | `TargetingSystem.ts` | Each tower with `Attack` component acquires/re-evaluates targets within range. Targeting modes: nearest, strongest, first (configurable per tower). |
| 5 | ATTACK | `AttackSystem.ts` | Fire cooldown tick. When cooldown expires and target is locked, spawn a `Projectile` entity toward target. |
| 6 | PROJECTILE | `ProjectileSystem.ts` | Move projectile entities toward targets. Check hit (distance to target < threshold). On hit: apply damage via `Health` component, apply status effects via `StatusEffects` component, destroy projectile entity. |
| 7 | STATUS | `StatusEffectSystem.ts` | Tick effect durations, apply DoT damage, apply slow multipliers to `Movement.slowMultiplier`, expire finished effects. |
| 8 | DEATH | `DeathSystem.ts` | Query entities where `Health.current <= 0`. Award gold/essence (via `shared/logic/GoldManager`). Feed kills to `shared/logic/ComboTracker` + `ScoreSystem`. Destroy entity. |
| 9 | NEXUS | `NexusSystem.ts` | Check enemies reaching nexus (position within nexus cell threshold). Deduct `useGameStore.nexusHP`. Destroy enemy (no gold reward). Check game-over condition (HP ≤ 0). |
| 10 | SCORE | `ScoreSystem.ts` | Update combo timer (via `shared/logic/ComboTracker`), speed bonus tracker, style points. Push totals to `useGameStore`. |
| 11 | RENDER | `RenderSystem.ts` | Y-sort entity layer, convert `Position` (grid) → screen coordinates, update Phaser sprite positions/animations, sync particle emitters, update health bar positions. This is the ONLY system that reads the `Renderable` component. |
| — | PREACT | (reactive) | Zustand store changes trigger Preact re-renders for HUD (gold, wave, score, combo display). No explicit system call. |

### System Execution

`GameScene.update()` calls each system function in sequence:

```typescript
update(time: number, delta: number) {
  const dt = delta * this.time.timeScale;
  if (dt === 0 && !this.hasPendingPauseActions()) return; // paused, skip unless pause-safe actions queued

  inputSystem(this.world, dt);
  waveSystem(this.world, dt);
  movementSystem(this.world, dt);
  targetingSystem(this.world, dt);
  attackSystem(this.world, dt);
  projectileSystem(this.world, dt);
  statusEffectSystem(this.world, dt);
  deathSystem(this.world, dt);
  nexusSystem(this.world, dt);
  scoreSystem(this.world, dt);
  renderSystem(this.world, dt); // only this touches Phaser
}
```

### Game Speed & Pause

- **Speed control**: `dt` is multiplied by game speed (1×, 2×, 3×) via Phaser's `this.time.timeScale`. Animations and tweens scale automatically. Speed is set by the `SET_SPEED` action from `SpeedControls.tsx`.
- **Pause**: Sets `timeScale = 0`, freezing the ECS update loop. The last rendered frame stays visible (sprites hold their current animation frame — no idle animations play during pause). `InputSystem` still runs to process pause-safe actions (BUILD_TOWER, UPGRADE_TOWER, SELL_TOWER, FUSE_TOWERS, TOGGLE_PAUSE). Preact overlay shows a semi-transparent pause indicator.
- **Game over**: Nexus HP ≤ 0 → `NexusSystem` sets a `gameOver` flag → all other systems skip processing → 1-second Phaser timer → fade overlay → transition to ScoreBreakdownScene. Score is still submitted (partial completion). See main spec "Anti-Cheat Strategy" for server-side validation.

### Wave Lifecycle State Machine

```text
PRE_WAVE → SPAWNING → ACTIVE → WAVE_CLEAR → (next wave or level complete)
    ▲                                              │
    └──────────────────────────────────────────────┘
```

- **PRE_WAVE**: Countdown timer visible to player. Duration uses the formula from main spec "Wave Composition": `baseCountdown - (waveIndex * reductionPerWave)`, minimum 8 seconds. Player can click "Send Wave" early (`SEND_WAVE_EARLY` action) for speed bonus points (`remainingCountdown * 10`). Timer expiring auto-starts the wave.
- **SPAWNING**: Enemies enter from spawn point(s) at defined intervals from the wave definition in `packages/shared/src/data/levels.ts`. Multiple enemy types can spawn in a single wave. Enemy stats scale per-level (see main spec "Enemy Data Framework" for multiplier formula).
- **ACTIVE**: All enemies for the wave have spawned; combat is ongoing. Transitions to WAVE_CLEAR when all enemies are dead or have reached the nexus.
- **WAVE_CLEAR**: 2-second pause. Gold interest applied (`10% of banked gold, capped at 50g` — see main spec "Game Economy"). Interest amount shown as a gold popup animation ("+12g interest"). Then transition to PRE_WAVE for the next wave. On final wave clear → level complete → ScoreBreakdownScene.

---

## 5. Enemy Movement & Steering

### Path Following

Enemies receive a path (list of grid cells) from `PathManager`. The `Movement` ECS component stores the path, current path index, speed, and slow multiplier. Each frame in `MovementSystem`:

1. Compute direction vector toward the next waypoint
2. Apply steering forces (separation + path-following)
3. Interpolate position: `position += resultantDirection * speed * dt * slowMultiplier`
4. When distance to current waypoint < 0.1 grid cells, advance `pathIndex` to the next waypoint
5. All positions remain in grid space; `RenderSystem` converts to isometric screen coordinates

### Steering Behaviors

Layered on top of path interpolation:

- **Separation** (weight 0.2, radius 0.6 grid cells): enemies push away from nearby enemies within the separation radius — prevents stacking into a single pixel. Creates the organic "horde" feel. Computed by iterating nearby entities with `Position` + `Movement` components.
- **Path following** (weight 0.8): a pull toward the path center so separated enemies don't drift too far off-route. Dominant weight keeps enemies on track.

**Performance note**: Separation is O(n²) over alive enemies. At the target ceiling of 40-60 simultaneous enemies (see main spec "Max Enemy Count"), this costs < 0.1ms per frame. No spatial partitioning needed at this scale.

### Repath Triggers

- **Tower placed or sold** → grid version increments (counter on `PathManager`) → all enemies with a stale `gridVersion` in their `Movement` component re-request paths from `PathManager`.
- **Repath timing**: enemies don't repath mid-cell. They finish moving to the next waypoint (current `pathIndex`), then switch to the new path from their current cell. This prevents jittery mid-tile direction changes.
- **Edge case**: if an enemy's current cell becomes blocked (fast placement race condition), force-push the enemy to the nearest walkable cell via BFS from its current position.
- **Boss-induced repath**: Bosses that alter the grid (Balrog fire trails, White Walker ice walls — see main spec "Boss Encounters") also increment the grid version, triggering re-pathing.

### Flying Enemies

- Skip pathfinding entirely — fly in a straight line from spawn to nexus. `Movement` component stores a direct path of `[spawnPos, nexusPos]`.
- Still use separation steering to avoid overlapping other flyers.
- Rendered on the same entity layer (Layer 3) but with `FLYING_DEPTH_OFFSET` (10000) added to their depth value, so they always appear above ground units.
- Only targetable by towers with an `canTargetAir: true` flag in their `TowerData` component.

---

## 6. HubScene & Level Progression

### Layout

- **Center**: Campaign map — an illustrated parchment-style map rendered as a Phaser tilemap, with level nodes as interactive sprites connected by decorative paths. Three regions (Middle-earth, Wizarding World, Westeros) are visually distinct with biome-specific art.
- **Level nodes**: Circular sprites showing level number, star rating (0-4 filled stars), and lock/unlock state. Completed nodes glow softly (Phaser tween on alpha). The current frontier node pulses (scale tween). Data sourced from `usePlayerStore.progress`.
- **Tab bar**: Profile, Grimoire, Store, Leaderboard — rendered as Preact components. Each tab opens a Preact overlay panel on top of the campaign map. The map stays visible but dims underneath (Phaser `Graphics` rect at 0.5 alpha over the map, behind the Preact DOM layer).
- **Scrolling**: Campaign map scrolls horizontally across the three Acts using the same pan controls as GameScene (edge scroll, drag, keys). Camera clamped to map bounds.

### Level Node Interactions

- **Hover** → Preact tooltip with level name, best score, star breakdown, difficulty badge.
- **Click unlocked node** → `LevelDetail.tsx` Preact panel showing enemy preview (types + counts), par time, rewards, difficulty selector, and a "Play" button. Play dispatches scene transition.
- **Click locked node** → shows unlock requirement ("Complete Level X" or "Earn Y total stars").

### Unlock Progression

Level numbering from main spec: Act 1 = Levels 1-5 + Convergence 6, Act 2 = Levels 7-11 + Convergence 12, Act 3 = Levels 13-17 + Convergence 18. Total: 18 levels.

- Levels unlock linearly within each Act (complete Level 1 → Level 2 unlocks, etc.).
- Convergence levels (6, 12, 18) require completing the previous Act's final level.
- **Star gates**: some levels require a minimum total star count to unlock, encouraging replaying earlier levels for better scores.

### ScoreBreakdownScene → HubScene Return

The ScoreBreakdownScene displays all score components from main spec "Scoring System":

- Base score, combo score (best combo highlighted), speed bonus, style points, perfect wave bonus, nexus health bonus
- Star rating animates in (1-4 stars filling sequentially with a satisfying chime per star)
- Total score with rank indicator if it made the leaderboard
- "Continue" button returns to HubScene with the campaign map scrolled to show the newly unlocked next level (if any), with a brief unlock animation (glow + scale pop) on the node

---

## 7. Visual Feedback Systems

### Tower Placement Ghost

During build mode, the ghost preview provides immediate visual feedback:

- Ghost sprite: 50% opacity version of the tower sprite, snapped to grid
- Color tint: green (valid) or red (invalid) applied as a Phaser sprite tint
- Range indicator: semi-transparent circle showing attack range, drawn on Layer 2 (ground effects)
- Path preview: dotted line showing the new enemy path if tower were placed here (see main spec "Tutorial & Onboarding — Path Visualization")
- Validity is read from the pre-computed buildability cache (see "Build-Mode Hover Optimization" in Section 3)
- Accessibility: green/red tint is supplemented with checkmark/X icon overlay (see main spec "Accessibility")

### Projectiles

All towers use visible projectiles (no instant-hit). Projectile entities have:

- A `Renderable` component with a sprite (arrow, fireball, spell bolt — defined per tower in `packages/shared/src/data/towers.ts` as `projectileType`)
- `Movement` component: speed and homing behavior (tracks target position each frame)
- On hit: projectile entity destroyed, damage applied via `Health` component, status effects applied via `StatusEffects` component, impact VFX plays (particle burst at hit location from `ParticlePresets.ts`)
- Tower fire feedback: recoil animation + muzzle particle + fire SFX (see main spec "Game Feel & Juice")

### Health Bars

- Rendered on Layer 6 (depth 600), always above entities
- Positioned above each enemy sprite with a fixed pixel offset (not world-space — stays consistent regardless of zoom)
- Two-bar design: background (dark gray) + foreground (color-coded by HP percentage: green > 60%, yellow 30-60%, red < 30%)
- Width: proportional to enemy type (larger enemies = wider bars)
- **Bosses**: larger, named health bar anchored to screen top (fixed to camera, not world-space). Shows boss name, phase indicator, and HP with numeric display. See main spec "Boss Encounters" for phase transitions that affect the bar.

### Status Effect VFX

Status effects are communicated through Phaser particle emitters attached to enemy sprites. Effects defined in `ParticlePresets.ts`:

- **Slow/Freeze**: frost crystals orbiting the enemy, blue-tinted particles
- **Burn**: flame particles rising from the enemy, orange glow
- **Poison**: green bubbling particles, sickly tint
- **Curse**: purple wisps swirling around the enemy
- **Fear** (Nazgûl Shade aura — see main spec enemy table): dark tendrils radiating outward
- Multiple effects stack visually — an enemy that is burning and slowed shows both flame and frost particles simultaneously

### Damage Numbers

Floating damage text on Layer 5 (VFX particles), managed by `DamageNumbers.ts`:

- Spawns at hit location, floats upward (~40px over ~1s) with slight random horizontal offset (±8px) to prevent overlap
- Color-coded by damage type: white = physical, orange = fire, blue = ice, green = poison, purple = arcane
- Critical hits use larger font (1.5x scale) + brief scale pop animation (overshoot tween)
- Fades out over ~1 second (alpha tween)
- **Combo kills** (3+ rapid kills): damage numbers combine into a single larger number with the combo multiplier shown (see main spec "Scoring System — Combo Display Escalation")

### Kill Confirmation

From main spec "Game Feel & Juice":

- Per-enemy death animation (dissolve for magic enemies, collapse for physical, explosion for bosses)
- Gold coin particle flies from death location toward the gold counter in the TopBar HUD
- Kill SFX varies by enemy type
- Combo kills (3+): rising-pitch audio cue reinforcing the chain

### Wave Transitions

- **Wave start**: biome-specific horn/alarm SFX + "Wave X/Y" text pulse (centered, large, fades after 1.5s)
- **Wave clear**: triumphant chime + gold interest popup animation ("+12g interest" floats upward from gold counter)
- **Boss wave**: preceded by BossIntroScene (3-5s cinematic), then 5-second fixed countdown

### Tower Upgrade Feedback

- Brief white flash (100ms) → color-coded particle burst (branch A = blue, branch B = red) → sprite swap to upgraded version
- Range circle briefly pulses to show new (larger) range
- Satisfying "level up" SFX
- Tier 3 upgrades get a more dramatic effect: screen-edge glow matching branch color

---

## 8. Performance Budgets

Target: stable 60 FPS on mid-range hardware (integrated GPU, 2020-era laptop).

| Metric | Budget |
|--------|--------|
| Frame time | < 12ms game logic + < 4ms render |
| Draw calls | < 200 per frame (sprite batching via texture atlases) |
| Alive entities | ≤ 60 (enemies) + ≤ 25 (towers) + ≤ 100 (projectiles) |
| Particle emitters | ≤ 30 active simultaneously |
| DOM nodes (Preact) | < 500 total HUD elements |

**Key optimizations**:

- Texture atlases per biome (TexturePacker) — minimizes draw calls via sprite batching
- Grid overlay uses dirty-flag redraw, not per-frame
- Y-sort via Phaser `Layer.sort()` — native implementation, not manual
- Steering separation only iterates alive enemies with `Movement` component
- Pathfinding is off main thread (Web Worker)
- Buildability pre-computation on build-mode enter (not per-hover)
