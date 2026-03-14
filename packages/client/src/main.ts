import Phaser from 'phaser';
import { gameConfig } from './game/config';

// Boot Phaser game
const game = new Phaser.Game(gameConfig);

// Preact UI overlay will be mounted here in a future task
// const uiRoot = document.getElementById('ui-overlay');

export { game };
