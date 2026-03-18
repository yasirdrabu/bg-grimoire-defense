import { useState, useEffect } from 'preact/hooks';
import { LevelDetail } from './LevelDetail';
import { Settings } from './Settings';
import { GrimoireBook } from '../grimoire/GrimoireBook';
import { useStore } from '../hooks/useStore';
import { useUIStore } from '../../stores/useUIStore';
import type { HubTab } from '../../stores/useUIStore';

const TAB_CONFIG: Array<{ id: HubTab; label: string; icon: string }> = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'grimoire', label: 'Grimoire', icon: '📖' },
  { id: 'store', label: 'Store', icon: '🏪' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
];

function StubPanel({ title, onClose }: { title: string; onClose: () => void }) {
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
          width: '400px',
          maxWidth: '95vw',
          background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
          border: '1px solid var(--hud-border)',
          borderRadius: '12px',
          padding: '32px 24px',
          zIndex: 51,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '17px', fontWeight: '700', color: '#c4a062', marginBottom: '12px' }}>
          {title}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--hud-muted)', marginBottom: '24px', fontStyle: 'italic' }}>
          Coming soon…
        </div>
        <button
          class="hud-btn hud-interactive"
          style={{
            padding: '9px 24px',
            fontSize: '13px',
            color: 'var(--hud-text)',
          }}
          onClick={onClose}
        >
          Close
        </button>
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
        <StubPanel title="Profile" onClose={handleClose} />
      )}
      {activeTab === 'store' && (
        <StubPanel title="Store" onClose={handleClose} />
      )}
      {activeTab === 'leaderboard' && (
        <StubPanel title="Leaderboard" onClose={handleClose} />
      )}

      {/* Settings overlay */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
