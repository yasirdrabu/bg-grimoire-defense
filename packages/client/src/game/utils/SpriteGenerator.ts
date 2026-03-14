import Phaser from 'phaser';
import { TOWER_COLORS, ENEMY_COLORS, PROJECTILE_COLORS, TILE_COLORS } from './colors';

type TowerShape = 'spire' | 'platform' | 'barrel' | 'crystal' | 'tree';

function generateIsometricTile(
  scene: Phaser.Scene,
  key: string,
  fillColor: number,
  strokeColor?: number,
): void {
  const g = scene.add.graphics();
  const hw = 64; // TILE_W / 2
  const hh = 32; // TILE_H / 2

  g.fillStyle(fillColor, 1);
  g.beginPath();
  g.moveTo(hw, 0);
  g.lineTo(hw * 2, hh);
  g.lineTo(hw, hh * 2);
  g.lineTo(0, hh);
  g.closePath();
  g.fillPath();

  if (strokeColor !== undefined) {
    g.lineStyle(1, strokeColor, 0.5);
    g.beginPath();
    g.moveTo(hw, 0);
    g.lineTo(hw * 2, hh);
    g.lineTo(hw, hh * 2);
    g.lineTo(0, hh);
    g.closePath();
    g.strokePath();
  }

  g.generateTexture(key, 128, 64);
  g.destroy();
}

