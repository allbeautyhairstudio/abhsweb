# Design Spec: ABHS Framer Motion Animation System

> **Status:** Approved (brainstorming complete)
> **Date:** 2026-03-22
> **Scope:** Add cinematic animations to ALL public pages using Framer Motion.
> No structural changes to existing pages -- animation is an additive layer.
> **Intensity:** Full showstopper (desktop), reduced for mobile, disabled for prefers-reduced-motion.

---

## 1. Architecture -- Animation Layer

### Library

Framer Motion (~45KB gzipped, tree-shakeable). The React animation standard.
Install: `pnpm add framer-motion`

### Core Principle

Animation as a separate layer. Reusable motion components wrap existing content.
Current pages stay structurally untouched -- elements get wrapped in motion containers.

### Reusable Motion Components

- **`MotionReveal`** -- scroll-triggered fade/slide/stagger wrapper
- **`MotionParallax`** -- scroll-progress linked position/scale
- **`MotionFloral`** -- reactive SVG wrapper (draw-in + breathing + cursor response)
- **`MotionPage`** -- route-aware page transition wrapper
- **`MotionGallery`** -- shared-element lightbox system with `layoutId`
- **`useAnimationTier`** -- hook returning `"full"` | `"reduced"` | `"none"`

### Component Location

All motion components live in `src/components/motion/`.
Hook lives in `src/hooks/useAnimationTier.ts`.

### Animation Tier System

The `useAnimationTier` hook determines animation intensity:

- **`"full"`** -- Desktop. All animations, parallax, cursor tracking, page transitions.
- **`"reduced"`** -- Mobile (detected via viewport width <= 768px). Fast fades, basic reveals only. No parallax, no cursor tracking, no cinematic page transitions.
- **`"none"`** -- `prefers-reduced-motion: reduce` is active. No animations at all. Elements render in their final state immediately.

Detection: `useMediaQuery` for viewport + `useReducedMotion` from Framer Motion.

---

## 2. Hero Entrance -- Orchestrated Reveal

The homepage hero is the first impression. Cinematic entrance, plays once per session.

### Desktop (full tier)

Timeline (all times from page load):

1. **0-200ms** -- Brief hold. Page is loaded but hero content is invisible.
2. **0-600ms** -- FloralBloom SVG draws itself via `strokeDashoffset` animation. Petals spiral inward.
3. **200-800ms** -- "Hi, I'm Karli." fades up with blur-to-sharp effect (`filter: blur(4px)` to `blur(0)`).
4. **300-1200ms** -- Headline cascades word-by-word: "I" "design" "hair" "that" then "works with your life" (copper span) arrives as one unit with subtle scale emphasis (1.05 to 1.0).
5. **800-1400ms** -- Subtitle paragraph fades up.
6. **1000-1600ms** -- CTA buttons arrive with spring physics (slight overshoot then settle).
7. **Post-settle** -- Salon background image begins continuous parallax (0.3x scroll speed). FloralCorner begins breathing micro-motion.

Total entrance: ~1.6s. Plays once per session (`sessionStorage` flag).

### Mobile (reduced tier)

- Simple staggered fade-up on all elements as a group
- All elements arrive within 600ms total
- No word-by-word, no blur effect, no parallax, no breathing

### Easing

Primary curve: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo) for reveals.
Spring physics: `{ type: "spring", damping: 20, stiffness: 200 }` for buttons and bouncy elements.

---

## 3. Scroll-Progress System -- Living Canvas

As visitors scroll, the page responds. The content stays readable but the environment breathes.

### Parallax Depth Layers (desktop only)

- **Background images** (hero salon photo, scissors CTA background): move at 0.3x scroll speed. Creates depth behind content.
- **Floral accents** (FloralCorner, FloralBloom): move at 0.15x scroll speed in the OPPOSITE direction. They float slightly independent -- like pressed flowers between glass layers.
- **Text content**: moves at normal 1x scroll speed. Always readable, never displaced.
- **Section background tones**: shift subtly with scroll progress via overlapping
  divs with opacity transitions (composite-only -- NOT backgroundColor animation).
  A blush-50 overlay div fades in near the quote section, then fades out.
  Like walking through rooms with different light.

