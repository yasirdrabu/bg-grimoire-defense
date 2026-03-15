import './hud.css';
import { TopBar } from './hud/TopBar';
import { BottomBar } from './hud/BottomBar';

export function App() {
  return (
    <div id="hud-root">
      <TopBar />
      <BottomBar />
    </div>
  );
}
