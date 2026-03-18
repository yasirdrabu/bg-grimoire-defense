import './hud.css';
import { useState, useEffect } from 'preact/hooks';
import { TopBar } from './hud/TopBar';
import { BottomBar } from './hud/BottomBar';
import { WavePreview } from './hud/WavePreview';
import { SpeedControls } from './hud/SpeedControls';
import { ComboDisplay } from './hud/ComboDisplay';
import { TutorialOverlay } from './hud/TutorialOverlay';
import { ScoreBreakdown } from './hud/ScoreBreakdown';
import { HubOverlay } from './hub/HubOverlay';
import { useStore } from './hooks/useStore';
import { useGameStore } from '../stores/useGameStore';

type ActiveScene = 'HubScene' | 'GameScene' | 'ScoreBreakdownScene' | 'BootScene';

export function App() {
  const [activeScene, setActiveScene] = useState<ActiveScene>('BootScene');
  const scoreBreakdown = useStore(useGameStore, (s) => s.scoreBreakdown);

  useEffect(() => {
    const handler = (e: Event) => {
      const { scene } = (e as CustomEvent<{ scene: ActiveScene }>).detail;
      setActiveScene(scene);
    };
    window.addEventListener('phaser:sceneChange', handler);
    return () => window.removeEventListener('phaser:sceneChange', handler);
  }, []);

  const isHub = activeScene === 'HubScene';
  const isGame = activeScene === 'GameScene' || activeScene === 'ScoreBreakdownScene';

  return (
    <div id="hud-root">
      {isHub && <HubOverlay />}

      {isGame && (
        <>
          <TopBar />
          <WavePreview />
          <SpeedControls />
          <ComboDisplay />
          <TutorialOverlay />
          <BottomBar />
        </>
      )}

      {/* Score breakdown shown over both game and score scenes */}
      {scoreBreakdown !== null && <ScoreBreakdown />}
    </div>
  );
}
