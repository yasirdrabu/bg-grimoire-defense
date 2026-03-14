# Preact HUD Overlay Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mount a Preact HUD overlay on top of the Phaser canvas with TopBar, BottomBar (TowerPanel/TowerInfo), WavePreview, SpeedControls, and ComboDisplay.

**Architecture:** Preact components read game state from vanilla Zustand stores via a `useStore` hook (wrapping `useSyncExternalStore` from `preact/compat`). UI actions dispatch to the store's action queue, consumed by Phaser's InputSystem. Pointer passthrough lets clicks fall through to Phaser canvas. TailwindCSS v4 handles styling with a hybrid fantasy theme.

**Tech Stack:** Preact 10, Zustand 5 (vanilla stores), TailwindCSS v4, Vite 6, Vitest

**Spec:** `docs/superpowers/specs/2026-03-14-preact-hud-overlay-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `packages/client/src/ui/hooks/useStore.ts` | `useSyncExternalStore` wrapper for vanilla Zustand stores |
| Create | `packages/client/src/ui/App.tsx` | Root Preact component, renders all HUD children |
| Create | `packages/client/src/ui/hud/TopBar.tsx` | Gold, Essence, Wave, HP bar, Score display |
| Create | `packages/client/src/ui/hud/BottomBar.tsx` | Container swapping TowerPanel ↔ TowerInfo |
| Create | `packages/client/src/ui/hud/TowerPanel.tsx` | Tower build buttons with hotkey badges + cost |
| Create | `packages/client/src/ui/hud/TowerInfo.tsx` | Selected tower stats, upgrade, sell |
| Create | `packages/client/src/ui/hud/WavePreview.tsx` | Next wave composition + Send Early button |
| Create | `packages/client/src/ui/hud/SpeedControls.tsx` | 1×/2×/3× speed + pause toggle |
| Create | `packages/client/src/ui/hud/ComboDisplay.tsx` | Combo count + multiplier with CSS fade |
| Create | `packages/client/src/ui/hud.css` | HUD theme variables + base styles |
| Modify | `packages/client/src/stores/useGameStore.ts` | Add `waveState`, `nextWaveEnemies`, `selectedTowerData`, `projectSelectedTower` |
| Modify | `packages/client/src/main.ts` | Mount Preact app to `#ui-overlay` |
| Modify | `packages/client/index.html` | Add styles to `#ui-overlay` div |
| Modify | `packages/client/src/game/scenes/GameScene.ts` | Project `waveState`, `nextWaveEnemies`, `selectedTowerData` to store; wire `SEND_WAVE_EARLY` |
| Create | `packages/client/src/ui/__tests__/useStore.test.ts` | Test the store hook bridge |
| Create | `packages/client/src/ui/__tests__/TopBar.test.tsx` | TopBar rendering tests |
| Create | `packages/client/src/ui/__tests__/TowerPanel.test.tsx` | TowerPanel affordability + build mode tests |
| Create | `packages/client/src/ui/__tests__/BottomBar.test.tsx` | Mode-switching tests |
| Create | `packages/client/src/ui/__tests__/TowerInfo.test.tsx` | TowerInfo dispatch + affordability tests |
| Create | `packages/client/src/ui/__tests__/SpeedControls.test.tsx` | Speed + pause dispatch tests |
| Create | `packages/client/src/ui/__tests__/ComboDisplay.test.tsx` | Visibility threshold tests |

---

## Chunk 1: Foundation — Store Changes + useStore Hook + Mount Point

### Task 1: Add new fields to useGameStore

**Files:**
- Modify: `packages/client/src/stores/useGameStore.ts`

- [ ] **Step 1: Add new fields to the GameState interface and defaults**

In `packages/client/src/stores/useGameStore.ts`, add to the `GameState` interface after `isGameOver`:

```ts
// Wave state for WavePreview
waveState: 'pre' | 'spawning' | 'active' | 'clear';
nextWaveEnemies: Array<{ enemyType: string; count: number }>;

// Selected tower projection for TowerInfo
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

// Action to project selected tower data from ECS
projectSelectedTower: (data: GameState['selectedTowerData']) => void;
clearSelectedTower: () => void;
```

Add to `DEFAULT_STATE`:

```ts
waveState: 'pre' as const,
nextWaveEnemies: [] as Array<{ enemyType: string; count: number }>,
selectedTowerData: null as GameState['selectedTowerData'],
```

Add store actions after `resetGameState`:

```ts
projectSelectedTower: (data) => {
  set({ selectedTowerData: data });
},
clearSelectedTower: () => {
  set({ selectedTowerData: null });
},
```

- [ ] **Step 2: Run typecheck**

Run: `cd packages/client && npx tsc --noEmit`
Expected: PASS (no type errors — new fields are additive)

- [ ] **Step 3: Run existing tests**

Run: `cd packages/client && npx vitest run`
Expected: All existing tests PASS (new fields have defaults)

- [ ] **Step 4: Commit**

```bash
git add packages/client/src/stores/useGameStore.ts
git commit -m "feat(stores): add waveState, nextWaveEnemies, selectedTowerData to game store"
```

---

### Task 2: Create useStore hook

**Files:**
- Create: `packages/client/src/ui/hooks/useStore.ts`
- Create: `packages/client/src/ui/__tests__/useStore.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/client/src/ui/__tests__/useStore.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { renderHook, act } from '@testing-library/preact';
import { useStore } from '../hooks/useStore';

describe('useStore', () => {
  it('reads initial state via selector', () => {
    const store = createStore<{ count: number }>(() => ({ count: 42 }));
    const { result } = renderHook(() => useStore(store, (s) => s.count));
    expect(result.current).toBe(42);
  });

  it('re-renders when selected state changes', () => {
    const store = createStore<{ count: number; unrelated: string }>(() => ({
      count: 0,
      unrelated: 'hello',
    }));
    const { result } = renderHook(() => useStore(store, (s) => s.count));

    expect(result.current).toBe(0);

    act(() => {
      store.setState({ count: 5 });
    });

    expect(result.current).toBe(5);
  });
});
```

- [ ] **Step 2: Install @testing-library/preact and jsdom**

Run: `cd packages/client && pnpm add -D @testing-library/preact jsdom`

