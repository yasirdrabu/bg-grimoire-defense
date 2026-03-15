import { describe, it, expect } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { renderHook, act } from '@testing-library/preact';
import { useStore } from '../hooks/useStore';

describe('useStore', () => {
  it('reads initial state via selector', () => {
    const store = createStore<{ count: number }>(() => ({ count: 42 }));
    const { result } = renderHook(() => useStore(store, (s) => s.count));
    expect(result.current).toBe(42);
  });

  it('re-renders when selected state changes', () => {
    const store = createStore<{ count: number; unrelated: string }>(() => ({
      count: 0,
      unrelated: 'hello',
    }));
    const { result } = renderHook(() => useStore(store, (s) => s.count));
    expect(result.current).toBe(0);
    act(() => { store.setState({ count: 5 }); });
    expect(result.current).toBe(5);
  });
});
