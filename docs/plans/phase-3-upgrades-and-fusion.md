# Phase 3: Upgrade Branches & Fusion — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full upgrade tree with Tier 3 branching paths (A/B), fusion system with adjacency detection and hybrid tower spawning, all Act 1 levels, Balrog boss, ScoreBreakdownScene, HubScene with campaign map.

**Architecture:** Fusion recipes are typed data in `packages/shared/src/data/fusions.ts`. FusionEngine handles adjacency detection, recipe matching, tower consumption, and hybrid spawning. BossPhase FSM stored as ECS component — systems check phase and execute behavior. HubScene is a hybrid renderer: Phaser tilemap for campaign map + Preact overlays for tabs.

**Tech Stack:** Same as Phase 2

---

## Task 1: Tier 3 Branching Upgrades

**Files:**
- Modify: `packages/shared/src/data/towers.ts` — add Tier 3 A/B branch definitions
- Modify: `packages/client/src/game/towers/TowerUpgrade.ts` — support branch selection
- Modify: `packages/client/src/ui/hud/TowerInfo.tsx` — show A/B branch buttons
- Test: `packages/client/src/game/towers/__tests__/TowerUpgrade.test.ts`

- [ ] **Step 1: Write failing tests** — branch A upgrade applies correct stats, branch B applies different stats, Essence cost deducted
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Add Tier 3 branch data** — each Middle-earth tower gets A and B branches with distinct stat profiles and visual language (A = blue, B = red)
- [ ] **Step 4: Update TowerUpgrade** to handle branch selection, deduct Essence
- [ ] **Step 5: Update TowerInfo.tsx** — show branch buttons when tower is Tier 2, display stat previews
- [ ] **Step 6: Run tests to verify they pass**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add Tier 3 branching upgrades (A/B) with Essence cost"
```

---

## Task 2: Fusion Engine

**Files:**
- Create: `packages/shared/src/data/fusions.ts`
- Create: `packages/client/src/game/towers/FusionEngine.ts`
- Test: `packages/client/src/game/towers/__tests__/FusionEngine.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe('FusionEngine', () => {
  it('should detect fusable adjacent towers', () => {
    const grid = new TowerGrid();
    grid.place('elven_archer_spire', 5, 5, 2);
    grid.place('dwarven_cannon', 5, 6, 2); // adjacent
    const fusable = findFusablePairs(grid);
    expect(fusable).toHaveLength(1);
    expect(fusable[0].recipeId).toBe('explosive_arrow');
  });

  it('should reject diagonal adjacency', () => {
    const grid = new TowerGrid();
    grid.place('elven_archer_spire', 5, 5, 2);
    grid.place('dwarven_cannon', 6, 6, 2); // diagonal
    expect(findFusablePairs(grid)).toHaveLength(0);
  });

  it('should reject towers below Tier 2', () => {
    const grid = new TowerGrid();
    grid.place('elven_archer_spire', 5, 5, 1); // Tier 1
    grid.place('dwarven_cannon', 5, 6, 2);
    expect(findFusablePairs(grid)).toHaveLength(0);
  });

  it('should consume both towers and spawn hybrid', () => {
    // ... verify entity destruction + new entity creation
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Define 3 intra-universe fusion recipes for Middle-earth**

```typescript
// packages/shared/src/data/fusions.ts
export const FUSIONS: Record<string, FusionRecipe> = {
  explosive_arrow: {
    id: 'explosive_arrow',
    name: 'Explosive Arrow Tower',
    inputs: ['elven_archer_spire', 'dwarven_cannon'],
    universe: 'middle_earth',
    tier: 'intra',
    essenceCost: 25,
    stats: { range: 4, attackSpeed: 1.2, damage: 35, splashRadius: 1.0 },
    mechanic: 'Single-target arrows detonate on impact for splash damage',
  },
  // ... 2 more recipes
};
```

- [ ] **Step 4: Implement FusionEngine** — adjacency detection (4-directional), recipe matching, tower consumption, hybrid entity creation
- [ ] **Step 5: Add adjacency shimmer VFX** — subtle particle connection between fusable adjacent towers
- [ ] **Step 6: Add "Fuse" button to TowerInfo.tsx** — visible when selected tower has an adjacent fusable partner
- [ ] **Step 7: Run tests to verify they pass**
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add fusion engine with 3 Middle-earth recipes and adjacency detection"
```

---

## Task 3: Grimoire Discovery + UI

**Files:**
- Create: `packages/client/src/ui/grimoire/GrimoireBook.tsx`
- Create: `packages/client/src/ui/grimoire/FusionLog.tsx`
- Modify: `packages/client/src/stores/usePlayerStore.ts` — track discovered fusions

- [ ] **Step 1: Implement GrimoireBook.tsx** — grid of fusion cards. Undiscovered = silhouetted with cryptic flavor text. Discovered = full art + stats.
- [ ] **Step 2: Implement FusionLog.tsx** — chronological discovery log.
- [ ] **Step 3: Add discovery tracking to usePlayerStore** — `discoveredFusions: Set<string>`.
- [ ] **Step 4: Wire first fusion discovery** — 25 Essence bonus, Grimoire entry unlocked with animation.
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Grimoire UI with fusion discovery tracking"
```

---

## Task 4: Act 1 Levels 2-5

**Files:**
- Modify: `packages/shared/src/data/levels.ts` — add Levels 2-5 wave definitions
- Create placeholder tilemaps for each level (or procedural grid variations)

- [ ] **Step 1: Define Level 2 ("Bree Under Siege")** — 12 waves, introduces upgrades and economy tutorial
- [ ] **Step 2: Define Level 3 ("Weathertop")** — 12 waves, fusion tutorial, adjacent tower requirement
- [ ] **Step 3: Define Level 4** — 14 waves, escalation, multiple enemy types, split spawns
- [ ] **Step 4: Define Level 5** — 15 waves, boss wave (Balrog) as final wave
- [ ] **Step 5: Add Level 2-3 tutorial hooks** (economy intro on L2, fusion intro on L3)
- [ ] **Step 6: Test each level** — verify wave compositions spawn correctly, difficulty feels right
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add Act 1 Levels 2-5 with wave compositions and tutorial hooks"
```

---

## Task 5: Balrog Boss (Level 5)

**Files:**
- Create: `packages/client/src/game/ecs/components/BossPhase.ts`
- Modify: `packages/client/src/game/enemies/EnemyAI.ts` — add Balrog behavior
- Test: `packages/client/src/game/enemies/__tests__/BossAI.test.ts`

- [ ] **Step 1: Write failing tests for Balrog phases**

```typescript
describe('Balrog Boss', () => {
  it('Phase 1: should leave fire trail on cells', () => {
    const world = new GameWorld();
    const balrog = createBoss(world, 'balrog');
    setBossPhase(world, balrog, 'WALKING');
    moveBossTo(world, balrog, 5, 5);
    balrogAI(world, 16);
    expect(getGridCell(5, 5).isOnFire).toBe(true);
  });

  it('should transition to FLIGHT at 50% HP', () => {
    const world = new GameWorld();
    const balrog = createBoss(world, 'balrog');
    setHealth(world, balrog, 1000, 2000);
    balrogAI(world, 16);
    const phase = world.getComponent(balrog, BossPhaseComponent)!;
    expect(phase.current).toBe('FLIGHT');
  });

  it('Phase 2: should only be targetable by air-targeting towers', () => {
    // ... verify canTargetAir filter
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement BossPhase component** — FSM with `current`, `timer`, `data` fields
- [ ] **Step 4: Implement Balrog AI** — Phase 1 (fire trail, unbuildable cells for 15s), Phase 2 (flight pattern, periodic landing)
- [ ] **Step 5: Add fire cell grid mechanic** — cells deal damage to towers, unbuildable timer, visual feedback
- [ ] **Step 6: Run tests to verify they pass**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add Balrog boss with fire trail and flight phase FSM"
```

---

## Task 6: ScoreBreakdownScene

**Files:**
- Create: `packages/client/src/game/scenes/ScoreBreakdownScene.ts`
- Create: `packages/client/src/ui/hud/ScoreBreakdown.tsx` (Preact overlay for score display)

- [ ] **Step 1: Implement ScoreBreakdownScene** — receives score data from GameScene pre-shutdown, displays breakdown
- [ ] **Step 2: Implement ScoreBreakdown.tsx** — base score, combo score, speed bonus, style points, perfect wave bonus, nexus health bonus
- [ ] **Step 3: Add star rating animation** — 1-4 stars fill sequentially with chime SFX per star
- [ ] **Step 4: Add "Continue" button** — transitions back to HubScene
- [ ] **Step 5: Wire scene transition** — GameScene captures score → fade → ScoreBreakdownScene → fade → HubScene
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add ScoreBreakdownScene with animated star ratings"
```

---

## Task 7: HubScene with Campaign Map

**Files:**
- Create: `packages/client/src/game/scenes/HubScene.ts`
- Create: `packages/client/src/ui/hub/LevelDetail.tsx`
- Create: `packages/client/src/ui/hub/Settings.tsx`
- Modify: `packages/client/src/stores/usePlayerStore.ts` — progress tracking, star ratings

- [ ] **Step 1: Implement HubScene** — campaign map with level nodes as interactive sprites, connected by decorative paths. Three regions visually distinct.
- [ ] **Step 2: Implement level node rendering** — circular sprites with level number, star rating (0-4), lock/unlock state. Current frontier pulses.
- [ ] **Step 3: Implement LevelDetail.tsx** — enemy preview, par time, rewards, difficulty selector, "Play" button.
- [ ] **Step 4: Implement Settings.tsx** — volume, game speed default, reduced motion toggle, UI scale.
- [ ] **Step 5: Add tab bar** — Profile, Grimoire, Store, Leaderboard (stub content for now). Map dims when tab open.
- [ ] **Step 6: Wire level unlock progression** — linear within Act, star gates.
- [ ] **Step 7: Add difficulty mode selection** — Story/Normal/Heroic affecting enemy HP, starting gold, nexus HP.
- [ ] **Step 8: Wire full scene flow** — BootScene → HubScene → GameScene → ScoreBreakdownScene → HubScene.
- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add HubScene with campaign map, level nodes, and difficulty selection"
```

---

## Phase 3 Checkpoint

At completion, you should have:
- Tier 3 branching upgrades (A/B paths) with Essence cost
- Fusion system with adjacency detection, 3 Middle-earth recipes
- Grimoire discovery UI with silhouetted/revealed entries
- Act 1 complete: 5 levels with distinct wave compositions
- Balrog boss with fire trail + flight phase FSM
- ScoreBreakdownScene with animated star ratings
- HubScene with campaign map, level nodes, tab navigation
- Difficulty modes (Story/Normal/Heroic)
- Full scene flow: Boot → Hub → Game → Score → Hub

**Next:** Phase 4 — Backend & Persistence
