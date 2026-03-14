# Preact HUD Overlay — Design Spec

## Overview

Mount a Preact UI overlay on top of the Phaser canvas to display game state (resources, wave, HP, score) and provide interactive controls (tower building, upgrades, speed, wave send). Replaces keyboard-only interaction with a full visual HUD.

## Decisions

- **Visual style**: Hybrid — modern layout with fantasy accents (gold highlights, subtle dark leather gradients, clean sans-serif text)
- **TowerPanel position**: Bottom bar (72px), horizontal strip with centered tower buttons
- **TowerInfo behavior**: Replaces bottom bar content when a placed tower is selected
- **Reactivity approach**: Preact with `useSyncExternalStore` imported from `preact/compat` (shimmed by `@preact/preset-vite` which aliases `react` → `preact/compat`). Reads from existing vanilla Zustand stores. No new runtime dependencies.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  ⬡ Gold  ◆ Essence  │  WAVE n/N  │  ♥ HP bar  ★ Score  │  ← TopBar (48px)
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐        ComboDisplay    ┌──────────────┐    │
│ │NEXT WAVE │        (fade in/out)   │ 1× [2×] 3× ⏸│    │
│ │ enemies  │                        └──────────────┘    │
│ │[SEND ⎵]  │                         SpeedControls     │
│ └──────────┘     Phaser Canvas                          │
│  WavePreview     (pointer passthrough)                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│    [Tower1]  [Tower2]  [Tower3]  [Tower4]  [Tower5]     │  ← BottomBar (72px)
│       1         2         3         4         5          │    TowerPanel ↔ TowerInfo
└─────────────────────────────────────────────────────────┘
```

## Components

### File Structure

```
packages/client/src/ui/
├── App.tsx                 # Root component, renders all HUD children
├── hooks/
│   └── useStore.ts         # useSyncExternalStore wrapper with selector
└── hud/
    ├── TopBar.tsx           # Gold, Essence, Wave counter, Nexus HP bar, Score
    ├── BottomBar.tsx        # Container swapping TowerPanel ↔ TowerInfo
    ├── TowerPanel.tsx       # Tower build buttons with hotkey badge + cost
    ├── TowerInfo.tsx        # Selected tower stats, upgrade, sell
    ├── WavePreview.tsx      # Next wave composition + Send Early button
    ├── SpeedControls.tsx    # 1×/2×/3× speed + pause toggle
    └── ComboDisplay.tsx     # Combo count + multiplier, CSS fade
```

### App.tsx

Root Preact component mounted to `#ui-overlay`. Renders all HUD children with no props — every component reads directly from stores via `useStore`.

### useStore Hook

```ts
function useStore<T, S>(store: StoreApi<T>, selector: (state: T) => S): S
```

A ~5-line wrapper around `useSyncExternalStore` (imported from `preact/compat`) that accepts a vanilla Zustand store and a selector function. Handles `subscribe` and `getSnapshot` mapping.

### TopBar

- **Left section**: Gold (hex icon + count), Essence (diamond icon + count)
- **Center section**: Wave counter (`WAVE n / N`)
- **Right section**: Nexus HP (heart icon + progress bar + `current/max`), Score (star icon + formatted number)
- Reads from `useGameStore`: `gold`, `essence`, `wave`, `totalWaves`, `nexusHP`, `maxNexusHP`, `score`

### BottomBar

Container that reads `useUIStore.inputMode`:
- `'idle'` or `'build'` → renders **TowerPanel**
- `'selected'` → renders **TowerInfo**

### TowerPanel

- Renders one button per tower in `TOWERS` (from `@grimoire/shared`)
- Each button shows: procedural icon (colored shape), gold cost, hotkey badge (1-5)
- **Affordability**: button at 50% opacity when `gold < tower.cost`
- **Active build**: gold border on the tower matching `useUIStore.buildTowerType`
- **Click**: calls `useUIStore.enterBuildMode(towerId)` only. This puts Phaser into build mode with ghost preview. The actual `BUILD_TOWER` dispatch happens when the player confirms placement by clicking a valid grid cell in Phaser's GameScene — TowerPanel does NOT dispatch `BUILD_TOWER`.
- Towers that can't be afforded show dimmed cost in muted color

