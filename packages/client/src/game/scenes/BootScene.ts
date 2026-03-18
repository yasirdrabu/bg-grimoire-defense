import Phaser from 'phaser';
import { generateAllSprites } from '../utils/SpriteGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // In future: load shared assets (UI sprites, fonts, audio manifests)
  }

  create(): void {
    generateAllSprites(this);
    this.scene.start('HubScene');
  }
}
