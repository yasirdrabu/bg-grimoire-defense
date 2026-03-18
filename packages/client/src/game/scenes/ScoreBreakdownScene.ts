import Phaser from 'phaser';
import { useGameStore } from '../../stores/useGameStore';
import { emitSceneChange } from '../utils/sceneEvents';

export class ScoreBreakdownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ScoreBreakdownScene' });
  }

  create(): void {
    emitSceneChange('ScoreBreakdownScene');

    // Dark background fill
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a14, 1);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  /** Called by ScoreBreakdown Preact component when "Continue" is pressed. */
  continue(): void {
    useGameStore.getState().setScoreBreakdown(null);
    useGameStore.getState().resetGameState();
    this.cameras.main.fadeOut(400, 0, 0, 0, (_camera: unknown, progress: number) => {
      if (progress === 1) {
        this.scene.start('HubScene');
      }
    });
  }
}
