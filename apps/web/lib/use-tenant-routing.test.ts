import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTenantRouting } from './use-tenant-routing';
import * as React from 'react';
import * as navigation from 'next/navigation';

// A simple mock for React hooks to simulate re-renders
vi.mock('react', () => {
  let cache: any[] = [];
  let index = 0;
  return {
    useMemo: (fn: any, deps: any[]) => {
      const cached = cache[index];
      if (cached && JSON.stringify(cached.deps) === JSON.stringify(deps)) {
        index++;
        return cached.val;
      }
      const val = fn();
      cache[index] = { deps, val };
      index++;
      return val;
    },
    useCallback: (fn: any, deps: any[]) => {
      const cached = cache[index];
      if (cached && JSON.stringify(cached.deps) === JSON.stringify(deps)) {
        index++;
        return cached.val;
      }
      cache[index] = { deps, val: fn };
      index++;
      return fn;
    },
    _reset: () => {
      cache = [];
      index = 0;
    },
    _nextRender: () => {
      index = 0;
    }
  };
});

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe('useTenantRouting', () => {
  beforeEach(() => {
    (React as any)._reset();
    vi.mocked(navigation.usePathname).mockReturnValue('/foo');
    vi.mocked(navigation.useRouter).mockReturnValue({ push: vi.fn() } as any);
  });

  it('returns a stable reference across renders if dependencies do not change', () => {
    const result1 = useTenantRouting('foo');
    (React as any)._nextRender();
    const result2 = useTenantRouting('foo');

    // This should pass if useTenantRouting is correctly memoized. 
    // Currently, it returns a new object literal every time, causing infinite loops in useEffects that depend on it.
    expect(result1).toBe(result2);
  });
});
