import { useUIStore } from '../../stores/useUIStore';

export interface TutorialContext {
  towerCount: number;
  waveStarted: boolean;
  goldAmount: number;
  currentWave: number;
  hasFusionTower: boolean;
}

/**
 * TutorialManager drives the step-by-step tutorial for Act 1 levels 1-3.
 *
 * act1_level1 steps:
 *   0 — Initial: prompt player to place an Elven Archer Spire at [5,7]
 *   1 — First tower placed: explain path update mechanic
 *   2 — (3s delay) Prompt second tower at [10,7]
 *   3 — Second tower placed: explain shortest-path behaviour
 *   4 — (3s delay) Prompt player to start the wave
 *   5 — Wave started: complete tutorial
 *
 * act1_level2 steps (economy focus):
 *   0 — Initial: welcome message
 *   1 — After wave 2: upgrade prompt
 *   2 — When gold > 200: interest tip
 *   3 — If gold < towerCost (200): sell tip (skips if gold stays above)
 *   4 — After wave 5: tutorial complete
 *
 * act1_level3 steps (fusion focus):
 *   0 — Initial: prompt adjacent tower placement
 *   1 — When two fusable towers adjacent (hasFusionTower): fuse prompt
 *   2 — After fusion (hasFusionTower goes true then stays): complete
 */
export class TutorialManager {
  private step = 0;
  private stepTimer = 0;
  private readonly levelId: string;

  /** Minimum tower cost used for low-gold detection in level 2 */
  private static readonly MIN_TOWER_COST = 200;

  /** Total steps per level (exclusive upper bound — step >= limit = inactive) */
  private static readonly STEP_LIMITS: Record<string, number> = {
    act1_level1: 6,
    act1_level2: 5,
    act1_level3: 3,
  };

  constructor(levelId: string) {
    this.levelId = levelId;
  }

  /** Returns true while the tutorial is still running for supported levels. */
  isActive(): boolean {
    const limit = TutorialManager.STEP_LIMITS[this.levelId];
    return limit !== undefined && this.step < limit;
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

    switch (this.levelId) {
      case 'act1_level1':
        this.tickLevel1(context, dt);
        break;
      case 'act1_level2':
        this.tickLevel2(context, dt);
        break;
      case 'act1_level3':
        this.tickLevel3(context, dt);
        break;
      default:
        break;
    }
  }

  // ─── Level 1 ───────────────────────────────────────────────────────────────

  private tickLevel1(context: TutorialContext, dt: number): void {
    const store = useUIStore.getState();

    switch (this.step) {
      case 0: {
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

  // ─── Level 2: Economy Tutorial ────────────────────────────────────────────

  private tickLevel2(context: TutorialContext, _dt: number): void {
    const store = useUIStore.getState();

    switch (this.step) {
      case 0: {
        // Initial welcome
        useUIStore.setState({
          tutorialActive: true,
          tutorialStep: 1,
          tutorialMessage:
            'Welcome to Bree! Build towers and defend the town from the invaders.',
          tutorialHighlight: null,
        });
        this.step = 1;
        break;
      }

      case 1: {
        // After wave 2 completes, show upgrade prompt
        if (context.currentWave >= 2) {
          store.setTutorialMessage(
            'Try upgrading a tower! Select it and click Upgrade to boost its power.',
          );
          useUIStore.setState({ tutorialStep: 2 });
          this.step = 2;
        }
        break;
      }

      case 2: {
        // When gold exceeds 200, show interest tip
        if (context.goldAmount > 200) {
          store.setTutorialMessage(
            'Bank your gold between waves to earn interest! Saving pays off.',
          );
          useUIStore.setState({ tutorialStep: 3 });
          this.step = 3;
        }
        break;
      }

      case 3: {
        // If gold drops below min tower cost, show sell tip; otherwise advance
        if (context.goldAmount < TutorialManager.MIN_TOWER_COST) {
          store.setTutorialMessage(
            'Low on gold? Sell a tower for a 75% refund to fund a better placement.',
          );
          useUIStore.setState({ tutorialStep: 4 });
          this.step = 4;
        } else if (context.currentWave >= 5) {
          // Skip sell tip if player has been managing gold well
          store.completeTutorial();
          this.step = 5;
        }
        break;
      }

      case 4: {
        // After wave 5 completes, tutorial is done
        if (context.currentWave >= 5) {
          store.completeTutorial();
          this.step = 5;
        }
        break;
      }

      default:
        break;
    }
  }

  // ─── Level 3: Fusion Tutorial ─────────────────────────────────────────────

  private tickLevel3(context: TutorialContext, _dt: number): void {
    const store = useUIStore.getState();

    switch (this.step) {
      case 0: {
        // Initial: prompt adjacent tower placement
        useUIStore.setState({
          tutorialActive: true,
          tutorialStep: 1,
          tutorialMessage:
            'Weathertop awaits! Place an Elven Archer Spire and a Dwarven Cannon adjacent to each other.',
          tutorialHighlight: null,
        });
        this.step = 1;
        break;
      }

      case 1: {
        // When two fusable towers are adjacent (hasFusionTower flag set by GameScene)
        if (context.hasFusionTower) {
          store.setTutorialMessage(
            'Those towers can be fused! Select one and click Fuse to combine them.',
          );
          useUIStore.setState({ tutorialStep: 2 });
          this.step = 2;
        }
        break;
      }

      case 2: {
        // After fusion completes — hasFusionTower is cleared when fusion happens
        if (!context.hasFusionTower && context.towerCount >= 1) {
          store.setTutorialMessage(
            'Fusion discovered! Check the Grimoire for more fusion recipes.',
          );
          store.completeTutorial();
          this.step = 3;
        }
        break;
      }

      default:
        break;
    }
  }
}
