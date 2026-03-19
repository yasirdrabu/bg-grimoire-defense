import { TOWERS } from '@grimoire/shared';
import { useStore } from '../hooks/useStore';
import { useGameStore } from '../../stores/useGameStore';
import { useUIStore } from '../../stores/useUIStore';

// Filter to only show towers for the current act's universe.
// Act 1 = middle_earth, Act 2 = wizarding, Act 3 = westeros.
// For now we show all unlocked universes up to the current act (Act 1 default).
const TOWER_KEYS = Object.keys(TOWERS).filter(
  (k) => TOWERS[k]!.universe === 'middle_earth',
);

const TOWER_COLORS: Record<string, string> = {
  elven_archer_spire: '#4ade80',
  ent_watchtower: '#8b5e3c',
  gondorian_ballista: '#94a3b8',
  istari_crystal: '#a78bfa',
  dwarven_cannon: '#f97316',
};

const HOTKEYS = ['1', '2', '3', '4', '5'];

export function TowerPanel() {
  const gold = useStore(useGameStore, (s) => s.gold);
  const isGameOver = useStore(useGameStore, (s) => s.isGameOver);
  const buildTowerType = useStore(useUIStore, (s) => s.buildTowerType);

  return (
    <div class="flex gap-2 justify-center">
      {TOWER_KEYS.map((towerKey, idx) => {
        const tower = TOWERS[towerKey]!;
        const canAfford = gold >= tower.cost;
        const isActive = buildTowerType === towerKey;
        const disabled = !canAfford || isGameOver;

        return (
          <button
            key={towerKey}
            data-tower-id={towerKey}
            class={`hud-btn relative flex flex-col items-center justify-center w-14 h-14 ${isActive ? 'hud-btn-active' : ''} ${disabled ? 'hud-btn-disabled' : ''}`}
            onClick={() => {
              if (!disabled) {
                useUIStore.getState().enterBuildMode(towerKey);
              }
            }}
          >
            <div
              class="w-5 h-5 rounded-full mb-0.5"
              style={{
                background: TOWER_COLORS[towerKey] ?? '#888',
                boxShadow: towerKey === 'istari_crystal' ? `0 0 8px ${TOWER_COLORS[towerKey]}` : undefined,
              }}
            />
            <span class="text-[9px]" style={{ color: disabled ? '#64748b' : 'var(--hud-muted)' }}>
              {tower.cost}g
            </span>
            {idx < HOTKEYS.length && (
              <div
                class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-sm text-[8px] border"
                style={{ background: '#1a1a2e', borderColor: 'var(--hud-border)', color: '#c4a062' }}
              >
                {HOTKEYS[idx]}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
