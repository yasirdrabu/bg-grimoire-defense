import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';

// ---------------------------------------------------------------------------
// Boss intro data
// ---------------------------------------------------------------------------

interface BossIntroData {
  title: string;
  subtitle: string;
  /** Primary thematic colour (0xRRGGBB). */
  color: number;
}

const BOSS_INTROS: Record<string, BossIntroData> = {
  balrog: {
    title: 'THE BALROG',
    subtitle: 'Flame of Udûn',
    color: 0xff4400,
  },
  basilisk: {
    title: 'THE BASILISK',
    subtitle: 'King of Serpents',
    color: 0x44ff44,
  },
  voldemort: {
    title: 'LORD VOLDEMORT',
    subtitle: 'The Dark Lord',
    color: 0x8844ff,
  },
  white_walker_general: {
    title: 'WHITE WALKER GENERAL',
    subtitle: 'Herald of Winter',
    color: 0x44ddff,
  },
  night_king: {
    title: 'THE NIGHT KING',
    subtitle: 'Lord of the Dead',
    color: 0x0088ff,
  },
};

/** Fallback intro used when a boss ID is not found in the lookup. */
const FALLBACK_INTRO: BossIntroData = {
  title: 'BOSS INCOMING',
  subtitle: 'Prepare yourself',
  color: 0xcc4400,
};

// ---------------------------------------------------------------------------
// Scene init data shape
// ---------------------------------------------------------------------------

interface BossIntroInitData {
  bossId: string;
  levelName: string;
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

const DISPLAY_DURATION_MS = 4000;
const TITLE_IN_DURATION_MS = 500;
const SUBTITLE_IN_DURATION_MS = 350;

export class BossIntroScene extends Phaser.Scene {
  private bossId = '';
  private levelName = '';

  constructor() {
    super({ key: 'BossIntroScene' });
  }

  init(data: BossIntroInitData): void {
    this.bossId = data.bossId ?? '';
    this.levelName = data.levelName ?? '';
  }

  create(): void {
    const { width, height } = this.scale;
    const intro = BOSS_INTROS[this.bossId] ?? FALLBACK_INTRO;

    // -------------------------------------------------------------------------
    // 1. Dark full-screen background
    // -------------------------------------------------------------------------
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, width, height);

    // -------------------------------------------------------------------------
    // 2. Thematic vignette (radial gradient approximated by a coloured oval)
    // -------------------------------------------------------------------------
    const vignette = this.add.graphics();
    // Outer ring — dark
    vignette.fillStyle(0x000000, 0.85);
    vignette.fillRect(0, 0, width, height);

    // Central glow using layered semi-transparent ellipses
    const glowSteps = 8;
    for (let i = glowSteps; i >= 1; i--) {
      const factor = i / glowSteps;
      const alpha = (1 - factor) * 0.18; // inner brightest
      const rW = width * 0.25 * factor;
      const rH = height * 0.35 * factor;
      vignette.fillStyle(intro.color, alpha);
      vignette.fillEllipse(width / 2, height / 2, rW * 2, rH * 2);
    }

    // -------------------------------------------------------------------------
    // 3. Level name (small, above title)
    // -------------------------------------------------------------------------
    this.add.text(width / 2, height * 0.32, this.levelName.toUpperCase(), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#888888',
      letterSpacing: 4,
    }).setOrigin(0.5, 0.5).setAlpha(0.6);

    // -------------------------------------------------------------------------
    // 4. Boss title (large dramatic text, scales in)
    // -------------------------------------------------------------------------
    const titleText = this.add.text(width / 2, height / 2, intro.title, {
      fontFamily: 'system-ui, serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: `#${intro.color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 6,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: `#${intro.color.toString(16).padStart(6, '0')}`,
        blur: 24,
        fill: true,
      },
    }).setOrigin(0.5, 0.5).setScale(0.1).setAlpha(0);

    // -------------------------------------------------------------------------
    // 5. Boss subtitle (italic, fades in after title)
    // -------------------------------------------------------------------------
    const subtitleText = this.add.text(width / 2, height * 0.61, intro.subtitle, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      fontStyle: 'italic',
      color: '#cccccc',
      letterSpacing: 2,
    }).setOrigin(0.5, 0.5).setAlpha(0);

    // -------------------------------------------------------------------------
    // 6. Horizontal decorative lines flanking the subtitle
    // -------------------------------------------------------------------------
    const lineY = height * 0.68;
    const lineLen = 80;
    const lineGfx = this.add.graphics().setAlpha(0);
    lineGfx.lineStyle(1, intro.color, 0.5);
    lineGfx.beginPath();
    lineGfx.moveTo(width / 2 - lineLen - 12, lineY);
    lineGfx.lineTo(width / 2 - 12, lineY);
    lineGfx.moveTo(width / 2 + 12, lineY);
    lineGfx.lineTo(width / 2 + lineLen + 12, lineY);
    lineGfx.strokePath();

    // -------------------------------------------------------------------------
    // 7. Animation sequence
    // -------------------------------------------------------------------------
    // Fade in from black
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Title: scale from 0.1 → 1.05 → 1 with elastic feel
    this.tweens.add({
      targets: titleText,
      scale: { from: 0.1, to: 1.05 },
      alpha: { from: 0, to: 1 },
      duration: TITLE_IN_DURATION_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: titleText,
          scale: 1,
          duration: 150,
          ease: 'Cubic.easeInOut',
        });
      },
    });

    // Subtitle fades in shortly after
    this.time.delayedCall(TITLE_IN_DURATION_MS + 100, () => {
      this.tweens.add({
        targets: [subtitleText, lineGfx],
        alpha: 1,
        duration: SUBTITLE_IN_DURATION_MS,
        ease: 'Quad.easeOut',
      });
    });

    // Play boss music cue
    audioManager.playBossMusic();

    // -------------------------------------------------------------------------
    // 8. Auto-transition to GameScene after DISPLAY_DURATION_MS
    // -------------------------------------------------------------------------
    this.time.delayedCall(DISPLAY_DURATION_MS, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0, (_camera: unknown, progress: number) => {
        if (progress === 1) {
          this.scene.start('GameScene');
        }
      });
    });
  }
}
