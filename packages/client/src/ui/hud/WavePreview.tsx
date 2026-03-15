import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

export function WavePreview() {
  const wave = useStore(useGameStore, (s) => s.wave);
  const totalWaves = useStore(useGameStore, (s) => s.totalWaves);
  const waveState = useStore(useGameStore, (s) => s.waveState);
  const nextWaveEnemies = useStore(useGameStore, (s) => s.nextWaveEnemies);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);

  const canSend = (waveState === 'pre_wave' || waveState === 'wave_clear') && !isGameOver && wave < totalWaves;

  return (
    <div class="hud-interactive fixed top-14 left-2 z-10">
      <div class="rounded-md border p-2 w-[150px]" style={{ background: 'var(--hud-bg-slate)', borderColor: 'var(--hud-border-subtle)' }}>
        <div class="text-[11px] tracking-wide mb-1.5" style={{ color: '#c4a062' }}>
          NEXT WAVE
        </div>

        {nextWaveEnemies.length > 0 ? (
          <div class="flex flex-col gap-1">
            {nextWaveEnemies.map((entry) => (
              <div key={entry.enemyType} class="flex justify-between items-center">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
                  <span class="text-[11px]" style={{ color: 'var(--hud-muted)' }}>
                    {entry.enemyType.replace(/_/g, ' ')}
                  </span>
                </div>
                <span class="text-[11px]" style={{ color: 'var(--hud-text)' }}>×{entry.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div class="text-[11px]" style={{ color: 'var(--hud-muted)' }}>
            {wave >= totalWaves ? 'Final wave!' : 'Ready'}
          </div>
        )}

        <div class="mt-2">
          <button
            class={`hud-btn w-full py-1 text-[11px] text-center ${canSend ? '' : 'hud-btn-disabled'}`}
            style={{ color: '#c4a062' }}
            onClick={() => {
              if (canSend) useGameStore.getState().dispatch({ type: 'SEND_WAVE_EARLY' });
            }}
          >
            SEND EARLY (Space)
          </button>
        </div>
      </div>
    </div>
  );
}
