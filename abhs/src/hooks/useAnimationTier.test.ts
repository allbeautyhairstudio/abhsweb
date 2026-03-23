// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnimationTier } from './useAnimationTier';

// Mock framer-motion's useReducedMotion
vi.mock('framer-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useReducedMotion } from 'framer-motion';

describe('useAnimationTier', () => {
  const mockedUseReducedMotion = vi.mocked(useReducedMotion);

  beforeEach(() => {
    mockedUseReducedMotion.mockReturnValue(false);
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 768px)' ? false : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "full" on desktop with no motion preference', () => {
    const { result } = renderHook(() => useAnimationTier());
    expect(result.current).toBe('full');
  });

  it('returns "none" when prefers-reduced-motion is active', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    const { result } = renderHook(() => useAnimationTier());
    expect(result.current).toBe('none');
  });

  it('returns "reduced" on mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 768px)' ? true : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    const { result } = renderHook(() => useAnimationTier());
    expect(result.current).toBe('reduced');
  });

  it('"none" takes priority over mobile viewport', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 768px)' ? true : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    const { result } = renderHook(() => useAnimationTier());
    expect(result.current).toBe('none');
  });
});
