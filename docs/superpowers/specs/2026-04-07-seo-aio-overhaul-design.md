# Premium SEO + AIO Overhaul -- Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Project:** All Beauty Hair Studio (ABHS)

---

## Problem

The site has basic metadata but no structured data, thin keywords, no AI engine optimization, and missing local SEO signals. Google can't understand this is a hair salon business. AI engines (ChatGPT, Perplexity, Gemini, Google AI Overviews) have no structured context to recommend Karli when people ask about hairstylists in Wildomar or surrounding areas.

The Google Business Profile shows the old Temecula address and is pending re-verification at the new Wildomar location. The website needs to be the authoritative source of truth for both search engines and AI engines.

## Solution

Four-part SEO + AIO package: Schema.org structured data, expanded local keywords, AI engine optimization files, and sitemap/footer fixes. No UI changes except phone number in footer. Everything else is invisible metadata.

---

## Business Details (Source of Truth)

- **Business Name:** All Beauty Hair Studio
- **Owner/Stylist:** Karli Rosario
- **Title:** Intentional Hair Designer, Licensed Hair Artist
- **Address:** 32395 Clinton Keith Rd, Suite A-103, Wildomar, CA 92595
- **Located in:** The Colour Parlor
- **Phone:** (951) 541-6620
- **Website:** https://allbeautyhairstudio.com
- **Instagram:** https://instagram.com/allbeautyhairstudio
- **Facebook:** https://facebook.com/allbeautyhair
- **Hours:** Tuesday - Thursday, by appointment only
- **Geo coordinates:** 33.5975, -117.2653
- **Price range:** $$
- **Service area:** Wildomar, Murrieta, Temecula, Lake Elsinore, Menifee, Canyon Lake, Hemet, Perris, Sun City

---

## Part 1: Schema.org JSON-LD Structured Data

### 1a. HairSalon + Person (Root Layout)

Server component `src/components/seo/structured-data.tsx` renders JSON-LD in the root layout.

**HairSalon schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "name": "All Beauty Hair Studio",
  "alternateName": "ABHS",
  "description": "Intentional hair design by Karli Rosario. Precision cuts and lived-in dimensional color that grows out gracefully. Located at The Colour Parlor in Wildomar, CA.",
  "url": "https://allbeautyhairstudio.com",
  "telephone": "+19515416620",
  "email": null,
  "image": "https://allbeautyhairstudio.com/images/og-image.jpg",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "32395 Clinton Keith Rd, Suite A-103",
    "addressLocality": "Wildomar",
    "addressRegion": "CA",
    "postalCode": "92595",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 33.5975,
    "longitude": -117.2653
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday", "opens": "09:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Wednesday", "opens": "09:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday", "opens": "09:00", "closes": "19:00" }
  ],
  "areaServed": [
    { "@type": "City", "name": "Wildomar", "sameAs": "https://en.wikipedia.org/wiki/Wildomar,_California" },
    { "@type": "City", "name": "Murrieta" },
    { "@type": "City", "name": "Temecula" },
    { "@type": "City", "name": "Lake Elsinore" },
    { "@type": "City", "name": "Menifee" },
    { "@type": "City", "name": "Canyon Lake" },
    { "@type": "City", "name": "Hemet" },
    { "@type": "City", "name": "Perris" },
    { "@type": "City", "name": "Sun City" }
  ],
  "founder": { "@id": "#karli-rosario" },
  "hasOfferCatalog": { "@id": "#services" },
  "sameAs": [
    "https://instagram.com/allbeautyhairstudio",
    "https://facebook.com/allbeautyhair"
  ]
}
```

**Person schema (Karli):**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "#karli-rosario",
  "name": "Karli Rosario",
  "jobTitle": "Intentional Hair Designer",
  "description": "Licensed hair artist specializing in precision scissor and razor cuts, lived-in dimensional color, and low maintenance hair design.",
  "worksFor": { "@type": "HairSalon", "name": "All Beauty Hair Studio" },
  "workLocation": {
    "@type": "Place",
    "name": "The Colour Parlor",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "32395 Clinton Keith Rd, Suite A-103",
      "addressLocality": "Wildomar",
      "addressRegion": "CA",
      "postalCode": "92595"
    }
  },
  "sameAs": [
    "https://instagram.com/allbeautyhairstudio",
    "https://facebook.com/allbeautyhair"
  ]
}
```

**Service schemas (OfferCatalog):**
```json
{
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "@id": "#services",
  "name": "Hair Services",
  "itemListElement": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Precision Haircut & Style",
        "description": "Signature scissor and razor cuts designed to grow out beautifully and work with your natural texture."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Low Maintenance Color",
        "description": "Color designed to grow out gracefully so you decide when to come back, not your hair."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Lived-in Dimensional Color",
        "description": "Balayage and dimensional highlights placed strategically for natural, sun-kissed movement."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Mini Service",
        "description": "Quick services like bang trims, toner refreshes, and minor adjustments between full appointments."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Color Correction",
        "description": "Fixing color gone wrong, whether from box dye, another salon, or a DIY experiment. Honest assessment, realistic timeline."
      }
    }
  ]
}
```

### 1b. FAQPage Schema (FAQ Page Only)

Separate component `src/components/seo/faq-structured-data.tsx` renders FAQPage JSON-LD on the `/faq` route only. Uses the same FAQ data already defined in the page. This triggers Google's rich FAQ results (expandable Q&A directly in search).

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I book an appointment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Start with my new client form..."
      }
    }
  ]
}
```

All 6 FAQ items included.

### 1c. BreadcrumbList (Every Page)

Added to the root structured data component. Each page passes its breadcrumb path.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://allbeautyhairstudio.com" },
    { "@type": "ListItem", "position": 2, "name": "Gallery", "item": "https://allbeautyhairstudio.com/gallery" }
  ]
}
```

