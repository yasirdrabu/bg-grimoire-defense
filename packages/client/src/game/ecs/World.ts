import type { EntityId, ComponentType, World } from '@grimoire/shared';

export class GameWorld implements World {
  private nextId: EntityId = 1;
  private readonly stores = new Map<string, Map<EntityId, unknown>>();
  private readonly entityComponents = new Map<EntityId, Set<string>>();

  createEntity(): EntityId {
    const id = this.nextId++;
    this.entityComponents.set(id, new Set());
    return id;
  }

  destroyEntity(id: EntityId): void {
    const componentNames = this.entityComponents.get(id);
    if (!componentNames) return;

    for (const name of componentNames) {
      const store = this.stores.get(name);
      if (store) store.delete(id);
    }
    this.entityComponents.delete(id);
  }

  addComponent<T>(id: EntityId, type: ComponentType<T>, data: T): void {
    let store = this.stores.get(type.name);
    if (!store) {
      store = new Map<EntityId, unknown>();
      this.stores.set(type.name, store);
    }
    store.set(id, data);

    const components = this.entityComponents.get(id);
    if (components) components.add(type.name);
  }

  getComponent<T>(id: EntityId, type: ComponentType<T>): T | undefined {
    const store = this.stores.get(type.name);
    if (!store) return undefined;
    return store.get(id) as T | undefined;
  }

  removeComponent<T>(id: EntityId, type: ComponentType<T>): void {
    const store = this.stores.get(type.name);
    if (store) store.delete(id);

    const components = this.entityComponents.get(id);
    if (components) components.delete(type.name);
  }

  query(...types: ComponentType[]): EntityId[] {
    if (types.length === 0) return [];

    // Start with the smallest store for efficiency
    let smallestStore: Map<EntityId, unknown> | undefined;
    let smallestSize = Infinity;

    for (const type of types) {
      const store = this.stores.get(type.name);
      if (!store || store.size === 0) return [];
      if (store.size < smallestSize) {
        smallestSize = store.size;
        smallestStore = store;
      }
    }

    if (!smallestStore) return [];

    const result: EntityId[] = [];
    for (const id of smallestStore.keys()) {
      let hasAll = true;
      for (const type of types) {
        const store = this.stores.get(type.name);
        if (!store || !store.has(id)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) result.push(id);
    }

    return result;
  }
}
