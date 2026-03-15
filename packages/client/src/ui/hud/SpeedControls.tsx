import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

const SPEEDS = [1, 2, 3] as const;

export function SpeedControls() {
  const gameSpeed = useStore(useGameStore, (s) => s.gameSpeed);
  const isPaused = useStore(useGameStore, (s) => s.isPaused);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);

  return (
    <div class="hud-interactive fixed top-14 right-2 z-10">
      <div class="flex gap-1 p-1 rounded-md border" style={{ background: 'var(--hud-bg-slate)', borderColor: 'var(--hud-border-subtle)' }}>
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            data-speed={speed}
            class={`hud-btn w-8 h-7 flex items-center justify-center text-[11px] font-semibold ${gameSpeed === speed && !isPaused ? 'hud-btn-active' : ''} ${isGameOver ? 'hud-btn-disabled' : ''}`}
            style={{ color: gameSpeed === speed && !isPaused ? 'var(--hud-gold)' : 'var(--hud-muted)' }}
            onClick={() => {
              if (!isGameOver) useGameStore.getState().dispatch({ type: 'SET_SPEED', speed });
            }}
          >
            {speed}×
          </button>
        ))}
        <div class="w-px my-0.5" style={{ background: 'var(--hud-border-subtle)' }} />
        <button
          data-pause
          class={`hud-btn w-8 h-7 flex items-center justify-center text-[13px] ${isPaused ? 'hud-btn-active' : ''} ${isGameOver ? 'hud-btn-disabled' : ''}`}
          style={{ color: isPaused ? 'var(--hud-gold)' : 'var(--hud-muted)' }}
          onClick={() => {
            if (!isGameOver) useGameStore.getState().dispatch({ type: 'TOGGLE_PAUSE' });
          }}
        >
          ⏸
        </button>
      </div>
    </div>
  );
}