Then update `packages/client/vitest.config.ts` (or create if it doesn't exist — currently test config comes from vite.config.ts). Add to the Vitest config:

```ts
// In vite.config.ts, add:
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  server: { port: 5173 },
  build: { target: 'es2022' },
  test: {
    environment: 'jsdom',
  },
});
```

This ensures all Preact component tests get a DOM environment.

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/client && npx vitest run src/ui/__tests__/useStore.test.ts`
Expected: FAIL — module `../hooks/useStore` not found

- [ ] **Step 4: Write the useStore hook**

Create `packages/client/src/ui/hooks/useStore.ts`:

```ts
import { useSyncExternalStore } from 'preact/compat';
import type { StoreApi } from 'zustand/vanilla';

export function useStore<T, S>(store: StoreApi<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/client && npx vitest run src/ui/__tests__/useStore.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/client/src/ui/hooks/useStore.ts packages/client/src/ui/__tests__/useStore.test.ts
git commit -m "feat(ui): add useStore hook bridging vanilla Zustand to Preact"
```

---

### Task 3: Create HUD CSS theme + overlay styles

**Files:**
- Create: `packages/client/src/ui/hud.css`
- Modify: `packages/client/index.html`

- [ ] **Step 1: Create HUD CSS with theme variables**

Create `packages/client/src/ui/hud.css`:

```css
@import "tailwindcss";

:root {
  --hud-gold: #ffd700;
  --hud-essence: #b366ff;
  --hud-hp: #f87171;
  --hud-text: #e2e8f0;
  --hud-muted: #94a3b8;
  --hud-border: rgba(139, 105, 20, 0.4);
  --hud-border-subtle: rgba(139, 105, 20, 0.3);
  --hud-bg-dark: rgba(26, 15, 10, 0.92);
  --hud-bg-slate: rgba(15, 23, 42, 0.85);
}

#ui-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  font-family: system-ui, -apple-system, sans-serif;
}

#ui-overlay * {
  box-sizing: border-box;
}

.hud-interactive {
  pointer-events: auto;
}

.hud-panel-bg {
  background: linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%);
  border-color: var(--hud-border);
}

.hud-gold-line {
  background: linear-gradient(90deg, transparent, rgba(139, 105, 20, 0.5), transparent);
}

.hud-btn {
  background: rgba(139, 105, 20, 0.1);
  border: 1px solid var(--hud-border-subtle);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.hud-btn:hover {
  background: rgba(139, 105, 20, 0.2);
  border-color: var(--hud-border);
}

.hud-btn-active {
  background: rgba(139, 105, 20, 0.25);
  border-color: var(--hud-gold);
}

.hud-btn-disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

/* Combo fade animation */
.combo-enter {
  animation: combo-fade-in 200ms ease-out;
}

.combo-exit {
  animation: combo-fade-out 500ms ease-in forwards;
}

@keyframes combo-fade-in {
  from { opacity: 0; transform: translateX(-50%) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) scale(1); }
}

@keyframes combo-fade-out {
  from { opacity: 1; transform: translateX(-50%) scale(1); }
  to { opacity: 0; transform: translateX(-50%) scale(0.8); }
}
```

- [ ] **Step 2: Update index.html to remove inline body overflow style**

In `packages/client/index.html`, the `#ui-overlay` div already exists. No HTML changes needed — CSS handles the overlay styling via `hud.css`.

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/ui/hud.css
git commit -m "feat(ui): add HUD CSS theme with variables and utility classes"
```

---

### Task 4: Create App.tsx and mount in main.ts

**Files:**
- Create: `packages/client/src/ui/App.tsx`
- Modify: `packages/client/src/main.ts`

- [ ] **Step 1: Create minimal App.tsx**

Create `packages/client/src/ui/App.tsx`:

```tsx
import './hud.css';

export function App() {
  return (
    <div id="hud-root">
      {/* Components will be added in subsequent tasks */}
    </div>
  );
}
```

- [ ] **Step 2: Mount Preact in main.ts**

Modify `packages/client/src/main.ts`:

```ts
import Phaser from 'phaser';
import { render } from 'preact';
import { gameConfig } from './game/config';
import { App } from './ui/App';

// Boot Phaser game
const game = new Phaser.Game(gameConfig);

// Mount Preact UI overlay
const uiRoot = document.getElementById('ui-overlay');
if (uiRoot) {
  render(<App />, uiRoot);
}

export { game };
```

- [ ] **Step 3: Run typecheck**

Run: `cd packages/client && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Run dev server to verify no runtime errors**

Run: `cd packages/client && npx vite --open`
Expected: Game loads, no console errors, empty overlay div is present.

- [ ] **Step 5: Commit**

```bash
git add packages/client/src/ui/App.tsx packages/client/src/main.ts
git commit -m "feat(ui): create App root and mount Preact overlay"
```

---

## Chunk 2: TopBar + BottomBar + TowerPanel

### Task 5: Create TopBar component

**Files:**
- Create: `packages/client/src/ui/hud/TopBar.tsx`
- Create: `packages/client/src/ui/__tests__/TopBar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/client/src/ui/__tests__/TopBar.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { TopBar } from '../hud/TopBar';

describe('TopBar', () => {
  beforeEach(() => {
    useGameStore.setState({
      gold: 500,
      essence: 25,
      wave: 3,
      totalWaves: 10,
      nexusHP: 3,
      maxNexusHP: 5,
      score: 1240,
    });
  });

  it('displays gold amount', () => {
    render(<TopBar />);
    expect(screen.getByText('500')).toBeTruthy();
  });

  it('displays essence amount', () => {
    render(<TopBar />);
    expect(screen.getByText('25')).toBeTruthy();
  });

  it('displays wave counter', () => {
    render(<TopBar />);
    expect(screen.getByText(/WAVE 3 \/ 10/)).toBeTruthy();
  });

  it('displays nexus HP', () => {
    render(<TopBar />);
    expect(screen.getByText('3/5')).toBeTruthy();
  });

  it('displays score', () => {
    render(<TopBar />);
    expect(screen.getByText('1,240')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/client && npx vitest run src/ui/__tests__/TopBar.test.tsx`
Expected: FAIL — module `../hud/TopBar` not found

- [ ] **Step 3: Implement TopBar**

Create `packages/client/src/ui/hud/TopBar.tsx`:

```tsx
import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

export function TopBar() {
  const gold = useStore(useGameStore, (s) => s.gold);
  const essence = useStore(useGameStore, (s) => s.essence);
  const wave = useStore(useGameStore, (s) => s.wave);
  const totalWaves = useStore(useGameStore, (s) => s.totalWaves);
  const nexusHP = useStore(useGameStore, (s) => s.nexusHP);
  const maxNexusHP = useStore(useGameStore, (s) => s.maxNexusHP);
  const score = useStore(useGameStore, (s) => s.score);
  const hpPercent = maxNexusHP > 0 ? (nexusHP / maxNexusHP) * 100 : 0;

  return (
    <div class="hud-interactive hud-panel-bg fixed top-0 left-0 right-0 h-12 flex items-center px-4 border-b" style={{ borderColor: 'var(--hud-border)' }}>
      {/* Decorative gold line */}
      <div class="hud-gold-line absolute bottom-0 left-[15%] right-[15%] h-px" />

      {/* Left: Resources */}
      <div class="flex gap-5 flex-1">
        <div class="flex items-center gap-1.5">
          <span class="text-sm" style={{ color: 'var(--hud-gold)' }}>⬡</span>
          <span class="text-[15px] font-semibold" style={{ color: 'var(--hud-gold)' }}>{gold}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-sm" style={{ color: 'var(--hud-essence)' }}>◆</span>
          <span class="text-[15px] font-semibold" style={{ color: 'var(--hud-essence)' }}>{essence}</span>
        </div>
      </div>

      {/* Center: Wave */}
      <div class="px-3.5 py-0.5 rounded border" style={{ borderColor: 'var(--hud-border-subtle)', background: 'rgba(139,105,20,0.1)' }}>
        <span class="text-[13px] tracking-wide" style={{ color: '#c4a062' }}>WAVE {wave} / {totalWaves}</span>
      </div>

      {/* Right: HP + Score */}
      <div class="flex gap-4 items-center flex-1 justify-end">
        <div class="flex items-center gap-1.5">
          <span class="text-[13px]" style={{ color: 'var(--hud-hp)' }}>♥</span>
          <div class="w-[72px] h-2 rounded border overflow-hidden" style={{ background: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.25)' }}>
            <div class="h-full rounded-sm transition-all duration-300" style={{ width: `${hpPercent}%`, background: 'linear-gradient(90deg, #f87171, #ef4444)' }} />
          </div>
          <span class="text-xs" style={{ color: '#fca5a5' }}>{nexusHP}/{maxNexusHP}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[13px]" style={{ color: 'var(--hud-gold)' }}>★</span>
          <span class="text-[15px] font-semibold" style={{ color: 'var(--hud-gold)' }}>{score.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/client && npx vitest run src/ui/__tests__/TopBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/client/src/ui/hud/TopBar.tsx packages/client/src/ui/__tests__/TopBar.test.tsx
git commit -m "feat(ui): add TopBar component with gold, essence, wave, HP, score"
```

---

### Task 6: Create TowerPanel component

**Files:**
- Create: `packages/client/src/ui/hud/TowerPanel.tsx`
- Create: `packages/client/src/ui/__tests__/TowerPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/client/src/ui/__tests__/TowerPanel.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { TowerPanel } from '../hud/TowerPanel';

describe('TowerPanel', () => {
  beforeEach(() => {
    useGameStore.setState({ gold: 200, isGameOver: false });
    useUIStore.setState({ inputMode: 'idle', buildTowerType: null });
  });

  it('renders all 5 tower buttons', () => {
    render(<TowerPanel />);
    expect(screen.getByText('100g')).toBeTruthy(); // elven_archer_spire
    expect(screen.getByText('200g')).toBeTruthy(); // ent_watchtower
    expect(screen.getByText('300g')).toBeTruthy(); // gondorian_ballista
    expect(screen.getByText('150g')).toBeTruthy(); // istari_crystal
    expect(screen.getByText('250g')).toBeTruthy(); // dwarven_cannon
  });

  it('dims towers the player cannot afford', () => {
    useGameStore.setState({ gold: 100 });
    const { container } = render(<TowerPanel />);
    const buttons = container.querySelectorAll('[data-tower-id]');
    // elven_archer_spire (100g) should be enabled, others dimmed
    const archer = container.querySelector('[data-tower-id="elven_archer_spire"]');
    const ballista = container.querySelector('[data-tower-id="gondorian_ballista"]');
    expect(archer?.classList.contains('hud-btn-disabled')).toBe(false);
    expect(ballista?.classList.contains('hud-btn-disabled')).toBe(true);
  });

  it('highlights active build mode tower', () => {
    useUIStore.setState({ inputMode: 'build', buildTowerType: 'istari_crystal' });
    const { container } = render(<TowerPanel />);
    const crystal = container.querySelector('[data-tower-id="istari_crystal"]');
    expect(crystal?.classList.contains('hud-btn-active')).toBe(true);
  });

  it('enters build mode on click', () => {
    render(<TowerPanel />);
    const archer = screen.getByText('100g').closest('[data-tower-id]')!;
    fireEvent.click(archer);
    const ui = useUIStore.getState();
    expect(ui.inputMode).toBe('build');
    expect(ui.buildTowerType).toBe('elven_archer_spire');
  });

  it('disables all buttons when game is over', () => {
    useGameStore.setState({ gold: 9999, isGameOver: true });
    const { container } = render(<TowerPanel />);
    const buttons = container.querySelectorAll('[data-tower-id]');
    buttons.forEach((btn) => {
      expect(btn.classList.contains('hud-btn-disabled')).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/client && npx vitest run src/ui/__tests__/TowerPanel.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement TowerPanel**

Create `packages/client/src/ui/hud/TowerPanel.tsx`:

```tsx
import { TOWERS } from '@grimoire/shared';
import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';

const TOWER_KEYS = Object.keys(TOWERS);

const TOWER_COLORS: Record<string, string> = {
  elven_archer_spire: '#4ade80',
  ent_watchtower: '#8b5e3c',
  gondorian_ballista: '#94a3b8',
  istari_crystal: '#a78bfa',
  dwarven_cannon: '#f97316',
};

const HOTKEYS = ['1', '2', '3', '4', '5'];

