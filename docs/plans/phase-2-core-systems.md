# Phase 2: Core Systems — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full economy, upgrades, scoring engine, multiple towers/enemies, wave system, and Preact HUD. Act 1 Level 1 fully playable with tutorial.

**Architecture:** Shared game logic (ComboTracker, ScoreAggregator, GoldManager, EssenceManager) lives in `packages/shared/src/logic/` — pure functions, no Phaser dependency, reusable by server for anti-cheat. Preact HUD components read from Zustand stores reactively. WaveSystem drives enemy spawning via level data definitions.

**Tech Stack:** Same as Phase 1 + Howler.js for audio stubs

---

## Task 1: Gold Economy (GoldManager)

**Files:**
- Create: `packages/shared/src/logic/GoldManager.ts`
- Test: `packages/shared/src/logic/__tests__/GoldManager.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe('GoldManager', () => {
  it('should calculate kill gold from enemy data', () => {
    expect(getKillGold({ goldReward: 8 })).toBe(8);
  });

  it('should calculate wave clear bonus', () => {
    expect(getWaveClearBonus(0)).toBe(25);
    expect(getWaveClearBonus(5)).toBe(50);
  });

  it('should calculate interest capped at 50', () => {
    expect(calculateInterest(200)).toBe(20);
    expect(calculateInterest(600)).toBe(50); // capped
  });

  it('should calculate sell refund at 75%', () => {
    expect(getSellRefund(100, 60)).toBe(120); // 75% of (100 + 60)
  });

  it('should return correct starting gold per act', () => {
    expect(getStartingGold(1)).toBe(650);
    expect(getStartingGold(2)).toBe(800);
    expect(getStartingGold(3)).toBe(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement GoldManager** — pure functions for all gold operations
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add GoldManager with kill gold, interest, sell refund, wave clear bonus"
```

---

## Task 2: Essence Economy (EssenceManager)

**Files:**
- Create: `packages/shared/src/logic/EssenceManager.ts`
- Test: `packages/shared/src/logic/__tests__/EssenceManager.test.ts`