### Scroll-Triggered Reveals

Each section has its own entrance:

**"Person Behind the Chair" section:**

- Karli's portrait gets the curtain reveal -- warm overlay slides away
  vertically (scaleY 1 to 0, transform-origin top), 900ms
- Blockquote border draws down via scaleY (800ms), then quote text slides in
  from left (800ms, delayed 300ms)

**"What Makes This Different" cards:**

- 3 cards stagger in from bottom (translateY 40px to 0, opacity 0 to 1)
- Stagger delay: 150ms between cards
- Copper accent bar scales in from left (scaleX 0 to 1) after each card
  settles, delayed 300ms

**Final CTA section:**

- FloralBloom draws in, headline fades up, buttons arrive with spring bounce
- Echoes the hero entrance but lighter -- bookend effect

**Floral dividers:**

- Draw themselves proportional to scroll position using
  `useScroll` + `useTransform`
- Visitor literally draws the vine as they scroll past it

### Scroll Velocity Awareness (desktop only -- stretch goal)

This is a polish feature. Implement after core scroll reveals work:

- Uses `useVelocity(scrollY)` from Framer Motion
- Velocity above 500px/s: skip to final state (no waiting through animations)
- Velocity below 500px/s: full orchestration plays at natural pace
- Direction change: elements with opacity < 0.5 snap to hidden, elements > 0.5
  snap to visible. No half-animated lingering.
- If implementation proves complex, drop this entirely -- scroll reveals work
  fine without velocity awareness

### Scroll-Progress Mobile Behavior

Scroll-triggered reveals only (fade-up, stagger). No parallax, no velocity awareness, no background color shifts.

---

## 4. Reactive Floral System -- Living Botanicals

The hand-drawn SVG florals (FloralBloom, FloralDivider, FloralCorner, FloralScatter) come alive through three animation phases.

### Phase 1 -- Draw-in (on scroll reveal)

SVG paths animate via `strokeDashoffset` from 100% to 0%:

- **FloralBloom**: petals spiral inward to center (1.2s)
- **FloralDivider**: the existing SVG has 30+ short disconnected strokes (not designed
  for stroke animation). Create a simplified animation-ready variant with fewer, longer
  continuous paths for the main vine, keeping the visual appearance identical. Leaves
  branch off as main stem passes them (2s, scroll-progress linked). Original SVG
  preserved as fallback for `"none"` tier.
- **FloralCorner**: stems grow outward from corner, leaves unfurl last (1.5s)
- **FloralScatter**: individual buds pop in with staggered timing like seeds landing (0.8s total)

### Phase 2 -- Breathing (continuous after reveal, desktop only)

- Petals: slow sinusoidal rotation, +-2 degrees, 8s cycle
- Leaves: gentle oscillation, +-1.5 degrees, 6s cycle, offset per leaf so they move independently
- Stems: stay fixed (anchor point)
- Center bloom: subtle opacity pulse, 0.4 to 0.6, 10s cycle

### Phase 3 -- Cursor Response (desktop only)

- Detection radius: 200px from cursor
- Leaves lean toward cursor (max 5 degree rotation toward cursor position)
- Petals spread slightly open near cursor (scale 1.0 to 1.05)
- As cursor moves away: elements ease back to breathing state (0.6s spring)
- Response is dampened: 100ms delay following cursor for organic feel
- Uses `useMotionValue` + `useTransform` for GPU-accelerated transforms

### Floral Performance Guards

- All animations use `transform` and `opacity` only -- zero layout triggers
- Elements outside viewport pause breathing cycle via IntersectionObserver
- `will-change: transform` on parallax elements and elements with continuous
  breathing animations only. Remove after one-time draw-in animations complete.
- Single document-level `mousemove` listener broadcasts cursor position to all
  subscribed floral components (not per-component listeners)

### Floral Scale Enhancement

Existing florals are small (FloralBloom at 32px, FloralCorner at ~128px).
Scale them up for more visual presence:

- FloralBloom: increase from `w-8 h-8` to `w-12 h-12` (48px) on hero, `w-10 h-10`
  elsewhere. Vary sizes across the site -- not all the same.
