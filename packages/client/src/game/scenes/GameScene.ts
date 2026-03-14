import Phaser from 'phaser';
import {
  TILE_W, TILE_H, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS,
  LAYER_TERRAIN, LAYER_GRID_OVERLAY,
} from '@grimoire/shared';
import { gridToScreen } from '../utils/isoMath';
import { GameWorld } from '../ecs/World';

export class GameScene extends Phaser.Scene {
  world!: GameWorld;

  private gridCols = DEFAULT_GRID_COLS;
  private gridRows = DEFAULT_GRID_ROWS;
  private mapOffsetX = 0;
  private mapOffsetY = 0;
  private gridOverlay!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.world = new GameWorld();

    // Center the isometric map in the viewport
    this.mapOffsetX = this.scale.width / 2;
    this.mapOffsetY = 100; // top margin

    // Set up camera bounds
    const mapWidth = (this.gridCols + this.gridRows) * (TILE_W / 2);
    const mapHeight = (this.gridCols + this.gridRows) * (TILE_H / 2);
    this.cameras.main.setBounds(
      -TILE_W, -TILE_H,
      mapWidth + TILE_W * 2,
      mapHeight + TILE_H * 2,
    );

    // Draw the isometric grid overlay
    this.drawGrid();
  }

  private drawGrid(): void {
    this.gridOverlay = this.add.graphics();
    this.gridOverlay.setDepth(LAYER_GRID_OVERLAY);

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const { screenX, screenY } = gridToScreen(col, row, this.mapOffsetX, this.mapOffsetY);
        this.drawIsoDiamond(screenX, screenY, 0x557733, 0x446622);
      }
    }
  }

  private drawIsoDiamond(x: number, y: number, fill: number, stroke: number): void {
    const hw = TILE_W / 2;
    const hh = TILE_H / 2;

    this.gridOverlay.fillStyle(fill, 0.6);
    this.gridOverlay.beginPath();
    this.gridOverlay.moveTo(x + hw, y);          // top
    this.gridOverlay.lineTo(x + TILE_W, y + hh); // right
    this.gridOverlay.lineTo(x + hw, y + TILE_H); // bottom
    this.gridOverlay.lineTo(x, y + hh);           // left
    this.gridOverlay.closePath();
    this.gridOverlay.fillPath();

    this.gridOverlay.lineStyle(1, stroke, 0.4);
    this.gridOverlay.strokePath();
  }

  update(_time: number, _delta: number): void {
    // Systems will be wired here in Task 12
  }
}