- [ ] **Step 1: Write failing tests** — boss kill essence (50/100), perfect wave (10), combo threshold (5 per 25+ combo), first fusion discovery (25)
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement EssenceManager**
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add EssenceManager with boss/wave/combo/fusion earning logic"
```

---

## Task 3: Scoring Engine

**Files:**
- Create: `packages/shared/src/logic/ComboTracker.ts`
- Create: `packages/shared/src/logic/ScoreAggregator.ts`
- Create: `packages/client/src/game/scoring/SpeedBonus.ts`
- Create: `packages/client/src/game/scoring/StylePoints.ts`
- Create: `packages/client/src/game/ecs/systems/ScoreSystem.ts`
- Test: `packages/shared/src/logic/__tests__/ComboTracker.test.ts`
- Test: `packages/shared/src/logic/__tests__/ScoreAggregator.test.ts`
- Test: `packages/client/src/game/scoring/__tests__/SpeedBonus.test.ts`
- Test: `packages/client/src/game/scoring/__tests__/StylePoints.test.ts`

- [ ] **Step 1: Write failing tests for ComboTracker**

```typescript
describe('ComboTracker', () => {
  it('should increment combo on kill within window', () => {
    const tracker = new ComboTracker();
    tracker.registerKill(0);
    tracker.registerKill(1000);
    expect(tracker.comboCount).toBe(2);
    expect(tracker.getMultiplier()).toBe(1); // < 5
  });

  it('should return 2x multiplier at 5 kills', () => {
    const tracker = new ComboTracker();
    for (let i = 0; i < 5; i++) tracker.registerKill(i * 200);
    expect(tracker.getMultiplier()).toBe(2);
  });

  it('should break combo after window expires', () => {
    const tracker = new ComboTracker();
    tracker.registerKill(0);
    tracker.tick(3000); // past 2500ms window
    expect(tracker.comboCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement ComboTracker** — combo window 2500ms, multiplier tiers (1x/2x/3x/5x/10x)
- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Write failing tests for StylePoints** — fusion kill (50), snipe (25), overkill (10), first blood (30), clean wave (100), maze master (200)
- [ ] **Step 6: Implement StylePoints**
- [ ] **Step 7: Write failing tests for SpeedBonus** — par time comparison, early send bonus
- [ ] **Step 8: Implement SpeedBonus**

- [ ] **Step 9: Write failing tests for ScoreAggregator** — combine all score components, validate plausibility
- [ ] **Step 10: Implement ScoreAggregator**

- [ ] **Step 11: Implement ScoreSystem** (ECS system) — updates combo, speed bonus, pushes totals to useGameStore
- [ ] **Step 12: Run all scoring tests**

Run: `pnpm test`
Expected: ALL PASS

- [ ] **Step 13: Commit**

```bash
git commit -m "feat: add scoring engine — ComboTracker, StylePoints, SpeedBonus, ScoreAggregator"
```

---

## Task 4: Wave System

**Files:**
- Create: `packages/shared/src/data/levels.ts` (Level 1 wave definitions)
- Create: `packages/client/src/game/ecs/systems/WaveSystem.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/WaveSystem.test.ts`

- [ ] **Step 1: Write Level 1 wave data**

```typescript
// packages/shared/src/data/levels.ts
export const LEVELS: Record<string, LevelDefinition> = {
  'act1_level1': {
    id: 'act1_level1',
    name: 'The Shire Falls',
    act: 1,
    levelIndex: 0,
    gridCols: 20,
    gridRows: 15,
    spawns: [[0, 7]],
    nexus: [19, 7],
    startingGold: 650,
    maxNexusHP: 5,
    waves: [
      { enemies: [{ type: 'orc_grunt', count: 8, interval: 800 }], parTime: 30000 },
      { enemies: [{ type: 'orc_grunt', count: 10, interval: 700 }], parTime: 28000 },
      // ... 10 waves total
    ],
  },
};
```

- [ ] **Step 2: Write failing tests for WaveSystem** — state machine (PRE_WAVE → SPAWNING → ACTIVE → WAVE_CLEAR), countdown, early send, interest application

- [ ] **Step 3: Implement WaveSystem** — tick countdown, spawn enemies per wave definition, track alive enemies, transition states

- [ ] **Step 4: Wire level complete → transition (stub for now)**
- [ ] **Step 5: Run tests to verify they pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add WaveSystem with state machine, countdown, and Level 1 wave data"
```

---

## Task 5: All 5 Middle-earth Towers (Tier 1-2 upgrades)

**Files:**
- Create: `packages/client/src/game/towers/TowerUpgrade.ts`
- Create: `packages/client/src/game/ecs/components/StatusEffects.ts`
- Create: `packages/client/src/game/ecs/systems/StatusEffectSystem.ts`
- Modify: `packages/shared/src/data/towers.ts` — add upgrade definitions
- Test: `packages/client/src/game/towers/__tests__/TowerUpgrade.test.ts`
- Test: `packages/client/src/game/ecs/systems/__tests__/StatusEffectSystem.test.ts`

- [ ] **Step 1: Write failing test for TowerUpgrade** — cost check, stat modification, tier advancement
- [ ] **Step 2: Implement TowerUpgrade** — apply stat changes, deduct gold, advance tier
- [ ] **Step 3: Write failing test for StatusEffectSystem** — slow applied, DoT ticks, effects expire
- [ ] **Step 4: Implement StatusEffectSystem** — tick durations, apply slow multiplier, apply DoT
- [ ] **Step 5: Add upgrade data to all 5 Middle-earth towers** (Tier 2 = 60% base cost, stat boosts)
- [ ] **Step 6: Ensure each tower has distinct targeting/behavior** — Elven Archer (fast, air), Gondorian Ballista (pierce), Dwarven Cannon (splash), Istari Crystal (slow), Ent Watchtower (root stun)
- [ ] **Step 7: Run all tests**
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add all Middle-earth towers with Tier 1-2 upgrades and status effects"
```

---

## Task 6: All 5 Middle-earth Enemies with Abilities

**Files:**
- Modify: `packages/client/src/game/enemies/EnemyFactory.ts`
- Create: `packages/client/src/game/enemies/EnemyAI.ts`
- Modify: `packages/shared/src/data/enemies.ts` — add ability definitions
- Test: `packages/client/src/game/enemies/__tests__/EnemyAI.test.ts`

- [ ] **Step 1: Write failing tests for enemy abilities**

```typescript
describe('EnemyAI', () => {
  it('Uruk-hai Berserker enrages below 30% HP', () => {
    const world = new GameWorld();
    const enemy = createEnemy(world, 'uruk_hai_berserker');
    setHealth(world, enemy, 30, 120); // 25% HP
    enemyAI(world, 16);
    const movement = world.getComponent(enemy, MovementComponent)!;
    expect(movement.speed).toBeCloseTo(0.7 * 1.5); // +50% speed
  });

  it('Nazgûl Shade applies fear aura to nearby towers', () => {
    // ...tower attack speed reduced 20%
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Implement EnemyAI** — Berserker enrage, Cave Troll tower smash, Nazgûl fear aura
- [ ] **Step 4: Add enemy scaling model** — `1 + (levelIndexWithinAct * 0.25)` HP multiplier
- [ ] **Step 5: Run tests to verify they pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add all Middle-earth enemies with abilities and scaling model"
```

---

## Task 7: Preact HUD Components

**Files:**
- Create: `packages/client/src/ui/App.tsx`
- Create: `packages/client/src/ui/hud/TopBar.tsx`
- Create: `packages/client/src/ui/hud/TowerPanel.tsx`
- Create: `packages/client/src/ui/hud/WavePreview.tsx`
- Create: `packages/client/src/ui/hud/SpeedControls.tsx`
- Create: `packages/client/src/ui/hud/TowerInfo.tsx`
- Create: `packages/client/src/ui/hud/ComboDisplay.tsx`
- Create: `packages/client/src/ui/shared/Button.tsx`
- Create: `packages/client/src/ui/shared/Tooltip.tsx`
- Modify: `packages/client/src/main.ts` — mount Preact App over Phaser canvas

- [ ] **Step 1: Create App.tsx** — layout container, conditionally renders HUD based on active scene

- [ ] **Step 2: Implement TopBar.tsx** — gold, essence, wave counter, nexus HP, score. Reads from `useGameStore`.

- [ ] **Step 3: Implement TowerPanel.tsx** — tower type buttons. On click → sets `useUIStore.inputMode = 'build'` and `buildTowerType`.

- [ ] **Step 4: Implement WavePreview.tsx** — countdown timer, "Send Wave" button dispatches `SEND_WAVE_EARLY`.

- [ ] **Step 5: Implement SpeedControls.tsx** — 1x/2x/3x buttons + pause toggle dispatching `SET_SPEED` / `TOGGLE_PAUSE`.

- [ ] **Step 6: Implement TowerInfo.tsx** — selected tower stats, upgrade buttons (A/B), sell button. Reads `useUIStore.selectedTowerId`.

- [ ] **Step 7: Implement ComboDisplay.tsx** — combo count + multiplier with escalating visual treatment per tier.

- [ ] **Step 8: Wire TailwindCSS** — configure `@tailwindcss/vite` plugin in vite.config.ts.

- [ ] **Step 9: Visual test** — play a full wave, verify HUD updates reactively.

- [ ] **Step 10: Commit**

```bash
git commit -m "feat: add Preact HUD — TopBar, TowerPanel, WavePreview, SpeedControls, TowerInfo, ComboDisplay"
```

---

## Task 8: Tutorial Scaffolding (Level 1)

**Files:**
- Create: `packages/client/src/game/tutorial/TutorialManager.ts`
- Create: `packages/client/src/ui/hud/TutorialOverlay.tsx`

- [ ] **Step 1: Implement TutorialManager** — sequence of tutorial steps for Level 1 ("The Shire Falls"):
  1. Highlight cell → prompt Elven Archer placement
  2. Show path update after placement
  3. Prompt second tower for longer path
  4. Text callout: "Enemies take the shortest path"
  5. Free play for remaining waves

- [ ] **Step 2: Implement TutorialOverlay.tsx** — Preact component for tutorial arrows, text callouts, highlights.

- [ ] **Step 3: Wire TutorialManager into GameScene** — checks level ID, runs tutorial steps if `act1_level1`.

- [ ] **Step 4: Visual test** — play Level 1 with tutorial prompts.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add tutorial scaffolding for Level 1 with guided tower placement"
```

---

## Phase 2 Checkpoint

At completion, you should have:
- Full gold + essence economy with tested logic
- Scoring engine (combo, speed bonus, style points, aggregator)
- Wave system with PRE_WAVE → SPAWNING → ACTIVE → WAVE_CLEAR lifecycle
- All 5 Middle-earth towers with Tier 1-2 upgrades
- All 5 Middle-earth enemies with unique abilities
- Status effect system (slow, DoT, stun)
- Full Preact HUD (TopBar, TowerPanel, WavePreview, SpeedControls, TowerInfo, ComboDisplay)
- Tutorial for Level 1

**Next:** Phase 3 — Upgrade Branches & Fusion
