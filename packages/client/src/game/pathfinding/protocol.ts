export type WorkerRequest =
  | { id: number; type: 'FIND_PATH'; gridData: number[][]; startX: number; startY: number; endX: number; endY: number }
  | { id: number; type: 'VALIDATE_PLACEMENT'; gridData: number[][]; spawns: [number, number][]; nexus: [number, number] }
  | { id: number; type: 'BATCH_VALIDATE'; gridData: number[][]; cells: [number, number][]; spawns: [number, number][]; nexus: [number, number] };

export type WorkerResponse =
  | { id: number; type: 'PATH_RESULT'; path: [number, number][] }
  | { id: number; type: 'VALIDATION_RESULT'; valid: boolean; paths: Record<string, [number, number][]> }
  | { id: number; type: 'BATCH_RESULT'; results: Record<string, boolean> }
  | { id: number; type: 'ERROR'; message: string };