- FloralCorner: increase from `w-36 h-36` to `w-48 h-48` on hero, `w-40 h-40` elsewhere.
- Add vine extensions to FloralCorner instances -- additional trailing stems
  that reach further into the content area. Creates organic, flowing decoration.
- Different sizes across pages: hero gets the largest, section accents are medium,
  inline accents are small. Varied scale creates visual rhythm.
- MotionFloral bloom-in effect: flowers scale from 0.6 to their full size on
  reveal, creating a natural "blooming" entrance.

### Floral Wrapping Strategy

`MotionFloral` receives existing floral SVG components as children. It does NOT
replace them -- it wraps them and injects animation props. For FloralDivider, a
simplified animation-ready SVG variant is created alongside the original (the
original renders in `"none"` tier). For FloralBloom, FloralCorner, FloralScatter,
the existing SVGs work as-is because their paths are simple enough for stroke
animation. FloralScatter's individual buds are targeted via child path selectors
for per-element stagger.

### Floral Mobile Behavior

Phase 1 plays as simple fade-in (no stroke animation). No breathing, no cursor response.

---

## 5. Page Transitions -- Route-Aware Enter Animations

Each page has its own entrance personality reflecting what the visitor is about to experience.

### Architecture Constraint (Next.js App Router)

The public layout (`src/app/(public)/layout.tsx`) is a server component. Next.js App Router
does not expose a route change lifecycle that Framer Motion's `AnimatePresence` can hook
into for exit animations without converting the layout to a client component -- which would
break server-side data fetching in gallery, philosophy, and other pages.

**Solution:** Enter-only animations. No exit transitions. Each page animates IN when it
mounts, but there is no animated exit when navigating away. This preserves server components
and keeps navigation feeling instant. The per-page entrance animations are cinematic enough
to carry the showstopper feel without needing exit orchestration.

`MotionPage` is a thin client component wrapper that each page imports individually
(not a layout-level wrapper). It reads `usePathname()` internally for route-aware
animation selection but does NOT wrap the layout's `{children}`.

### Route-Specific Enter Animations (desktop)

- **Homepage** `/` -- Fade + scale from 0.97 to 1.0 ("opening the door"), 400ms
- **Gallery** `/gallery` -- Grid tiles cascade from center outward (photos laid on table), 500ms
- **Philosophy** `/philosophy` -- Slow crossfade with barely perceptible upward drift (turning a page), 500ms
- **FAQ** `/faq` -- Slides in from right (practical, confident), 350ms
- **New Client Form** `/newclientform` -- Rises from bottom like a drawer ("let's get started"), 400ms
- **Book** `/book` -- Same drawer-up as intake form (consistent "action pages rise"), 400ms
- **About** `/about` -- Curtain reveal -- warm overlay splits from center to edges, 600ms
- **Legal** `/legal/*` -- Simple fast crossfade, 200ms

### Header Continuity

Header stays persistent -- never animates. Provides visual continuity across page changes.
Scroll position resets to top on navigation (browser default).

### Page Transition Mobile Behavior

Simple 200ms fade-in on ALL routes. No directional movement, no route-specific personality. Fast and invisible.

---

## 6. Immersive Gallery -- Shared-Element Lightbox

The gallery showcases Karli's work. It should feel like stepping into a portfolio exhibition.

### Integration with Instagram Feed

The gallery page renders an `InstagramFeed` client component that fetches paginated data
from the Instagram Graph API via a server-side proxy. The gallery is NOT a static image
grid -- it is a dynamic, paginated external feed with video autoplay (IntersectionObserver).

`MotionGallery` wraps the existing `InstagramFeed` component. It does not replace it.
Animation hooks into the feed's existing render cycle:

- **Initial load items** get the full entrance cascade
- **Paginated (load-more) items** get a simpler staggered fade-in per batch
- **Video items** are excluded from parallax depth (their existing IntersectionObserver
  for autoplay must not conflict with a parallax observer). Videos get hover lift only.
- The shared-element lightbox must handle both images AND videos (videos show play controls)

### Grid Entrance (desktop)

- Initial viewport images cascade in from center outward in concentric rings
- Each image fades from opacity 0 + scale 0.9 to full (like polaroids developing)
- Stagger: 60ms between rings, ~600ms for visible viewport
- Paginated items (loaded via "Load More") fade in with simple row stagger

