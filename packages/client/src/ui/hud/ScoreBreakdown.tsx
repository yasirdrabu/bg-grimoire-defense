import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

const STAR_FILLED = '★';
const STAR_EMPTY = '☆';
const MAX_STARS = 4;

interface ScoreRowProps {
  label: string;
  value: number;
  emphasis?: boolean;
}

function ScoreRow({ label, value, emphasis = false }: ScoreRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: emphasis ? '10px 0' : '6px 0',
        borderTop: emphasis ? '1px solid var(--hud-border)' : undefined,
        marginTop: emphasis ? '4px' : undefined,
      }}
    >
      <span
        style={{
          fontSize: emphasis ? '15px' : '13px',
          fontWeight: emphasis ? '700' : '400',
          color: emphasis ? '#c4a062' : 'var(--hud-text)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: emphasis ? '17px' : '13px',
          fontWeight: emphasis ? '700' : '500',
          color: emphasis ? 'var(--hud-gold)' : 'var(--hud-text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function ScoreBreakdown() {
  const breakdown = useStore(useGameStore, (s) => s.scoreBreakdown);

  if (!breakdown) return null;

  const handleContinue = () => {
    // Access the Phaser game instance via the global reference set in main.tsx
    const phaserGame = (window as unknown as Record<string, unknown>).__phaserGame as
      | { scene: { getScene: (key: string) => { continue?: () => void } | null } }
      | undefined;
    const scene = phaserGame?.scene.getScene('ScoreBreakdownScene') as
      | { continue: () => void }
      | null
      | undefined;
    scene?.continue();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 60,
        }}
      />

      {/* Panel */}
      <div
        class="hud-interactive score-breakdown-enter"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '420px',
          maxWidth: '95vw',
          background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
          border: '1px solid var(--hud-border)',
          borderRadius: '12px',
          zIndex: 61,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--hud-muted)',
              marginBottom: '4px',
            }}
          >
            Level Complete
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#c4a062',
              letterSpacing: '0.04em',
            }}
          >
            {breakdown.levelName}
          </div>
        </div>

        {/* Stars */}
        <div
          style={{
            padding: '20px 24px 16px',
            textAlign: 'center',
            borderBottom: '1px solid var(--hud-border-subtle)',
          }}
        >
          <div style={{ fontSize: '36px', letterSpacing: '6px', lineHeight: 1 }}>
            {Array.from({ length: MAX_STARS }, (_, i) => (
              <span
                key={i}
                style={{
                  color: i < breakdown.stars ? 'var(--hud-gold)' : 'rgba(148, 163, 184, 0.25)',
                  display: 'inline-block',
                  transition: `opacity 0.3s ease ${i * 100}ms`,
                  filter: i < breakdown.stars ? 'drop-shadow(0 0 4px rgba(255,215,0,0.6))' : 'none',
                }}
              >
                {i < breakdown.stars ? STAR_FILLED : STAR_EMPTY}
              </span>
            ))}
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--hud-muted)',
            }}
          >
            {breakdown.stars} / {MAX_STARS} stars
          </div>
        </div>

        {/* Score Breakdown */}
        <div style={{ padding: '16px 24px' }}>
          <ScoreRow label="Base Score" value={breakdown.baseScore} />
          <ScoreRow label="Combo Score" value={breakdown.comboScore} />
          <ScoreRow label="Speed Bonus" value={breakdown.speedBonus} />
          <ScoreRow label="Style Points" value={breakdown.stylePoints} />
          <ScoreRow label="Perfect Wave Bonus" value={breakdown.perfectWaveBonus} />
          <ScoreRow label="Nexus Health Bonus" value={breakdown.nexusHealthBonus} />
          <ScoreRow label="Total Score" value={breakdown.totalScore} emphasis />
        </div>

        {/* Continue Button */}
        <div
          style={{
            padding: '0 24px 24px',
            textAlign: 'center',
          }}
        >
          <button
            class="hud-btn hud-interactive"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#c4a062',
              letterSpacing: '0.05em',
              borderColor: 'rgba(196, 160, 98, 0.5)',
              background: 'rgba(196, 160, 98, 0.08)',
            }}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
