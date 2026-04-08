# Per-Page Open Graph Images -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate branded per-page OG images so every ABHS page has its own social media preview card.

**Architecture:** A shared helper (`src/lib/og-image.tsx`) renders a branded card via Next.js `ImageResponse` (Satori). Each public page gets `opengraph-image.tsx` and `twitter-image.tsx` files that call the helper with page-specific content. Next.js auto-discovers these files and sets the correct meta tags.

**Tech Stack:** Next.js ImageResponse (built-in, uses Satori), Google Fonts (Playfair Display + Inter fetched at build time)

**Spec:** `docs/superpowers/specs/2026-04-07-og-images-design.md`

---

### Task 1: Create shared OG image helper

**Files:**
- Create: `abhs/src/lib/og-image.tsx`

- [ ] **Step 1: Create the shared helper**

```tsx
import { ImageResponse } from 'next/og';

// Cache fonts across requests
let playfairBold: ArrayBuffer | null = null;
let interRegular: ArrayBuffer | null = null;
let interSemiBold: ArrayBuffer | null = null;

async function loadFonts() {
  if (!playfairBold) {
    playfairBold = await fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vUDQZNLo_U2r.woff2'
    ).then((res) => res.arrayBuffer());
  }
  if (!interRegular) {
    interRegular = await fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
    ).then((res) => res.arrayBuffer());
  }
  if (!interSemiBold) {
    interSemiBold = await fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2'
    ).then((res) => res.arrayBuffer());
  }
  return { playfairBold, interRegular, interSemiBold };
}

export async function createOgImage(pageName: string, tagline: string) {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FAF6F2 0%, #FFF8F0 50%, #FAF6F2 100%)',
          padding: '60px 80px',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            width: '120px',
            height: '3px',
            background: '#A0714E',
            marginBottom: '40px',
          }}
        />

        {/* Karli Rosario */}
        <div
          style={{
            fontFamily: 'Playfair Display',
            fontSize: '52px',
            fontWeight: 700,
            color: '#3D3229',
            marginBottom: '8px',
          }}
        >
          Karli Rosario
        </div>

        {/* Intentional Hair Design */}
        <div
          style={{
            fontFamily: 'Inter',
            fontSize: '22px',
            fontWeight: 400,
            color: '#756458',
            letterSpacing: '2px',
            textTransform: 'uppercase' as const,
            marginBottom: '32px',
          }}
        >
          Intentional Hair Design
        </div>

        {/* Divider */}
        <div
          style={{
            width: '280px',
            height: '1px',
            background: '#E3D9D0',
            marginBottom: '32px',
          }}
        />

        {/* Page name */}
        <div
          style={{
            fontFamily: 'Inter',
            fontSize: '32px',
            fontWeight: 600,
            color: '#3F5A37',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ color: '#A0714E', fontSize: '20px' }}>&#10022;</span>
          {pageName}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: 'Inter',
            fontSize: '20px',
            fontWeight: 400,
            color: '#756458',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: '1.5',
          }}
        >
          {tagline}
        </div>

        {/* Bottom section */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 400,
              color: '#9F8E80',
              letterSpacing: '1px',
            }}
          >
            allbeautyhairstudio.com
          </div>
          <div
            style={{
              width: '120px',
              height: '3px',
              background: '#A0714E',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Playfair Display', data: fonts.playfairBold!, weight: 700 as const, style: 'normal' as const },
        { name: 'Inter', data: fonts.interRegular!, weight: 400 as const, style: 'normal' as const },
        { name: 'Inter', data: fonts.interSemiBold!, weight: 600 as const, style: 'normal' as const },
      ],
    }
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd abhs && npx tsc --noEmit`
Expected: clean (zero errors)

- [ ] **Step 3: Commit**

```bash
git add abhs/src/lib/og-image.tsx
git commit -m "feat: add shared OG image helper for branded social cards"
```

---

### Task 2: Add OG images for Homepage, Gallery, FAQ

