import Phaser from 'phaser';
import {
  TILE_W, TILE_H, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS,
  LAYER_GRID_OVERLAY, LAYER_ENTITIES_BASE,
  TOWERS, TOWER_UPGRADES, LEVELS, getSellRefund, calculateInterest, getWaveClearBonus,
} from '@grimoire/shared';
import { gridToScreen, screenToGrid } from '../utils/isoMath';
import { GameWorld } from '../ecs/World';
import { PositionComponent } from '../ecs/components/Position';
import { RenderableComponent } from '../ecs/components/Renderable';
import { AttackComponent } from '../ecs/components/Attack';
import { TowerDataComponent } from '../ecs/components/TowerData';
import { EnemyDataComponent } from '../ecs/components/EnemyData';
import { HealthComponent } from '../ecs/components/Health';

// Systems
import { inputSystem } from '../ecs/systems/InputSystem';
import { enemyAISystem } from '../enemies/EnemyAI';
import { bossAISystem } from '../enemies/BossAI';
import { tickFireCells, damageFireTowers } from '../ecs/systems/FireCellSystem';
import { movementSystem } from '../ecs/systems/MovementSystem';
import { targetingSystem } from '../ecs/systems/TargetingSystem';
import { attackSystem } from '../ecs/systems/AttackSystem';
import { projectileSystem } from '../ecs/systems/ProjectileSystem';
import { statusEffectSystem } from '../ecs/systems/StatusEffectSystem';
import { deathSystem } from '../ecs/systems/DeathSystem';
import { nexusSystem } from '../ecs/systems/NexusSystem';
import { scoreSystem } from '../ecs/systems/ScoreSystem';
import { WaveSystem } from '../ecs/systems/WaveSystem';

// Factories
import { createTowerEntity } from '../towers/TowerFactory';
import { createEnemyEntity } from '../enemies/EnemyFactory';
import { canPlace, cloneGridWithBlock, createGrid } from '../towers/TowerPlacement';

// Stores
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePlayerStore } from '../../stores/usePlayerStore';

// API
import { api } from '../../api/client';
import { OfflineQueue } from '../../api/offlineQueue';

// Tutorial
import { TutorialManager } from '../tutorial/TutorialManager';
import { findFusionRecipe } from '../towers/FusionEngine';

