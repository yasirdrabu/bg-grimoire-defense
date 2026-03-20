import { useStore } from '../hooks/useStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { audioManager } from '../../game/audio/AudioManager';

interface SettingsProps {
  onClose: () => void;
}

function SettingsRow({ label, children }: { label: string; children: preact.ComponentChildren }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid var(--hud-border-subtle)',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--hud-text)' }}>{label}</span>
      {children}
    </div>
  );
}

export function Settings({ onClose }: SettingsProps) {
  const volume = useStore(usePlayerStore, (s) => s.volume);
  const reducedMotion = useStore(usePlayerStore, (s) => s.reducedMotion);
  const uiScale = useStore(usePlayerStore, (s) => s.uiScale);
  const { setVolume, setReducedMotion, setUiScale } = usePlayerStore.getState();

  return (
    <>
      {/* Backdrop */}
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
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
          width: '400px',
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
            padding: '18px 24px 14px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#c4a062', letterSpacing: '0.04em' }}>
            Settings
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
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Settings rows */}
        <div style={{ padding: '4px 24px 20px' }}>
          <SettingsRow label="Master Volume">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onInput={(e) => {
                  const val = parseFloat((e.target as HTMLInputElement).value);
                  setVolume(val);
                  audioManager.setMasterVolume(val);
                }}
                style={{ width: '120px', accentColor: 'var(--hud-gold)' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--hud-muted)', width: '32px', textAlign: 'right' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          </SettingsRow>

          <SettingsRow label="Reduced Motion">
            <button
              class={`hud-btn${reducedMotion ? ' hud-btn-active' : ''}`}
              style={{
                padding: '5px 14px',
                fontSize: '12px',
                color: reducedMotion ? '#c4a062' : 'var(--hud-muted)',
              }}
              onClick={() => setReducedMotion(!reducedMotion)}
            >
              {reducedMotion ? 'On' : 'Off'}
            </button>
          </SettingsRow>

          <SettingsRow label="UI Scale">
            <div style={{ display: 'flex', gap: '6px' }}>
              {([0.85, 1, 1.15] as const).map((scale) => (
                <button
                  key={scale}
                  class={`hud-btn${uiScale === scale ? ' hud-btn-active' : ''}`}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    color: uiScale === scale ? '#c4a062' : 'var(--hud-muted)',
                  }}
                  onClick={() => setUiScale(scale)}
                >
                  {scale === 0.85 ? 'Small' : scale === 1 ? 'Normal' : 'Large'}
                </button>
              ))}
            </div>
          </SettingsRow>
        </div>

        {/* Footer note */}
        <div
          style={{
            padding: '0 24px 16px',
            fontSize: '11px',
            color: 'var(--hud-muted)',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          Audio infrastructure is wired. Drop .ogg assets into /public/audio/ to enable sound.
        </div>
      </div>
    </>
  );
}
