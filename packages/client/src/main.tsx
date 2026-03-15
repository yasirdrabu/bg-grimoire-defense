import Phaser from 'phaser';
import { render } from 'preact';
import { gameConfig } from './game/config';
import { App } from './ui/App';

// Boot Phaser game
const game = new Phaser.Game(gameConfig);

// Mount Preact UI overlay
const uiRoot = document.getElementById('ui-overlay');
if (uiRoot) {
  render(<App />, uiRoot);
}

export { game };
