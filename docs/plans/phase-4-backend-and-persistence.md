# Phase 4: Backend & Persistence — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Server running with auth, profiles, score submission with anti-cheat validation, leaderboards, and client API layer with offline resilience.

**Architecture:** Hono REST API on Node.js 22. SQLite via better-sqlite3. Drizzle ORM for type-safe schema/queries. JWT auth (stateless). Score validation uses `shared/logic/ScoreAggregator` on the server. Offline score caching in localStorage with retry queue.

**Tech Stack:** Hono 4.6+, better-sqlite3, Drizzle ORM, JWT (jose), bcrypt, Supertest for API tests

---

## Task 1: Database Schema & Migrations

**Files:**
- Create: `packages/server/src/db/schema.ts`
- Create: `packages/server/src/db/connection.ts`
- Create: `packages/server/src/db/migrate.ts`
- Create: `packages/server/src/db/seed.ts`
- Create: `packages/server/drizzle.config.ts`

- [ ] **Step 1: Define Drizzle schema** — players, player_progress, fusion_discoveries, game_sessions, leaderboard, store_items, player_purchases, player_equipped (from spec SQL)
- [ ] **Step 2: Create connection module** — better-sqlite3 instance, Drizzle wrapper
- [ ] **Step 3: Create migration script** — `pnpm --filter server db:migrate`
- [ ] **Step 4: Create seed script** — default store items, test player
- [ ] **Step 5: Run migration and verify tables created**

