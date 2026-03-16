import { useState } from 'preact/hooks';
import { FUSIONS, TOWERS } from '@grimoire/shared';
import type { FusionRecipe } from '@grimoire/shared';
import { useStore } from '../hooks/useStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { FusionLog } from './FusionLog';

interface GrimoireBookProps {
  onClose: () => void;
}

type GrimoireTab = 'recipes' | 'log';

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        fontSize: '10px',
        color: 'var(--hud-muted)',
        background: 'rgba(148, 163, 184, 0.08)',
        border: '1px solid var(--hud-border-subtle)',
        borderRadius: '4px',
        padding: '1px 5px',
      }}
    >
      {label}{value ? ` ${value}` : ''}
    </span>
  );
}

function FusionCard({ recipe, discovered }: { recipe: FusionRecipe; discovered: boolean }) {
  const inputNameA = TOWERS[recipe.inputs[0]]?.name ?? recipe.inputs[0];
  const inputNameB = TOWERS[recipe.inputs[1]]?.name ?? recipe.inputs[1];

  if (!discovered) {
    return (
      <div
        style={{
          background: 'var(--hud-bg-slate)',
          border: '1px solid var(--hud-border-subtle)',
          borderRadius: '8px',
          padding: '14px',
          opacity: 0.65,
          filter: 'grayscale(0.8)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '6px',
            background: 'rgba(148, 163, 184, 0.1)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '22px', filter: 'blur(2px)' }}>?</span>
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--hud-muted)',
            marginBottom: '6px',
            userSelect: 'none',
          }}
        >
          <span style={{ filter: 'blur(3px)', display: 'inline-block' }}>████████████</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--hud-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
          {recipe.hint}
        </div>
      </div>
    );
  }

  return (
    <div
      class="grimoire-card"
      style={{
        background: 'var(--hud-bg-slate)',
        border: '1px solid var(--hud-border-subtle)',
        borderRadius: '8px',
        padding: '14px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '6px',
          background: 'rgba(196, 160, 98, 0.15)',
          border: '1px solid rgba(196, 160, 98, 0.3)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '22px' }}>✦</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#c4a062', marginBottom: '4px' }}>
        {recipe.name}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--hud-muted)', marginBottom: '8px' }}>
        {inputNameA} + {inputNameB}
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--hud-text)',
          lineHeight: '1.45',
          borderTop: '1px solid var(--hud-border-subtle)',
          paddingTop: '8px',
          marginBottom: '8px',
        }}
      >
        {recipe.mechanic}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <StatBadge label="DMG" value={String(recipe.stats.damage)} />
        <StatBadge label="RNG" value={String(recipe.stats.range)} />
        <StatBadge label="SPD" value={String(recipe.stats.attackSpeed)} />
        <StatBadge label={recipe.stats.damageType} value="" />
      </div>
    </div>
  );
}

export function GrimoireBook({ onClose }: GrimoireBookProps) {
  const [activeTab, setActiveTab] = useState<GrimoireTab>('recipes');
  const discoveredFusions = useStore(usePlayerStore, (s) => s.discoveredFusions);
  const recipes = Object.values(FUSIONS);
  const discoveredCount = recipes.filter((r) => discoveredFusions.has(r.id)).length;

  return (
    <>
      {/* Backdrop */}
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

      {/* Panel */}
      <div
        class="hud-interactive"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '640px',
          maxWidth: '95vw',
          maxHeight: '80vh',
          background: 'linear-gradient(180deg, var(--hud-bg-dark) 0%, var(--hud-bg-slate) 100%)',
          border: '1px solid var(--hud-border)',
          borderRadius: '12px',
          zIndex: 51,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#c4a062', letterSpacing: '0.04em' }}>
              Grimoire of Fusions
            </div>
            <div style={{ fontSize: '12px', color: 'var(--hud-muted)', marginTop: '2px' }}>
              {discoveredCount} / {recipes.length} discovered
            </div>
          </div>
          <button
            class="hud-btn"
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--hud-muted)' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            padding: '0 20px',
            borderBottom: '1px solid var(--hud-border-subtle)',
            display: 'flex',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          {(['recipes', 'log'] as GrimoireTab[]).map((tab) => (
            <button
              key={tab}
              class={`hud-btn${activeTab === tab ? ' hud-btn-active' : ''}`}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                color: activeTab === tab ? '#c4a062' : 'var(--hud-muted)',
                borderBottom: 'none',
                borderRadius: '6px 6px 0 0',
                textTransform: 'capitalize',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'recipes' ? 'Recipes' : 'Discovery Log'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {activeTab === 'recipes' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {recipes.map((recipe) => (
                <FusionCard
                  key={recipe.id}
                  recipe={recipe}
                  discovered={discoveredFusions.has(recipe.id)}
                />
              ))}
            </div>
          )}
          {activeTab === 'log' && <FusionLog discoveredFusions={discoveredFusions} />}
        </div>
      </div>
    </>
  );
}
