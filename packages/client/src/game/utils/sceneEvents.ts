/**
 * Emits a custom event so the Preact overlay knows which Phaser scene is active.
 */
export function emitSceneChange(scene: string): void {
  window.dispatchEvent(
    new CustomEvent('phaser:sceneChange', { detail: { scene } }),
  );
}
