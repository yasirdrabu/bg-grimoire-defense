import Phaser from 'phaser';
import {
  TILE_W, TILE_H, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS,
  LAYER_GRID_OVERLAY, LAYER_ENTITIES_BASE,
  TOWERS,
} from '@grimoire/shared';
import { gridToScreen, screenToGrid } from '../utils/isoMath';
import { GameWorld } from '../ecs/World';
import { PositionComponent } from '../ecs/components/Position';
import { RenderableComponent } from '../ecs/components/Renderable';
import { AttackComponent } from '../ecs/components/Attack';
import { TowerDataComponent } from '../ecs/components/TowerData';
import { EnemyDataComponent } from '../ecs/components/EnemyData';
import { HealthComponent } from '../ecs/components/Health';
import { MovementComponent } from '../ecs/components/Movement';
import { ProjectileComponent } from '../ecs/components/Projectile';

// Systems
import { inputSystem } from '../ecs/systems/InputSystem';
import { movementSystem } from '../ecs/systems/MovementSystem';
import { targetingSystem } from '../ecs/systems/TargetingSystem';
import { attackSystem } from '../ecs/systems/AttackSystem';
import { projectileSystem } from '../ecs/systems/ProjectileSystem';
import { statusEffectSystem } from '../ecs/systems/StatusEffectSystem';
import { deathSystem } from '../ecs/systems/DeathSystem';
import { nexusSystem } from '../ecs/systems/NexusSystem';

// Factories
import { createTowerEntity } from '../towers/TowerFactory';
import { createEnemyEntity } from '../enemies/EnemyFactory';
import { canPlace, cloneGridWithBlock, createGrid } from '../towers/TowerPlacement';

// Stores
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';

// Pathfinding
import PF from 'pathfinding';

export class GameScene extends Phaser.Scene {
  world!: GameWorld;

  private gridCols = DEFAULT_GRID_COLS;
  private gridRows = DEFAULT_GRID_ROWS;
  private mapOffsetX = 0;
  private mapOffsetY = 0;
  private gridOverlay!: Phaser.GameObjects.Graphics;
  private gridData!: number[][];
  private entityLayer!: Phaser.GameObjects.Layer;

  // Level config
  private spawnPos: [number, number] = [0, 7];
  private nexusPos: [number, number] = [19, 7];

  // Wave state
  private waveActive = false;
  private enemiesToSpawn = 0;
  private spawnTimer = 0;
  private spawnInterval = 500; // ms between spawns
  private currentPath: [number, number][] = [];

  // Ghost preview
  private ghostSprite: Phaser.GameObjects.Sprite | null = null;
  private rangeCircle: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.world = new GameWorld();
    this.gridData = createGrid(this.gridCols, this.gridRows);

    // Center the isometric map
    this.mapOffsetX = this.scale.width / 2;
    this.mapOffsetY = 80;

    // Camera bounds
    const mapWidth = (this.gridCols + this.gridRows) * (TILE_W / 2);
    const mapHeight = (this.gridCols + this.gridRows) * (TILE_H / 2);
    this.cameras.main.setBounds(
      -TILE_W, -TILE_H,
      mapWidth + TILE_W * 2,
      mapHeight + TILE_H * 2,
    );

    // Create entity layer for depth sorting
    this.entityLayer = this.add.layer();
    this.entityLayer.setDepth(LAYER_ENTITIES_BASE);

    // Draw grid
    this.drawGrid();

    // Place nexus and spawn markers
    this.placeMarker('nexus', this.nexusPos[0], this.nexusPos[1]);
    this.placeMarker('spawn', this.spawnPos[0], this.spawnPos[1]);

    // Compute initial path
    this.computePath();

    // Initialize game state
    useGameStore.setState({
      gold: 650,
      nexusHP: 5,
      maxNexusHP: 5,
      wave: 0,
      totalWaves: 5,
      waveState: 'pre',
      nextWaveEnemies: [{ enemyType: 'orc_grunt', count: 10 }],
    });

