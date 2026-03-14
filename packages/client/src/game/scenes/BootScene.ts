import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Procedural sprites will be generated in create()
    // In future: load shared assets (UI sprites, fonts, audio manifests)
  }

  create(): void {
    // Placeholder — sprite generation will be added in Task 6
    this.scene.start('GameScene');
  }
}