### TowerInfo

Displayed when `useUIStore.inputMode === 'selected'`. Reads `selectedTowerData` from `useGameStore`.

Shows:
- Tower name, tier, icon
- Stats: damage, attack speed, range, special ability text
- **Upgrade A button**: cost + description, dimmed if unaffordable
- **Upgrade B button**: cost + description, dimmed if unaffordable
- **Sell button**: shows refund amount (50% of total invested)
- **Close button (✕)**: calls `useUIStore.deselectTower()`

Upgrade clicks dispatch `{ type: 'UPGRADE_TOWER', towerId, branch: 'A'|'B' }`.
Sell clicks dispatch `{ type: 'SELL_TOWER', towerId }`.

### WavePreview

- Positioned top-left, floating panel
- Shows enemy composition for the next wave: enemy name + colored dot + count
- **Send Early button**: dispatches `{ type: 'SEND_WAVE_EARLY' }`, disabled during active wave
- Reads `nextWaveEnemies`, `wave`, and `waveState` from `useGameStore`
- `waveState === 'pre' | 'clear'`: Send Early enabled, shows "Ready"
- `waveState === 'spawning' | 'active'`: Send Early disabled, shows "In Progress"

### SpeedControls

- Positioned top-right, floating panel
- Three speed buttons: 1×, 2×, 3× — dispatch `{ type: 'SET_SPEED', speed }`
- Pause button: dispatches `{ type: 'TOGGLE_PAUSE' }`
- Active speed gets gold border highlight
- Reads `gameSpeed` and `isPaused` from `useGameStore`

### ComboDisplay

- Positioned top-center, below TopBar
- Only renders when `comboCount >= 2`
- Shows combo count (large) + multiplier text (small)
- CSS transitions: fade-in 200ms on appear, fade-out 500ms on reset
- Reads `comboCount` and `comboMultiplier` from `useGameStore`

## Store Changes

### useGameStore — New Fields

```ts
// Added to GameState interface:
waveState: 'pre' | 'spawning' | 'active' | 'clear';
nextWaveEnemies: Array<{ enemyType: string; count: number }>;
selectedTowerData: {
  id: string;
  name: string;
  tier: number;
  damage: number;
  attackSpeed: number;
  range: number;
  special: string | null;
  upgradeCostA: number | null;
  upgradeCostB: number | null;
  sellRefund: number;
} | null;

// New action on the store:
projectSelectedTower: (towerId: string, data: SelectedTowerData) => void;
```

- `nextWaveEnemies` — projected by WaveSystem (or GameScene wave logic) when a wave ends. **Prerequisite**: wave composition data must exist (currently waves are hardcoded as `10 + wave*2` orc_grunts). Until proper level data exists, this will show a placeholder or be computed from the simple formula.
- `selectedTowerData` — projected by a new `projectSelectedTower(towerId: string)` action on `useGameStore`. Called by GameScene's tower click handler (where the ECS World is accessible). When the player clicks a placed tower, GameScene reads the tower's ECS components (TowerData, Attack, Health) and calls `useGameStore.getState().projectSelectedTower(towerId)` to populate this field. `useUIStore.selectTower()` continues to handle only the UI mode switch.
- `waveState` — tracks current wave phase for WavePreview button states

### Default Values

```ts
waveState: 'pre',
nextWaveEnemies: [],
selectedTowerData: null,
```

## Data Flow

```
Phaser ECS systems ──write──→ useGameStore ──read──→ Preact components (reactive)
                                                          │
Preact components ──dispatch──→ useGameStore.pendingActions
                                     │
                              InputSystem ──drainActions──→ Phaser game logic
                                     │
                              useUIStore ←──→ build mode, tower selection state
```

