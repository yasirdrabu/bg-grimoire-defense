import { FUSIONS, TOWERS } from '@grimoire/shared';

interface FusionLogProps {
  discoveredFusions: Set<string>;
}

export function FusionLog({ discoveredFusions }: FusionLogProps) {
  // Show discoveries in insertion order (Set preserves insertion order)
  const entries = [...discoveredFusions]
    .map((id) => FUSIONS[id])
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== undefined);

  if (entries.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: 'var(--hud-muted)',
          fontSize: '13px',
          padding: '40px 20px',
          fontStyle: 'italic',
        }}
      >
        No fusions discovered yet. Combine Tier 2 towers to unlock entries.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {entries.map((recipe, index) => {
        const inputNameA = TOWERS[recipe.inputs[0]]?.name ?? recipe.inputs[0];
        const inputNameB = TOWERS[recipe.inputs[1]]?.name ?? recipe.inputs[1];

        return (
          <div
            key={recipe.id}
            style={{
              background: 'var(--hud-bg-slate)',
              border: '1px solid var(--hud-border-subtle)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            {/* Discovery index badge */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(196, 160, 98, 0.15)',
                border: '1px solid rgba(196, 160, 98, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: '#c4a062',
                fontWeight: '700',
                flexShrink: 0,
              }}
            >
              {index + 1}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#c4a062', marginBottom: '3px' }}>
                {recipe.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--hud-muted)', marginBottom: '6px' }}>
                {inputNameA} + {inputNameB}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--hud-text)', lineHeight: '1.4' }}>
                {recipe.mechanic}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