// Pathfinding
import PF from 'pathfinding';
import { emitSceneChange } from '../utils/sceneEvents';

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

  // Wave management
  private waveSystem!: WaveSystem;
  private currentPath: [number, number][] = [];

  // Tutorial
  private tutorialManager: TutorialManager | null = null;

  // Ghost preview
  private ghostSprite: Phaser.GameObjects.Sprite | null = null;
  private rangeCircle: Phaser.GameObjects.Graphics | null = null;

  // Session tracking for server score submission
  private sessionId: string | null = null;
  private sessionStartedAt = 0;
  private sessionTowersBuilt = 0;
  private sessionTowersFused = 0;
  private sessionEnemiesKilled = 0;
  private sessionGoldEarned = 0;
  private sessionEssenceEarned = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    emitSceneChange('GameScene');
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

    // Initialize game state — read selected level from store
    const selectedLevelId = useGameStore.getState().selectedLevelId;
    const levelDef = LEVELS[selectedLevelId] ?? LEVELS['act1_level1']!;
    this.waveSystem = new WaveSystem(levelDef);

    // Wire tutorial for all tutorial levels
    const tutorialLevels = ['act1_level1', 'act1_level2', 'act1_level3'];
    if (tutorialLevels.includes(levelDef.id)) {
      this.tutorialManager = new TutorialManager(levelDef.id);
    }
    const firstWave = levelDef.waves[0];
    useGameStore.setState({
      gold: levelDef.startingGold,
      nexusHP: levelDef.maxNexusHP,
      maxNexusHP: levelDef.maxNexusHP,
      wave: 0,
      totalWaves: levelDef.waves.length,
      waveState: 'pre_wave',
      nextWaveEnemies: firstWave
        ? firstWave.enemies.map(g => ({ enemyType: g.type, count: g.count }))
        : [],
    });

    // Reset per-session stats
    this.sessionId = null;
    this.sessionStartedAt = Date.now();
    this.sessionTowersBuilt = 0;
    this.sessionTowersFused = 0;
    this.sessionEnemiesKilled = 0;
    this.sessionGoldEarned = 0;
    this.sessionEssenceEarned = 0;

    // Start server-side session if logged in
    const playerState = usePlayerStore.getState();
    if (playerState.isLoggedIn) {
      api
        .startSession(levelDef.id, useGameStore.getState().selectedDifficulty)
        .then((res) => { this.sessionId = res.session_id; })
        .catch(() => { /* Session start failed — submission will be skipped */ });
    }

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
    this.input.keyboard?.on('keydown-SPACE', () => {
      useGameStore.setState({ sendWaveEarlyFlag: true });
    });
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
          const upgradeData = TOWER_UPGRADES[towerData.towerId];
          const isTier1 = towerData.tier === 1;
          const isTier2 = towerData.tier === 2;
          useGameStore.getState().projectSelectedTower({
            id: String(id),
            name: towerDef?.name ?? towerData.towerId,
            tier: towerData.tier,
            damage: attack.damage,
            attackSpeed: attack.attackSpeed,
            range: attack.range,
            special: towerDef?.special ?? null,
            upgradeCostA: isTier1
              ? (towerDef?.upgradeCostTier2 ?? null)
              : isTier2
                ? (towerDef?.upgradeCostTier3 ?? null)
                : null,
            upgradeCostAEssence: isTier2 ? (towerDef?.essenceCostTier3 ?? null) : null,
            upgradeCostB: isTier2 ? (towerDef?.upgradeCostTier3 ?? null) : null,
            upgradeCostBEssence: isTier2 ? (towerDef?.essenceCostTier3 ?? null) : null,
            upgradeNameA: isTier2 ? (upgradeData?.tier3A.name ?? null) : null,
            upgradeNameB: isTier2 ? (upgradeData?.tier3B.name ?? null) : null,
            upgradeDescA: isTier2 ? (upgradeData?.tier3A.specialAbility ?? null) : null,
            upgradeDescB: isTier2 ? (upgradeData?.tier3B.specialAbility ?? null) : null,
            sellRefund: getSellRefund(towerDef?.cost ?? 0, towerData.totalInvestment - (towerDef?.cost ?? 0)),
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

  update(_time: number, delta: number): void {
    const state = useGameStore.getState();

    if (state.isGameOver) return;

    // When paused: only run InputSystem for pause-safe actions (build, upgrade, sell, fuse, toggle_pause)
    if (state.isPaused) {
      inputSystem(this.world, 0);
      return;
    }

    const dt = delta * state.gameSpeed;

    // Handle send wave early flag
    if (state.sendWaveEarlyFlag) {
      useGameStore.setState({ sendWaveEarlyFlag: false });
      this.waveSystem.sendWaveEarly();
    }

    // Count alive enemies for WaveSystem
    const aliveEnemies = this.world.query(EnemyDataComponent, HealthComponent)
      .filter(id => (this.world.getComponent(id, HealthComponent)?.current ?? 0) > 0);

    // Tick wave system
    const waveEvents = this.waveSystem.tick(dt, aliveEnemies.length);

    // Process wave events
    for (const event of waveEvents) {
      switch (event.type) {
        case 'SPAWN_ENEMY':
          this.spawnEnemy(event.enemyType);
          break;
        case 'WAVE_STARTED':
          useGameStore.setState({ wave: event.waveIndex + 1, waveState: 'spawning' });
          break;
        case 'WAVE_CLEARED': {
          const currentGold = useGameStore.getState().gold;
          const waveClearBonus = getWaveClearBonus(event.waveIndex);
          useGameStore.setState({
            waveState: 'wave_clear',
            gold: currentGold + waveClearBonus,
          });
          break;
        }
        case 'APPLY_INTEREST': {
          const currentGold = useGameStore.getState().gold;
          const interest = calculateInterest(currentGold);
          useGameStore.setState({ gold: currentGold + interest });
          break;
        }
        case 'LEVEL_COMPLETE': {
          useGameStore.setState({ waveState: 'level_complete' });
          this.handleLevelComplete();
          break;
        }
      }
    }

    // Project wave state and countdown from WaveSystem
    const ws = this.waveSystem.getState();
    const countdownRemaining = this.waveSystem.getRemainingCountdownMs();
    const currentStoreState = useGameStore.getState();
    if (ws !== currentStoreState.waveState || countdownRemaining !== currentStoreState.countdownRemainingMs) {
      useGameStore.setState({ waveState: ws, countdownRemainingMs: countdownRemaining });
    }

    // Project next wave enemies for WavePreview UI
    const selectedLevelId = useGameStore.getState().selectedLevelId;
    const levelDef = LEVELS[selectedLevelId] ?? LEVELS['act1_level1']!;
    const nextWaveIdx = this.waveSystem.getCurrentWaveIndex();
    const nextWave = levelDef.waves[nextWaveIdx];
    if (nextWave) {
      useGameStore.setState({
        nextWaveEnemies: nextWave.enemies.map(g => ({ enemyType: g.type, count: g.count })),
      });
    } else {
      useGameStore.setState({ nextWaveEnemies: [] });
    }

    // Run ECS systems in spec order (§4 Game Loop)
    inputSystem(this.world, dt);
    // WaveSystem ticked above (event-based, not an ECS system function)
    enemyAISystem(this.world, dt);
    bossAISystem(this.world, dt);
    tickFireCells(dt);
    damageFireTowers(this.world, dt);
    movementSystem(this.world, dt);
    targetingSystem(this.world, dt);
    attackSystem(this.world, dt);
    projectileSystem(this.world, dt);
    statusEffectSystem(this.world, dt);
    deathSystem(this.world, dt);
    nexusSystem(this.world, dt, this.nexusPos[0], this.nexusPos[1]);
    scoreSystem(this.world, dt);

    // Tick tutorial
    if (this.tutorialManager?.isActive()) {
      const towerIds = this.world.query(TowerDataComponent, PositionComponent);
      const towerCount = towerIds.length;

      // Detect whether any two adjacent towers can be fused (for L3 tutorial)
      let hasFusionTower = false;
      if (towerCount >= 2) {
        const posMap = new Map<string, string>();
        for (const id of towerIds) {
          const pos = this.world.getComponent(id, PositionComponent);
          const data = this.world.getComponent(id, TowerDataComponent);
          if (pos && data) {
            posMap.set(`${pos.gridX},${pos.gridY}`, data.towerId);
          }
        }
        outer: for (const id of towerIds) {
          const pos = this.world.getComponent(id, PositionComponent);
          const data = this.world.getComponent(id, TowerDataComponent);
          if (!pos || !data) continue;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
            const neighbourType = posMap.get(`${pos.gridX + dx},${pos.gridY + dy}`);
            if (neighbourType && findFusionRecipe(data.towerId, neighbourType)) {
              hasFusionTower = true;
              break outer;
            }
          }
        }
      }

      this.tutorialManager.tick(
        {
          towerCount,
          waveStarted: this.waveSystem.getState() !== 'pre_wave',
          goldAmount: state.gold,
          currentWave: this.waveSystem.getCurrentWaveIndex(),
          hasFusionTower,
        },
        dt,
      );
    }

    this.renderEntities();
  }

  private handleLevelComplete(): void {
    const state = useGameStore.getState();
    const selectedLevelId = state.selectedLevelId;
    const levelDef = LEVELS[selectedLevelId] ?? LEVELS['act1_level1']!;

    const baseScore = state.score;
    const comboScore = 0;
    const speedBonus = 0;
    const stylePoints = 0;
    const perfectWaveBonus = 0;
    const nexusHealthBonus = Math.floor((state.nexusHP / state.maxNexusHP) * 500);
    const totalScore = baseScore + comboScore + speedBonus + stylePoints + perfectWaveBonus + nexusHealthBonus;

    let stars = 0;
    if (state.nexusHP > 0) {
      stars = 1;
      if (totalScore >= 1000) stars = 2;
      if (totalScore >= 3000) stars = 3;
      if (totalScore >= 5000) stars = 4;
    }

    useGameStore.getState().setScoreBreakdown({
      baseScore,
      comboScore,
      speedBonus,
      stylePoints,
      perfectWaveBonus,
      nexusHealthBonus,
      totalScore,
      stars,
      levelId: levelDef.id,
      levelName: levelDef.name,
    });

    // Update player progress
    const playerState = usePlayerStore.getState();
    const existingProgress = playerState.progress.get(levelDef.id);
    usePlayerStore.getState().updateProgress(levelDef.id, {
      levelId: levelDef.id,
      difficulty: state.selectedDifficulty,
      bestScore: Math.max(totalScore, existingProgress?.bestScore ?? 0),
      stars: Math.max(stars, existingProgress?.stars ?? 0),
      bestCombo: Math.max(state.comboCount, existingProgress?.bestCombo ?? 0),
      timesCompleted: (existingProgress?.timesCompleted ?? 0) + 1,
    });

    // Submit score to server (fire-and-forget; queue offline if network fails)
    this.submitScore(state, totalScore, baseScore, comboScore, speedBonus, stylePoints, perfectWaveBonus, nexusHealthBonus);

    this.cameras.main.fadeOut(500, 0, 0, 0, (_camera: unknown, progress: number) => {
      if (progress === 1) {
        this.scene.start('ScoreBreakdownScene');
      }
    });
  }

  private submitScore(
    state: ReturnType<typeof useGameStore.getState>,
    _totalScore: number,
    baseScore: number,
    comboScore: number,
    speedBonus: number,
    stylePoints: number,
    perfectWaveBonus: number,
    nexusHealthBonus: number,
  ): void {
    if (!usePlayerStore.getState().isLoggedIn) return;
    if (!this.sessionId) return;

    const sessionId = this.sessionId;
    const durationMs = Date.now() - this.sessionStartedAt;

    const scoreBreakdown = {
      base_score: baseScore,
      combo_score: comboScore,
      speed_score: speedBonus,
      style_score: stylePoints,
      perfect_wave_bonus: perfectWaveBonus,
      nexus_health_bonus: nexusHealthBonus,
    };

    const stats = {
      waves_completed: state.wave,
      total_waves: state.totalWaves,
      towers_built: this.sessionTowersBuilt,
      towers_fused: this.sessionTowersFused,
      enemies_killed: this.sessionEnemiesKilled,
      gold_earned: this.sessionGoldEarned,
      essence_earned: this.sessionEssenceEarned,
      max_combo: state.comboCount,
      nexus_hp_remaining: state.nexusHP,
      duration_ms: durationMs,
    };

    api.endSession(sessionId, scoreBreakdown, stats).catch(() => {
      // Network failure — queue for later retry
      OfflineQueue.enqueue({ sessionId, scoreBreakdown, stats });
    });
  }

  private spawnEnemy(enemyType: string): void {
    if (this.currentPath.length === 0) return;

    const enemyId = createEnemyEntity(
      this.world,
      enemyType,
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
    const sprite = this.add.sprite(screenX + TILE_W / 2, screenY + TILE_H / 2, enemyType);
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
