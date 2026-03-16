import { useUIStore } from '../../stores/useUIStore';

export interface TutorialContext {
  towerCount: number;
  waveStarted: boolean;
  goldAmount: number;
}

/**
 * TutorialManager drives the step-by-step tutorial for act1_level1.
 *
 * Steps:
 *   0 — Initial: prompt player to place an Elven Archer Spire at [5,7]
 *   1 — First tower placed: explain path update mechanic
 *   2 — (3s delay) Prompt second tower at [10,7]
 *   3 — Second tower placed: explain shortest-path behaviour
 *   4 — (3s delay) Prompt player to start the wave
 *   5 — Wave started: complete tutorial
 */
export class TutorialManager {
  private step = 0;
  private stepTimer = 0;
  private readonly levelId: string;

  constructor(levelId: string) {
    this.levelId = levelId;
  }

  /** Returns true while the tutorial is still running. */
  isActive(): boolean {
    return this.step < 6 && this.levelId === 'act1_level1';
  }

  getCurrentStep(): number {
    return this.step;
  }

  /**
   * Called each frame from GameScene.update(). dt is the scaled delta in ms.
   * Reads/writes tutorial state via useUIStore.
   */
  tick(context: TutorialContext, dt: number): void {
    if (!this.isActive()) return;

    const store = useUIStore.getState();

    switch (this.step) {
      case 0: {
        // Initialise tutorial on first tick
        useUIStore.setState({
          tutorialActive: true,
          tutorialStep: 1,
          tutorialMessage:
            'Welcome to The Shire Falls! Place an Elven Archer Spire to defend the Nexus.',
          tutorialHighlight: { gridX: 5, gridY: 7 },
        });
        this.step = 1;
        break;
      }

      case 1: {
        // Wait for first tower
        if (context.towerCount >= 1) {
          store.setTutorialMessage(
            "Great! Notice how the enemies' path changed. Towers force enemies to take longer routes.",
          );
          store.setTutorialHighlight(null);
          useUIStore.setState({ tutorialStep: 2 });
          this.step = 2;
          this.stepTimer = 0;
        }
        break;
      }

      case 2: {
        // Wait 3 seconds, then prompt second tower
        this.stepTimer += dt;
        if (this.stepTimer >= 3000) {
          store.setTutorialMessage(
            'Place another tower to create a longer maze. Try blocking the path further!',
          );
          store.setTutorialHighlight({ gridX: 10, gridY: 7 });
          useUIStore.setState({ tutorialStep: 3 });
          this.step = 3;
        }
        break;
      }

      case 3: {
        // Wait for second tower
        if (context.towerCount >= 2) {
          store.setTutorialMessage(
            'Enemies always take the shortest path to the Nexus. Use this to your advantage!',
          );
          store.setTutorialHighlight(null);
          useUIStore.setState({ tutorialStep: 4 });
          this.step = 4;
          this.stepTimer = 0;
        }
        break;
      }

      case 4: {
        // Wait 3 seconds, then prompt wave start
        this.stepTimer += dt;
        if (this.stepTimer >= 3000) {
          store.setTutorialMessage(
            'Press SPACE or click Send Wave to begin! Good luck, defender.',
          );
          store.setTutorialHighlight(null);
          useUIStore.setState({ tutorialStep: 5 });
          this.step = 5;
        }
        break;
      }

      case 5: {
        // Wait for wave to start
        if (context.waveStarted) {
          store.completeTutorial();
          this.step = 6;
        }
        break;
      }

      default:
        break;
    }
  }
}
