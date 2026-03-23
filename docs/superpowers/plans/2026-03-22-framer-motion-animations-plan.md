# ABHS Framer Motion Animation System -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cinematic Framer Motion animations to all ABHS public pages --
full showstopper on desktop, reduced for mobile, disabled for prefers-reduced-motion.

**Architecture:** Animation as a separate layer using reusable motion components
that wrap existing content. Server components stay server components. Each page
imports thin client-side motion wrappers. A `useAnimationTier` hook controls
intensity: `"full"` (desktop), `"reduced"` (mobile), `"none"` (reduced motion).

**Tech Stack:** Framer Motion, React 19, Next.js 16 App Router, TypeScript,
Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-03-22-framer-motion-animations-design.md`

**Deferred (stretch goal):** Scroll velocity awareness (spec Section 3) is
out of scope for this plan. Implement after core animations ship if desired.

---

## File Structure

### New Files

- `src/hooks/useAnimationTier.ts` -- animation tier detection hook
- `src/hooks/useAnimationTier.test.ts` -- tier hook tests
- `src/hooks/useCursorPosition.ts` -- shared cursor tracking for florals
- `src/components/motion/motion-reveal.tsx` -- scroll-triggered reveal wrapper
- `src/components/motion/motion-parallax.tsx` -- scroll-progress parallax
- `src/components/motion/motion-floral.tsx` -- reactive SVG wrapper
- `src/components/motion/motion-page.tsx` -- per-page enter animation
- `src/components/motion/motion-gallery.tsx` -- gallery lightbox + depth
- `src/components/motion/index.ts` -- barrel export
- `src/components/decorative/floral-divider-animated.tsx` -- animation-ready
  divider SVG with fewer, longer paths

### Modified Files

- `package.json` -- add `framer-motion`
- `src/app/(public)/page.tsx` -- wrap hero, sections, cards with motion
- `src/app/(public)/gallery/page.tsx` -- wrap feed with MotionGallery
- `src/app/(public)/faq/page.tsx` -- AnimatePresence accordion, stagger
- `src/app/(public)/philosophy/page.tsx` -- section reveals, list staggers
- `src/app/(public)/about/page.tsx` -- chapter reveals, image curtains
- `src/app/(public)/newclientform/page.tsx` -- step transitions, field staggers
- `src/app/(public)/book/page.tsx` -- page enter animation
- `src/components/decorative/floral-accents.tsx` -- wrap with MotionFloral
- `src/components/layout/header.tsx` -- nav underline animation
- `src/components/layout/mobile-nav.tsx` -- animated drawer + stagger
- `src/components/layout/footer.tsx` -- link hover opacity
- `src/components/gallery/instagram-feed.tsx` -- hover effects, lightbox

### NOT Modified

- `src/app/(public)/layout.tsx` -- stays server component, no changes
- `src/app/globals.css` -- existing prefers-reduced-motion rules cover us
- All admin pages, API routes, database code, test files

---

## Task 1: Install Framer Motion + Create Animation Tier Hook

**Files:**

- Modify: `package.json`
- Create: `src/hooks/useAnimationTier.ts`
- Create: `src/hooks/useAnimationTier.test.ts`

- [ ] **Step 1: Install framer-motion**

```bash
cd /c/kar/abhs && pnpm add framer-motion
```

Verify no version conflicts with pinned Vite 6.3.5 / Vitest 4.0.18.

- [ ] **Step 2: Write failing tests for useAnimationTier**

Create `src/hooks/useAnimationTier.test.ts`:

```typescript
// @vitest-environment jsdom
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
    // Default to desktop viewport
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
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd /c/kar/abhs && npx vitest run src/hooks/useAnimationTier.test.ts
```

Expected: FAIL -- module not found.

- [ ] **Step 4: Implement useAnimationTier**

Create `src/hooks/useAnimationTier.ts`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

export type AnimationTier = 'full' | 'reduced' | 'none';

/**
 * Determines animation intensity based on device and user preferences.
 * - "full": desktop, all animations
 * - "reduced": mobile (<=768px), fast fades only
 * - "none": prefers-reduced-motion, no animations
 */
export function useAnimationTier(): AnimationTier {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion) return 'none';
  if (isMobile) return 'reduced';
  return 'full';
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /c/kar/abhs && npx vitest run src/hooks/useAnimationTier.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 6: Run full test suite to verify no regressions**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: 292+ tests PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/hooks/useAnimationTier.ts src/hooks/useAnimationTier.test.ts
git commit -m "feat: add framer-motion + useAnimationTier hook

Three-tier animation system: full (desktop), reduced (mobile), none (reduced motion).
Hook uses framer-motion useReducedMotion + matchMedia for viewport detection."
```

---

## Task 2: MotionReveal -- Scroll-Triggered Reveal Component

**Files:**

- Create: `src/components/motion/motion-reveal.tsx`

- [ ] **Step 1: Create MotionReveal component**

