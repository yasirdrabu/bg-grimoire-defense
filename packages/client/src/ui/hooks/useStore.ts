import { useSyncExternalStore } from 'preact/compat';
import type { StoreApi } from 'zustand/vanilla';

export function useStore<T, S>(store: StoreApi<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
  );
}
