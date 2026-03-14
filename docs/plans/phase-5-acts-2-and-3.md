# Phase 5: Acts 2 & 3 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full 18-level campaign across 3 Acts, all 15 towers, all enemies, 4 remaining bosses, all 30 fusion recipes, Convergence levels, challenge modifiers, and weekly challenge system.

**Architecture:** Content follows established patterns from Phase 2-3. Each Act's towers/enemies/levels follow the same data schema. Boss AI uses BossPhase FSM component. Fusion recipes follow the same FusionEngine. Challenge modifiers are config-driven and applied as game state modifiers at level start.

**Tech Stack:** Same as previous phases

---

## Task 1: Wizarding World Towers (Act 2)

**Files:**
- Modify: `packages/shared/src/data/towers.ts` — add 5 Wizarding World towers
- Test: `packages/shared/src/__tests__/towers-wizarding.test.ts`

- [ ] **Step 1: Design 5 Wizarding World towers** following archetype pattern (Cheap DPS, Medium DPS, Expensive DPS, Utility, Specialist). At least 2 must have `canTargetAir: true`.
- [ ] **Step 2: Write failing data validation tests**
- [ ] **Step 3: Implement tower data** with Tier 1-3 stats and branch definitions
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add 5 Wizarding World towers with upgrade branches"
```

---

## Task 2: Wizarding World Enemies + Bosses (Act 2)

**Files:**
- Modify: `packages/shared/src/data/enemies.ts` — add 5 Wizarding World enemies
- Modify: `packages/client/src/game/enemies/EnemyAI.ts` — add Wizarding enemy abilities
- Test: `packages/client/src/game/enemies/__tests__/WizardingEnemies.test.ts`

- [ ] **Step 1: Design 5 Wizarding World enemies** with thematic abilities
- [ ] **Step 2: Write failing tests for enemy abilities**
- [ ] **Step 3: Implement enemy data and AI**
- [ ] **Step 4: Implement Basilisk boss** (Level 11 mid-boss) — Phase 1 TUNNELING (burrow/emerge), Phase 2 PETRIFY (disable tower for 5s with warning animation)
- [ ] **Step 5: Implement Voldemort boss** (Level 12 Convergence) — Phase 1 TELEPORT, Phase 2 HORCRUXES (7 minions = shield layers), Phase 3 DESPERATE (double teleport, Avada Kedavra)
- [ ] **Step 6: Write boss AI tests**
- [ ] **Step 7: Run all tests**
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add Wizarding World enemies with Basilisk and Voldemort bosses"
```

---

## Task 3: Act 2 Levels (7-12)

**Files:**
- Modify: `packages/shared/src/data/levels.ts` — add Levels 7-12

- [ ] **Step 1: Define Levels 7-10** — 15-20 waves each, Wizarding World enemies, escalating difficulty
- [ ] **Step 2: Define Level 11** — Basilisk boss as final wave
- [ ] **Step 3: Define Level 12 (Convergence)** — mixed Middle-earth + Wizarding enemies, Voldemort boss, mandatory fusion opportunities
- [ ] **Step 4: Apply cross-act scaling** — 2x HP multiplier for Act 2 base stats
- [ ] **Step 5: Test each level spawns correctly**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add Act 2 Levels 7-12 with Convergence level"
```

---

## Task 4: Westeros Towers (Act 3)

**Files:**
- Modify: `packages/shared/src/data/towers.ts` — add 5 Westeros towers

- [ ] **Step 1: Design 5 Westeros towers** following archetype pattern
- [ ] **Step 2: Write failing data validation tests**
- [ ] **Step 3: Implement tower data** with Tier 1-3 stats and branches
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add 5 Westeros towers with upgrade branches"
```

---

## Task 5: Westeros Enemies + Bosses (Act 3)

**Files:**
- Modify: `packages/shared/src/data/enemies.ts`
- Modify: `packages/client/src/game/enemies/EnemyAI.ts`

