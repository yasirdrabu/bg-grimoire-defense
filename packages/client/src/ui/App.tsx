import './hud.css';
import { TopBar } from './hud/TopBar';
import { BottomBar } from './hud/BottomBar';
import { WavePreview } from './hud/WavePreview';
import { SpeedControls } from './hud/SpeedControls';
import { ComboDisplay } from './hud/ComboDisplay';
import { TutorialOverlay } from './hud/TutorialOverlay';
import { GrimoireBook } from './grimoire/GrimoireBook';
import { useStore } from './hooks/useStore';
import { useUIStore } from '../stores/useUIStore';

export function App() {
  const activeTab = useStore(useUIStore, (s) => s.activeTab);
  const setActiveTab = useUIStore.getState().setActiveTab;

  return (
    <div id="hud-root">
      <TopBar />
      <WavePreview />
      <SpeedControls />
      <ComboDisplay />
      <TutorialOverlay />
      <BottomBar />
      {activeTab === 'grimoire' && (
        <GrimoireBook onClose={() => setActiveTab('none')} />
      )}
    </div>
  );
}
