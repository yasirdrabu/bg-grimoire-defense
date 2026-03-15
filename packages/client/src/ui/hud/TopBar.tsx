import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';

export function TopBar() {
  const gold = useStore(useGameStore, (s) => s.gold);
  const essence = useStore(useGameStore, (s) => s.essence);
  const wave = useStore(useGameStore, (s) => s.wave);
  const totalWaves = useStore(useGameStore, (s) => s.totalWaves);
  const nexusHP = useStore(useGameStore, (s) => s.nexusHP);
  const maxNexusHP = useStore(useGameStore, (s) => s.maxNexusHP);
  const score = useStore(useGameStore, (s) => s.score);
  const hpPercent = maxNexusHP > 0 ? (nexusHP / maxNexusHP) * 100 : 0;

  return (
    <div class="hud-interactive hud-panel-bg fixed top-0 left-0 right-0 h-12 flex items-center px-4 border-b" style={{ borderColor: 'var(--hud-border)' }}>
      <div class="hud-gold-line absolute bottom-0 left-[15%] right-[15%] h-px" />
      <div class="flex gap-5 flex-1">
        <div class="flex items-center gap-1.5">
          <span class="text-sm" style={{ color: 'var(--hud-gold)' }}>⬡</span>
          <span class="text-[15px] font-semibold" style={{ color: 'var(--hud-gold)' }}>{gold}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-sm" style={{ color: 'var(--hud-essence)' }}>◆</span>
          <span class="text-[15px] font-semibold" style={{ color: 'var(--hud-essence)' }}>{essence}</span>
        </div>
      </div>
      <div class="px-3.5 py-0.5 rounded border" style={{ borderColor: 'var(--hud-border-subtle)', background: 'rgba(139,105,20,0.1)' }}>
        <span class="text-[13px] tracking-wide" style={{ color: '#c4a062' }}>WAVE {wave} / {totalWaves}</span>
      </div>
      <div class="flex gap-4 items-center flex-1 justify-end">
        <div class="flex items-center gap-1.5">
          <span class="text-[13px]" style={{ color: 'var(--hud-hp)' }}>♥</span>
          <div class="w-[72px] h-2 rounded border overflow-hidden" style={{ background: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.25)' }}>
            <div class="h-full rounded-sm transition-all duration-300" style={{ width: `${hpPercent}%`, background: 'linear-gradient(90deg, #f87171, #ef4444)' }} />
          </div>
          <span class="text-xs" style={{ color: '#fca5a5' }}>{nexusHP}/{maxNexusHP}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[13px]" style={{ color: 'var(--hud-gold)' }}>★</span>
          <span class="text-[15px] font-semibold" style={{ color: 'var(--hud-gold)' }}>{score.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
