import type { ComponentType, EntityId } from '@grimoire/shared';

// Re-export shared ECS types for local use
export type { EntityId, ComponentType };
export type { World, System } from '@grimoire/shared';

/** Create a typed component type identifier */
export function defineComponent<T>(name: string): ComponentType<T> {
  return { name } as ComponentType<T>;
}
