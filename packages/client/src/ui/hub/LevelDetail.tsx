import { LEVELS } from '@grimoire/shared';
import type { Difficulty, WaveEnemyGroup } from '@grimoire/shared';
import { useStore } from '../hooks/useStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useGameStore } from '../../stores/useGameStore';

const STAR_FILLED = '★';
const STAR_EMPTY = '☆';
const MAX_STARS = 4;

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  story: 'Story',
  normal: 'Normal',
  heroic: 'Heroic',
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  story: 'Enemies have 70% HP, more gold, 8 Nexus HP',
  normal: 'Standard experience',
  heroic: 'Enemies have 130% HP, less gold, 3 Nexus HP',
};

const ENEMY_DISPLAY_NAMES: Record<string, string> = {
  orc_grunt: 'Orc Grunt',
  goblin_runner: 'Goblin Runner',
  uruk_hai_berserker: 'Uruk-hai Berserker',
  cave_troll: 'Cave Troll',
  nazgul_shade: 'Nazgul Shade',
  balrog: 'Balrog',
};

interface LevelDetailProps {
  levelId: string;
  onClose: () => void;
}

export function LevelDetail({ levelId, onClose }: LevelDetailProps) {
  const levelDef = LEVELS[levelId];
  const selectedDifficulty = useStore(useGameStore, (s) => s.selectedDifficulty);
  const progress = useStore(usePlayerStore, (s) => s.progress.get(levelId));
  const bestScore = progress?.bestScore ?? 0;
  const bestStars = progress?.stars ?? 0;

  if (!levelDef) return null;

  const firstWave = levelDef.waves[0];
  const previewEnemies = firstWave
    ? firstWave.enemies.map((g: WaveEnemyGroup) => ({
        name: ENEMY_DISPLAY_NAMES[g.type] ?? g.type,
        count: g.count,
      }))
    : [];

  const handleDifficulty = (d: Difficulty) => {
    useGameStore.getState().setSelectedDifficulty(d);
  };

  const handlePlay = () => {
    useGameStore.getState().setSelectedLevel(levelId);
    // Call HubScene.startLevel via global game reference
    const phaserGame = (window as unknown as Record<string, unknown>).__phaserGame as
      | { scene: { getScene: (key: string) => unknown } }
      | undefined;
    const scene = phaserGame?.scene.getScene('HubScene') as
      | { startLevel: (id: string) => void }
      | null
      | undefined;
    scene?.startLevel(levelId);
    onClose();
  };

  const difficulties: Difficulty[] = ['story', 'normal', 'heroic'];

  return (
    <>
      {/* Backdrop */}
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 70,
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '480px',
          maxWidth: '95vw',
          background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
          border: '1px solid var(--hud-border)',
          borderRadius: '12px',
          zIndex: 71,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 14px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--hud-muted)',
                marginBottom: '4px',
              }}
            >
              Act {levelDef.act} &mdash; Level {levelDef.levelIndex + 1}
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#c4a062',
                letterSpacing: '0.03em',
              }}
            >
              {levelDef.name}
            </div>
          </div>
          <button
            class="hud-btn"
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: 'var(--hud-muted)',
              flexShrink: 0,
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Best Score + Stars */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--hud-muted)', marginBottom: '2px' }}>
              Best Score
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: bestScore > 0 ? 'var(--hud-gold)' : 'var(--hud-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {bestScore > 0 ? bestScore.toLocaleString() : '—'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--hud-muted)', marginBottom: '2px' }}>
              Stars
            </div>
            <div style={{ fontSize: '22px', letterSpacing: '3px' }}>
              {Array.from({ length: MAX_STARS }, (_, i) => (
                <span
                  key={i}
                  style={{
                    color: i < bestStars ? 'var(--hud-gold)' : 'rgba(148, 163, 184, 0.25)',
                    filter: i < bestStars ? 'drop-shadow(0 0 3px rgba(255,215,0,0.5))' : 'none',
                  }}
                >
                  {i < bestStars ? STAR_FILLED : STAR_EMPTY}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Enemy Preview */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--hud-border-subtle)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--hud-muted)',
              marginBottom: '10px',
            }}
          >
            Wave 1 Preview
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {previewEnemies.map((e: { name: string; count: number }, i: number) => (
              <div
                key={i}
                style={{
                  background: 'rgba(148, 163, 184, 0.07)',
                  border: '1px solid var(--hud-border-subtle)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  color: 'var(--hud-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ color: 'var(--hud-muted)', fontSize: '11px' }}>{e.count}x</span>
                {e.name}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--hud-muted)' }}>
            {levelDef.waves.length} waves total
            {levelDef.boss ? ` · Boss: ${ENEMY_DISPLAY_NAMES[levelDef.boss] ?? levelDef.boss}` : ''}
          </div>
        </div>

        {/* Difficulty Selector */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--hud-border-subtle)' }}>
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--hud-muted)',
              marginBottom: '10px',
            }}
          >
            Difficulty
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {difficulties.map((d) => (
              <button
                key={d}
                class={`hud-btn${selectedDifficulty === d ? ' hud-btn-active' : ''}`}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  fontSize: '13px',
                  fontWeight: selectedDifficulty === d ? '600' : '400',
                  color: selectedDifficulty === d ? '#c4a062' : 'var(--hud-text)',
                }}
                onClick={() => handleDifficulty(d)}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--hud-muted)', fontStyle: 'italic' }}>
            {DIFFICULTY_DESCRIPTIONS[selectedDifficulty]}
          </div>
        </div>

        {/* Play Button */}
        <div style={{ padding: '16px 24px' }}>
          <button
            class="hud-btn hud-interactive"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '15px',
              fontWeight: '700',
              color: '#c4a062',
              letterSpacing: '0.06em',
              borderColor: 'rgba(196, 160, 98, 0.6)',
              background: 'rgba(196, 160, 98, 0.1)',
            }}
            onClick={handlePlay}
          >
            Play
          </button>
        </div>
      </div>
    </>
  );
}
