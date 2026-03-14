export interface PlayerProfile {
  readonly id: string;
  readonly username: string;
  readonly displayName?: string;
  readonly avatarUrl?: string;
  readonly title: string;
  readonly borderStyle: string;
  readonly coins: number;
}

export interface LevelProgress {
  readonly levelId: string;
  readonly difficulty: string;
  readonly bestScore: number;
  readonly stars: number;
  readonly bestCombo: number;
  readonly timesCompleted: number;
  readonly fastestClearMs?: number;
}