- [ ] **Step 1: Design 5 Westeros enemies** with thematic abilities
- [ ] **Step 2: Write failing tests for enemy abilities**
- [ ] **Step 3: Implement enemy data and AI**
- [ ] **Step 4: Implement White Walker General boss** (Level 17) — Phase 1 RESURRECT (undead respawn aura), Phase 2 ICE_WALL (freeze cell rows, force repath)
- [ ] **Step 5: Implement Night King boss** (Level 18 Final) — Phase 1 CORRUPTION (towers switch allegiance 8s), Phase 2 DRAGON (air strafe, wight spawns), Phase 3 LAST_STAND (nexus DPS race)
- [ ] **Step 6: Write boss AI tests**
- [ ] **Step 7: Run all tests**
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add Westeros enemies with White Walker and Night King bosses"
```

---

## Task 6: Act 3 Levels (13-18)

**Files:**
- Modify: `packages/shared/src/data/levels.ts` — add Levels 13-18

- [ ] **Step 1: Define Levels 13-16** — 18-25 waves each, Westeros enemies
- [ ] **Step 2: Define Level 17** — White Walker General boss
- [ ] **Step 3: Define Level 18 (Final Convergence)** — all 3 universes mixed, Night King boss, convergence fusions
- [ ] **Step 4: Apply cross-act scaling** — 4x HP multiplier for Act 3
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Act 3 Levels 13-18 with Final Convergence"
```

---

## Task 7: All 30 Fusion Recipes

**Files:**
- Modify: `packages/shared/src/data/fusions.ts` — expand to all 30 recipes
- Test: `packages/shared/src/__tests__/fusions.test.ts`

- [ ] **Step 1: Define 6 remaining intra-universe fusions** (3 Wizarding, 3 Westeros)
- [ ] **Step 2: Define 18 cross-universe fusions** (pairs across 2 universes)
- [ ] **Step 3: Define 3 convergence fusions** (one tower from each universe)
- [ ] **Step 4: Write validation tests** — ensure all recipe inputs exist, no duplicates, stats are balanced
- [ ] **Step 5: Update Grimoire UI** to show all 30 entries
- [ ] **Step 6: Run tests to verify they pass**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add all 30 fusion recipes (9 intra + 18 cross + 3 convergence)"
```

---

## Task 8: Convergence Level 6

**Files:**
- Modify: `packages/shared/src/data/levels.ts`

- [ ] **Step 1: Define Level 6** — 20 waves, Middle-earth + Wizarding enemies mixed, convergence fusion opportunities
- [ ] **Step 2: Ensure both universe towers are available** in the build panel during Convergence levels
- [ ] **Step 3: Test cross-universe enemy mixing**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add Convergence Level 6 with cross-universe enemies"
```

---

## Task 9: Challenge Modifiers + Weekly Challenge

**Files:**
- Create: `packages/shared/src/data/challenges.ts`
- Create: `packages/client/src/game/modifiers/ChallengeModifier.ts`
- Modify: `packages/client/src/ui/hub/LevelDetail.tsx` — modifier selection
- Create: `packages/server/src/routes/challenges.ts` (weekly challenge rotation)

- [ ] **Step 1: Define challenge modifier types** — "No Utility Towers", "Double Speed Enemies", "Limited Gold (50%)", "Fragile Nexus (1 HP)"
- [ ] **Step 2: Implement ChallengeModifier** — applies game state modifications at level start
- [ ] **Step 3: Add modifier toggle UI** to LevelDetail.tsx (unlocked after first level completion)
- [ ] **Step 4: Implement weekly challenge rotation** — server picks level + modifier, separate leaderboard
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add challenge modifiers and weekly challenge system"
```

---

## Phase 5 Checkpoint

At completion, you should have:
- Full 18-level campaign across 3 Acts
- 15 towers (5 per universe) with Tier 1-3 upgrades
- All enemies with unique abilities
- 6 bosses with multi-phase FSM AI
- All 30 fusion recipes
- 3 Convergence levels with mixed enemies
- Challenge modifiers and weekly challenge system
- Complete Grimoire with all entries

**Next:** Phase 6 — Store, Polish & Launch
