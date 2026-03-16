import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';

export function TowerInfo() {
  const data = useStore(useGameStore, (s) => s.selectedTowerData);
  const gold = useStore(useGameStore, (s) => s.gold);
  const essence = useStore(useGameStore, (s) => s.essence);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);

  if (!data) return null;

  const isTier1 = data.tier === 1;
  const isTier2 = data.tier === 2;

  // Tier 1: single upgrade button (branch A holds the gold cost, no essence)
  // Tier 2: two branch buttons each with gold + essence cost
  const canAffordA =
    data.upgradeCostA !== null &&
    gold >= data.upgradeCostA &&
    (data.upgradeCostAEssence === null || essence >= data.upgradeCostAEssence);

  const canAffordB =
    data.upgradeCostB !== null &&
    gold >= data.upgradeCostB &&
    (data.upgradeCostBEssence === null || essence >= data.upgradeCostBEssence);

  const canUpgradeA = canAffordA && !isGameOver;
  const canUpgradeB = canAffordB && !isGameOver;

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

      {/* Tier 1: single Upgrade button (no branch selection needed) */}
      {isTier1 && data.upgradeCostA !== null && (
        <button
          class={`hud-btn px-2 py-1 text-xs ${canUpgradeA ? '' : 'hud-btn-disabled'}`}
          onClick={() => {
            if (canUpgradeA) {
              useGameStore.getState().dispatch({ type: 'UPGRADE_TOWER', towerId: data.id, branch: 'A' });
            }
          }}
        >
          <span style={{ color: 'var(--hud-text)' }}>Upgrade</span>
          <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.upgradeCostA}g</span>
        </button>
      )}

      {/* Tier 2: Branch A button (blue accent) */}
      {isTier2 && data.upgradeCostA !== null && (
        <button
          class={`hud-btn px-2 py-1 text-xs ${canUpgradeA ? '' : 'hud-btn-disabled'}`}
          style={{ borderColor: '#3b82f6' }}
          onClick={() => {
            if (canUpgradeA) {
              useGameStore.getState().dispatch({ type: 'UPGRADE_TOWER', towerId: data.id, branch: 'A' });
            }
          }}
        >
          <span style={{ color: '#60a5fa' }}>
            {data.upgradeNameA ?? 'Upgrade A'}
          </span>
          {data.upgradeDescA && (
            <span class="ml-1 italic" style={{ color: 'var(--hud-muted)' }}>{data.upgradeDescA}</span>
          )}
          <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.upgradeCostA}g</span>
          {data.upgradeCostAEssence !== null && data.upgradeCostAEssence > 0 && (
            <span class="ml-1" style={{ color: '#a78bfa' }}>+{data.upgradeCostAEssence}e</span>
          )}
        </button>
      )}

      {/* Tier 2: Branch B button (red accent) */}
      {isTier2 && data.upgradeCostB !== null && (
        <button
          class={`hud-btn px-2 py-1 text-xs ${canUpgradeB ? '' : 'hud-btn-disabled'}`}
          style={{ borderColor: '#ef4444' }}
          onClick={() => {
            if (canUpgradeB) {
              useGameStore.getState().dispatch({ type: 'UPGRADE_TOWER', towerId: data.id, branch: 'B' });
            }
          }}
        >
          <span style={{ color: '#f87171' }}>
            {data.upgradeNameB ?? 'Upgrade B'}
          </span>
          {data.upgradeDescB && (
            <span class="ml-1 italic" style={{ color: 'var(--hud-muted)' }}>{data.upgradeDescB}</span>
          )}
          <span class="ml-1" style={{ color: 'var(--hud-gold)' }}>{data.upgradeCostB}g</span>
          {data.upgradeCostBEssence !== null && data.upgradeCostBEssence > 0 && (
            <span class="ml-1" style={{ color: '#a78bfa' }}>+{data.upgradeCostBEssence}e</span>
          )}
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
