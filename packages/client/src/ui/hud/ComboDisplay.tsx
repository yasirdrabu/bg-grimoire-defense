import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

export function ComboDisplay() {
  const comboCount = useStore(useGameStore, (s) => s.comboCount);
  const comboMultiplier = useStore(useGameStore, (s) => s.comboMultiplier);

  if (comboCount < 2) return null;

  return (
    <div
      class="hud-interactive combo-enter fixed top-14 left-1/2 z-10 rounded-md border px-4 py-1 text-center"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(255,215,0,0.1)',
        borderColor: 'rgba(255,215,0,0.3)',
      }}
    >
      <div class="text-lg font-bold" style={{ color: 'var(--hud-gold)' }}>
        {comboCount}× COMBO
      </div>
      <div class="text-[11px]" style={{ color: '#c4a062' }}>
        ×{comboMultiplier} multiplier
      </div>
    </div>
  );
}
