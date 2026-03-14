export type EntityId = number;

export type ComponentType<T = unknown> = {
  readonly name: string;
  readonly _phantom?: T;
};

export interface World {
  createEntity(): EntityId;
  destroyEntity(id: EntityId): void;
  addComponent<T>(id: EntityId, type: ComponentType<T>, data: T): void;
  getComponent<T>(id: EntityId, type: ComponentType<T>): T | undefined;
  removeComponent<T>(id: EntityId, type: ComponentType<T>): void;
  query(...types: ComponentType[]): EntityId[];
}

export type System = (world: World, dt: number) => void;
