const API_URL = ((import.meta as unknown as { env: Record<string, string | undefined> }).env['VITE_API_URL']) ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---- Response shape types (matching server output) ----

export interface AuthPlayerRow {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  title: string;
  borderStyle: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  player: AuthPlayerRow;
}

export interface RefreshResponse {
  token: string;
}

export interface ProfileProgressRow {
  id: string;
  playerId: string;
  levelId: string;
  difficulty: string;
  bestScore: number;
  stars: number;
  bestCombo: number;
  bestSpeedBonus: number;
  timesCompleted: number;
  fastestClearMs: number | null;
  completedAt: string | null;
}

export interface ProfileFusionRow {
  id: string;
  playerId: string;
  fusionId: string;
  discoveredAt: string;
}

export interface ProfileResponse {
  player: AuthPlayerRow;
  progress: ProfileProgressRow[];
  fusions: ProfileFusionRow[];
}

export interface UpdateProfileResponse {
  player: AuthPlayerRow;
}

export interface StartSessionResponse {
  session_id: string;
}

export interface SessionRow {
  id: string;
  playerId: string;
  levelId: string;
  difficulty: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  wavesCompleted: number | null;
  totalWaves: number | null;
  baseScore: number | null;
  comboScore: number | null;
  speedScore: number | null;
  styleScore: number | null;
  perfectWaveBonus: number | null;
  nexusHealthBonus: number | null;
  totalScore: number | null;
  scoreHash: string | null;
  towersBuilt: number | null;
  towersFused: number | null;
  enemiesKilled: number | null;
  goldEarned: number | null;
  essenceEarned: number | null;
  maxCombo: number | null;
  nexusHpRemaining: number | null;
}

export interface EndSessionResponse {
  session: SessionRow;
  leaderboard_rank: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
  title: string;
  border_style: string;
  score: number;
  session_id?: string;
  achieved_at?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  player_rank: number | null;
}

export interface ScoreBreakdownPayload {
  base_score: number;
  combo_score: number;
  speed_score: number;
  style_score: number;
  perfect_wave_bonus: number;
  nexus_health_bonus: number;
}

export interface SessionStatsPayload {
  waves_completed: number;
  total_waves: number;
  towers_built: number;
  towers_fused: number;
  enemies_killed: number;
  gold_earned: number;
  essence_earned: number;
  max_combo: number;
  nexus_hp_remaining: number;
  duration_ms: number;
}

// ---- API Client ----

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText })) as Record<string, unknown>;
      const message = typeof err['error'] === 'string' ? err['error'] : 'Request failed';
      throw new ApiError(res.status, message);
    }

    return res.json() as Promise<T>;
  }

  // ---- Auth ----

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/register', { email, username, password });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/login', { email, password });
  }

  async refreshToken(currentToken: string): Promise<RefreshResponse> {
    return this.request<RefreshResponse>('POST', '/auth/refresh', { token: currentToken });
  }

  // ---- Profile ----

  async getProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('GET', '/profile');
  }

  async updateProfile(data: { display_name?: string }): Promise<UpdateProfileResponse> {
    return this.request<UpdateProfileResponse>('PUT', '/profile', data);
  }

  // ---- Sessions ----

  async startSession(levelId: string, difficulty: string): Promise<StartSessionResponse> {
    return this.request<StartSessionResponse>('POST', '/sessions/start', {
      level_id: levelId,
      difficulty,
    });
  }

  async endSession(
    sessionId: string,
    scoreBreakdown: ScoreBreakdownPayload,
    stats: SessionStatsPayload,
  ): Promise<EndSessionResponse> {
    return this.request<EndSessionResponse>('PUT', `/sessions/${sessionId}/end`, {
      score_breakdown: scoreBreakdown,
      stats,
    });
  }

  // ---- Leaderboard ----

  async getLeaderboard(
    levelId: string,
    difficulty = 'normal',
    page = 1,
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({ difficulty, page: String(page) });
    return this.request<LeaderboardResponse>('GET', `/leaderboard/${encodeURIComponent(levelId)}?${params}`);
  }

  async getCampaignLeaderboard(
    difficulty = 'normal',
    page = 1,
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({ difficulty, page: String(page) });
    return this.request<LeaderboardResponse>('GET', `/leaderboard/campaign?${params}`);
  }
}

export const api = new ApiClient();
