import Phaser from 'phaser';
import { LEVELS } from '@grimoire/shared';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { useGameStore } from '../../stores/useGameStore';
import { emitSceneChange } from '../utils/sceneEvents';

// Act 1 level ids in order
const ACT1_LEVEL_IDS = [
  'act1_level1',
  'act1_level2',
  'act1_level3',
  'act1_level4',
  'act1_level5',
] as const;

interface LevelNodeConfig {
  levelId: string;
  x: number;
  y: number;
}

export class HubScene extends Phaser.Scene {
  private levelNodes: Map<string, Phaser.GameObjects.Container> = new Map();
  private pulseTween: Phaser.Tweens.Tween | null = null;

  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Parchment-style background
    this.drawBackground(width, height);

    // Draw level nodes spaced across the map
    const nodeConfigs = this.buildNodeConfigs(width, height);
    this.drawConnectingLines(nodeConfigs);
    for (const cfg of nodeConfigs) {
      this.createLevelNode(cfg);
    }

    // Pulse the current frontier node
    this.updatePulse();

    // Notify Preact overlay
    emitSceneChange('HubScene');

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Listen for store changes to refresh nodes when progress updates
    usePlayerStore.subscribe(() => {
      this.refreshNodes();
    });

    // Notify Preact that hub scene is active (tab state reset)
    useUIStore.getState().setActiveTab('none');
  }

  private drawBackground(width: number, height: number): void {
    const bg = this.add.graphics();

    // Dark outer
    bg.fillStyle(0x0a0a14, 1);
    bg.fillRect(0, 0, width, height);

    // Parchment map area
    const mapX = width * 0.08;
    const mapY = height * 0.08;
    const mapW = width * 0.84;
    const mapH = height * 0.84;

    bg.fillStyle(0x2a1f0e, 1);
    bg.fillRoundedRect(mapX, mapY, mapW, mapH, 16);

    // Parchment texture overlay (lighter center)
    bg.fillStyle(0x3a2c14, 0.5);
    bg.fillRoundedRect(mapX + 10, mapY + 10, mapW - 20, mapH - 20, 12);

    // Border
    bg.lineStyle(2, 0x8b6914, 0.7);
    bg.strokeRoundedRect(mapX, mapY, mapW, mapH, 16);

    // Inner border
    bg.lineStyle(1, 0x8b6914, 0.3);
    bg.strokeRoundedRect(mapX + 6, mapY + 6, mapW - 12, mapH - 12, 12);

    // Title area
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x1a0f06, 0.8);
    titleBg.fillRoundedRect(width / 2 - 140, mapY + 12, 280, 40, 8);

    this.add.text(width / 2, mapY + 32, 'ACT I — THE SHADOW FALLS', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#c4a062',
      letterSpacing: 3,
    }).setOrigin(0.5, 0.5);
  }

  private buildNodeConfigs(width: number, height: number): LevelNodeConfig[] {
    const mapX = width * 0.08;
    const mapY = height * 0.08;
    const mapW = width * 0.84;
    const mapH = height * 0.84;

    // 5 nodes arranged left-to-right with a slight vertical curve
    const yOffsets = [0, -30, 15, -20, 10];
    const baseY = mapY + mapH / 2 + 10;

    return ACT1_LEVEL_IDS.map((levelId, i) => ({
      levelId,
      x: mapX + (mapW / 5) * i + mapW / 10,
      y: baseY + yOffsets[i]!,
    }));
  }

  private drawConnectingLines(nodes: LevelNodeConfig[]): void {
    const lines = this.add.graphics();
    lines.lineStyle(3, 0x5a4520, 0.6);

    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i]!;
      const to = nodes[i + 1]!;
      lines.beginPath();
      lines.moveTo(from.x, from.y);
      // Bezier curve for organic path feel
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 25;
      lines.moveTo(from.x, from.y);

      // Draw using small steps
      const steps = 20;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const bx = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
        const by = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * midY + t * t * to.y;
        lines.lineTo(bx, by);
      }
      lines.strokePath();
    }
  }

  private createLevelNode(cfg: LevelNodeConfig): void {
    const levelDef = LEVELS[cfg.levelId];
    if (!levelDef) return;

    const container = this.add.container(cfg.x, cfg.y);
    const playerState = usePlayerStore.getState();
    const unlocked = playerState.isLevelUnlocked(cfg.levelId);
    const progress = playerState.progress.get(cfg.levelId);
    const stars = progress?.stars ?? 0;

    // Node circle
    const radius = 28;
    const nodeGfx = this.add.graphics();

    if (unlocked) {
      nodeGfx.fillStyle(0x2a1f0e, 1);
      nodeGfx.lineStyle(2, 0xc4a062, 0.9);
    } else {
      nodeGfx.fillStyle(0x1a1520, 1);
      nodeGfx.lineStyle(2, 0x4a3a5a, 0.5);
    }

    nodeGfx.fillCircle(0, 0, radius);
    nodeGfx.strokeCircle(0, 0, radius);

    // Level number
    const numText = this.add.text(0, unlocked ? -6 : 0, String(levelDef.levelIndex + 1), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: unlocked ? '#c4a062' : '#5a4a6a',
    }).setOrigin(0.5, 0.5);

    container.add([nodeGfx, numText]);

    // Stars row (only show if unlocked)
    if (unlocked && stars > 0) {
      const starText = this.add.text(0, 10, this.buildStarStr(stars), {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10px',
        color: '#ffd700',
      }).setOrigin(0.5, 0.5);
      container.add(starText);
    }

    // Lock icon for locked nodes
    if (!unlocked) {
      const lockText = this.add.text(0, 0, '🔒', {
        fontSize: '16px',
      }).setOrigin(0.5, 0.5);
      container.add(lockText);
    }

    // Level name label below node
    const label = this.add.text(0, radius + 12, levelDef.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: unlocked ? '#c4a062' : '#5a4a6a',
      align: 'center',
      wordWrap: { width: 100 },
    }).setOrigin(0.5, 0);
    container.add(label);

    // Interactive hit area for unlocked nodes — placed at scene level (not in container)
    // because Phaser container children don't translate interactive hit areas correctly
    if (unlocked) {
      const hitZone = this.add.zone(cfg.x, cfg.y, radius * 2, radius * 2)
        .setInteractive(
          new Phaser.Geom.Circle(radius, radius, radius),
          Phaser.Geom.Circle.Contains,
        );
      hitZone.on('pointerdown', () => {
        this.onNodeClick(cfg.levelId);
      });
      hitZone.on('pointerover', () => {
        nodeGfx.clear();
        nodeGfx.fillStyle(0x3a2a10, 1);
        nodeGfx.lineStyle(2, 0xffd700, 1);
        nodeGfx.fillCircle(0, 0, radius);
        nodeGfx.strokeCircle(0, 0, radius);
        this.game.canvas.style.cursor = 'pointer';
      });
      hitZone.on('pointerout', () => {
        nodeGfx.clear();
        nodeGfx.fillStyle(0x2a1f0e, 1);
        nodeGfx.lineStyle(2, 0xc4a062, 0.9);
        nodeGfx.fillCircle(0, 0, radius);
        nodeGfx.strokeCircle(0, 0, radius);
        this.game.canvas.style.cursor = 'default';
      });
    }

    this.levelNodes.set(cfg.levelId, container);
  }

  private buildStarStr(stars: number): string {
    const filled = '★'.repeat(stars);
    const empty = '☆'.repeat(4 - stars);
    return filled + empty;
  }

  private updatePulse(): void {
    // Find the frontier: first unlocked level without a star completion
    const playerState = usePlayerStore.getState();
    let frontier: string | null = null;

    for (const levelId of ACT1_LEVEL_IDS) {
      if (!playerState.isLevelUnlocked(levelId)) break;
      const progress = playerState.progress.get(levelId);
      if (!progress || progress.stars === 0) {
        frontier = levelId;
        break;
      }
    }

    // Default to first level if all complete
    if (!frontier) frontier = ACT1_LEVEL_IDS[ACT1_LEVEL_IDS.length - 1] ?? null;

    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }

    if (frontier) {
      const container = this.levelNodes.get(frontier);
      if (container) {
        this.pulseTween = this.tweens.add({
          targets: container,
          scaleX: 1.12,
          scaleY: 1.12,
          alpha: { from: 1, to: 0.85 },
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  private refreshNodes(): void {
    // Destroy and recreate all nodes to reflect new progress
    for (const container of this.levelNodes.values()) {
      container.destroy();
    }
    this.levelNodes.clear();

    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }

    const { width, height } = this.scale;
    const nodeConfigs = this.buildNodeConfigs(width, height);
    for (const cfg of nodeConfigs) {
      this.createLevelNode(cfg);
    }
    this.updatePulse();
  }

  private onNodeClick(levelId: string): void {
    useGameStore.getState().setSelectedLevel(levelId);
    // Signal to Preact overlay to show LevelDetail
    useUIStore.getState().setActiveTab('none');
    // We use a custom event to open LevelDetail overlay
    window.dispatchEvent(new CustomEvent('hub:openLevelDetail', { detail: { levelId } }));
  }

  /** Called by Preact when "Play" is pressed in LevelDetail overlay. */
  startLevel(_levelId: string): void {
    this.cameras.main.fadeOut(400, 0, 0, 0, (_camera: unknown, progress: number) => {
      if (progress === 1) {
        this.scene.start('GameScene');
      }
    });
  }

  shutdown(): void {
    this.game.canvas.style.cursor = 'default';
    if (this.pulseTween) {
      this.pulseTween.stop();
    }
  }
}
