# Gameplay Rendering & Scene Design Spec

Companion to `docs/main-spec.md`. This document covers scene management, isometric rendering, camera, input, the per-frame game loop, enemy movement, and the HubScene — everything the player sees and interacts with moment-to-moment.

---

## 1. Scene Graph & Flow

```
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

**Phaser scenes** (4 total): `BootScene`, `HubScene`, `GameScene`, `ScoreBreakdownScene`, `BossIntroScene`.
**Preact overlays** (not Phaser scenes): `SettingsOverlay`, all HUD components, tab panels (Profile, Grimoire, Store, Leaderboard).

### Scene Lifecycle

- **BootScene.preload()** — load shared assets (UI sprites, fonts, audio sprites).
- **HubScene.create()** — load campaign map tilemap, render level nodes with star ratings from player progress.
- **GameScene.create()** — load level-specific tilemap + biome sprite atlas, initialize ECS world, spawn grid overlay.
- **GameScene.shutdown()** — destroy ECS world, release level-specific assets.

### Scene Transitions

Fade-to-black tween: 300ms fade out → load next scene → 300ms fade in. This masks asset loading between scenes.

### Key Design Decisions

- **HubScene is the anchor** — a single hub with tab navigation keeps the player oriented. All non-gameplay UI (profile, grimoire, store, leaderboard) is accessible as Preact overlay tabs.
- **SettingsOverlay is a Preact modal**, not a Phaser scene — avoids unnecessary scene teardown/rebuild.
- **BossIntroScene** only triggers for levels with a boss flag. Short cinematic, then transitions to GameScene with boss data loaded.

---

## 2. Isometric Rendering Pipeline

### Coordinate Systems

Two coordinate systems coexist:

- **Grid space (logical)** — flat 2D grid. All game logic (pathfinding, placement, collision) operates here.
- **Screen space (isometric)** — diamond projection for visual rendering only.

Tile dimensions: **128×64 pixels** (standard isometric 2:1 ratio). Defined as constants `TILE_W = 128`, `TILE_H = 64` in `packages/shared/src/constants.ts`.

Conversion formulas (grid → screen):

```
screenX = (gridX - gridY) * TILE_W / 2 + mapOffsetX
screenY = (gridX + gridY) * TILE_H / 2 + mapOffsetY
```

Where `mapOffsetX`/`mapOffsetY` position the grid origin on the canvas (typically centering the map).

Inverse (screen click → grid cell):

```
// First subtract camera scroll and map offset
localX = (clickX + cameraScrollX) - mapOffsetX
localY = (clickY + cameraScrollY) - mapOffsetY

