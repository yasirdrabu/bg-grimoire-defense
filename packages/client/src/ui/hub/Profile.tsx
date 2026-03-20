import { useState, useEffect } from 'preact/hooks';
import { api } from '../../api/client';
import type { ProfileResponse } from '../../api/client';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useStore } from '../hooks/useStore';

const OVERLAY_STYLE = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  zIndex: 50,
};

const MODAL_STYLE = {
  position: 'fixed' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '480px',
  maxWidth: '95vw',
  maxHeight: '82vh',
  display: 'flex',
  flexDirection: 'column' as const,
  background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
  border: '1px solid var(--hud-border)',
  borderRadius: '12px',
  overflow: 'hidden',
  zIndex: 51,
};

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: '1px solid var(--hud-border-subtle)',
      }}
    >
      <span style={{ fontSize: '12px', color: 'var(--hud-muted)' }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--hud-text)', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

function GuestProfile({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div class="hud-interactive" style={OVERLAY_STYLE} onClick={onClose} />
      <div class="hud-interactive" style={MODAL_STYLE}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hud-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#c4a062' }}>Profile</div>
          <button class="hud-btn hud-interactive" style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--hud-muted)' }} onClick={onClose}>Close</button>
        </div>
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--hud-muted)', fontSize: '13px', fontStyle: 'italic' }}>
          Log in to view your profile and stats.
        </div>
      </div>
    </>
  );
}

export function Profile({ onClose }: { onClose: () => void }) {
  const isLoggedIn = useStore(usePlayerStore, (s) => s.isLoggedIn);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .getProfile()
      .then((res) => {
        setProfile(res);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <GuestProfile onClose={onClose} />;
  }

  // Aggregate stats from progress records
  const totalStars = profile?.progress.reduce((sum, p) => sum + p.stars, 0) ?? 0;
  const levelsCompleted = profile?.progress.filter((p) => p.timesCompleted > 0).length ?? 0;
  const bestCombo = profile?.progress.reduce((max, p) => Math.max(max, p.bestCombo), 0) ?? 0;
  const totalFusions = profile?.fusions.length ?? 0;

  const player = profile?.player;
  const coins = player?.coins ?? 0;
  const title = player?.title ?? null;
  const borderStyle = player?.borderStyle ?? null;
  const avatarUrl = player?.avatarUrl ?? null;

  return (
    <>
      <div class="hud-interactive" style={OVERLAY_STYLE} onClick={onClose} />
      <div class="hud-interactive" style={MODAL_STYLE}>
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#c4a062' }}>Profile</div>
          <button
            class="hud-btn hud-interactive"
            style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--hud-muted)' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--hud-muted)', fontSize: '13px' }}>
              Loading…
            </div>
          )}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}
          {!loading && !error && player && (
            <>
              {/* Avatar + identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--hud-bg-dark)',
                    border: `2px solid ${borderStyle ? '#c4a062' : 'var(--hud-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '👤'
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '17px',
                      fontWeight: '700',
                      color: 'var(--hud-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {player.displayName ?? player.username}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hud-muted)', marginTop: '2px' }}>
                    @{player.username}
                  </div>
                  {title && (
                    <div style={{ fontSize: '11px', color: '#c4a062', marginTop: '4px', fontStyle: 'italic' }}>
                      {title}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipped cosmetics */}
              {(borderStyle || title || avatarUrl) && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '10px 12px',
                    background: 'rgba(196, 160, 98, 0.06)',
                    border: '1px solid rgba(196, 160, 98, 0.2)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--hud-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Equipped Cosmetics
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {borderStyle && (
                      <span style={{ fontSize: '11px', color: '#c4a062', background: 'rgba(196, 160, 98, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                        Border: {borderStyle}
                      </span>
                    )}
                    {title && (
                      <span style={{ fontSize: '11px', color: '#c4a062', background: 'rgba(196, 160, 98, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                        Title: {title}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ marginBottom: '8px', fontSize: '11px', color: 'var(--hud-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stats
              </div>
              <div style={{ marginBottom: '16px' }}>
                <StatRow label="Total Stars" value={totalStars} />
                <StatRow label="Levels Completed" value={levelsCompleted} />
                <StatRow label="Best Combo" value={bestCombo} />
                <StatRow label="Fusions Discovered" value={totalFusions} />
                <StatRow label="Coins" value={coins} />
              </div>

              {/* Member since */}
              <div style={{ fontSize: '11px', color: 'var(--hud-muted)', textAlign: 'center', marginTop: '8px' }}>
                Member since {new Date(player.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