**Files:**
- Create: `abhs/src/app/(public)/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/twitter-image.tsx`
- Create: `abhs/src/app/(public)/gallery/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/gallery/twitter-image.tsx`
- Create: `abhs/src/app/(public)/faq/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/faq/twitter-image.tsx`

- [ ] **Step 1: Create homepage OG image**

Create `abhs/src/app/(public)/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('Home', 'Low maintenance hair that grows out gracefully');
}
```

- [ ] **Step 2: Create homepage Twitter image**

Create `abhs/src/app/(public)/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 3: Create gallery OG image**

Create `abhs/src/app/(public)/gallery/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('Gallery', 'See the work, feel the vibe');
}
```

- [ ] **Step 4: Create gallery Twitter image**

Create `abhs/src/app/(public)/gallery/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 5: Create FAQ OG image**

Create `abhs/src/app/(public)/faq/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('FAQ', 'Answers before you even ask');
}
```

- [ ] **Step 6: Create FAQ Twitter image**

Create `abhs/src/app/(public)/faq/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 7: Visual test**

Start dev server: `cd abhs && npx next dev --port 3005`
Open in browser:
- `http://localhost:3005/opengraph-image` (homepage)
- `http://localhost:3005/gallery/opengraph-image` (gallery)
- `http://localhost:3005/faq/opengraph-image` (FAQ)

Each should render a 1200x630 branded card with the correct page name and tagline.

- [ ] **Step 8: Commit**

```bash
git add abhs/src/app/\(public\)/opengraph-image.tsx abhs/src/app/\(public\)/twitter-image.tsx abhs/src/app/\(public\)/gallery/opengraph-image.tsx abhs/src/app/\(public\)/gallery/twitter-image.tsx abhs/src/app/\(public\)/faq/opengraph-image.tsx abhs/src/app/\(public\)/faq/twitter-image.tsx
git commit -m "feat: add OG images for homepage, gallery, FAQ"
```

---

### Task 3: Add OG images for Philosophy, New Client Form, Book

**Files:**
- Create: `abhs/src/app/(public)/philosophy/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/philosophy/twitter-image.tsx`
- Create: `abhs/src/app/(public)/newclientform/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/newclientform/twitter-image.tsx`
- Create: `abhs/src/app/(public)/book/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/book/twitter-image.tsx`

- [ ] **Step 1: Create philosophy OG + Twitter images**

Create `abhs/src/app/(public)/philosophy/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('My Philosophy', 'Hair that works with your life, not against it');
}
```

Create `abhs/src/app/(public)/philosophy/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 2: Create new client form OG + Twitter images**

Create `abhs/src/app/(public)/newclientform/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('Consultation Form', 'Tell me about your hair so I can take care of you');
}
```

Create `abhs/src/app/(public)/newclientform/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 3: Create book OG + Twitter images**

Create `abhs/src/app/(public)/book/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('Book an Appointment', 'Ready when you are');
}
```

Create `abhs/src/app/(public)/book/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 4: Visual test**

Open in browser:
- `http://localhost:3005/philosophy/opengraph-image`
- `http://localhost:3005/newclientform/opengraph-image`
- `http://localhost:3005/book/opengraph-image`

- [ ] **Step 5: Commit**

```bash
git add abhs/src/app/\(public\)/philosophy/ abhs/src/app/\(public\)/newclientform/opengraph-image.tsx abhs/src/app/\(public\)/newclientform/twitter-image.tsx abhs/src/app/\(public\)/book/
git commit -m "feat: add OG images for philosophy, consultation form, book"
```

---

### Task 4: Add OG images for About and Legal pages