```typescript
'use client';

import { useRef } from 'react';
import {
  motion,
  useInView,
  type Variant,
} from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface MotionRevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  /** Distance in px for the slide */
  distance?: number;
  /** Stagger children by this delay (seconds) */
  stagger?: number;
  /** IntersectionObserver threshold (0-1) */
  threshold?: number;
  /** Only animate once */
  once?: boolean;
  className?: string;
}

const directionOffset: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export function MotionReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance,
  stagger = 0,
  threshold = 0.3,
  once = true,
  className,
}: MotionRevealProps) {
  const tier = useAnimationTier();
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  // No animation tier -- render children immediately
  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  const offset = directionOffset[direction];
  const dist = distance ?? Math.abs(offset.x || offset.y);
  const scale = dist / Math.abs(offset.x || offset.y || 1);

  const hidden: Variant = {
    opacity: 0,
    x: offset.x * scale,
    y: offset.y * scale,
  };

  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  // Reduced tier: faster, no directional slide
  const reducedDuration = tier === 'reduced' ? 0.3 : duration;
  const reducedDelay = tier === 'reduced' ? delay * 0.5 : delay;
  const effectiveDirection = tier === 'reduced' ? 'none' : direction;

  const containerVariants = {
    hidden: effectiveDirection === 'none' ? { opacity: 0 } : hidden,
    visible: {
      ...(effectiveDirection === 'none' ? { opacity: 1 } : visible),
      transition: {
        duration: reducedDuration,
        delay: reducedDelay,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: tier === 'reduced' ? 0 : stagger,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

/** Wrap individual children inside a MotionReveal with stagger */
export function MotionRevealChild({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const childVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create barrel export**

Create `src/components/motion/index.ts`:

```typescript
export { MotionReveal, MotionRevealChild } from './motion-reveal';
```

- [ ] **Step 3: Verify build compiles**

```bash
cd /c/kar/abhs && npx next build 2>&1 | tail -5
```

Expected: Build succeeds (component not used yet, but imports must resolve).

- [ ] **Step 4: Commit**

```bash
git add src/components/motion/
git commit -m "feat: add MotionReveal scroll-triggered reveal component

Supports direction, delay, duration, stagger, and threshold props.
Respects animation tier -- instant render for 'none', fast fade for 'reduced'."
```

---

## Task 3: MotionParallax -- Scroll-Progress Parallax Component

**Files:**

- Create: `src/components/motion/motion-parallax.tsx`
- Modify: `src/components/motion/index.ts`

- [ ] **Step 1: Create MotionParallax component**

```typescript
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface MotionParallaxProps {
  children: React.ReactNode;
  /** Parallax speed multiplier. 0.3 = moves at 30% scroll speed. Negative = opposite direction. */
  speed?: number;
  className?: string;
}

