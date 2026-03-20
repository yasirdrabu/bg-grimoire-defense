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

    // Handle race condition: if Phaser scene already started before Preact mounted,
    // check the current active scene from the game instance
    const game = (window as unknown as Record<string, unknown>).__phaserGame as
      { scene?: { scenes?: Array<{ sys?: { isActive?: () => boolean; settings?: { key?: string } } }> } } | undefined;
    if (game?.scene?.scenes) {
      for (const s of game.scene.scenes) {
        if (s.sys?.isActive?.() && s.sys.settings?.key) {
          const key = s.sys.settings.key as ActiveScene;
          if (key !== 'BootScene') {
            setActiveScene(key);
            break;
          }
        }
      }
    }

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
