import PF from 'pathfinding';
import type { WorkerRequest, WorkerResponse } from './protocol';

const finder = new PF.AStarFinder({
  allowDiagonal: false,
});

function createGrid(gridData: number[][]): PF.Grid {
  return new PF.Grid(gridData);
}

function findPath(
  gridData: number[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): [number, number][] {
  const grid = createGrid(gridData);
  const rawPath = finder.findPath(startX, startY, endX, endY, grid);
  return rawPath as [number, number][];
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;

  try {
    switch (req.type) {
      case 'FIND_PATH': {
        const path = findPath(req.gridData, req.startX, req.startY, req.endX, req.endY);
        const response: WorkerResponse = { id: req.id, type: 'PATH_RESULT', path };
        self.postMessage(response);
        break;
      }

      case 'VALIDATE_PLACEMENT': {
        const paths: Record<string, [number, number][]> = {};
        let valid = true;

        for (const spawn of req.spawns) {
          const path = findPath(req.gridData, spawn[0], spawn[1], req.nexus[0], req.nexus[1]);
          const key = `${spawn[0]},${spawn[1]}`;
          paths[key] = path;
          if (path.length === 0) {
            valid = false;
            break;
          }
        }

        const response: WorkerResponse = { id: req.id, type: 'VALIDATION_RESULT', valid, paths };
        self.postMessage(response);
        break;
      }

      case 'BATCH_VALIDATE': {
        const results: Record<string, boolean> = {};

        for (const cell of req.cells) {
          // Clone grid data and block this cell
          const testGrid = req.gridData.map((row) => [...row]);
          testGrid[cell[1]]![cell[0]] = 1; // 1 = blocked

          let allPathsValid = true;
          for (const spawn of req.spawns) {
            const path = findPath(testGrid, spawn[0], spawn[1], req.nexus[0], req.nexus[1]);
            if (path.length === 0) {
              allPathsValid = false;
              break;
            }
          }

          results[`${cell[0]},${cell[1]}`] = allPathsValid;
        }

        const response: WorkerResponse = { id: req.id, type: 'BATCH_RESULT', results };
        self.postMessage(response);
        break;
      }
    }
  } catch (err) {
    const response: WorkerResponse = {
      id: req.id,
      type: 'ERROR',
      message: err instanceof Error ? err.message : 'Unknown worker error',
    };
    self.postMessage(response);
  }
};
