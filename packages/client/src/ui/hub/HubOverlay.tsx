import { useState, useEffect } from 'preact/hooks';
import { LevelDetail } from './LevelDetail';
import { Settings } from './Settings';
import { Profile } from './Profile';
import { GrimoireBook } from '../grimoire/GrimoireBook';
import { CosmeticStore } from '../store/CosmeticStore';
import { useStore } from '../hooks/useStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import type { HubTab } from '../../stores/useUIStore';
import { api } from '../../api/client';
import type { LeaderboardEntry } from '../../api/client';

const TAB_CONFIG: Array<{ id: HubTab; label: string; icon: string }> = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'grimoire', label: 'Grimoire', icon: '📖' },
  { id: 'store', label: 'Store', icon: '🏪' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
];

type LeaderboardScope = 'campaign' | string; // 'campaign' or a levelId

function LeaderboardPanel({ onClose }: { onClose: () => void }) {
  const playerId = useStore(usePlayerStore, (s) => s.playerId);
  const [scope, setScope] = useState<LeaderboardScope>('campaign');
  const [difficulty, setDifficulty] = useState('normal');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const req =
      scope === 'campaign'
        ? api.getCampaignLeaderboard(difficulty, 1)
        : api.getLeaderboard(scope, difficulty, 1);

    req
      .then((res) => {
        setEntries(res.entries);
        setTotal(res.total);
        setPlayerRank(res.player_rank);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [scope, difficulty]);

  return (
    <>
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 50,
        }}
        onClick={onClose}
      />
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '520px',
          maxWidth: '95vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
          border: '1px solid var(--hud-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 51,
        }}
      >
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
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#c4a062' }}>
            Leaderboard
          </div>
          <button
            class="hud-btn hud-interactive"
            style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--hud-muted)' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <select
            style={{
              background: 'var(--hud-bg-slate)',
              border: '1px solid var(--hud-border)',
              borderRadius: '6px',
              color: 'var(--hud-text)',
              padding: '4px 8px',
              fontSize: '12px',
            }}
            value={scope}
            onChange={(e) => setScope((e.target as HTMLSelectElement).value)}
          >
            <option value="campaign">Campaign Total</option>
            <option value="act1_level1">Act 1 – Level 1</option>
            <option value="act1_level2">Act 1 – Level 2</option>
            <option value="act1_level3">Act 1 – Level 3</option>
          </select>
          <select
            style={{
              background: 'var(--hud-bg-slate)',
              border: '1px solid var(--hud-border)',
              borderRadius: '6px',
              color: 'var(--hud-text)',
              padding: '4px 8px',
              fontSize: '12px',
            }}
            value={difficulty}
            onChange={(e) => setDifficulty((e.target as HTMLSelectElement).value)}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Player's rank banner (if logged in and ranked) */}
        {playerRank !== null && playerId !== null && (
          <div
            style={{
              padding: '8px 20px',
              background: 'rgba(196, 160, 98, 0.1)',
              borderBottom: '1px solid var(--hud-border-subtle)',
              fontSize: '12px',
              color: '#c4a062',
              flexShrink: 0,
            }}
          >
            Your rank: #{playerRank} of {total}
          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hud-muted)', fontSize: '13px' }}>
              Loading…
            </div>
          )}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}
          {!loading && !error && entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hud-muted)', fontSize: '13px', fontStyle: 'italic' }}>
              No scores recorded yet.
            </div>
          )}
          {!loading && !error && entries.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--hud-muted)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'right', padding: '6px 12px 6px 20px', width: '40px' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '6px 12px' }}>Player</th>
                  <th style={{ textAlign: 'right', padding: '6px 20px 6px 12px' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isCurrentPlayer = playerId !== null && entry.player_id === playerId;
                  return (
                    <tr
                      key={entry.player_id}
                      style={{
                        background: isCurrentPlayer ? 'rgba(196, 160, 98, 0.08)' : 'transparent',
                        borderTop: '1px solid var(--hud-border-subtle)',
                      }}
                    >
                      <td
                        style={{
                          textAlign: 'right',
                          padding: '8px 12px 8px 20px',
                          color: entry.rank <= 3 ? '#c4a062' : 'var(--hud-muted)',
                          fontWeight: entry.rank <= 3 ? '700' : '400',
                        }}
                      >
                        {entry.rank}
                      </td>
                      <td style={{ padding: '8px 12px', color: isCurrentPlayer ? '#c4a062' : 'var(--hud-text)' }}>
                        {entry.display_name ?? entry.username}
                        {isCurrentPlayer && (
                          <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--hud-muted)' }}>(you)</span>
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          padding: '8px 20px 8px 12px',
                          color: 'var(--hud-text)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {entry.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export function HubOverlay() {
  const activeTab = useStore(useUIStore, (s) => s.activeTab);
  const setActiveTab = useUIStore.getState().setActiveTab;
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Listen for hub:openLevelDetail events dispatched by HubScene
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ levelId: string }>).detail;
      setSelectedLevelId(detail.levelId);
    };
    window.addEventListener('hub:openLevelDetail', handler);
    return () => window.removeEventListener('hub:openLevelDetail', handler);
  }, []);

  const handleClose = () => {
    setActiveTab('none');
    setSelectedLevelId(null);
  };

  return (
    <>
      {/* Tab Bar — always visible in HubScene */}
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '8px',
          zIndex: 40,
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            class={`hud-btn${activeTab === tab.id ? ' hud-btn-active' : ''}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 10px',
              gap: '3px',
              width: '64px',
            }}
            onClick={() => setActiveTab(activeTab === tab.id ? 'none' : tab.id)}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            <span style={{ fontSize: '9px', color: 'var(--hud-muted)', letterSpacing: '0.04em' }}>
              {tab.label}
            </span>
          </button>
        ))}

        {/* Settings button */}
        <button
          class="hud-btn"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 10px',
            gap: '3px',
            width: '64px',
            marginTop: '8px',
          }}
          onClick={() => setShowSettings(true)}
        >
          <span style={{ fontSize: '18px' }}>⚙️</span>
          <span style={{ fontSize: '9px', color: 'var(--hud-muted)', letterSpacing: '0.04em' }}>
            Settings
          </span>
        </button>
      </div>

      {/* Level Detail overlay */}
      {selectedLevelId && (
        <LevelDetail
          levelId={selectedLevelId}
          onClose={() => setSelectedLevelId(null)}
        />
      )}

      {/* Tab panels */}
      {activeTab === 'grimoire' && (
        <GrimoireBook onClose={handleClose} />
      )}
      {activeTab === 'profile' && (
        <Profile onClose={handleClose} />
      )}
      {activeTab === 'store' && (
        <CosmeticStore onClose={handleClose} />
      )}
      {activeTab === 'leaderboard' && (
        <LeaderboardPanel onClose={handleClose} />
      )}

      {/* Settings overlay */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
