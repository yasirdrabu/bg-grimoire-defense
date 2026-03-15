import { useStore } from '../hooks/useStore';
import { useUIStore } from '../../stores/useUIStore';
import { TowerPanel } from './TowerPanel';
import { TowerInfo } from './TowerInfo';

export function BottomBar() {
  const inputMode = useStore(useUIStore, (s) => s.inputMode);

  return (
    <div class="hud-interactive hud-panel-bg fixed bottom-0 left-0 right-0 h-[72px] flex items-center justify-center border-t" style={{ borderColor: 'var(--hud-border)' }}>
      <div class="hud-gold-line absolute top-0 left-[15%] right-[15%] h-px" />
      {inputMode === 'selected' ? <TowerInfo /> : <TowerPanel />}
    </div>
  );
}