// Then apply inverse isometric transform
gridX = floor(localX / TILE_W + localY / TILE_H)
gridY = floor(localY / TILE_H - localX / TILE_W)
```

### Tile Rendering: Hybrid Approach

- **Base terrain** from Tiled tilemaps — hand-authored per level with terrain types (grass, water, stone, cliffs), decoration layers, and marked walkable/blocked cells. Provides visual richness and per-level identity.
- **Grid overlay** rendered programmatically on top using a Phaser `Graphics` object (redrawn only when grid state changes, not every frame) — shows buildable cells, path hints, hover highlights. This layer is the gameplay interface; the tilemap is the visual backdrop.

### Render Layer Stack (back to front)

| Layer | Name | Content |
|-------|------|---------|
| 0 | Terrain | Tilemap ground, water, cliffs (from Tiled) |
| 1 | Grid overlay | Buildable cells, path hints, hover highlight |
| 2 | Ground effects | Fire trails, ice patches, AoE indicators |
| 3 | Entities | Towers and enemies — **Y-sorted every frame** |
| 4 | Projectiles | Arrows, fireballs, spell bolts |
| 5 | VFX particles | Status effect particles, explosions, damage numbers |
| 6 | Health bars | Always rendered on top of entities |
| DOM | Preact HUD | TopBar, TowerPanel, WavePreview, ComboDisplay |

### Entity Depth Sorting

Entities on Layer 3 are Y-sorted every frame: sprites with a higher `screenY` (further down screen / closer to camera) render on top. This creates correct isometric occlusion.

```
const FLYING_DEPTH_OFFSET = 10000; // must exceed max screenY for largest map
depth = screenY + (entity.isFlying ? FLYING_DEPTH_OFFSET : 0)
```

Flying units always render above ground entities. `FLYING_DEPTH_OFFSET` is defined in `packages/shared/src/constants.ts` and must exceed the maximum `screenY` value for the largest supported map (30×20 grid at 64px tile height = max screenY of ~1600).

---

## 3. Camera & Input

### Camera

- **Fixed zoom** — no pinch/scroll zoom. Zoom level is tuned per map size for consistent tile readability.
- **Panning**: edge-of-screen scroll (mouse near viewport edge), middle-mouse-button drag, and WASD/arrow keys.
- **Clamped to map bounds** with a small margin — cannot scroll past map edges.
- **Initial position**: camera starts centered on the Nexus at level load, then smoothly pans to show the first spawn point before wave 1 begins.
- **Desktop-first**: this is a desktop browser game. Touch/mobile input is out of scope for MVP. If mobile support is added later, touch panning (drag) and tap-to-select would replace edge scroll and right-click respectively.

### Input Model: Click-to-Select with Ghost Preview

**Idle state:**
- Cursor is default
- Hovering over a tower highlights it (outline glow)
- Hovering over an enemy shows health bar tooltip

**Build mode** (activated by clicking a tower type in the build panel):
- A translucent ghost sprite follows the cursor, snapping to grid cells
- **Green ghost** = valid placement (cell is empty, buildable, all paths remain valid)
- **Red ghost** = invalid (cell occupied, non-buildable, or would block all paths to nexus)
- Range circle shown around ghost to preview tower coverage area
- Left-click confirms placement
- Right-click or Escape cancels build mode

**Tower selected** (clicking a placed tower):
- Contextual panel opens (Preact component) showing stats, upgrade branches (A/B), sell button
- Clicking elsewhere deselects

**During waves:**
- All build/upgrade/sell interactions remain available — no "planning phase only" restriction
- Players can build under pressure

### Coordinate Conversion for Clicks

Screen click → subtract camera offset → apply inverse isometric transform → snap to nearest grid cell.

---

## 4. Game Loop & Frame Lifecycle

### GameScene.update(dt) — Per-Frame Pipeline

Every frame (16.6ms target at 60 FPS), systems execute in this order:

| Step | System | Responsibility |
|------|--------|----------------|
| 1 | INPUT | Drain Zustand action queue (build, upgrade, sell, fusion requests from Preact UI) |
| 2 | WAVE | Tick countdown timer, spawn enemies from wave definition, track wave completion |
| 3 | MOVEMENT | Advance enemies along paths with steering behaviors, update positions |
| 4 | TARGETING | Each tower acquires/re-evaluates targets within range (nearest, strongest, first) |
| 5 | ATTACK | Fire cooldown tick, spawn projectile entities toward locked targets |
| 6 | PROJECTILE | Move projectiles, check hit (distance to target < threshold), apply damage + effects |
| 7 | STATUS | Tick effect durations, apply DoT damage, apply slow multipliers, expire finished effects |
| 8 | DEATH | Remove dead enemies, award gold/essence, feed kills to ComboTracker + ScoreSystem |
| 9 | NEXUS | Check enemies reaching nexus: deduct HP, destroy enemy, check game-over condition (`NexusSystem.ts`) |
| 10 | SCORE | Update combo timer, speed bonus tracker, style points, push totals to Zustand store |
| 11 | RENDER | Y-sort entity layer, update sprite positions/animations, sync particle emitters, update health bars |
| — | PREACT | Reacts to Zustand store changes → re-renders HUD (gold, wave, score, combo display) |

### Game Speed & Pause

- **Speed control**: `dt` is multiplied by game speed (1×, 2×, 3×) before passing to all systems. Uses Phaser's `this.time.timeScale` — animations and tweens scale automatically.
- **Pause**: Sets `timeScale = 0`, freezing the ECS update loop. The last rendered frame stays visible (sprites hold their current animation frame). Build/upgrade/sell still work while paused — these actions bypass the time scale and process immediately via the Zustand action queue. Preact overlay shows pause indicator.
- **Game over**: Nexus HP ≤ 0 → freeze all systems → 1-second delay → fade overlay → transition to ScoreBreakdownScene. Score is still submitted (partial completion).

### Wave Lifecycle State Machine

```
PRE_WAVE → SPAWNING → ACTIVE → WAVE_CLEAR → (next wave or level complete)
    ▲                                              │
    └──────────────────────────────────────────────┘
