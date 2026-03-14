import { PATH_REQUEST_TIMEOUT_MS } from '@grimoire/shared';
import type { WorkerRequest, WorkerResponse } from './protocol';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timestamp: number;
}

export class PathManager {
  private worker: Worker;
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private gridVersion = 0;
  private pathCache = new Map<string, [number, number][]>();
  private buildabilityCache: Record<string, boolean> | null = null;

  constructor() {
    this.worker = new Worker(
      new URL('./pathfinding.worker.ts', import.meta.url),
      { type: 'module' },
    );
    this.worker.onmessage = this.handleResponse.bind(this);
    this.worker.onerror = this.handleError.bind(this);
  }

  private handleResponse(event: MessageEvent<WorkerResponse>): void {
    const res = event.data;
    const pending = this.pending.get(res.id);
    if (!pending) return;

    this.pending.delete(res.id);

    if (res.type === 'ERROR') {
      pending.reject(new Error(res.message));
    } else {
      pending.resolve(res);
    }
  }

  private handleError(_event: ErrorEvent): void {
    // Worker crashed — terminate and respawn
    this.worker.terminate();
    this.worker = new Worker(
      new URL('./pathfinding.worker.ts', import.meta.url),
      { type: 'module' },
    );
    this.worker.onmessage = this.handleResponse.bind(this);
    this.worker.onerror = this.handleError.bind(this);

    // Reject all pending requests
    for (const [id, pending] of this.pending) {
      pending.reject(new Error('Worker crashed'));
      this.pending.delete(id);
    }
  }

  private sendRequest(request: WorkerRequest): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      this.pending.set(request.id, {
        resolve: resolve as (v: unknown) => void,
        reject,
        timestamp: Date.now(),
      });

      this.worker.postMessage(request);

      // Per-request timeout
      setTimeout(() => {
        const p = this.pending.get(request.id);
        if (p) {
          this.pending.delete(request.id);
          p.reject(new Error(`Pathfinding request ${request.id} timed out`));
        }
      }, PATH_REQUEST_TIMEOUT_MS);
    });
  }

  async findPath(
    gridData: number[][],
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): Promise<[number, number][]> {
    const cacheKey = `${this.gridVersion}:${startX},${startY}-${endX},${endY}`;
    const cached = this.pathCache.get(cacheKey);
    if (cached) return cached;

    const id = this.nextId++;
    const res = await this.sendRequest({
      id,
      type: 'FIND_PATH',
      gridData,
      startX,
      startY,
      endX,
      endY,
    }) as Extract<WorkerResponse, { type: 'PATH_RESULT' }>;

    this.pathCache.set(cacheKey, res.path);
    return res.path;
  }

  async validatePlacement(
    gridData: number[][],
    spawns: [number, number][],
    nexus: [number, number],
  ): Promise<{ valid: boolean; paths: Record<string, [number, number][]> }> {
    const id = this.nextId++;
    const res = await this.sendRequest({
      id,
      type: 'VALIDATE_PLACEMENT',
      gridData,
      spawns,
      nexus,
    }) as Extract<WorkerResponse, { type: 'VALIDATION_RESULT' }>;

    return { valid: res.valid, paths: res.paths };
  }

  async precomputeBuildability(
    gridData: number[][],
    cells: [number, number][],
    spawns: [number, number][],
    nexus: [number, number],
  ): Promise<Record<string, boolean>> {
    const id = this.nextId++;
    const res = await this.sendRequest({
      id,
      type: 'BATCH_VALIDATE',
      gridData,
      cells,
      spawns,
      nexus,
    }) as Extract<WorkerResponse, { type: 'BATCH_RESULT' }>;

    this.buildabilityCache = res.results;
    return res.results;
  }

  getBuildability(gridX: number, gridY: number): boolean | null {
    if (!this.buildabilityCache) return null;
    return this.buildabilityCache[`${gridX},${gridY}`] ?? null;
  }

  incrementGridVersion(): void {
    this.gridVersion++;
    this.pathCache.clear();
    this.buildabilityCache = null;
  }

  getGridVersion(): number {
    return this.gridVersion;
  }

  destroy(): void {
    this.worker.terminate();
    this.pending.clear();
    this.pathCache.clear();
  }
}