export function MotionParallax({
  children,
  speed = 0.3,
  className,
}: MotionParallaxProps) {
  const tier = useAnimationTier();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Convert scroll progress (0-1) to pixel offset
  // At speed 0.3, element moves 30% of its travel distance
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  if (tier !== 'full') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Update barrel export**

Add to `src/components/motion/index.ts`:

```typescript
export { MotionParallax } from './motion-parallax';
```

- [ ] **Step 3: Commit**

```bash
git add src/components/motion/
git commit -m "feat: add MotionParallax scroll-progress parallax component

Speed prop controls parallax intensity. Desktop only -- renders static on mobile/reduced."
```

---

## Task 4: MotionPage -- Per-Page Enter Animation

**Files:**

- Create: `src/components/motion/motion-page.tsx`
- Modify: `src/components/motion/index.ts`

- [ ] **Step 1: Create MotionPage component**

```typescript
'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAnimationTier } from '@/hooks/useAnimationTier';

type PageTransition = {
  initial: Record<string, number>;
  animate: Record<string, number>;
  transition: Record<string, unknown>;
};

const routeTransitions: Record<string, PageTransition> = {
  '/': {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  '/gallery': {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  '/philosophy': {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  '/faq': {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  '/newclientform': {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  '/book': {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  '/about': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const defaultTransition: PageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

interface MotionPageProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionPage({ children, className }: MotionPageProps) {
  const tier = useAnimationTier();
  const pathname = usePathname();

  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  // Mobile: simple fast fade on all routes
  if (tier === 'reduced') {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  // Desktop: route-specific transitions
  const config = routeTransitions[pathname] ?? defaultTransition;

  return (
    <motion.div
      className={className}
      initial={config.initial}
      animate={config.animate}
      transition={config.transition}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Update barrel export**

Add to `src/components/motion/index.ts`:

```typescript
export { MotionPage } from './motion-page';
```

- [ ] **Step 3: Commit**

```bash
git add src/components/motion/
git commit -m "feat: add MotionPage route-aware enter animation component

Route-specific transitions: homepage scales in, FAQ slides, form rises, about fades.
Mobile: simple 200ms fade. Reduced motion: no animation."
```

---

## Task 5: Cursor Position Hook + MotionFloral -- Reactive Botanicals

**Files:**

- Create: `src/hooks/useCursorPosition.ts`
- Create: `src/components/motion/motion-floral.tsx`
- Modify: `src/components/motion/index.ts`

- [ ] **Step 1: Create shared cursor position hook**

Create `src/hooks/useCursorPosition.ts`:

```typescript
'use client';

import { useEffect } from 'react';
import { motionValue, type MotionValue } from 'framer-motion';

// Module-level singleton -- one listener shared across all consumers
const cursorX = motionValue(0);
const cursorY = motionValue(0);
let listenerCount = 0;

function handleMouseMove(e: MouseEvent) {
  cursorX.set(e.clientX);
  cursorY.set(e.clientY);
}

/**
 * Shared cursor position using a single document-level mousemove listener.
 * Uses module-level singleton MotionValues -- no matter how many components
 * call this hook, only one mousemove listener exists.
 */
export function useCursorPosition(): { x: MotionValue<number>; y: MotionValue<number> } {
  useEffect(() => {
    listenerCount++;
    if (listenerCount === 1) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    return () => {
      listenerCount--;
      if (listenerCount === 0) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return { x: cursorX, y: cursorY };
}
```

- [ ] **Step 2: Create MotionFloral component**

Create `src/components/motion/motion-floral.tsx`:

```typescript
'use client';

import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useInView,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';
import { useCursorPosition } from '@/hooks/useCursorPosition';

interface MotionFloralProps {
  children: React.ReactNode;
  /** Enable SVG stroke draw-in animation */
  drawIn?: boolean;
  /** Draw-in duration in seconds */
  drawDuration?: number;
  /** Enable breathing micro-motion after reveal */
  breathing?: boolean;
  /** Enable cursor response (desktop only) */
  cursorResponse?: boolean;
  className?: string;
}

function useDistanceFromElement(
  ref: React.RefObject<HTMLElement | null>,
  cursorX: MotionValue<number>,
  cursorY: MotionValue<number>
) {
  const [distance, setDistance] = useState(Infinity);

  useEffect(() => {
    function update() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cursorX.get() - cx;
      const dy = cursorY.get() - cy;
      setDistance(Math.sqrt(dx * dx + dy * dy));
    }

    const unsubX = cursorX.on('change', update);
    const unsubY = cursorY.on('change', update);
    return () => {
      unsubX();
      unsubY();
    };
  }, [ref, cursorX, cursorY]);

  return distance;
}

export function MotionFloral({
  children,
  drawIn = true,
  drawDuration = 1.2,
  breathing = true,
  cursorResponse = true,
  className,
}: MotionFloralProps) {
  const tier = useAnimationTier();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const cursor = useCursorPosition();
  const distance = useDistanceFromElement(ref, cursor.x, cursor.y);

  // No animation: render children static
  if (tier === 'none') {
    return <div className={className}>{children}</div>;
  }

  // Mobile: simple fade-in
  if (tier === 'reduced') {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    );
  }

  // Desktop: full animation
  const isNear = cursorResponse && distance < 200;
  const cursorInfluence = isNear ? Math.max(0, 1 - distance / 200) : 0;

  // Cursor response overrides breathing when cursor is near
  const cursorRotate = cursorInfluence * 5;
  const cursorScale = 1 + cursorInfluence * 0.05;

  // When cursor is near, use cursor-driven rotation (spring physics).
  // When cursor is far, use breathing keyframe animation.
  // The two are mutually exclusive -- cursor takes priority.
  const animateProps = isInView
    ? isNear
      ? {
          opacity: 1,
          rotate: cursorRotate,
          scale: cursorScale,
        }
      : breathing
        ? {
            opacity: 1,
            rotate: [0, 1.5, 0, -1.5, 0],
            scale: 1,
          }
        : { opacity: 1 }
    : { opacity: 0 };

  const transitionProps = isNear
    ? {
        opacity: { duration: 0.6 },
        rotate: { type: 'spring' as const, damping: 20, stiffness: 150 },
        scale: { type: 'spring' as const, damping: 20, stiffness: 150 },
      }
    : breathing
      ? {
          opacity: { duration: 0.6 },
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut' as const,
            delay: drawDuration,
          },
        }
      : { opacity: { duration: 0.6 } };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={animateProps}
      transition={transitionProps}
      style={{ willChange: breathing ? 'transform' : undefined }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Update barrel export**

Add to `src/components/motion/index.ts`:

```typescript
export { MotionFloral } from './motion-floral';
```

- [ ] **Step 4: Run full test suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: All tests PASS (no existing code modified yet).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCursorPosition.ts src/components/motion/
git commit -m "feat: add MotionFloral reactive SVG wrapper + cursor tracking hook

Three phases: draw-in on reveal, breathing micro-motion, cursor response.
Single document-level mousemove listener shared across all floral instances."
```

---

## Task 6: Animated Floral Divider SVG

**Files:**

- Create: `src/components/decorative/floral-divider-animated.tsx`

- [ ] **Step 1: Create animation-ready floral divider**

The existing FloralDivider has 30+ short disconnected strokes. Create a simplified
version with fewer, longer continuous paths that support stroke-dashoffset animation.

Create `src/components/decorative/floral-divider-animated.tsx`:

```typescript
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface AnimatedDividerProps {
  className?: string;
}

/**
 * Animation-ready botanical vine divider. Simplified paths (fewer, longer strokes)
 * for smooth strokeDashoffset animation tied to scroll position.
 * Visual appearance matches the original FloralDivider.
 */
export function FloralDividerAnimated({ className = '' }: AnimatedDividerProps) {
  const tier = useAnimationTier();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress to stroke draw -- all hooks at top level
  const vineOffset = useTransform(scrollYProgress, [0.2, 0.7], [600, 0]);
  const leafOffset = useTransform(scrollYProgress, [0.3, 0.6], [40, 0]);
  const bloomOffset = useTransform(scrollYProgress, [0.35, 0.55], [32, 0]);
  const petalOffset = useTransform(scrollYProgress, [0.4, 0.6], [80, 0]);

  if (tier === 'none') {
    // Fallback: render the original static divider style
    return (
      <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
        <div className="h-px flex-1 bg-current opacity-30" />
        <svg viewBox="0 0 600 40" fill="none" className="w-full max-w-2xl h-10 shrink-0" aria-hidden="true">
          <path d="M0 20 Q75 20 120 14 Q160 8 200 14 Q240 20 300 20 Q360 20 400 14 Q440 8 480 14 Q525 20 600 20" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="300" cy="20" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M300 13 Q298 16 300 20 Q302 16 300 13z" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
          <path d="M300 27 Q302 24 300 20 Q298 24 300 27z" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
        </svg>
        <div className="h-px flex-1 bg-current opacity-30" />
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <div className="h-px flex-1 bg-current opacity-30" />
      <svg viewBox="0 0 600 40" fill="none" className="w-full max-w-2xl h-10 shrink-0" aria-hidden="true">
        {/* Main vine -- single continuous path */}
        <motion.path
          d="M0 20 Q75 20 120 14 Q160 8 200 14 Q240 20 300 20 Q360 20 400 14 Q440 8 480 14 Q525 20 600 20"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
          fill="none"
          strokeDasharray={600}
          style={tier === 'full' ? { strokeDashoffset: vineOffset } : undefined}
          initial={tier === 'reduced' ? { opacity: 0 } : undefined}
          animate={tier === 'reduced' ? { opacity: 0.4 } : undefined}
          transition={tier === 'reduced' ? { duration: 0.5 } : undefined}
        />
        {/* Left leaf */}
        <motion.path
          d="M150 14 Q145 6 155 3 Q160 9 150 14z"
          stroke="currentColor"
          strokeWidth="0.7"
          fill="none"
          opacity="0.3"
          strokeDasharray={40}
          style={tier === 'full' ? { strokeDashoffset: leafOffset } : undefined}
        />
        {/* Right leaf */}
        <motion.path
          d="M450 14 Q455 6 445 3 Q440 9 450 14z"
          stroke="currentColor"
          strokeWidth="0.7"
          fill="none"
          opacity="0.3"
          strokeDasharray={40}
          style={tier === 'full' ? { strokeDashoffset: leafOffset } : undefined}
        />
        {/* Center bloom */}
        <motion.circle
          cx="300" cy="20" r="5"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
          strokeDasharray={32}
          style={tier === 'full' ? { strokeDashoffset: bloomOffset } : undefined}
        />
        {/* Center petals */}
        <motion.path
          d="M300 13 Q298 16 300 20 Q302 16 300 13z M300 27 Q302 24 300 20 Q298 24 300 27z M293 20 Q296 18 300 20 Q296 22 293 20z M307 20 Q304 22 300 20 Q304 18 307 20z"
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
          opacity="0.4"
          strokeDasharray={80}
          style={tier === 'full' ? { strokeDashoffset: petalOffset } : undefined}
        />
      </svg>
      <div className="h-px flex-1 bg-current opacity-30" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/decorative/floral-divider-animated.tsx
git commit -m "feat: add animation-ready FloralDividerAnimated component

Simplified SVG paths for smooth scroll-linked strokeDashoffset draw-in.
Falls back to static render for 'none' tier, fade-in for 'reduced'."
```

---

## Task 7: Homepage Animations

**Files:**

- Modify: `src/app/(public)/page.tsx`

This is the main event -- the hero entrance, section reveals, card staggers, and
parallax on the homepage. The page is currently a server component. We need to
extract the animated sections into client component wrappers while keeping the
page itself as a server component.

- [ ] **Step 1: Add imports and wrap hero section**

In `src/app/(public)/page.tsx`, add motion imports at top and wrap sections.
The page stays a server component -- motion wrappers are client components
that receive server-rendered children.

Add to imports:

```typescript
import { MotionReveal, MotionRevealChild } from '@/components/motion';
import { MotionParallax } from '@/components/motion';
import { MotionPage } from '@/components/motion';
import { MotionFloral } from '@/components/motion';
import { FloralDividerAnimated } from '@/components/decorative/floral-divider-animated';
```

Wrap the entire page content in `<MotionPage>`.

Wrap the hero `<section>` content (the `<div className="relative mx-auto...">`)
with `<MotionReveal>` and individual elements with `<MotionRevealChild>`.

Add `sessionStorage` guard so hero entrance only plays once per session:

```typescript
const [heroPlayed, setHeroPlayed] = useState(() => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('abhs-hero-played') === 'true';
});
useEffect(() => {
  if (!heroPlayed) sessionStorage.setItem('abhs-hero-played', 'true');
}, [heroPlayed]);
```

If `heroPlayed` is true, skip the hero orchestration (render content visible).
This requires extracting the hero into a client component (`HeroSection`).

Replace `<FloralDivider className="py-6 text-forest-500" />` with
`<FloralDividerAnimated className="py-6 text-forest-500" />`.

Wrap Karli's portrait with a **curtain reveal** (not a directional slide):

```typescript
<div className="relative overflow-hidden">
  <motion.div
    className="absolute inset-0 bg-warm-100 z-10"
    initial={{ scaleY: 1 }}
    animate={isInView ? { scaleY: 0 } : { scaleY: 1 }}
    transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
    style={{ transformOrigin: 'top' }}
  />
  <Image ... />
</div>
```

Wrap the text column with `<MotionReveal direction="right" delay={0.2}>`.

Animate the blockquote border draw-down:

```typescript
<motion.div
  className="border-l-2 border-copper-400"
  initial={{ scaleY: 0 }}
  animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
  style={{ transformOrigin: 'top' }}
>
  <MotionReveal direction="left" delay={0.3}>
    <blockquote>...</blockquote>
  </MotionReveal>
</motion.div>
```

Wrap each of the 3 "What Makes This Different" cards with `<MotionRevealChild>`,
inside a parent `<MotionReveal stagger={0.15}>`. Add copper accent bar animation
to each card:

```typescript
<motion.div
  className="h-0.5 w-8 bg-copper-500 rounded-full"
  initial={{ scaleX: 0 }}
  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
  transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
  style={{ transformOrigin: 'left' }}
/>
```

Wrap the final CTA section content with `<MotionReveal>`.

Add background tone shift overlay on the quote section:

```typescript
<motion.div
  className="absolute inset-0 bg-blush-50 pointer-events-none"
  style={{ opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 0.3, 0]) }}
/>
```

Wrap FloralBloom instances with `<MotionFloral>`.
Wrap FloralCorner instances with `<MotionFloral breathing cursorResponse>`.

Wrap background images with `<MotionParallax speed={0.3}>`.

- [ ] **Step 2: Start dev server and visually verify**

```bash
cd /c/kar/abhs && pnpm dev
```

Open `http://localhost:3001` in browser. Verify:

- Hero content cascades in on page load
- Scroll down: "Person Behind the Chair" reveals
- Cards stagger in with copper accent bars
- Floral divider draws itself as you scroll
- Final CTA fades in
- FloralCorner breathes and responds to cursor (desktop)
- On mobile viewport: fast fades only, no parallax

- [ ] **Step 3: Run full test suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/page.tsx
git commit -m "feat: add cinematic animations to homepage

Hero entrance orchestration, scroll-triggered section reveals, card stagger,
parallax backgrounds, reactive florals, animated divider. Mobile: fast fades."
```

---

## Task 8: FAQ Page -- Animated Accordion

**Files:**

- Modify: `src/app/(public)/faq/page.tsx`

- [ ] **Step 1: Restructure FaqItem for smooth height animation**

The current FaqItem uses `{isOpen && (...)}` conditional render. Change to
always-rendered content with AnimatePresence height animation.

Add imports:

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { MotionReveal, MotionPage } from '@/components/motion';
import { MotionFloral } from '@/components/motion';
```

Replace the answer section in FaqItem (the `{isOpen && (` block) with:

```typescript
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3, delay: isOpen ? 0.1 : 0 },
      }}
      className="overflow-hidden"
    >
      <p className="pb-5 text-warm-500 leading-relaxed">
        {answer}
      </p>
    </motion.div>
  )}
</AnimatePresence>
```

Replace chevron rotation with spring:

```typescript
<motion.div
  animate={{ rotate: isOpen ? 180 : 0 }}
  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
>
  <ChevronDown size={18} className="text-copper-500" />
</motion.div>
```

Wrap FAQ list items with `<MotionReveal stagger={0.08}>` and each FaqItem
with `<MotionRevealChild>`.

Wrap page with `<MotionPage>`.

- [ ] **Step 2: Visually verify on dev server**

Open `http://localhost:3001/faq`. Verify:

- FAQ items stagger in on page load
- Clicking opens with smooth height animation
- Text fades in after panel opens
- Chevron rotates with spring physics
- Only one panel open at a time

- [ ] **Step 3: Run tests**

```bash
cd /c/kar/abhs && npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/faq/page.tsx
git commit -m "feat: add animated FAQ accordion with spring chevron

Smooth height animation via AnimatePresence, text fade-in after open,
spring chevron rotation, staggered FAQ item reveals on scroll."
```

---

## Task 9: Philosophy Page -- Section Reveals + List Staggers

**Files:**

- Modify: `src/app/(public)/philosophy/page.tsx`

- [ ] **Step 1: Wrap sections with MotionReveal**

Add imports for `MotionReveal`, `MotionRevealChild`, `MotionPage`, `MotionFloral`,
`FloralDividerAnimated`.

Wrap page content in `<MotionPage>`.

Wrap each major section (title, "What Is Intentional Hair", "Why It Matters",
"How It Works", pull quote, CTA) with `<MotionReveal>`.

Wrap each bullet list item (sage dots, copper bullets) with `<MotionRevealChild>`
inside a `<MotionReveal stagger={0.1}>`.

Wrap pull quote with `<MotionReveal direction="left">`.

Replace FloralDividers with `<FloralDividerAnimated>`.
Wrap FloralBlooms with `<MotionFloral>`.
Wrap FloralCorners with `<MotionFloral breathing cursorResponse>`.

- [ ] **Step 2: Visually verify**

Open `http://localhost:3001/philosophy`. Verify sections reveal on scroll,
bullet lists stagger in, pull quote slides from left.

- [ ] **Step 3: Run tests + commit**

```bash
cd /c/kar/abhs && npx vitest run
git add src/app/\(public\)/philosophy/page.tsx
git commit -m "feat: add scroll reveals to philosophy page

Section fade-ups, staggered bullet lists, pull quote slide-in,
animated floral dividers and reactive floral accents."
```

---

## Task 10: About Page -- Chapter Reveals + Image Curtains

**Files:**

- Modify: `src/app/(public)/about/page.tsx`

- [ ] **Step 1: Add chapter reveals and image curtain**

Add motion imports. Wrap page in `<MotionPage>` with the about-specific
curtain transition.

Wrap each chapter section with `<MotionReveal>`.

For the photo grid (3 images), use `<MotionReveal stagger={0.15}>` parent
with `<MotionRevealChild>` on each image container.

Add a curtain reveal on images: wrap each `<Image>` in a container with
a `<motion.div>` overlay that animates `scaleY` from 1 to 0:

```typescript
<div className="relative overflow-hidden rounded-2xl">
  <motion.div
    className="absolute inset-0 bg-warm-100 z-10"
    initial={{ scaleY: 1 }}
    animate={isInView ? { scaleY: 0 } : { scaleY: 1 }}
    transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
    style={{ transformOrigin: 'top' }}
  />
  <Image ... />
</div>
```

Replace FloralDividers with `<FloralDividerAnimated>`.

- [ ] **Step 2: Visually verify + test + commit**

```bash
cd /c/kar/abhs && npx vitest run
git add src/app/\(public\)/about/page.tsx
git commit -m "feat: add chapter reveals and image curtains to about page

Each chapter fades in on scroll, photo grid staggers with curtain reveal overlay,
animated floral dividers between sections."
```

---

## Task 11: Book Page + New Client Form -- Page Transitions + Form Polish

**Files:**

- Modify: `src/app/(public)/book/page.tsx`
- Modify: `src/app/(public)/newclientform/page.tsx`

- [ ] **Step 1: Book page -- simple page enter**

Add `MotionPage` and `MotionFloral` imports. Wrap page content in `<MotionPage>`.
Wrap FloralBloom with `<MotionFloral>`.

- [ ] **Step 2: New client form -- step transitions**

Add imports for `motion`, `AnimatePresence`, `MotionPage`.

Wrap the entire form in `<MotionPage>`.

Wrap the step content area with `<AnimatePresence mode="wait">`. Key each
`{step === N && (...)}` block on the step number. Replace conditional render
with:

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    {step === 1 && (...)}
    {step === 2 && (...)}
    {/* etc */}
  </motion.div>
</AnimatePresence>
```

Note: the `key={step}` on the motion.div triggers the AnimatePresence cycle.
Each step block still uses conditional render inside, but the wrapper handles
the animation.

Animate the progress bar width with `motion.div`:

```typescript
<motion.div
  className="h-1 bg-forest-400 rounded-full"
  animate={{ width: `${(step / totalSteps) * 100}%` }}
  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
/>
```

Add validation shake on error fields:

```typescript
<motion.div
  animate={errors[fieldName] ? { x: [0, -3, 3, -3, 3, 0] } : { x: 0 }}
  transition={{ duration: 0.4 }}
>
  {/* existing input field */}
</motion.div>
```

Add photo upload animations: drop zone pulse on dragover via
`animate={{ scale: [1, 1.02, 1] }}` with `repeat: Infinity` while dragging.
Uploaded photo thumbnails pop in with `initial={{ scale: 0 }}` and
`animate={{ scale: 1 }}` using spring physics.

Add submit button feedback: while `status === 'sending'`, show a subtle
`animate={{ opacity: [1, 0.7, 1] }}` pulse. On success, morph the button
text to a checkmark icon using `AnimatePresence mode="wait"`.

- [ ] **Step 3: Visually verify both pages + test + commit**

```bash
cd /c/kar/abhs && npx vitest run
git add src/app/\(public\)/book/page.tsx src/app/\(public\)/newclientform/page.tsx
git commit -m "feat: add page enter animations + form step transitions

Book page rises in. New client form: step transitions with slide left/right,
spring-animated progress bar, AnimatePresence mode=wait for smooth swaps."
```

---

## Task 12: Gallery -- Immersive Feed + Shared-Element Lightbox

**Files:**

- Modify: `src/app/(public)/gallery/page.tsx`
- Modify: `src/components/gallery/instagram-feed.tsx`
- Create: `src/components/motion/motion-gallery.tsx`
- Modify: `src/components/motion/index.ts`

- [ ] **Step 1: Create MotionGallery lightbox component**

Create `src/components/motion/motion-gallery.tsx`:

```typescript
'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnimationTier } from '@/hooks/useAnimationTier';

interface GalleryItem {
  id: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  caption?: string;
  permalink: string;
}

interface MotionGalleryLightboxProps {
  items: GalleryItem[];
  selectedId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function MotionGalleryLightbox({
  items,
  selectedId,
  onClose,
  onNavigate,
}: MotionGalleryLightboxProps) {
  const tier = useAnimationTier();
  const selectedIndex = items.findIndex((i) => i.id === selectedId);
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  const goNext = useCallback(() => {
    if (selectedIndex < items.length - 1) {
      onNavigate(items[selectedIndex + 1].id);
    }
  }, [selectedIndex, items, onNavigate]);

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) {
      onNavigate(items[selectedIndex - 1].id);
    }
  }, [selectedIndex, items, onNavigate]);

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    if (!selectedId) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }

    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [selectedId, onClose, goNext, goPrev]);

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-warm-800/85"
            onClick={onClose}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          {selectedIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-4 z-10 p-2 text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {selectedIndex < items.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-4 z-10 p-2 text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Content */}
          <motion.div
            key={selected.id}
            layoutId={tier === 'full' ? `gallery-${selected.id}` : undefined}
            className="relative z-10 max-w-[90vw] max-h-[85vh]"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {selected.media_type === 'VIDEO' ? (
              <video
                src={selected.media_url}
                className="max-w-full max-h-[85vh] rounded-lg"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={selected.media_url}
                alt={selected.caption || 'Gallery image'}
                className="max-w-full max-h-[85vh] rounded-lg object-contain"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Enhance InstagramFeed with hover effects + lightbox**

In `src/components/gallery/instagram-feed.tsx`:

Add imports for `motion`, `MotionGalleryLightbox`, `useAnimationTier`.

Add state: `const [selectedId, setSelectedId] = useState<string | null>(null);`

Wrap each ImageCard with `<motion.div layoutId={\`gallery-${post.id}\`}>` for the
shared-element transition.

Add hover effects to ImageCard: replace existing hover classes with Framer Motion
`whileHover={{ y: -4, scale: 1.02 }}` with spring transition.

Add neighbor dimming: when any image is hovered, other images get `opacity: 0.85`.

Render `<MotionGalleryLightbox>` at the bottom of the feed.

For staggered entrance on initial load, wrap the masonry container items with
`<motion.div>` using `initial={{ opacity: 0, scale: 0.9 }}` and
`animate={{ opacity: 1, scale: 1 }}` with a stagger based on index.

Add parallax depth lanes (desktop only, images not videos): wrap each image
item in `<MotionParallax>` with alternating speeds based on column index.
Odd-column items: `speed={-0.02}`. Even-column items: `speed={0.02}`.
This creates subtle dimensional separation. Skip videos (their existing
IntersectionObserver for autoplay would conflict with parallax).

- [ ] **Step 3: Wrap gallery page**

In `src/app/(public)/gallery/page.tsx`, add `MotionPage` and `MotionReveal` imports.
Wrap header section with `<MotionReveal>`.

- [ ] **Step 4: Visually verify gallery**

Open `http://localhost:3001/gallery`. Verify:

- Images cascade in with stagger on load
- Hover: image lifts, neighbors dim
- Click: shared-element transition to lightbox (desktop)
- Arrow keys navigate in lightbox
- Escape closes
- Mobile: tap opens standard lightbox (no shared-element morph)

- [ ] **Step 5: Run tests + commit**

```bash
cd /c/kar/abhs && npx vitest run
git add src/components/motion/ src/components/gallery/ src/app/\(public\)/gallery/
git commit -m "feat: add immersive gallery with shared-element lightbox

Staggered image cascade, hover lift with neighbor dimming, layoutId shared-element
transition to fullscreen lightbox, keyboard navigation, video support."
```

---

## Task 13: Header + Mobile Nav + Footer Animations

**Files:**

- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/mobile-nav.tsx`
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Header -- nav link underline animation**

In `header.tsx`, add `motion` import. Replace desktop nav link hover
effect with an animated underline. For each nav link, add an underline
`<motion.span>` that scales in from left on hover:

```typescript
<motion.span
  className="absolute bottom-0 left-0 right-0 h-0.5 bg-copper-500 origin-left"
  initial={{ scaleX: 0 }}
  whileHover={{ scaleX: 1 }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
/>
```

Add active page indicator: if `pathname === link.href`, render the underline
at `scaleX: 1` permanently.

- [ ] **Step 2: Mobile nav -- animated drawer + link stagger**

In `mobile-nav.tsx`, replace the conditional render with `AnimatePresence`.
Animate the overlay fade and drawer slide:

```typescript
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        className="fixed inset-0 bg-warm-800/20 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.nav
        className="fixed top-16 left-0 right-0 bg-white shadow-lg z-50"
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {links.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            {/* existing link content */}
          </motion.div>
        ))}
      </motion.nav>
    </>
  )}