---

## Part 2: Expanded Keywords & Metadata

### Root Layout Keywords

Expand from 8 to 25+ keywords targeting Wildomar and surrounding cities:

```
hairstylist wildomar, hair salon wildomar, balayage wildomar,
hair colorist wildomar, low maintenance hair wildomar,
intentional hair design, precision haircuts,
hairstylist murrieta, hair salon murrieta, balayage murrieta,
hairstylist temecula, hair salon temecula, balayage temecula,
hairstylist lake elsinore, hair salon menifee,
hair salon canyon lake, dimensional color wildomar,
lived in color wildomar, color correction wildomar,
karli rosario hair, the colour parlor wildomar,
women haircut wildomar, mens haircut wildomar,
hair salon near me wildomar, best hairstylist wildomar ca
```

### Per-Page Meta Description Upgrades

Each description gets natural location signals woven in:

| Page | Updated Description |
|------|-------------------|
| Homepage | "Intentional hair design by Karli Rosario in Wildomar, CA. Low maintenance cuts and color that grow out gracefully. Serving Wildomar, Murrieta, Temecula, and surrounding areas." |
| Gallery | "See Karli Rosario's latest work at All Beauty Hair Studio in Wildomar, CA. Precision cuts, balayage, and dimensional color transformations." |
| FAQ | "Common questions about booking with Karli Rosario at All Beauty Hair Studio in Wildomar. Pricing, process, cancellation policy, and what to expect." |
| Philosophy | "What intentional hair design means at All Beauty Hair Studio in Wildomar, CA. Hair that grows out beautifully and works with your real life." |
| About | "Meet Karli Rosario, intentional hair designer at The Colour Parlor in Wildomar, CA. Her journey back to hair through loss, resilience, and choosing herself." |
| New Client Form | "Start your consultation with Karli Rosario at All Beauty Hair Studio in Wildomar, CA. Tell her about your hair so she can design something that works for your life." |
| Book | "Book your next hair appointment with Karli Rosario at All Beauty Hair Studio in Wildomar, CA. Serving Murrieta, Temecula, Lake Elsinore, and Menifee." |

---

## Part 3: AI Engine Optimization (AIO)

### public/llms.txt

Short, structured summary for AI crawlers. Follows the emerging llms.txt standard.

```markdown
# All Beauty Hair Studio
> Intentional hair design by Karli Rosario in Wildomar, CA

## About
Karli Rosario is a licensed hair artist specializing in precision scissor
and razor cuts and lived-in dimensional color. She designs hair that grows
out gracefully so clients decide when to come back, not their hair.
Located at The Colour Parlor in Wildomar, CA.

## Services
- Precision Haircut & Style
- Low Maintenance Color
- Lived-in Dimensional Color (Balayage)
- Mini Service (bang trims, toner refresh)
- Color Correction

## Location
The Colour Parlor
32395 Clinton Keith Rd, Suite A-103
Wildomar, CA 92595

## Service Area
Wildomar, Murrieta, Temecula, Lake Elsinore, Menifee, Canyon Lake

## Hours
Tuesday - Thursday, by appointment only

## Contact
- Phone: (951) 541-6620
- New clients: https://allbeautyhairstudio.com/newclientform
- Booking: https://allbeautyhairstudio.com/book
- Instagram: https://instagram.com/allbeautyhairstudio

## Philosophy
Every cut and color decision is made with the client's real life in mind,
their routine, their capacity, their goals. Hair that works with life,
not against it. Low maintenance by design, not by accident.
```

### public/llms-full.txt

Extended version with FAQ answers, service details, Karli's background, and salon philosophy. Gives AI engines deep context for accurate recommendations. Content pulled from existing pages (no new writing needed).

### Meta Tag

In root layout `<head>`:
```html
<meta name="ai-content-declaration" content="original" />
```

Signals to AI crawlers that content is original and human-authored.

---

## Part 4: Sitemap + Footer

### Sitemap

Add missing `/about` page:
```typescript
{ url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 }
```

### Footer

Add phone number below address as a clickable `tel:` link:
```
(951) 541-6620
```
44px touch target, consistent with existing footer link styling.

---

## File Structure

```
src/components/seo/structured-data.tsx      NEW - HairSalon + Person + Service + Breadcrumb JSON-LD
src/components/seo/faq-structured-data.tsx   NEW - FAQPage JSON-LD
src/app/layout.tsx                           MODIFY - keywords, meta tags, add structured-data component
src/app/(public)/page.tsx                    MODIFY - meta description
src/app/(public)/gallery/page.tsx            MODIFY - meta description
src/app/(public)/faq/page.tsx                MODIFY - add FAQPage structured data, meta description
src/app/(public)/faq/layout.tsx              MODIFY - meta description
src/app/(public)/philosophy/page.tsx         MODIFY - meta description
src/app/(public)/about/page.tsx              MODIFY - meta description
src/app/(public)/newclientform/layout.tsx     MODIFY - meta description
src/app/(public)/book/page.tsx               MODIFY - meta description
src/app/sitemap.ts                           MODIFY - add /about
src/components/layout/footer.tsx             MODIFY - add phone number
public/llms.txt                              NEW - AI engine summary
public/llms-full.txt                         NEW - AI engine detailed context
public/robots.txt                            MODIFY - add llms.txt reference
```

## Out of Scope

- Google Business Profile verification (requires manual Google process)
- Blog content strategy (separate initiative)
- Google Ads or paid campaigns
- Review collection/management
- New page creation (service area pages, city landing pages)
- Visual/UI changes beyond phone number in footer

## Validation

After implementation:
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org
- Facebook Sharing Debugger: scrape again after deploy
- Manually verify llms.txt is accessible at /llms.txt