    // Input: click to place towers
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.handleClick(pointer);
      }
      if (pointer.rightButtonDown()) {
        useUIStore.getState().exitBuildMode();
        this.clearGhost();
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handleHover(pointer);
    });

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-ONE', () => {
      useUIStore.getState().enterBuildMode('elven_archer_spire');
      useGameStore.getState().clearSelectedTower();
    });
    this.input.keyboard?.on('keydown-TWO', () => {
      useUIStore.getState().enterBuildMode('ent_watchtower');
      useGameStore.getState().clearSelectedTower();
    });
    this.input.keyboard?.on('keydown-THREE', () => {
      useUIStore.getState().enterBuildMode('gondorian_ballista');
      useGameStore.getState().clearSelectedTower();
    });
    this.input.keyboard?.on('keydown-FOUR', () => {
      useUIStore.getState().enterBuildMode('istari_crystal');
      useGameStore.getState().clearSelectedTower();
    });
    this.input.keyboard?.on('keydown-FIVE', () => {
      useUIStore.getState().enterBuildMode('dwarven_cannon');
      useGameStore.getState().clearSelectedTower();
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      useUIStore.getState().exitBuildMode();
      this.clearGhost();
    });
    this.input.keyboard?.on('keydown-SPACE', () => this.startWave());

    // Start first wave prompt
    this.add.text(this.scale.width / 2, 20, 'Press SPACE to send wave | Keys 1-5 to build towers | Click to place', {
      fontSize: '14px',
      color: '#cccccc',
    }).setOrigin(0.5, 0).setDepth(1000);
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
    this.gridOverlay.moveTo(x + hw, y);
    this.gridOverlay.lineTo(x + TILE_W, y + hh);
    this.gridOverlay.lineTo(x + hw, y + TILE_H);
    this.gridOverlay.lineTo(x, y + hh);
    this.gridOverlay.closePath();
    this.gridOverlay.fillPath();

    this.gridOverlay.lineStyle(1, stroke, 0.4);
    this.gridOverlay.strokePath();
  }

  private placeMarker(key: string, gridX: number, gridY: number): void {
    const { screenX, screenY } = gridToScreen(gridX, gridY, this.mapOffsetX, this.mapOffsetY);
    const sprite = this.add.sprite(screenX + TILE_W / 2, screenY + TILE_H / 2, key);
    sprite.setDepth(LAYER_GRID_OVERLAY + 1);
  }

  private computePath(): void {
    const grid = new PF.Grid(this.gridData);
    const finder = new PF.AStarFinder({ allowDiagonal: false });
    this.currentPath = finder.findPath(
      this.spawnPos[0], this.spawnPos[1],
      this.nexusPos[0], this.nexusPos[1],
      grid,
    ) as [number, number][];
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    const ui = useUIStore.getState();
    const game = useGameStore.getState();
    const { gridX, gridY } = screenToGrid(
      pointer.worldX, pointer.worldY,
      0, 0,
      this.mapOffsetX, this.mapOffsetY,
    );

    if (ui.inputMode === 'build' && ui.buildTowerType) {
      // === BUILD MODE ===
      if (!canPlace(this.gridData, gridX, gridY)) return;
      if (gridX === this.spawnPos[0] && gridY === this.spawnPos[1]) return;
      if (gridX === this.nexusPos[0] && gridY === this.nexusPos[1]) return;

      const towerDef = TOWERS[ui.buildTowerType];
      if (!towerDef || game.gold < towerDef.cost) return;

      const testGrid = cloneGridWithBlock(this.gridData, gridX, gridY);
      const testPfGrid = new PF.Grid(testGrid);
      const testFinder = new PF.AStarFinder({ allowDiagonal: false });
      const testPath = testFinder.findPath(
        this.spawnPos[0], this.spawnPos[1],
        this.nexusPos[0], this.nexusPos[1],
        testPfGrid,
      );
      if (testPath.length === 0) return;

      this.gridData[gridY]![gridX] = 1;
      const towerId = createTowerEntity(this.world, ui.buildTowerType, gridX, gridY);

      const { screenX, screenY } = gridToScreen(gridX, gridY, this.mapOffsetX, this.mapOffsetY);
      const sprite = this.add.sprite(screenX + TILE_W / 2, screenY + TILE_H / 2, ui.buildTowerType);
      sprite.setDepth(LAYER_ENTITIES_BASE + screenY);
      this.entityLayer.add(sprite);

      const renderable = this.world.getComponent(towerId, RenderableComponent)!;
      renderable.sprite = sprite;

      useGameStore.setState({ gold: game.gold - towerDef.cost });
      this.computePath();
      this.clearGhost();
    } else if (ui.inputMode === 'idle' || ui.inputMode === 'selected') {
      // === TOWER SELECTION MODE ===
      const towers = this.world.query(TowerDataComponent, PositionComponent);
      for (const id of towers) {
        const pos = this.world.getComponent(id, PositionComponent)!;
        if (pos.gridX === gridX && pos.gridY === gridY) {
          const towerData = this.world.getComponent(id, TowerDataComponent)!;
          const attack = this.world.getComponent(id, AttackComponent)!;
          const towerDef = TOWERS[towerData.towerId];
          useGameStore.getState().projectSelectedTower({
            id: String(id),
            name: towerDef?.name ?? towerData.towerId,
            tier: towerData.tier,
            damage: attack.damage,
            attackSpeed: attack.attackSpeed,
            range: attack.range,
            special: towerDef?.special ?? null,
            upgradeCostA: towerDef?.upgradeCostTier2 ?? null,
            upgradeCostB: null,
            sellRefund: Math.floor((towerDef?.cost ?? 0) * 0.5),
          });
          useUIStore.getState().selectTower(String(id));
          return;
        }
      }
      // No tower found — deselect
      useUIStore.getState().deselectTower();
      useGameStore.getState().clearSelectedTower();
    }
  }

  private handleHover(pointer: Phaser.Input.Pointer): void {
    const ui = useUIStore.getState();
    if (ui.inputMode !== 'build' || !ui.buildTowerType) {
      this.clearGhost();
      return;
    }

    const { gridX, gridY } = screenToGrid(
      pointer.worldX, pointer.worldY,
      0, 0,
      this.mapOffsetX, this.mapOffsetY,
    );

    if (gridX < 0 || gridX >= this.gridCols || gridY < 0 || gridY >= this.gridRows) {
      this.clearGhost();
      return;
    }

    const { screenX, screenY } = gridToScreen(gridX, gridY, this.mapOffsetX, this.mapOffsetY);
    const valid = canPlace(this.gridData, gridX, gridY);

    // Update or create ghost sprite
    if (!this.ghostSprite) {
      this.ghostSprite = this.add.sprite(0, 0, ui.buildTowerType);
      this.ghostSprite.setAlpha(0.5);
      this.ghostSprite.setDepth(900);
    }
    this.ghostSprite.setPosition(screenX + TILE_W / 2, screenY + TILE_H / 2);
    this.ghostSprite.setTexture(ui.buildTowerType);
    this.ghostSprite.setTint(valid ? 0x44FF44 : 0xFF4444);

    // Range circle
    if (!this.rangeCircle) {
      this.rangeCircle = this.add.graphics();
      this.rangeCircle.setDepth(899);
    }
    this.rangeCircle.clear();
    const towerDef = TOWERS[ui.buildTowerType];
    if (towerDef) {
      const rangePx = towerDef.range * TILE_W / 2;
      this.rangeCircle.lineStyle(1, valid ? 0x44FF44 : 0xFF4444, 0.3);
      this.rangeCircle.fillStyle(valid ? 0x44FF44 : 0xFF4444, 0.1);
      this.rangeCircle.fillCircle(screenX + TILE_W / 2, screenY + TILE_H / 2, rangePx);
      this.rangeCircle.strokeCircle(screenX + TILE_W / 2, screenY + TILE_H / 2, rangePx);
    }
  }

  private clearGhost(): void {
    if (this.ghostSprite) {
      this.ghostSprite.destroy();
      this.ghostSprite = null;
    }
    if (this.rangeCircle) {
      this.rangeCircle.clear();
    }
  }

  private startWave(): void {
    if (this.waveActive) return;

    const state = useGameStore.getState();
    if (state.wave >= state.totalWaves) return;

    this.waveActive = true;
    this.enemiesToSpawn = 10 + state.wave * 2; // escalating count
    this.spawnTimer = 0;
    useGameStore.setState({ wave: state.wave + 1, waveState: 'spawning' });
  }

  update(_time: number, delta: number): void {
    const state = useGameStore.getState();
    if (state.isGameOver || state.isPaused) return;

    // Handle send wave early flag
    if (state.sendWaveEarlyFlag) {
      useGameStore.setState({ sendWaveEarlyFlag: false });
      this.startWave();
    }

    const dt = delta * state.gameSpeed;

    // Spawn enemies
    if (this.waveActive && this.enemiesToSpawn > 0) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer -= this.spawnInterval;
        this.spawnEnemy();
        this.enemiesToSpawn--;
        if (this.enemiesToSpawn <= 0) {
          this.waveActive = false;
        }
      }
    }

    // Run ECS systems in spec order
    inputSystem(this.world, dt);
    // waveSystem — handled above for now
    movementSystem(this.world, dt);
    targetingSystem(this.world, dt);
    attackSystem(this.world, dt);
    projectileSystem(this.world, dt);
    statusEffectSystem(this.world, dt);
    deathSystem(this.world, dt);
    nexusSystem(this.world, dt, this.nexusPos[0], this.nexusPos[1]);
    // scoreSystem — Phase 2

    // Check wave state transitions
    const currentWaveState = useGameStore.getState().waveState;
    if (currentWaveState === 'spawning' || currentWaveState === 'active') {
      const livingEnemies = this.world.query(EnemyDataComponent, HealthComponent);
      const anyAlive = livingEnemies.some((id) => {
        const health = this.world.getComponent(id, HealthComponent)!;
        return health.current > 0;
      });

      if (!anyAlive && !this.waveActive) {
        // All enemies dead and spawning complete
        useGameStore.setState({ waveState: 'clear' });
        // Project next wave enemies
        if (state.wave < state.totalWaves) {
          const count = 10 + state.wave * 2;
          useGameStore.setState({
            nextWaveEnemies: [{ enemyType: 'orc_grunt', count }],
          });
        } else {
          useGameStore.setState({ nextWaveEnemies: [] });
        }
      } else if (!this.waveActive && currentWaveState === 'spawning') {
        // Spawning finished but enemies still alive
        useGameStore.setState({ waveState: 'active' });
      }
    }

    this.renderEntities();
  }

  private spawnEnemy(): void {
    if (this.currentPath.length === 0) return;

    const enemyId = createEnemyEntity(
      this.world,
      'orc_grunt',
      this.spawnPos[0],
      this.spawnPos[1],
      [...this.currentPath],
      1, 0, // Act 1, Level 0
    );

    // Create enemy sprite
    const { screenX, screenY } = gridToScreen(
      this.spawnPos[0], this.spawnPos[1],
      this.mapOffsetX, this.mapOffsetY,
    );
    const sprite = this.add.sprite(screenX + TILE_W / 2, screenY + TILE_H / 2, 'orc_grunt');
    sprite.setDepth(LAYER_ENTITIES_BASE + screenY);
    this.entityLayer.add(sprite);

    const renderable = this.world.getComponent(enemyId, RenderableComponent)!;
    renderable.sprite = sprite;
  }

  private renderEntities(): void {
    // Update all entity sprites from ECS Position
    const renderables = this.world.query(PositionComponent, RenderableComponent);

    for (const id of renderables) {
      const pos = this.world.getComponent(id, PositionComponent)!;
      const renderable = this.world.getComponent(id, RenderableComponent)!;

      if (!renderable.sprite) continue;

      const { screenX, screenY } = gridToScreen(pos.gridX, pos.gridY, this.mapOffsetX, this.mapOffsetY);
      const sprite = renderable.sprite as Phaser.GameObjects.Sprite;
      sprite.x = screenX + TILE_W / 2;
      sprite.y = screenY + TILE_H / 2;
      sprite.setDepth(LAYER_ENTITIES_BASE + screenY);

      // Check if flying
      const enemyData = this.world.getComponent(id, EnemyDataComponent);
      if (enemyData?.isFlying) {
        sprite.setDepth(LAYER_ENTITIES_BASE + screenY + 10000);
      }
    }

    // Clean up sprites for destroyed entities
    for (const id of renderables) {
      const health = this.world.getComponent(id, HealthComponent);
      if (health && health.current <= 0) {
        const renderable = this.world.getComponent(id, RenderableComponent)!;
        if (renderable.sprite) {
          (renderable.sprite as Phaser.GameObjects.Sprite).destroy();
        }
      }
    }

    // Sort entity layer by depth
    this.entityLayer.sort('depth');
  }
}