</AnimatePresence>
```

- [ ] **Step 3: Footer -- minimal link hover**

In `footer.tsx`, this is a server component. Add subtle CSS-only hover opacity
to footer links (no Framer Motion needed -- server component stays server):

Add `hover:opacity-80 transition-opacity` to footer link classes if not already present.

- [ ] **Step 4: Visually verify all three + test + commit**

```bash
cd /c/kar/abhs && npx vitest run
git add src/components/layout/
git commit -m "feat: add header underline, mobile nav slide, footer hover

Desktop nav links get animated copper underline on hover with active indicator.
Mobile nav slides down with staggered link entrance. Footer links get hover opacity."
```

---

## Task 14: Button Micro-interactions

**Files:**

- Modify: `src/app/(public)/page.tsx`
- Modify: (any page with CTA buttons)

- [ ] **Step 1: Add spring hover/press to CTA buttons**

For each CTA button (Link component) on the homepage and other pages, wrap with
`motion.div` or use `motion(Link)`:

```typescript
<motion.div
  whileHover={{ y: -3, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
>
  <Link href="/newclientform" className="...existing classes...">
    New Here? Let's Talk
  </Link>
</motion.div>
```

Apply to all forest-green primary CTAs and ghost secondary CTAs across public pages.

- [ ] **Step 2: Visually verify buttons have spring physics on hover/press**

- [ ] **Step 3: Run tests + commit**

```bash
cd /c/kar/abhs && npx vitest run
git add src/app/\(public\)/
git commit -m "feat: add spring micro-interactions to CTA buttons

Hover lift with shadow expansion, press compress, spring physics on all
public page CTAs. Works on both desktop hover and mobile tap."
```

---

## Task 15: Floral Scale Enhancement + Vine Extensions

**Files:**

- Modify: `src/components/decorative/floral-accents.tsx`
- Modify: all public page files (size class updates)

- [ ] **Step 1: Scale up floral sizes across all pages**

Update Tailwind size classes on every floral instance:

**Homepage (`page.tsx`):**

- Hero FloralBloom: `w-8 h-8` -> `w-12 h-12` (largest, hero emphasis)
- Hero FloralCorner: `w-28 h-28 sm:w-36 sm:h-36` -> `w-40 h-40 sm:w-48 sm:h-48`
- Section FloralBloom: `w-6 h-6` -> `w-10 h-10`
- CTA FloralBloom: `w-8 h-8` -> `w-12 h-12`

**Philosophy page:**

- Title FloralBloom: `w-8 h-8` -> `w-12 h-12`
- Section FloralBlooms: vary between `w-8 h-8` and `w-10 h-10`
- FloralCorners: increase by one step (e.g., `w-20 h-20` -> `w-28 h-28`)

**FAQ page:**

- FloralBlooms: `w-8 h-8` -> `w-10 h-10`
- FloralCorners: increase one step each

**About page:**

- Title FloralBloom: `w-8 h-8` -> `w-12 h-12`

- [ ] **Step 2: Add vine extension to FloralCorner**

In `src/components/decorative/floral-accents.tsx`, add an optional `withVines`
prop to FloralCorner that renders additional trailing stems extending beyond
the corner arrangement:

```typescript
interface AccentProps {
  className?: string;
  withVines?: boolean;
}
```

When `withVines` is true, add extra SVG paths extending outward from the
existing branches -- longer trailing stems with small leaves that reach
further into the content area. This creates organic flowing decoration
without touching the existing SVG structure.

Apply `withVines` to hero and CTA FloralCorner instances.

- [ ] **Step 3: Add bloom-in scale to MotionFloral**

Update `MotionFloral` to include a scale-up on reveal:

```typescript
initial={{ opacity: 0, scale: 0.6 }}
animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
```

This makes flowers "bloom" into their full size on scroll reveal.

- [ ] **Step 4: Verify all floral instances are wrapped and sized**

Check every public page:

- Homepage: FloralBloom (x3), FloralCorner (x2), FloralDivider (x1 animated)
- FAQ: FloralBloom (x3), FloralCorner (x3), FloralDivider (x1)
- Philosophy: FloralBloom (x4), FloralCorner (x4), FloralDivider (x3)
- About: FloralBloom (x1), FloralDivider (x6)

Any FloralDivider instances not yet replaced with `<FloralDividerAnimated>`
should be swapped now.

- [ ] **Step 2: Run full test suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 3: Commit if any changes**

```bash
git add src/app/\(public\)/ src/components/decorative/
git commit -m "feat: complete floral animation integration across all pages

All FloralBloom/FloralCorner instances wrapped with MotionFloral for breathing
and cursor response. All FloralDividers replaced with animated scroll-draw variant."
```

---

## Task 16: Final Verification + Build Check

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: 292+ tests PASS (plus new useAnimationTier tests).

- [ ] **Step 2: Run production build**

```bash
cd /c/kar/abhs && npx next build
```

Expected: Build succeeds. Note the bundle size increase from framer-motion.
Report actual size in commit message.

- [ ] **Step 3: Visual verification across all pages**

Start dev server and verify each page:

- `/` -- Hero entrance, parallax, card stagger, floral breathing, cursor response
- `/gallery` -- Image cascade, hover lift/dim, lightbox shared-element
- `/faq` -- Item stagger, smooth accordion, spring chevron
- `/philosophy` -- Section reveals, list staggers, pull quote
- `/about` -- Chapter reveals, image curtains
- `/newclientform` -- Step slide transitions, spring progress bar
- `/book` -- Page enter animation

Test on mobile viewport (Chrome DevTools): fast fades only, no parallax.
Test with `prefers-reduced-motion`: no animations at all.

- [ ] **Step 4: Final commit with build stats**

Stage only the files we created/modified (not untracked scratch files):

```bash
git add src/components/motion/ src/hooks/ src/components/decorative/ \
  src/app/\(public\)/ src/components/layout/ src/components/gallery/ \
  package.json pnpm-lock.yaml
git commit -m "feat: complete ABHS Framer Motion animation system

16 tasks implemented: animation tier hook, 5 motion components, animated divider,
7 page integrations, lightbox, header/nav/footer polish, button micro-interactions.
Full showstopper on desktop, reduced for mobile, disabled for prefers-reduced-motion.
Build size: [report actual delta here]."
```
