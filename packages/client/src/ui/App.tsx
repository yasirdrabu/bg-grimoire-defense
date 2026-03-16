import './hud.css';
import { TopBar } from './hud/TopBar';
import { BottomBar } from './hud/BottomBar';
import { WavePreview } from './hud/WavePreview';
import { SpeedControls } from './hud/SpeedControls';
import { ComboDisplay } from './hud/ComboDisplay';
import { TutorialOverlay } from './hud/TutorialOverlay';

export function App() {
  return (
    <div id="hud-root">
      <TopBar />
      <WavePreview />
      <SpeedControls />
      <ComboDisplay />
      <TutorialOverlay />
      <BottomBar />
    </div>
  );
}