```

- **PRE_WAVE**: Countdown timer visible to player (15-30 seconds, configured per level in `packages/shared/src/data/levels.ts` as `preWaveTimer`). Player can click "Send Wave" early for a speed bonus. Timer expiring auto-starts the wave.
- **SPAWNING**: Enemies enter from spawn point(s) at defined intervals from the wave definition. Multiple enemy types can spawn in a single wave.
- **ACTIVE**: All enemies for the wave have spawned; combat is ongoing. Transitions to WAVE_CLEAR when all enemies are dead or have reached the nexus.
- **WAVE_CLEAR**: Brief pause, gold interest applied, then transition to PRE_WAVE for the next wave. On final wave clear → level complete → ScoreBreakdownScene.

---

## 5. Enemy Movement & Steering

### Path Following

Enemies receive a path (list of grid cells) from the PathManager. Each frame:

1. Interpolate toward the next waypoint: `position += direction * speed * dt * slowMultiplier`
2. When distance to waypoint < threshold, advance to the next waypoint
3. Positions are in grid space; the render step converts to isometric screen coordinates

### Steering Behaviors

Layered on top of path interpolation:

- **Separation** (weight 0.2, radius 0.6 grid cells): enemies push away from nearby enemies within the separation radius — prevents stacking into a single pixel. Creates the organic "horde" feel.
- **Path following** (weight 0.8): a pull toward the path center so separated enemies don't drift too far off-route. Dominant weight keeps enemies on track.

### Repath Triggers

- **Tower placed or sold** → grid version increments → PathManager invalidates cache → all enemies with stale grid versions re-request paths.
- **Repath timing**: enemies don't repath mid-cell. They finish moving to the next waypoint, then switch to the new path. This prevents jittery mid-tile direction changes.
- **Edge case**: if an enemy's current cell becomes blocked (fast placement race condition), force-push the enemy to the nearest walkable cell.

### Flying Enemies

- Skip pathfinding entirely — fly in a straight line from spawn to nexus.
- Still use separation steering to avoid overlapping other flyers.
- Rendered on the same entity layer (Layer 3) but with `FLYING_DEPTH_OFFSET` (10000) so they always appear above ground units.

---

## 6. HubScene & Level Progression

### Layout

- **Center**: Campaign map — an illustrated parchment-style map with level nodes connected by paths. Three regions (Middle-earth, Wizarding World, Westeros) are visually distinct with biome-specific art.
- **Level nodes**: Circular icons showing level number, star rating (0-4 filled stars), and lock/unlock state. Completed nodes glow softly. The current frontier node pulses.
- **Tab bar**: Profile, Grimoire, Store, Leaderboard. Each tab opens a Preact overlay panel on top of the campaign map. The map stays visible but dims underneath.
- **Scrolling**: Campaign map scrolls horizontally across the three Acts using the same pan controls as GameScene (edge scroll, drag, keys).

### Level Node Interactions

- **Hover** → tooltip with level name, best score, star breakdown.
- **Click unlocked node** → level detail panel showing enemy preview, par time, rewards, and a "Play" button.
- **Click locked node** → shows unlock requirement ("Complete Level X" or "Earn Y total stars").

### Unlock Progression

Level numbering: Act 1 = Levels 1-5 + Convergence 6, Act 2 = Levels 7-11 + Convergence 12, Act 3 = Levels 13-17 + Convergence 18. Total: 18 levels.

- Levels unlock linearly within each Act (complete Level 1 → Level 2 unlocks, etc.).
- Convergence levels (6, 12, 18) require completing the previous Act's final level.
- **Star gates**: some levels require a minimum total star count to unlock, encouraging replaying earlier levels for better scores.

### ScoreBreakdownScene → HubScene Return

The ScoreBreakdownScene displays:
- Base score, combo bonus, speed bonus, style points, perfect wave bonus, nexus health bonus
- Star rating animates in (1-4 stars filling sequentially)
- "Continue" button returns to HubScene with the campaign map scrolled to show the newly unlocked next level (if any), with a brief unlock animation on the node.

---

## 7. Visual Feedback Systems

### Tower Placement Ghost

During build mode, the ghost preview provides immediate visual feedback:
- Ghost sprite: 50% opacity version of the tower sprite, snapped to grid
- Color tint: green (valid) or red (invalid) applied as a sprite tint
- Range indicator: semi-transparent circle showing attack range, drawn on Layer 2
- Path validation runs on the cloned grid before confirming — result is reflected in ghost color

### Projectiles

All towers use visible projectiles (no instant-hit):
- Projectile entities are spawned by the AttackSystem and managed by the ProjectileSystem
- Each projectile has: sprite, speed, tracking (homes toward target), and an on-hit effect
- On hit: projectile is destroyed, damage is applied, and impact VFX plays (particle burst at hit location)
- Projectile types are defined per tower in shared data (arrow, fireball, spell bolt, etc.)

### Health Bars

- Rendered on Layer 6, always above entities
- Positioned above each enemy sprite with a fixed screen-space offset
- Two-bar design: background (dark) + foreground (color-coded by HP percentage: green > yellow > red)
- Bosses get a larger, named health bar anchored to screen top (not world-space)

### Status Effect VFX

Status effects are communicated through particle effects attached to enemy sprites (no icons):
- **Slow/Freeze**: frost crystals orbiting the enemy, blue-tinted particles
- **Burn**: flame particles rising from the enemy, orange glow
- **Poison**: green bubbling particles, sickly tint
- **Curse**: purple wisps swirling around the enemy
- Multiple effects stack visually — an enemy that is burning and slowed shows both flame and frost particles

### Damage Numbers

Floating damage text on Layer 5:
- Spawns at hit location, floats upward with slight random horizontal offset
- Color-coded by damage type (white = physical, orange = fire, blue = ice, green = poison, purple = arcane)
- Critical hits use larger font + brief scale pop animation
- Fades out over ~1 second