**Files:**
- Create: `abhs/src/app/(public)/about/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/about/twitter-image.tsx`
- Create: `abhs/src/app/(public)/legal/privacy/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/legal/privacy/twitter-image.tsx`
- Create: `abhs/src/app/(public)/legal/terms/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/legal/terms/twitter-image.tsx`
- Create: `abhs/src/app/(public)/legal/ai-disclosure/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/legal/ai-disclosure/twitter-image.tsx`
- Create: `abhs/src/app/(public)/legal/retention/opengraph-image.tsx`
- Create: `abhs/src/app/(public)/legal/retention/twitter-image.tsx`

- [ ] **Step 1: Create about OG + Twitter images**

Create `abhs/src/app/(public)/about/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('About Karli', 'The stylist behind the chair');
}
```

Create `abhs/src/app/(public)/about/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 2: Create privacy OG + Twitter images**

Create `abhs/src/app/(public)/legal/privacy/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('Privacy Policy', 'How we protect your information');
}
```

Create `abhs/src/app/(public)/legal/privacy/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 3: Create terms OG + Twitter images**

Create `abhs/src/app/(public)/legal/terms/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('Terms of Service', 'The fine print, kept simple');
}
```

Create `abhs/src/app/(public)/legal/terms/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 4: Create AI disclosure OG + Twitter images**

Create `abhs/src/app/(public)/legal/ai-disclosure/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('AI Disclosure', 'How we use AI in our services');
}
```

Create `abhs/src/app/(public)/legal/ai-disclosure/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 5: Create data retention OG + Twitter images**

Create `abhs/src/app/(public)/legal/retention/opengraph-image.tsx`:

```tsx
import { createOgImage } from '@/lib/og-image';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return createOgImage('Data Retention', 'How long we keep your information');
}
```

Create `abhs/src/app/(public)/legal/retention/twitter-image.tsx`:

```tsx
export { default, runtime, contentType, size } from './opengraph-image';
```

- [ ] **Step 6: Visual test**

Open in browser:
- `http://localhost:3005/about/opengraph-image`
- `http://localhost:3005/legal/privacy/opengraph-image`
- `http://localhost:3005/legal/terms/opengraph-image`
- `http://localhost:3005/legal/ai-disclosure/opengraph-image`
- `http://localhost:3005/legal/retention/opengraph-image`

- [ ] **Step 7: Commit**

```bash
git add abhs/src/app/\(public\)/about/ abhs/src/app/\(public\)/legal/
git commit -m "feat: add OG images for about and legal pages"
```

---

### Task 5: Clean up root layout and verify

**Files:**
- Modify: `abhs/src/app/layout.tsx:46-51`

- [ ] **Step 1: Remove hardcoded OG image from root layout**

In `abhs/src/app/layout.tsx`, change the `openGraph` section from:

```tsx
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Karli Rosario — Intentional Hair Design',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
```

To:

```tsx
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Karli Rosario — Intentional Hair Design',
  },
```

- [ ] **Step 2: Type check**

Run: `cd abhs && npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Run full test suite**

Run: `cd abhs && npx vitest run`
Expected: 280 tests passing

- [ ] **Step 4: Build check**

Run: `cd abhs && npx next build`
Expected: clean build with no errors

- [ ] **Step 5: View page source to verify meta tags**

Start dev server and view source of `http://localhost:3005/gallery`:
- Should contain `<meta property="og:image" content="...gallery/opengraph-image...">` (auto-generated)
- Should NOT contain `/images/og-image.jpg`

- [ ] **Step 6: Commit**

```bash
git add abhs/src/app/layout.tsx
git commit -m "fix: remove nonexistent hardcoded OG image from root layout"
```

---

### Task 6: Final push

- [ ] **Step 1: Push to remote**

```bash
git push origin main
```

- [ ] **Step 2: Deploy to VPS**

Bas deploys manually via SSH:

```bash
ssh -p 2222 abhs@72.62.200.30
cd /var/www/abhsweb/abhs && bash deploy/deploy.sh
```

- [ ] **Step 3: Validate live OG images**

After deploy, test with:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Enter each page URL (e.g., `https://allbeautyhairstudio.com/gallery`)
- Verify unique OG image appears for each page