export function TowerPanel() {
  const gold = useStore(useGameStore, (s) => s.gold);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);
  const buildTowerType = useStore(useUIStore, (s) => s.buildTowerType);

  return (
    <div class="flex gap-2 justify-center">
      {TOWER_KEYS.map((towerKey, idx) => {
        const tower = TOWERS[towerKey]!;
        const canAfford = gold >= tower.cost;
        const isActive = buildTowerType === towerKey;
        const disabled = !canAfford || isGameOver;

        return (
          <button
            key={towerKey}
            data-tower-id={towerKey}
            class={`hud-btn relative flex flex-col items-center justify-center w-14 h-14 ${isActive ? 'hud-btn-active' : ''} ${disabled ? 'hud-btn-disabled' : ''}`}
            onClick={() => {
              if (!disabled) {
                useUIStore.getState().enterBuildMode(towerKey);
              }
            }}
          >
            {/* Tower icon (colored circle) */}
            <div
              class="w-5 h-5 rounded-full mb-0.5"
              style={{
                background: TOWER_COLORS[towerKey] ?? '#888',
                boxShadow: towerKey === 'istari_crystal' ? `0 0 8px ${TOWER_COLORS[towerKey]}` : undefined,
              }}
            />
            {/* Cost */}
            <span class="text-[9px]" style={{ color: disabled ? '#64748b' : 'var(--hud-muted)' }}>
              {tower.cost}g
            </span>
            {/* Hotkey badge */}
            {idx < HOTKEYS.length && (
              <div
                class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-sm text-[8px] border"
                style={{ background: '#1a1a2e', borderColor: 'var(--hud-border)', color: '#c4a062' }}
              >
                {HOTKEYS[idx]}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/client && npx vitest run src/ui/__tests__/TowerPanel.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/client/src/ui/hud/TowerPanel.tsx packages/client/src/ui/__tests__/TowerPanel.test.tsx
git commit -m "feat(ui): add TowerPanel with affordability dimming and build mode"
```

---

### Task 7: Create TowerInfo component

**Files:**
- Create: `packages/client/src/ui/hud/TowerInfo.tsx`
- Create: `packages/client/src/ui/__tests__/TowerInfo.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/client/src/ui/__tests__/TowerInfo.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { TowerInfo } from '../hud/TowerInfo';

const SAMPLE_TOWER = {
  id: 'tower-1',
  name: 'Elven Archer Spire',
  tier: 1,
  damage: 15,
  attackSpeed: 0.8,
  range: 4,
  special: null as string | null,
  upgradeCostA: 60,
  upgradeCostB: null as number | null,
  sellRefund: 50,
};

describe('TowerInfo', () => {
  beforeEach(() => {
    useGameStore.setState({ gold: 500, isGameOver: false, selectedTowerData: SAMPLE_TOWER, pendingActions: [] });
    useUIStore.setState({ inputMode: 'selected', selectedTowerId: 'tower-1' });
  });

  it('renders nothing when no tower is selected', () => {
    useGameStore.setState({ selectedTowerData: null });
    const { container } = render(<TowerInfo />);
    expect(container.innerHTML).toBe('');
  });

  it('shows tower name and stats', () => {
    render(<TowerInfo />);
    expect(screen.getByText('Elven Archer Spire')).toBeTruthy();
    expect(screen.getByText('DMG 15')).toBeTruthy();
    expect(screen.getByText('SPD 0.8s')).toBeTruthy();
    expect(screen.getByText('RNG 4')).toBeTruthy();
  });

  it('dispatches UPGRADE_TOWER on upgrade click', () => {
    render(<TowerInfo />);
    const upgradeBtn = screen.getByText('Upgrade A').closest('button')!;
    fireEvent.click(upgradeBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'UPGRADE_TOWER', towerId: 'tower-1', branch: 'A' });
  });

  it('dispatches SELL_TOWER on sell click', () => {
    render(<TowerInfo />);
    const sellBtn = screen.getByText('Sell').closest('button')!;
    fireEvent.click(sellBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'SELL_TOWER', towerId: 'tower-1' });
  });

  it('deselects tower on close click', () => {
    render(<TowerInfo />);
    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(useUIStore.getState().inputMode).toBe('idle');
  });

  it('dims upgrade button when unaffordable', () => {
    useGameStore.setState({ gold: 10 });
    const { container } = render(<TowerInfo />);
    const upgradeBtn = screen.getByText('Upgrade A').closest('button')!;
    expect(upgradeBtn.classList.contains('hud-btn-disabled')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/client && npx vitest run src/ui/__tests__/TowerInfo.test.tsx`
Expected: FAIL — module `../hud/TowerInfo` not found

- [ ] **Step 3: Implement TowerInfo**

Create `packages/client/src/ui/hud/TowerInfo.tsx`:

```tsx
import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';

export function TowerInfo() {
  const data = useStore(useGameStore, (s) => s.selectedTowerData);
  const gold = useStore(useGameStore, (s) => s.gold);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);

  if (!data) return null;

  const canUpgradeA = data.upgradeCostA !== null && gold >= data.upgradeCostA && !isGameOver;
  const canUpgradeB = data.upgradeCostB !== null && gold >= data.upgradeCostB && !isGameOver;

  return (
    <div class="flex items-center gap-4 px-4 w-full">
      {/* Tower identity */}
      <div class="flex flex-col min-w-0">
        <span class="text-sm font-semibold truncate" style={{ color: 'var(--hud-text)' }}>{data.name}</span>
        <span class="text-xs" style={{ color: 'var(--hud-muted)' }}>Tier {data.tier}</span>
      </div>

      {/* Stats */}
      <div class="flex gap-3 text-xs" style={{ color: 'var(--hud-muted)' }}>
        <span>DMG {data.damage}</span>
        <span>SPD {data.attackSpeed}s</span>
        <span>RNG {data.range}</span>
      </div>

      {data.special && (
        <span class="text-xs italic" style={{ color: '#c4a062' }}>{data.special}</span>
      )}

      {/* Spacer */}
      <div class="flex-1" />

      {/* Upgrade A */}
      {data.upgradeCostA !== null && (
        <button
          class={`hud-btn px-2 py-1 text-xs ${canUpgradeA ? '' : 'hud-btn-disabled'}`}
          onClick={() => {
            if (canUpgradeA) {
              useGameStore.getState().dispatch({ type: 'UPGRADE_TOWER', towerId: data.id, branch: 'A' });
            }
          }}
        >
          <span style={{ color: 'var(--hud-text)' }}>Upgrade A</span>
          <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.upgradeCostA}g</span>
        </button>
      )}

      {/* Upgrade B */}
      {data.upgradeCostB !== null && (
        <button
          class={`hud-btn px-2 py-1 text-xs ${canUpgradeB ? '' : 'hud-btn-disabled'}`}
          onClick={() => {
            if (canUpgradeB) {
              useGameStore.getState().dispatch({ type: 'UPGRADE_TOWER', towerId: data.id, branch: 'B' });
            }
          }}
        >
          <span style={{ color: 'var(--hud-text)' }}>Upgrade B</span>
          <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.upgradeCostB}g</span>
        </button>
      )}

      {/* Sell */}
      <button
        class={`hud-btn px-2 py-1 text-xs ${isGameOver ? 'hud-btn-disabled' : ''}`}
        onClick={() => {
          if (!isGameOver) {
            useGameStore.getState().dispatch({ type: 'SELL_TOWER', towerId: data.id });
          }
        }}
      >
        <span style={{ color: 'var(--hud-hp)' }}>Sell</span>
        <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.sellRefund}g</span>
      </button>

      {/* Close */}
      <button
        class="hud-btn w-7 h-7 flex items-center justify-center text-sm"
        style={{ color: 'var(--hud-muted)' }}
        onClick={() => useUIStore.getState().deselectTower()}
      >
        ✕
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/client && npx vitest run src/ui/__tests__/TowerInfo.test.tsx`
Expected: PASS

- [ ] **Step 5: Run typecheck**

Run: `cd packages/client && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/client/src/ui/hud/TowerInfo.tsx packages/client/src/ui/__tests__/TowerInfo.test.tsx
git commit -m "feat(ui): add TowerInfo component with stats, upgrade, and sell"
```

> **Note:** `UPGRADE_TOWER` and `SELL_TOWER` actions are dispatched to the action queue but are currently no-ops in InputSystem (commented as "Will be handled in Phase 2"). The buttons work correctly — the actions just aren't consumed yet.

---

### Task 8: Create BottomBar container

**Files:**
- Create: `packages/client/src/ui/hud/BottomBar.tsx`
- Create: `packages/client/src/ui/__tests__/BottomBar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/client/src/ui/__tests__/BottomBar.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { useUIStore } from '../../stores/useUIStore';
import { useGameStore } from '../../stores/useGameStore';
import { BottomBar } from '../hud/BottomBar';

describe('BottomBar', () => {
  beforeEach(() => {
    useUIStore.setState({ inputMode: 'idle', selectedTowerId: null, buildTowerType: null });
    useGameStore.setState({ gold: 500, isGameOver: false, selectedTowerData: null });
  });

  it('renders TowerPanel in idle mode', () => {
    render(<BottomBar />);
    // TowerPanel renders cost labels
    expect(screen.getByText('100g')).toBeTruthy();
  });

  it('renders TowerPanel in build mode', () => {
    useUIStore.setState({ inputMode: 'build', buildTowerType: 'elven_archer_spire' });
    render(<BottomBar />);
    expect(screen.getByText('100g')).toBeTruthy();
  });

  it('renders TowerInfo in selected mode', () => {
    useUIStore.setState({ inputMode: 'selected', selectedTowerId: 'tower-1' });
    useGameStore.setState({
      selectedTowerData: {
        id: 'tower-1',
        name: 'Elven Archer Spire',
        tier: 1,
        damage: 15,
        attackSpeed: 0.8,
        range: 4,
        special: null,
        upgradeCostA: 60,
        upgradeCostB: null,
        sellRefund: 50,
      },
    });
    render(<BottomBar />);
    expect(screen.getByText('Elven Archer Spire')).toBeTruthy();
    expect(screen.getByText('DMG 15')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/client && npx vitest run src/ui/__tests__/BottomBar.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement BottomBar**

Create `packages/client/src/ui/hud/BottomBar.tsx`:

```tsx
import { useStore } from '../hooks/useStore';
import { useUIStore } from '../../stores/useUIStore';
import { TowerPanel } from './TowerPanel';
import { TowerInfo } from './TowerInfo';

export function BottomBar() {
  const inputMode = useStore(useUIStore, (s) => s.inputMode);

  return (
    <div class="hud-interactive hud-panel-bg fixed bottom-0 left-0 right-0 h-[72px] flex items-center justify-center border-t" style={{ borderColor: 'var(--hud-border)' }}>
      {/* Decorative gold line */}
      <div class="hud-gold-line absolute top-0 left-[15%] right-[15%] h-px" />

      {inputMode === 'selected' ? <TowerInfo /> : <TowerPanel />}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/client && npx vitest run src/ui/__tests__/BottomBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/client/src/ui/hud/BottomBar.tsx packages/client/src/ui/__tests__/BottomBar.test.tsx
git commit -m "feat(ui): add BottomBar container swapping TowerPanel and TowerInfo"
```

---

### Task 9: Wire TopBar + BottomBar into App.tsx

**Files:**
- Modify: `packages/client/src/ui/App.tsx`

- [ ] **Step 1: Update App.tsx to render TopBar and BottomBar**

```tsx
import './hud.css';
import { TopBar } from './hud/TopBar';
import { BottomBar } from './hud/BottomBar';

export function App() {
  return (
    <div id="hud-root">
      <TopBar />
      <BottomBar />
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `cd packages/client && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `cd packages/client && npx vitest run`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add packages/client/src/ui/App.tsx
git commit -m "feat(ui): wire TopBar and BottomBar into App"
```

---

## Chunk 3: Floating Panels — WavePreview, SpeedControls, ComboDisplay

### Task 10: Create SpeedControls component

**Files:**
- Create: `packages/client/src/ui/hud/SpeedControls.tsx`
- Create: `packages/client/src/ui/__tests__/SpeedControls.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/client/src/ui/__tests__/SpeedControls.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { SpeedControls } from '../hud/SpeedControls';

describe('SpeedControls', () => {
  beforeEach(() => {
    useGameStore.setState({ gameSpeed: 1, isPaused: false, isGameOver: false, pendingActions: [] });
  });

  it('highlights active speed', () => {
    const { container } = render(<SpeedControls />);
    const btn1 = container.querySelector('[data-speed="1"]');
    expect(btn1?.classList.contains('hud-btn-active')).toBe(true);
  });

  it('dispatches SET_SPEED on click', () => {
    const { container } = render(<SpeedControls />);
    const btn2 = container.querySelector('[data-speed="2"]')!;
    fireEvent.click(btn2);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'SET_SPEED', speed: 2 });
  });

  it('dispatches TOGGLE_PAUSE on pause click', () => {
    const { container } = render(<SpeedControls />);
    const pauseBtn = container.querySelector('[data-pause]')!;
    fireEvent.click(pauseBtn);
    const actions = useGameStore.getState().pendingActions;
    expect(actions).toContainEqual({ type: 'TOGGLE_PAUSE' });
  });

  it('disables all buttons when game is over', () => {
    useGameStore.setState({ isGameOver: true });
    const { container } = render(<SpeedControls />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn.classList.contains('hud-btn-disabled')).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/client && npx vitest run src/ui/__tests__/SpeedControls.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement SpeedControls**

Create `packages/client/src/ui/hud/SpeedControls.tsx`:

```tsx
import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

const SPEEDS = [1, 2, 3] as const;

export function SpeedControls() {
  const gameSpeed = useStore(useGameStore, (s) => s.gameSpeed);
  const isPaused = useStore(useGameStore, (s) => s.isPaused);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);
  const dispatch = useGameStore.getState().dispatch;

  return (
    <div class="hud-interactive fixed top-14 right-2 z-10">
      <div class="flex gap-1 p-1 rounded-md border" style={{ background: 'var(--hud-bg-slate)', borderColor: 'var(--hud-border-subtle)' }}>
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            data-speed={speed}
            class={`hud-btn w-8 h-7 flex items-center justify-center text-[11px] font-semibold ${gameSpeed === speed && !isPaused ? 'hud-btn-active' : ''} ${isGameOver ? 'hud-btn-disabled' : ''}`}
            style={{ color: gameSpeed === speed && !isPaused ? 'var(--hud-gold)' : 'var(--hud-muted)' }}
            onClick={() => {
              if (!isGameOver) dispatch({ type: 'SET_SPEED', speed });
            }}
          >
            {speed}×
          </button>
        ))}
        <div class="w-px my-0.5" style={{ background: 'var(--hud-border-subtle)' }} />
        <button
          data-pause
          class={`hud-btn w-8 h-7 flex items-center justify-center text-[13px] ${isPaused ? 'hud-btn-active' : ''} ${isGameOver ? 'hud-btn-disabled' : ''}`}
          style={{ color: isPaused ? 'var(--hud-gold)' : 'var(--hud-muted)' }}
          onClick={() => {
            if (!isGameOver) dispatch({ type: 'TOGGLE_PAUSE' });
          }}
        >
          ⏸
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/client && npx vitest run src/ui/__tests__/SpeedControls.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/client/src/ui/hud/SpeedControls.tsx packages/client/src/ui/__tests__/SpeedControls.test.tsx
git commit -m "feat(ui): add SpeedControls with speed buttons and pause toggle"
```

---

### Task 11: Create WavePreview component

**Files:**
- Create: `packages/client/src/ui/hud/WavePreview.tsx`

- [ ] **Step 1: Implement WavePreview**

Create `packages/client/src/ui/hud/WavePreview.tsx`:

```tsx
import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

export function WavePreview() {
  const wave = useStore(useGameStore, (s) => s.wave);
  const totalWaves = useStore(useGameStore, (s) => s.totalWaves);
  const waveState = useStore(useGameStore, (s) => s.waveState);
  const nextWaveEnemies = useStore(useGameStore, (s) => s.nextWaveEnemies);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);
  const dispatch = useGameStore.getState().dispatch;

  const canSend = (waveState === 'pre' || waveState === 'clear') && !isGameOver && wave < totalWaves;

  return (
    <div class="hud-interactive fixed top-14 left-2 z-10">
      <div class="rounded-md border p-2 w-[150px]" style={{ background: 'var(--hud-bg-slate)', borderColor: 'var(--hud-border-subtle)' }}>
        <div class="text-[11px] tracking-wide mb-1.5" style={{ color: '#c4a062' }}>
          NEXT WAVE
        </div>

        {nextWaveEnemies.length > 0 ? (
          <div class="flex flex-col gap-1">
            {nextWaveEnemies.map((entry) => (
              <div key={entry.enemyType} class="flex justify-between items-center">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
                  <span class="text-[11px]" style={{ color: 'var(--hud-muted)' }}>
                    {entry.enemyType.replace(/_/g, ' ')}
                  </span>
                </div>
                <span class="text-[11px]" style={{ color: 'var(--hud-text)' }}>×{entry.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div class="text-[11px]" style={{ color: 'var(--hud-muted)' }}>
            {wave >= totalWaves ? 'Final wave!' : 'Ready'}
          </div>
        )}

        <div class="mt-2">
          <button
            class={`hud-btn w-full py-1 text-[11px] text-center ${canSend ? '' : 'hud-btn-disabled'}`}
            style={{ color: '#c4a062' }}
            onClick={() => {
              if (canSend) dispatch({ type: 'SEND_WAVE_EARLY' });
            }}
          >
            SEND EARLY (Space)
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `cd packages/client && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/ui/hud/WavePreview.tsx
git commit -m "feat(ui): add WavePreview with enemy list and send early button"
```

---

### Task 12: Create ComboDisplay component

**Files:**
- Create: `packages/client/src/ui/hud/ComboDisplay.tsx`
- Create: `packages/client/src/ui/__tests__/ComboDisplay.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/client/src/ui/__tests__/ComboDisplay.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { useGameStore } from '../../stores/useGameStore';
import { ComboDisplay } from '../hud/ComboDisplay';

describe('ComboDisplay', () => {
  beforeEach(() => {
    useGameStore.setState({ comboCount: 0, comboMultiplier: 1 });
  });

  it('is hidden when comboCount < 2', () => {
    useGameStore.setState({ comboCount: 1 });
    const { container } = render(<ComboDisplay />);
    expect(container.innerHTML).toBe('');
  });

  it('renders when comboCount >= 2', () => {
    useGameStore.setState({ comboCount: 5, comboMultiplier: 1.5 });
    render(<ComboDisplay />);
    expect(screen.getByText('5× COMBO')).toBeTruthy();
    expect(screen.getByText('×1.5 multiplier')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/client && npx vitest run src/ui/__tests__/ComboDisplay.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ComboDisplay**

Create `packages/client/src/ui/hud/ComboDisplay.tsx`:

```tsx
import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

export function ComboDisplay() {
  const comboCount = useStore(useGameStore, (s) => s.comboCount);
  const comboMultiplier = useStore(useGameStore, (s) => s.comboMultiplier);

  if (comboCount < 2) return null;

  return (
    <div
      class="hud-interactive combo-enter fixed top-14 left-1/2 z-10 rounded-md border px-4 py-1 text-center"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(255,215,0,0.1)',
        borderColor: 'rgba(255,215,0,0.3)',
      }}
    >
      <div class="text-lg font-bold" style={{ color: 'var(--hud-gold)' }}>
        {comboCount}× COMBO
      </div>
      <div class="text-[11px]" style={{ color: '#c4a062' }}>
        ×{comboMultiplier} multiplier
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/client && npx vitest run src/ui/__tests__/ComboDisplay.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/client/src/ui/hud/ComboDisplay.tsx packages/client/src/ui/__tests__/ComboDisplay.test.tsx
git commit -m "feat(ui): add ComboDisplay with fade animation and threshold"
```

---

### Task 13: Wire all floating panels into App.tsx

**Files:**
- Modify: `packages/client/src/ui/App.tsx`

- [ ] **Step 1: Update App.tsx with all components**

```tsx
import './hud.css';
import { TopBar } from './hud/TopBar';
import { BottomBar } from './hud/BottomBar';
import { WavePreview } from './hud/WavePreview';
import { SpeedControls } from './hud/SpeedControls';
import { ComboDisplay } from './hud/ComboDisplay';

export function App() {
  return (
    <div id="hud-root">
      <TopBar />
      <WavePreview />
      <SpeedControls />
      <ComboDisplay />
      <BottomBar />
    </div>
  );
}
```

- [ ] **Step 2: Run all tests**

Run: `cd packages/client && npx vitest run`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/ui/App.tsx
git commit -m "feat(ui): wire WavePreview, SpeedControls, ComboDisplay into App"
```

---

## Chunk 4: GameScene Integration — Store Projection + SEND_WAVE_EARLY

### Task 14: Project waveState and nextWaveEnemies from GameScene

**Files:**
- Modify: `packages/client/src/game/scenes/GameScene.ts`

- [ ] **Step 1: Update GameScene to project wave state to store**

In `GameScene.ts`, update `startWave()` and the spawning logic in `update()`:

In `startWave()`, after `this.waveActive = true;`:
```ts
useGameStore.setState({ waveState: 'spawning' });
```

In `update()`, when `this.enemiesToSpawn <= 0`:

```ts
this.waveActive = false;
// Don't set 'active' here — check for clear immediately in case all enemies already died during spawning
```

Add a check after `deathSystem` / `nexusSystem` — when no enemies remain and wave was spawning or active. This goes inside `update()` after the `nexusSystem(...)` call, where `state` is already defined:

```ts
// Check wave clear: no living enemies (handles both 'spawning' and 'active' states)
const currentWaveState = useGameStore.getState().waveState;
if (currentWaveState === 'spawning' || currentWaveState === 'active') {
  const livingEnemies = this.world.query(EnemyDataComponent, HealthComponent);
  const anyAlive = Array.from(livingEnemies).some((id) => {
    const health = this.world.getComponent(id, HealthComponent)!;
    return health.current > 0;
  });

  // If spawning is done and no enemies alive, wave is clear
  if (!anyAlive && !this.waveActive) {
    useGameStore.setState({ waveState: 'clear' });
    // Project next wave enemies
    if (state.wave < state.totalWaves) {
      const count = 10 + state.wave * 2; // current formula
      useGameStore.setState({
        nextWaveEnemies: [{ enemyType: 'orc_grunt', count }],
      });
    } else {
      useGameStore.setState({ nextWaveEnemies: [] });
    }
  } else if (!this.waveActive && currentWaveState === 'spawning') {
    // Spawning finished but enemies still alive
    useGameStore.setState({ waveState: 'active' });
  }
}
```

Also, in `create()`, after initializing game state, project initial next wave enemies:
```ts
useGameStore.setState({
  waveState: 'pre',
  nextWaveEnemies: [{ enemyType: 'orc_grunt', count: 10 }],
});
```

- [ ] **Step 2: Wire SEND_WAVE_EARLY in InputSystem**

In `packages/client/src/game/ecs/systems/InputSystem.ts`, the `SEND_WAVE_EARLY` case currently does nothing. It needs to signal GameScene. The simplest approach: set a flag on the store that GameScene reads.

Add to `useGameStore` a `sendWaveEarlyFlag: boolean` default `false`. In InputSystem:
```ts
case 'SEND_WAVE_EARLY':
  useGameStore.setState({ sendWaveEarlyFlag: true });
  break;
```

In `GameScene.update()`, at the top after `isPaused` check:
```ts
const sendEarly = state.sendWaveEarlyFlag;
if (sendEarly) {
  useGameStore.setState({ sendWaveEarlyFlag: false });
  this.startWave();
}
```

Add `sendWaveEarlyFlag: false` to `DEFAULT_STATE` and `GameState` interface in `useGameStore.ts`.

- [ ] **Step 3: Run typecheck**

Run: `cd packages/client && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Run all tests**

Run: `cd packages/client && npx vitest run`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add packages/client/src/game/scenes/GameScene.ts packages/client/src/game/ecs/systems/InputSystem.ts packages/client/src/stores/useGameStore.ts
git commit -m "feat(game): project waveState and nextWaveEnemies to store, wire SEND_WAVE_EARLY"
```

---

### Task 15: Project selectedTowerData from GameScene

**Files:**
- Modify: `packages/client/src/game/scenes/GameScene.ts`

- [ ] **Step 1: Add tower click detection in handleClick**

Currently, `handleClick` only handles build mode. Add an else branch for idle mode to detect tower clicks:

After the early return `if (ui.inputMode !== 'build' ...)`, add:

```ts
// If idle mode, check if clicking on an existing tower
if (ui.inputMode === 'idle') {
  const { gridX, gridY } = screenToGrid(
    pointer.worldX, pointer.worldY,
    0, 0,
    this.mapOffsetX, this.mapOffsetY,
  );

  // Find tower at this grid cell
  const towers = this.world.query(TowerDataComponent, PositionComponent);
  for (const id of towers) {
    const pos = this.world.getComponent(id, PositionComponent)!;
    if (pos.gridX === gridX && pos.gridY === gridY) {
      const towerData = this.world.getComponent(id, TowerDataComponent)!;
      const attack = this.world.getComponent(id, AttackComponent)!;
      const towerDef = TOWERS[towerData.towerType];

      useGameStore.getState().projectSelectedTower({
        id: id,
        name: towerDef?.name ?? towerData.towerType,
        tier: towerData.tier,
        damage: attack.damage,
        attackSpeed: attack.cooldown / 1000,
        range: attack.range,
        special: towerDef?.special ?? null,
        upgradeCostA: towerDef?.upgradeCostTier2 ?? null,
        upgradeCostB: null, // No branch B data yet
        sellRefund: Math.floor((towerDef?.cost ?? 0) * 0.5),
      });
      useUIStore.getState().selectTower(id);
      return;
    }
  }
}
```

Restructure `handleClick` so the build-mode logic and idle-mode logic are in an if/else. Move the `screenToGrid` call before the mode check so both branches can use it. Keep the existing build logic (lines 193-242 of the current file) inside the build branch:

```ts
private handleClick(pointer: Phaser.Input.Pointer): void {
  const ui = useUIStore.getState();
  const game = useGameStore.getState();
  const { gridX, gridY } = screenToGrid(
    pointer.worldX, pointer.worldY,
    0, 0,
    this.mapOffsetX, this.mapOffsetY,
  );

  if (ui.inputMode === 'build' && ui.buildTowerType) {
    // === EXISTING BUILD LOGIC (lines 201-242, unchanged) ===
    if (!canPlace(this.gridData, gridX, gridY)) return;
    if (gridX === this.spawnPos[0] && gridY === this.spawnPos[1]) return;
    if (gridX === this.nexusPos[0] && gridY === this.nexusPos[1]) return;
    const towerDef = TOWERS[ui.buildTowerType];
    if (!towerDef || game.gold < towerDef.cost) return;
    const testGrid = cloneGridWithBlock(this.gridData, gridX, gridY);
    const testPfGrid = new PF.Grid(testGrid);
    const testFinder = new PF.AStarFinder({ allowDiagonal: false });
    const testPath = testFinder.findPath(
      this.spawnPos[0], this.spawnPos[1],
      this.nexusPos[0], this.nexusPos[1],
      testPfGrid,
    );
    if (testPath.length === 0) return;
    this.gridData[gridY]![gridX] = 1;
    const towerId = createTowerEntity(this.world, ui.buildTowerType, gridX, gridY);
    const { screenX, screenY } = gridToScreen(gridX, gridY, this.mapOffsetX, this.mapOffsetY);
    const sprite = this.add.sprite(screenX + TILE_W / 2, screenY + TILE_H / 2, ui.buildTowerType);
    sprite.setDepth(LAYER_ENTITIES_BASE + screenY);
    this.entityLayer.add(sprite);
    const renderable = this.world.getComponent(towerId, RenderableComponent)!;
    renderable.sprite = sprite;
    useGameStore.setState({ gold: game.gold - towerDef.cost });
    this.computePath();
    this.clearGhost();
  } else if (ui.inputMode === 'idle' || ui.inputMode === 'selected') {
    // Check for tower click
    const towers = this.world.query(TowerDataComponent, PositionComponent);
    for (const id of towers) {
      const pos = this.world.getComponent(id, PositionComponent)!;
      if (pos.gridX === gridX && pos.gridY === gridY) {
        const towerData = this.world.getComponent(id, TowerDataComponent)!;
        const attack = this.world.getComponent(id, AttackComponent)!;
        const towerDef = TOWERS[towerData.towerType];
        useGameStore.getState().projectSelectedTower({
          id: id,
          name: towerDef?.name ?? towerData.towerType,
          tier: towerData.tier,
          damage: attack.damage,
          attackSpeed: attack.cooldown / 1000,
          range: attack.range,
          special: towerDef?.special ?? null,
          upgradeCostA: towerDef?.upgradeCostTier2 ?? null,
          upgradeCostB: null,
          sellRefund: Math.floor((towerDef?.cost ?? 0) * 0.5),
        });
        useUIStore.getState().selectTower(id);
        return;
      }
    }
    // No tower found at click — deselect
    useUIStore.getState().deselectTower();
    useGameStore.getState().clearSelectedTower();
  }
}
```

Also, in the keyboard shortcuts section of `create()`, clear selected tower when entering build mode via hotkeys. After each `enterBuildMode` call, add a `clearSelectedTower` call:

```ts
this.input.keyboard?.on('keydown-ONE', () => {
  useUIStore.getState().enterBuildMode('elven_archer_spire');
  useGameStore.getState().clearSelectedTower();
});
// ... same pattern for keys TWO through FIVE
```

This prevents stale `selectedTowerData` when switching from selected mode to build mode via keyboard.

- [ ] **Step 2: Run typecheck**

Run: `cd packages/client && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `cd packages/client && npx vitest run`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add packages/client/src/game/scenes/GameScene.ts
git commit -m "feat(game): project selectedTowerData on tower click"
```

---

### Task 16: Remove the old instruction text overlay

**Files:**
- Modify: `packages/client/src/game/scenes/GameScene.ts`

- [ ] **Step 1: Remove the text instruction from GameScene.create()**

Delete or comment out the line in `GameScene.create()` that adds the instruction text:
```ts
// Remove this line:
this.add.text(this.scale.width / 2, 20, 'Press SPACE to send wave | Keys 1-5 to build towers | Click to place', { ... });
```

The HUD now provides all this information via WavePreview (Space to send) and TowerPanel (tower selection).

- [ ] **Step 2: Run dev server to verify visually**

Run: `cd packages/client && npx vite --open`
Expected: Game loads with HUD overlay visible, no old instruction text.

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/game/scenes/GameScene.ts
git commit -m "chore: remove old instruction text overlay, replaced by HUD"
```

---

### Task 17: Final integration test

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests PASS across all packages

- [ ] **Step 2: Run typecheck across entire monorepo**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Run dev server and verify all HUD components**

Run: `pnpm --filter client dev`

Verify:
- TopBar shows gold, essence, wave counter, HP bar, score
- BottomBar shows tower buttons with costs and hotkey badges
- Tower buttons dim when unaffordable
- Clicking a tower button enters build mode (gold border)
- WavePreview shows next wave enemies and Send Early button
- SpeedControls shows 1×/2×/3× buttons and pause
- Clicking a placed tower shows TowerInfo in bottom bar
- Clicks pass through to Phaser canvas in empty areas
- ComboDisplay appears when combo ≥ 2 (requires manual testing with kills)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(ui): complete Preact HUD overlay — all Phase 2 components"
```