Run: `pnpm --filter server db:migrate`
Expected: All tables created successfully.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add database schema with Drizzle ORM and migration scripts"
```

---

## Task 2: Auth Routes

**Files:**
- Create: `packages/server/src/routes/auth.ts`
- Create: `packages/server/src/middleware/auth.ts`
- Create: `packages/server/src/utils/jwt.ts`
- Create: `packages/server/src/utils/hash.ts`
- Modify: `packages/server/src/index.ts` — mount routes
- Test: `packages/server/src/__tests__/auth.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe('Auth routes', () => {
  it('POST /api/auth/register creates player and returns token', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', username: 'wizard1', password: 'secure123' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.player.username).toBe('wizard1');
  });

  it('POST /api/auth/login returns token for valid credentials', async () => {
    // ... register first, then login
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    // ... expect 401
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement jwt.ts** — sign/verify JWT with jose library
- [ ] **Step 4: Implement hash.ts** — bcrypt hash/compare
- [ ] **Step 5: Implement auth middleware** — extract and verify JWT from Authorization header
- [ ] **Step 6: Implement auth routes** — register, login, refresh
- [ ] **Step 7: Run tests to verify they pass**
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add auth routes with JWT and bcrypt password hashing"
```

---

## Task 3: Profile & Progress Routes

**Files:**
- Create: `packages/server/src/routes/profile.ts`
- Create: `packages/server/src/services/ProfileService.ts`
- Test: `packages/server/src/__tests__/profile.test.ts`

- [ ] **Step 1: Write failing tests** — GET /api/profile returns player + progress + fusions, PUT /api/profile updates display_name
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement ProfileService** — fetch player with progress, update profile fields
- [ ] **Step 4: Implement profile routes**
- [ ] **Step 5: Run tests to verify they pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add profile routes with progress tracking"
```

---

## Task 4: Score Submission & Session Routes

**Files:**
- Create: `packages/server/src/routes/sessions.ts`
- Create: `packages/server/src/routes/scores.ts`
- Create: `packages/server/src/services/ScoreService.ts`
- Create: `packages/server/src/services/SessionService.ts`
- Create: `packages/server/src/utils/anticheat.ts`
- Test: `packages/server/src/__tests__/sessions.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe('Session routes', () => {
  it('POST /api/sessions/start creates an active session', async () => {
    const res = await authedRequest('POST', '/api/sessions/start', {
      level_id: 'act1_level1', difficulty: 'normal',
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.session_id).toBeDefined();
  });

  it('PUT /api/sessions/:id/end validates and saves score', async () => {
    // ... start session, then end with score breakdown
  });

  it('PUT /api/sessions/:id/end rejects implausible score', async () => {
    // ... enemies_killed > expected for waves_completed
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement SessionService** — create session, expire after 1 hour, rate limit (10/hour)
- [ ] **Step 4: Implement ScoreService** — recompute total using shared ScoreAggregator, HMAC hash, plausibility checks
- [ ] **Step 5: Implement anticheat.ts** — plausibility validators (duration, kill count, max combo, theoretical max)
- [ ] **Step 6: Implement session routes** — start, end with score breakdown
- [ ] **Step 7: Run tests to verify they pass**
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add session and score routes with anti-cheat validation"
```

---

## Task 5: Leaderboard Routes

**Files:**
- Create: `packages/server/src/routes/leaderboard.ts`
- Create: `packages/server/src/services/LeaderboardService.ts`
- Test: `packages/server/src/__tests__/leaderboard.test.ts`

- [ ] **Step 1: Write failing tests** — GET per-level leaderboard with pagination, campaign total leaderboard, player rank
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement LeaderboardService** — sorted by score DESC, per-difficulty, player rank lookup, upsert best score
- [ ] **Step 4: Implement leaderboard routes**
- [ ] **Step 5: Run tests to verify they pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add leaderboard routes with per-level and campaign rankings"
```

---

## Task 6: Rate Limiting & CORS Middleware

**Files:**
- Create: `packages/server/src/middleware/rateLimit.ts`
- Create: `packages/server/src/middleware/cors.ts`
- Create: `packages/server/src/routes/health.ts`

- [ ] **Step 1: Implement rate limiting** — in-memory token bucket per IP, 1 score/minute, 10 sessions/hour
- [ ] **Step 2: Implement CORS middleware** — allow CORS_ORIGIN from env
- [ ] **Step 3: Add health check route** — `GET /api/health`
- [ ] **Step 4: Wire all middleware into Hono app**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add rate limiting, CORS, and health check middleware"
```

---

## Task 7: Client API Layer

**Files:**
- Create: `packages/client/src/api/client.ts`
- Create: `packages/client/src/api/offlineQueue.ts`
- Modify: `packages/client/src/stores/usePlayerStore.ts` — wire API calls

- [ ] **Step 1: Implement API client** — typed fetch wrapper for all endpoints, JWT token management
- [ ] **Step 2: Implement offline queue** — localStorage-based queue for score submissions, exponential backoff retry
- [ ] **Step 3: Wire auth flow** — login/register from HubScene, token storage
- [ ] **Step 4: Wire score submission** — GameScene → ScoreBreakdownScene → submit to server
- [ ] **Step 5: Wire leaderboard fetching** — Leaderboard tab in HubScene
- [ ] **Step 6: Add "offline" indicator** — non-blocking banner when network unavailable
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add client API layer with offline score caching and retry"
```

---

## Task 8: End-to-End Flow Test

- [ ] **Step 1: Run full flow manually** — register → login → hub → select level → play → score → leaderboard
- [ ] **Step 2: Verify score submission** — check database has correct session and leaderboard entries
- [ ] **Step 3: Verify anti-cheat** — submit tampered score, verify server rejects
- [ ] **Step 4: Test offline resilience** — disconnect, play, reconnect, verify score queued and submitted
- [ ] **Step 5: Fix integration issues**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: wire full auth → play → score → leaderboard flow"
```

---

## Phase 4 Checkpoint

At completion, you should have:
- SQLite database with Drizzle schema and migrations
- Auth routes (register, login, refresh) with JWT
- Profile routes with progress tracking
- Session/score routes with server-side anti-cheat validation
- Leaderboard routes with per-level and campaign rankings
- Rate limiting and CORS middleware
- Client API layer with offline score caching
- Full end-to-end flow: register → hub → play → score → leaderboard

**Next:** Phase 5 — Acts 2 & 3