function generateTowerSprite(
  scene: Phaser.Scene,
  key: string,
  color: number,
  shape: TowerShape,
): void {
  const g = scene.add.graphics();
  const w = 48;
  const h = 64;

  // Isometric base diamond
  g.fillStyle(0x555555);
  const basePoints = [
    new Phaser.Geom.Point(w / 2, h - 8),
    new Phaser.Geom.Point(w, h - 16),
    new Phaser.Geom.Point(w / 2, h - 24),
    new Phaser.Geom.Point(0, h - 16),
  ];
  g.fillPoints(basePoints, true);

  // Tower body
  g.fillStyle(color);
  switch (shape) {
    case 'spire':
      g.fillRect(w / 2 - 5, 8, 10, h - 32);
      g.fillTriangle(w / 2 - 8, 8, w / 2, 0, w / 2 + 8, 8);
      break;
    case 'platform':
      g.fillRect(4, h / 2 - 8, w - 8, 12);
      g.fillRect(w / 2 - 3, h / 2 - 20, 6, 12);
      break;
    case 'barrel':
      g.fillRect(w / 2 - 10, h / 2 - 6, 20, 16);
      g.fillCircle(w / 2, h / 2 - 10, 8);
      break;
    case 'crystal':
      const crystalPoints = [
        new Phaser.Geom.Point(w / 2, 4),
        new Phaser.Geom.Point(w / 2 + 10, h / 2),
        new Phaser.Geom.Point(w / 2, h - 28),
        new Phaser.Geom.Point(w / 2 - 10, h / 2),
      ];
      g.fillPoints(crystalPoints, true);
      break;
    case 'tree':
      g.fillRect(w / 2 - 4, h / 2 - 4, 8, 20);
      g.fillCircle(w / 2, h / 2 - 10, 14);
      break;
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function generateEnemySprite(
  scene: Phaser.Scene,
  key: string,
  color: number,
  radius: number,
): void {
  const g = scene.add.graphics();
  const size = radius * 2 + 4;
  const cx = size / 2;
  const cy = size / 2;

  // Body
  g.fillStyle(color);
  g.fillCircle(cx, cy, radius);

  // Direction indicator (forward-facing notch)
  g.fillStyle(0xFFFFFF, 0.6);
  g.fillTriangle(
    cx, cy - radius + 2,
    cx - 3, cy - radius + 8,
    cx + 3, cy - radius + 8,
  );

  g.generateTexture(key, size, size);
  g.destroy();
}

function generateProjectile(
  scene: Phaser.Scene,
  key: string,
  color: number,
  radius: number,
): void {
  const g = scene.add.graphics();
  g.fillStyle(color);
  g.fillCircle(radius, radius, radius);
  g.generateTexture(key, radius * 2, radius * 2);
  g.destroy();
}

function generateNexusSprite(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const s = 48;

  // Glowing diamond
  g.fillStyle(0xFFDD44);
  const points = [
    new Phaser.Geom.Point(s / 2, 0),
    new Phaser.Geom.Point(s, s / 2),
    new Phaser.Geom.Point(s / 2, s),
    new Phaser.Geom.Point(0, s / 2),
  ];
  g.fillPoints(points, true);

  // Inner glow
  g.fillStyle(0xFFFFFF, 0.5);
  g.fillCircle(s / 2, s / 2, 8);

  g.generateTexture('nexus', s, s);
  g.destroy();
}

function generateSpawnSprite(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const s = 48;

  g.fillStyle(0xCC4444);
  const points = [
    new Phaser.Geom.Point(s / 2, 0),
    new Phaser.Geom.Point(s, s / 2),
    new Phaser.Geom.Point(s / 2, s),
    new Phaser.Geom.Point(0, s / 2),
  ];
  g.fillPoints(points, true);

  // Arrow indicator
  g.fillStyle(0xFFFFFF, 0.6);
  g.fillTriangle(s / 2 - 6, s / 2, s / 2 + 6, s / 2, s / 2, s / 2 - 8);

  g.generateTexture('spawn', s, s);
  g.destroy();
}

/** Generate all placeholder sprites at boot time */
export function generateAllSprites(scene: Phaser.Scene): void {
  // Tiles
  generateIsometricTile(scene, 'tile_grass', TILE_COLORS.grass, 0x446622);
  generateIsometricTile(scene, 'tile_stone', TILE_COLORS.stone, 0x666666);
  generateIsometricTile(scene, 'tile_water', TILE_COLORS.water, 0x223366);
  generateIsometricTile(scene, 'tile_blocked', TILE_COLORS.blocked);
  generateIsometricTile(scene, 'tile_hover_valid', TILE_COLORS.buildable_hover);
  generateIsometricTile(scene, 'tile_hover_invalid', TILE_COLORS.invalid_hover);

  // Towers (each role has a distinct silhouette)
  generateTowerSprite(scene, 'elven_archer_spire', TOWER_COLORS.elven_archer_spire, 'spire');
  generateTowerSprite(scene, 'gondorian_ballista', TOWER_COLORS.gondorian_ballista, 'platform');
  generateTowerSprite(scene, 'dwarven_cannon', TOWER_COLORS.dwarven_cannon, 'barrel');
  generateTowerSprite(scene, 'istari_crystal', TOWER_COLORS.istari_crystal, 'crystal');
  generateTowerSprite(scene, 'ent_watchtower', TOWER_COLORS.ent_watchtower, 'tree');

  // Enemies (size = threat level)
  generateEnemySprite(scene, 'orc_grunt', ENEMY_COLORS.orc_grunt, 10);
  generateEnemySprite(scene, 'goblin_runner', ENEMY_COLORS.goblin_runner, 7);
  generateEnemySprite(scene, 'uruk_hai_berserker', ENEMY_COLORS.uruk_hai_berserker, 13);
  generateEnemySprite(scene, 'cave_troll', ENEMY_COLORS.cave_troll, 18);
  generateEnemySprite(scene, 'nazgul_shade', ENEMY_COLORS.nazgul_shade, 11);

  // Projectiles
  generateProjectile(scene, 'proj_arrow', PROJECTILE_COLORS.arrow, 3);
  generateProjectile(scene, 'proj_fireball', PROJECTILE_COLORS.fireball, 5);
  generateProjectile(scene, 'proj_cannonball', PROJECTILE_COLORS.cannonball, 4);
  generateProjectile(scene, 'proj_spell_bolt', PROJECTILE_COLORS.spell_bolt, 4);
  generateProjectile(scene, 'proj_root_thorn', PROJECTILE_COLORS.root_thorn, 3);

  // Special tiles
  generateNexusSprite(scene);
  generateSpawnSprite(scene);
}
