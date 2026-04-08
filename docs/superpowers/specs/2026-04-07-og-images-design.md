# Per-Page Open Graph Images -- Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Project:** All Beauty Hair Studio (ABHS)

---

## Problem

Social media shares of ABHS pages show no image (the referenced `/images/og-image.jpg` doesn't exist). Every page shares the same generic metadata. When Karli or clients share a link, there's no visual preview.

## Solution

Per-page dynamic OG images using Next.js `ImageResponse` (Satori). Each public page gets its own branded social card generated at request time and cached.

## Card Layout

**Dimensions:** 1200x630px (OG standard)

```
+----------------------------------------------------------+
|  (cream-to-blush gradient background)                    |
|                                                          |
|  ---- copper accent line ----                            |
|                                                          |
|  Karli Rosario                          (large, serif)   |
|  Intentional Hair Design                (smaller, sans)  |
|                                                          |
|  --- thin warm divider ---                               |
|                                                          |
|  * [Page Name]                          (forest green)   |
|  [Page tagline]                         (warm text)      |
|                                                          |
|  allbeautyhairstudio.com               (bottom, subtle)  |
|  ---- copper accent line ----                            |
|                                                          |
+----------------------------------------------------------+
```

**Title format on every card:** Karli Rosario | Intentional Hair Design | [Page Name]

## Colors

- Background: cream (#FAF6F2) to blush (#FFF8F0) gradient
- "Karli Rosario": warm-700 (#3D3229), Playfair Display serif
- "Intentional Hair Design": warm-500 (#756458), Inter sans
- Accent lines: copper-500 (#A0714E)
- Divider: warm-200 (#E3D9D0)
- Page name: forest-500 (#3F5A37), Inter bold
- Tagline: warm-500 (#756458), Inter regular
- URL: warm-400 (#9F8E80), Inter small

## Fonts

- **Playfair Display** (serif) -- for "Karli Rosario"
- **Inter** (sans) -- for everything else

Fonts fetched from Google Fonts CDN at image generation time (Satori requirement -- cannot use local font files in ImageResponse without embedding them as ArrayBuffer).

## Pages

| Route | Page Name | Tagline |
|-------|-----------|---------|
| `/` (homepage) | Home | Low maintenance hair that grows out gracefully |
| `/gallery` | Gallery | See the work, feel the vibe |
| `/faq` | FAQ | Answers before you even ask |
| `/philosophy` | My Philosophy | Hair that works with your life, not against it |
| `/newclientform` | Consultation Form | Tell me about your hair so I can take care of you |
| `/book` | Book an Appointment | Ready when you are |
| `/about` | About Karli | The stylist behind the chair |
| `/legal/privacy` | Privacy Policy | How we protect your information |
| `/legal/terms` | Terms of Service | The fine print, kept simple |
| `/legal/ai-disclosure` | AI Disclosure | How we use AI in our services |
| `/legal/retention` | Data Retention | How long we keep your information |

## Architecture

### Shared Helper

`src/lib/og-image.tsx` -- exports `createOgImage(pageName: string, tagline: string)` that returns an `ImageResponse`. All per-page files call this one function.

Responsibilities:
- Fetch and cache fonts (Playfair Display 700, Inter 400 + 600)
- Render the branded card layout as JSX (Satori-compatible subset)
- Return `ImageResponse` with correct dimensions and content type

### Per-Page Files

Each public page directory gets:
- `opengraph-image.tsx` -- exports default function calling `createOgImage()`
- `twitter-image.tsx` -- re-exports the same function (Next.js auto-sets Twitter card meta)

These are convention-based files -- Next.js auto-discovers them and generates the correct `<meta property="og:image">` and `<meta name="twitter:image">` tags.

### File Structure

```
src/lib/og-image.tsx                           (shared helper)
src/app/(public)/opengraph-image.tsx           (homepage)
src/app/(public)/twitter-image.tsx
src/app/(public)/gallery/opengraph-image.tsx
src/app/(public)/gallery/twitter-image.tsx
src/app/(public)/faq/opengraph-image.tsx
src/app/(public)/faq/twitter-image.tsx
src/app/(public)/philosophy/opengraph-image.tsx
src/app/(public)/philosophy/twitter-image.tsx
src/app/(public)/newclientform/opengraph-image.tsx
src/app/(public)/newclientform/twitter-image.tsx
src/app/(public)/book/opengraph-image.tsx
src/app/(public)/book/twitter-image.tsx
src/app/(public)/about/opengraph-image.tsx
src/app/(public)/about/twitter-image.tsx
src/app/(public)/legal/privacy/opengraph-image.tsx
src/app/(public)/legal/privacy/twitter-image.tsx
src/app/(public)/legal/terms/opengraph-image.tsx
src/app/(public)/legal/terms/twitter-image.tsx
src/app/(public)/legal/ai-disclosure/opengraph-image.tsx
src/app/(public)/legal/ai-disclosure/twitter-image.tsx
src/app/(public)/legal/retention/opengraph-image.tsx
src/app/(public)/legal/retention/twitter-image.tsx
```

### Root Layout Cleanup

Remove the hardcoded `openGraph.images` from `src/app/layout.tsx` since each page now generates its own. Keep the rest of the OG metadata (type, locale, siteName).

## Caching

Next.js caches generated OG images by default. Images regenerate on deploy (new build). No manual cache management needed.

## Testing

- Visual: hit `/opengraph-image` on each page route in dev to see the generated image
- Validate with Facebook Sharing Debugger and Twitter Card Validator after deploy
- Check that each page's `<meta property="og:image">` points to its own generated image, not the global one

## Out of Scope

- Blog pages (hidden from nav, no social sharing needed)
- Admin pages (not public)
- Dynamic per-client OG images
