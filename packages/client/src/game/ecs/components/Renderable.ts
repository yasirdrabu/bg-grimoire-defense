import { defineComponent } from '../types';

export interface RenderableData {
  spriteKey: string;
  sprite?: unknown; // Phaser.GameObjects.Sprite — typed as unknown to keep ECS Phaser-free in tests
  visible: boolean;
}

export const RenderableComponent = defineComponent<RenderableData>('Renderable');