- Phaser systems write game state every frame (gold, wave, HP, score, combo, etc.)
- Preact components read reactively via `useSyncExternalStore`
- UI actions (build, upgrade, sell, speed, pause, send wave) go through `dispatch()` into the pending action queue
- Phaser's InputSystem drains the queue each frame

## Pointer Passthrough

The `#ui-overlay` div:

```css
#ui-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}
```

Each HUD component container gets `pointer-events: auto` so only UI elements intercept clicks. All other areas pass through to the Phaser canvas beneath.

## Styling

- **TailwindCSS v4** utility classes for layout, spacing, typography
- **CSS custom properties** for the hybrid theme palette:
  - `--hud-bg`: dark leather/slate gradient backgrounds
  - `--hud-border`: gold accent borders (`rgba(139,105,20,0.4)`)
  - `--hud-gold`: `#ffd700` for gold currency and highlights
  - `--hud-essence`: `#b366ff` for essence currency
  - `--hud-hp`: `#f87171` for health
  - `--hud-text`: `#e2e8f0` for primary text
  - `--hud-muted`: `#94a3b8` for secondary text
- **Font**: system-ui sans-serif for readability
- **Backgrounds**: `linear-gradient` with dark leather tones fading to slate, semi-transparent
- **Borders**: subtle gold (`rgba(139,105,20,0.3-0.4)`) with decorative gradient lines on TopBar/BottomBar
- **Active states**: gold border + slightly brighter background

## Game Over State

When `isGameOver` becomes true:
- All interactive controls (TowerPanel buttons, SpeedControls, WavePreview Send Early) become disabled (dimmed, no pointer events)
- TopBar remains visible showing final stats
- The HUD does NOT render a game-over screen — Phaser handles the scene transition to ScoreBreakdownScene per the gameplay spec

## Resize Behavior

The `#ui-overlay` fills the full browser viewport (`position: fixed; inset: 0`). HUD elements anchor to viewport edges, not the Phaser canvas bounds. This is intentional — the HUD wraps the game canvas rather than aligning to it. If Phaser letterboxes (black bars), the HUD extends across the full viewport including the bars, providing a frame effect. This avoids complexity of syncing with `game.scale` events and keeps HUD positioning simple with CSS.

## Prerequisites & Limitations

These items are referenced by this spec but do not yet exist. The HUD will degrade gracefully:

1. **Wave composition data**: `nextWaveEnemies` requires level data with wave definitions. Until then, WavePreview shows a computed preview based on the current formula (`10 + wave*2` orc_grunts) or is hidden.
2. **Upgrade branch data**: `TowerInfo` upgrade buttons require branching upgrade definitions in `packages/shared/src/data/`. Until then, upgrade buttons show costs from `upgradeCostTier2`/`upgradeCostTier3` without branch descriptions, or are hidden if tier is already max.
3. **InputSystem handlers**: `UPGRADE_TOWER`, `SELL_TOWER`, `SET_SPEED`, and `TOGGLE_PAUSE` actions are defined in the `GameAction` type but not yet handled by InputSystem. The HUD dispatches them; InputSystem must be extended to consume them.
4. **Essence economy**: Essence display in TopBar will show 0 until the EssenceManager is implemented. This is expected.

## Mount Point

In `packages/client/src/main.ts`, after Phaser game creation:

```ts
import { render } from 'preact';
import { App } from './ui/App';

const game = new Phaser.Game(gameConfig);
render(<App />, document.getElementById('ui-overlay')!);
```

## Testing

- Each component can be unit tested with Preact Testing Library
- Mock the Zustand stores to test render output for different states
- Key test cases:

  - `useStore` hook triggers re-render when store state changes (validates `useSyncExternalStore` bridge with `preact/compat`)
  - TopBar displays correct values from store
  - TowerPanel dims buttons when gold is insufficient
  - BottomBar swaps between TowerPanel and TowerInfo based on inputMode
  - ComboDisplay visibility tied to comboCount threshold
  - Dispatch calls produce correct GameAction shapes
  - All interactive controls disabled when `isGameOver` is true
