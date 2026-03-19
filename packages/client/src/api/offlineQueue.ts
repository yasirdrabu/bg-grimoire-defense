import type { ApiClient, ScoreBreakdownPayload, SessionStatsPayload } from './client';
import { ApiError } from './client';

export interface QueuedScore {
  sessionId: string;
  scoreBreakdown: ScoreBreakdownPayload;
  stats: SessionStatsPayload;
  retryCount: number;
  queuedAt: number;
}

const MAX_RETRY_COUNT = 5;
const MAX_QUEUE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Returns delay in ms using exponential back-off: 5s, 10s, 20s, 40s, 80s */
function backoffDelay(retryCount: number): number {
  return Math.min(5000 * Math.pow(2, retryCount), 80000);
}

export class OfflineQueue {
  private static readonly STORAGE_KEY = 'grimoire_offline_scores';

  private static load(): QueuedScore[] {
    try {
      const raw = localStorage.getItem(OfflineQueue.STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as QueuedScore[];
    } catch {
      return [];
    }
  }

  private static save(queue: QueuedScore[]): void {
    try {
      localStorage.setItem(OfflineQueue.STORAGE_KEY, JSON.stringify(queue));
    } catch {
      // Silently ignore storage errors (e.g. private browsing quota exceeded)
    }
  }

  static enqueue(
    score: Omit<QueuedScore, 'retryCount' | 'queuedAt'>,
  ): void {
    const queue = OfflineQueue.load();
    // Avoid duplicate entries for the same session
    const existingIdx = queue.findIndex((q) => q.sessionId === score.sessionId);
    const entry: QueuedScore = {
      ...score,
      retryCount: 0,
      queuedAt: Date.now(),
    };
    if (existingIdx !== -1) {
      queue[existingIdx] = entry;
    } else {
      queue.push(entry);
    }
    OfflineQueue.save(queue);
  }

  static dequeue(): QueuedScore | null {
    const queue = OfflineQueue.load();
    if (queue.length === 0) return null;
    const [first, ...rest] = queue;
    OfflineQueue.save(rest);
    return first ?? null;
  }

  static peek(): QueuedScore[] {
    return OfflineQueue.load();
  }

  static remove(sessionId: string): void {
    const queue = OfflineQueue.load().filter((q) => q.sessionId !== sessionId);
    OfflineQueue.save(queue);
  }

  /**
   * Attempts to submit all queued scores.
   * Entries that succeed are removed. Entries that fail with a server error (4xx)
   * that is not a connectivity issue are also removed (unrecoverable). Entries that
   * fail due to network errors have their retryCount incremented; entries that exceed
   * MAX_RETRY_COUNT or are older than MAX_QUEUE_AGE_MS are discarded.
   */
  static async processQueue(client: ApiClient): Promise<void> {
    const queue = OfflineQueue.load();
    if (queue.length === 0) return;

    const remaining: QueuedScore[] = [];

    for (const entry of queue) {
      // Discard stale entries
      if (Date.now() - entry.queuedAt > MAX_QUEUE_AGE_MS) continue;
      // Discard entries that have exceeded retry limit
      if (entry.retryCount >= MAX_RETRY_COUNT) continue;

      // Check if enough time has passed for this retry attempt
      const requiredDelay = entry.retryCount === 0 ? 0 : backoffDelay(entry.retryCount - 1);
      const elapsed = Date.now() - entry.queuedAt;
      if (elapsed < requiredDelay) {
        remaining.push(entry);
        continue;
      }

      try {
        await client.endSession(entry.sessionId, entry.scoreBreakdown, entry.stats);
        // Successfully submitted — do not add to remaining
      } catch (err) {
        if (err instanceof ApiError) {
          // 4xx errors (except 401/429) are unrecoverable — discard
          if (err.status >= 400 && err.status < 500 && err.status !== 401 && err.status !== 429) {
            continue;
          }
        }
        // Network error or retryable server error — keep with incremented retry count
        remaining.push({ ...entry, retryCount: entry.retryCount + 1 });
      }
    }

    OfflineQueue.save(remaining);
  }
}
