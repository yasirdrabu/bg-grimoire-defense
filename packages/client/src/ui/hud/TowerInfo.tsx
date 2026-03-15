import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';

export function TowerInfo() {
  const data = useStore(useGameStore, (s) => s.selectedTowerData);
  const gold = useStore(useGameStore, (s) => s.gold);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);

  if (!data) return null;

  const canUpgradeA = data.upgradeCostA !== null && gold >= data.upgradeCostA && !isGameOver;
  const canUpgradeB = data.upgradeCostB !== null && gold >= data.upgradeCostB && !isGameOver;

  return (
    <div class="flex items-center gap-4 px-4 w-full">
      <div class="flex flex-col min-w-0">
        <span class="text-sm font-semibold truncate" style={{ color: 'var(--hud-text)' }}>{data.name}</span>
        <span class="text-xs" style={{ color: 'var(--hud-muted)' }}>Tier {data.tier}</span>
      </div>
      <div class="flex gap-3 text-xs" style={{ color: 'var(--hud-muted)' }}>
        <span>DMG {data.damage}</span>
        <span>SPD {data.attackSpeed}s</span>
        <span>RNG {data.range}</span>
      </div>
      {data.special && (
        <span class="text-xs italic" style={{ color: '#c4a062' }}>{data.special}</span>
      )}
      <div class="flex-1" />
      {data.upgradeCostA !== null && (
        <button
          class={`hud-btn px-2 py-1 text-xs ${canUpgradeA ? '' : 'hud-btn-disabled'}`}
          onClick={() => {
            if (canUpgradeA) {
              useGameStore.getState().dispatch({ type: 'UPGRADE_TOWER', towerId: data.id, branch: 'A' });
            }
          }}
        >
          <span style={{ color: 'var(--hud-text)' }}>Upgrade A</span>
          <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.upgradeCostA}g</span>
        </button>
      )}
      {data.upgradeCostB !== null && (
        <button
          class={`hud-btn px-2 py-1 text-xs ${canUpgradeB ? '' : 'hud-btn-disabled'}`}
          onClick={() => {
            if (canUpgradeB) {
              useGameStore.getState().dispatch({ type: 'UPGRADE_TOWER', towerId: data.id, branch: 'B' });
            }
          }}
        >
          <span style={{ color: 'var(--hud-text)' }}>Upgrade B</span>
          <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.upgradeCostB}g</span>
        </button>
      )}
      <button
        class={`hud-btn px-2 py-1 text-xs ${isGameOver ? 'hud-btn-disabled' : ''}`}
        onClick={() => {
          if (!isGameOver) {
            useGameStore.getState().dispatch({ type: 'SELL_TOWER', towerId: data.id });
          }
        }}
      >
        <span style={{ color: 'var(--hud-hp)' }}>Sell</span>
        <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.sellRefund}g</span>
      </button>
      <button
        class="hud-btn w-7 h-7 flex items-center justify-center text-sm"
        style={{ color: 'var(--hud-muted)' }}
        onClick={() => useUIStore.getState().deselectTower()}
      >
        ✕
      </button>
    </div>
  );
}