### Scroll Depth Effect (desktop)

- Masonry grid gets two parallax depth lanes (images only, not videos)
- Odd-column images: 0.95x scroll speed
- Even-column images: 1.05x scroll speed
- Subtle dimensional separation -- reads as "something feels premium"

### Hover (desktop)

- Hovered image lifts (translateY -4px) + shadow deepens + scale 1.02, spring ease
- Neighboring images dim (opacity 0.85) -- focus effect
- Transition: 300ms spring

### Shared-Element Lightbox

- Click triggers `layoutId` shared-element transition -- image flies from grid position to centered fullscreen
- Background: warm-800 overlay at 0.85 opacity, fades in during transition
- Swipe/arrow navigation between images (horizontal slide)
- Close: image morphs BACK to grid position. Spatial context preserved.
- Videos in lightbox autoplay with faded-in play/pause controls
- `layoutId` is based on Instagram media ID for stable identity across re-renders

### Gallery Mobile Behavior

- Staggered fade-in on scroll (no depth lanes, no neighbor dimming)
- Tap opens standard fullscreen lightbox with crossfade (no shared-element morph)
- Swipe navigation in lightbox

---

## 7. Button Micro-interactions & Form Polish

The tactile details that make the site feel handcrafted.

### Buttons (all pages, both tiers)

- **Hover**: lift translateY(-3px) + shadow expansion + scale(1.02), spring physics (overshoot then settle)
- **Press**: quick compress scale(0.98) + shadow tighten, instant feedback
- **Release**: spring back to hover state
- Forest green primary: deeper shadow glow (forest-tinted rgba)
- Ghost secondary: border color warmth shift on hover
- Works on mobile via tap -- fast and satisfying

### Nav Links (desktop)

- Underline draws in from left on hover (scaleX 0 to 1, transform-origin left)
- Active page: persistent copper underline
- Footer links: simple opacity shift (footer stays quiet)

### New Client Form Wizard

**Desktop:**

- Step transitions: current step exits left, new step enters from right
  (reverses when going back). Forward is right, backward is left.
- Progress bar fills with smooth spring animation between steps
- Form fields within each step stagger in (fade-up, 40ms between fields)
- Validation errors: gentle horizontal shake (3px oscillation, 400ms) --
  not angry, just "hey, look here"
- Photo upload: drop zone pulses gently on dragover, uploaded photos pop in
  with spring scale from 0
- Submit button: slight glow pulse while submitting, satisfying checkmark
  morph on success

**Mobile:**

- Step transitions: simple crossfade (no directional slide)
- No field stagger, no validation shake (just red border)
- Submit feedback still works (simpler version)

### FAQ Accordion Enhancement

- Content height animates smoothly via `AnimatePresence` + `motion.div`
  with height auto-animation
- The existing `FaqItem` must be restructured: content div always renders
  (with `overflow: hidden` and animated height) instead of conditionally
  mounting/unmounting. This is required for smooth height animation.
- Text within panel fades in after panel opens (200ms delay)
- Chevron rotates with spring easing (not linear)
- Only one panel open at a time -- closing panel animates height to 0

---

## 8. Performance & Accessibility

### Performance

- All animations use `transform` and `opacity` only (composite-only, GPU accelerated)
- No layout thrashing -- zero width/height animations except FAQ accordion (uses Framer Motion layout animation for height)
- Floral breathing cycles pause via IntersectionObserver when off-screen
- `will-change: transform` on parallax elements only (not globally)
- Framer Motion is tree-shakeable -- only import what's used
- Session flag prevents hero replay on same-session revisits

### Accessibility (non-negotiable)

- `prefers-reduced-motion: reduce` disables ALL animations -- elements render in final state
- Mobile tier disables parallax, cursor tracking, cinematic page transitions
- No infinite animations that can't be stopped (breathing cycles are subtle and pause off-screen)
- All interactive elements remain keyboard accessible
- Focus indicators never hidden by animation layers
- Touch targets remain 44x44px minimum -- animations don't affect hit areas
- `aria-hidden="true"` on all decorative animated elements

### Bundle Impact

- Framer Motion: estimated 30-40KB gzipped (this spec uses a substantial
  portion of the library: `useScroll`, `useTransform`, `useMotionValue`,
  `useVelocity`, `AnimatePresence`, `layoutId`, `motion` components).
  Verify actual bundle increase with `next build` after implementation.
- No other new dependencies
- Existing `tw-animate-css` dependency is kept. Framer Motion handles all
  new animations; tw-animate-css continues to provide utility classes for
  existing Tailwind animations (e.g., `animate-spin` on loaders). No conflict.
- Motion components are client components (`"use client"`) -- server
  components remain server components
- Lazy-load `MotionGallery` lightbox (only loads when gallery page is visited)

### Testing Requirements

- `useAnimationTier` hook: unit tests verifying it returns `"none"` when
  `prefers-reduced-motion` is active, `"reduced"` at mobile viewport,
  `"full"` at desktop viewport
- Motion wrapper components: basic render tests confirming they render
  children correctly in all three tiers (full, reduced, none)
- Existing 292 tests must continue to pass unchanged
- Visual verification on dev server before any deploy

---

## 9. What We Are NOT Changing

This spec is additive only. The following stay exactly as they are:

- Page structure and content
- Brand palette, typography, spacing
- Component hierarchy and file organization
- Server components (motion wrappers are client-side only)
- API routes, database, auth
- Admin CRM (no animations on admin pages)
- SEO, metadata, security headers
- Test suite (292 tests remain untouched)

---

## 10. Files Created/Modified

### New Files

- `src/components/motion/motion-reveal.tsx`
- `src/components/motion/motion-parallax.tsx`
- `src/components/motion/motion-floral.tsx`
- `src/components/motion/motion-page.tsx`
- `src/components/motion/motion-gallery.tsx`
- `src/components/motion/index.ts` (barrel export)
- `src/hooks/useAnimationTier.ts`
- `src/hooks/useAnimationTier.test.ts`
- `src/components/decorative/floral-divider-animated.tsx`
  (simplified SVG variant for stroke animation)

### Modified Files (wrapping existing elements)

- `src/app/(public)/layout.tsx` -- remains server component (NO changes for
  page transitions -- `MotionPage` is per-page, not layout-level)
- `src/app/(public)/page.tsx` -- wrap hero sections with `MotionReveal`, `MotionParallax`
- `src/app/(public)/gallery/page.tsx` -- wrap with `MotionGallery`
- `src/app/(public)/faq/page.tsx` -- enhance accordion with Framer Motion height animation
- `src/app/(public)/philosophy/page.tsx` -- wrap sections with `MotionReveal`
- `src/app/(public)/about/page.tsx` -- wrap sections with `MotionReveal`, curtain on images
- `src/app/(public)/newclientform/page.tsx` -- wrap step transitions, field staggers
- `src/app/(public)/book/page.tsx` -- minimal (just page transition wrapper)
- `src/components/decorative/floral-accents.tsx` -- wrap SVGs with `MotionFloral`
- `src/components/layout/header.tsx` -- nav link underline animation
- `src/components/layout/mobile-nav.tsx` -- animated drawer + link stagger
- `src/components/layout/footer.tsx` -- minimal (link hover opacity)
- `src/app/globals.css` -- add `will-change` utilities if needed
- `package.json` -- add `framer-motion` dependency

---

## 11. Summary

Nine interconnected animation systems that transform the ABHS public site into a cinematic, handcrafted experience:

1. **Architecture** -- animation tier hook, reusable motion components
2. **Hero entrance** -- orchestrated word-by-word reveal with SVG draw-in
3. **Scroll-progress** -- parallax depth, background shifts, velocity-aware reveals
4. **Reactive florals** -- draw-in, breathing, cursor-responsive botanicals
5. **Page transitions** -- route-aware cinematic entrances/exits
6. **Immersive gallery** -- parallax depth grid, shared-element lightbox
7. **Micro-interactions** -- spring buttons, nav underlines, form polish

Desktop: full showstopper. Mobile: fast and clean. Reduced motion: fully respected.
The site's structure, content, and brand stay exactly as they are. We're breathing life into it.
