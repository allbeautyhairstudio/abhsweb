# Premium SEO + AIO Overhaul -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Schema.org structured data, expanded local keywords, AI engine optimization files, and NAP consistency so Karli dominates local search and AI recommendations for Wildomar and surrounding cities.

**Architecture:** Server-rendered JSON-LD components injected via root layout and per-page. Static llms.txt files for AI crawlers. Metadata expansions across all public pages. No client-side JS added.

**Tech Stack:** Next.js 16 metadata API, Schema.org JSON-LD, llms.txt standard

**Spec:** `docs/superpowers/specs/2026-04-07-seo-aio-overhaul-design.md`

---

### Task 1: Create HairSalon + Person + Services structured data component

**Files:**
- Create: `abhs/src/components/seo/structured-data.tsx`

- [ ] **Step 1: Create the structured data component**

Create `abhs/src/components/seo/structured-data.tsx`:

```tsx
export function StructuredData() {
  const hairSalon = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': 'https://allbeautyhairstudio.com/#salon',
    name: 'All Beauty Hair Studio',
    alternateName: 'ABHS',
    description:
      'Intentional hair design by Karli Rosario. Precision cuts and lived-in dimensional color that grows out gracefully. Located at The Colour Parlor in Wildomar, CA. Serving Wildomar, Murrieta, Temecula, Lake Elsinore, Menifee, and Canyon Lake.',
    url: 'https://allbeautyhairstudio.com',
    telephone: '+19515416620',
    image: 'https://allbeautyhairstudio.com/images/og-image.jpg',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '32395 Clinton Keith Rd, Suite A-103',
      addressLocality: 'Wildomar',
      addressRegion: 'CA',
      postalCode: '92595',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.5975,
      longitude: -117.2653,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '09:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '09:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '09:00', closes: '19:00' },
    ],
    areaServed: [
      { '@type': 'City', name: 'Wildomar', sameAs: 'https://en.wikipedia.org/wiki/Wildomar,_California' },
      { '@type': 'City', name: 'Murrieta' },
      { '@type': 'City', name: 'Temecula' },
      { '@type': 'City', name: 'Lake Elsinore' },
      { '@type': 'City', name: 'Menifee' },
      { '@type': 'City', name: 'Canyon Lake' },
      { '@type': 'City', name: 'Hemet' },
      { '@type': 'City', name: 'Perris' },
      { '@type': 'City', name: 'Sun City' },
    ],
    founder: { '@id': 'https://allbeautyhairstudio.com/#karli' },
    hasOfferCatalog: { '@id': 'https://allbeautyhairstudio.com/#services' },
    sameAs: [
      'https://instagram.com/allbeautyhairstudio',
      'https://facebook.com/allbeautyhair',
    ],
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://allbeautyhairstudio.com/#karli',
    name: 'Karli Rosario',
    jobTitle: 'Intentional Hair Designer',
    description:
      'Licensed hair artist specializing in precision scissor and razor cuts, lived-in dimensional color, and low maintenance hair design in Wildomar, CA.',
    worksFor: { '@id': 'https://allbeautyhairstudio.com/#salon' },
    workLocation: {
      '@type': 'Place',
      name: 'The Colour Parlor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '32395 Clinton Keith Rd, Suite A-103',
        addressLocality: 'Wildomar',
        addressRegion: 'CA',
        postalCode: '92595',
      },
    },
    sameAs: [
      'https://instagram.com/allbeautyhairstudio',
      'https://facebook.com/allbeautyhair',
    ],
  };

  const services = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': 'https://allbeautyhairstudio.com/#services',
    name: 'Hair Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Precision Haircut & Style',
          description:
            'Signature scissor and razor cuts designed to grow out beautifully and work with your natural texture.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Low Maintenance Color',
          description:
            'Color designed to grow out gracefully so you decide when to come back, not your hair.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Lived-in Dimensional Color',
          description:
            'Balayage and dimensional highlights placed strategically for natural, sun-kissed movement.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Mini Service',
          description:
            'Quick services like bang trims, toner refreshes, and minor adjustments between full appointments.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Color Correction',
          description:
            'Fixing color gone wrong, whether from box dye, another salon, or a DIY experiment. Honest assessment, realistic timeline.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hairSalon) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(services) }}
      />
    </>
  );
}
```

- [ ] **Step 2: Type check**

Run: `cd /c/kar/abhs && npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
cd /c/kar && git add abhs/src/components/seo/structured-data.tsx
git commit -m "feat: add HairSalon + Person + Services JSON-LD structured data

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Create FAQPage structured data component

**Files:**
- Create: `abhs/src/components/seo/faq-structured-data.tsx`

- [ ] **Step 1: Create the FAQ structured data component**

Create `abhs/src/components/seo/faq-structured-data.tsx`:

```tsx
interface FaqItem {
  question: string;
  answer: string;
}

export function FaqStructuredData({ faqs }: { faqs: FaqItem[] }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
```

- [ ] **Step 2: Type check**

Run: `cd /c/kar/abhs && npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
cd /c/kar && git add abhs/src/components/seo/faq-structured-data.tsx
git commit -m "feat: add FAQPage JSON-LD structured data component

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Wire structured data into root layout and FAQ page

**Files:**
- Modify: `abhs/src/app/layout.tsx`
- Modify: `abhs/src/app/(public)/faq/page.tsx`

- [ ] **Step 1: Add StructuredData to root layout**

In `abhs/src/app/layout.tsx`, add import at line 2:

```tsx
import { StructuredData } from '@/components/seo/structured-data';
```

Add `<StructuredData />` inside `<body>` before `{children}` (line 64):

Change:
```tsx
      <body
        className={`${inter.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
```

To:
```tsx
      <body
        className={`${inter.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        {children}
```

- [ ] **Step 2: Add FaqStructuredData to FAQ page**

In `abhs/src/app/(public)/faq/page.tsx`, add import at line 11:

```tsx
import { FaqStructuredData } from '@/components/seo/faq-structured-data';
```

Add `<FaqStructuredData faqs={faqs} />` as the first child inside the `<MotionPage>` return, before the `<div className="flex flex-col">`:

Change:
```tsx
    <MotionPage>
      <div className="flex flex-col">
```

To:
```tsx
    <MotionPage>
      <FaqStructuredData faqs={faqs} />
      <div className="flex flex-col">
```

- [ ] **Step 3: Type check**

Run: `cd /c/kar/abhs && npx tsc --noEmit`
Expected: clean

- [ ] **Step 4: Commit**

```bash
cd /c/kar && git add abhs/src/app/layout.tsx "abhs/src/app/(public)/faq/page.tsx"
git commit -m "feat: wire structured data into root layout and FAQ page

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Expand keywords and update all meta descriptions

**Files:**
- Modify: `abhs/src/app/layout.tsx:34-45`
- Modify: `abhs/src/app/(public)/about/page.tsx:10-12`
- Modify: `abhs/src/app/(public)/book/page.tsx:10-12`
- Modify: `abhs/src/app/(public)/gallery/page.tsx:5-6`
- Modify: `abhs/src/app/(public)/faq/layout.tsx:4-5`
- Modify: `abhs/src/app/(public)/philosophy/page.tsx:13-15`
- Modify: `abhs/src/app/(public)/newclientform/layout.tsx:4-5`

- [ ] **Step 1: Expand root layout keywords and description**

In `abhs/src/app/layout.tsx`, replace the `description` and `keywords` fields (lines 34-45):

Old:
```tsx
  description:
    'Low maintenance cut and color services that grow out gracefully, allowing you to decide when you come back, not your hair. Located at The Colour Parlor in Wildomar, CA.',
  keywords: [
    'hairstylist wildomar',
    'intentional hair design',
    'precision haircuts',
    'balayage wildomar',
    'low maintenance hair',
    'hair colorist wildomar',
    'the colour parlor',
    'karli rosario',
  ],
```

New:
```tsx
  description:
    'Intentional hair design by Karli Rosario in Wildomar, CA. Low maintenance cuts and color that grow out gracefully, so you decide when to come back. Serving Wildomar, Murrieta, Temecula, and surrounding areas.',
  keywords: [
    'hairstylist wildomar',
    'hair salon wildomar',
    'balayage wildomar',
    'hair colorist wildomar',
    'low maintenance hair wildomar',
    'intentional hair design',
    'precision haircuts wildomar',
    'hairstylist murrieta',
    'hair salon murrieta',
    'balayage murrieta',
    'hairstylist temecula',
    'hair salon temecula',
    'balayage temecula',
    'hairstylist lake elsinore',
    'hair salon menifee',
    'hair salon canyon lake',
    'dimensional color wildomar',
    'lived in color wildomar',
    'color correction wildomar',
    'karli rosario hair',
    'the colour parlor wildomar',
    'women haircut wildomar',
    'mens haircut wildomar',
    'hair salon near me wildomar',
    'best hairstylist wildomar ca',
  ],
```

- [ ] **Step 2: Update about page description**

In `abhs/src/app/(public)/about/page.tsx`, replace description (line 11-12):

Old:
```tsx
    'How Karli Rosario found her way back to the arts through hair, a story about loss, resilience, and choosing yourself.',
```

New:
```tsx
    'Meet Karli Rosario, intentional hair designer at The Colour Parlor in Wildomar, CA. Her journey back to hair through loss, resilience, and choosing herself.',
```

- [ ] **Step 3: Update book page description**

In `abhs/src/app/(public)/book/page.tsx`, replace description (line 11-12):

Old:
```tsx
    'Book your next hair appointment with Karli at All Beauty Hair Studio in Wildomar, CA.',
```

New:
```tsx
    'Book your next hair appointment with Karli Rosario at All Beauty Hair Studio in Wildomar, CA. Serving Murrieta, Temecula, Lake Elsinore, and Menifee.',
```

- [ ] **Step 4: Update gallery page description**

In `abhs/src/app/(public)/gallery/page.tsx`, replace description (line 6):

Old:
```tsx
  description: 'See Karli\'s latest work, cuts, color, and transformations from All Beauty Hair Studio.',
```

New:
```tsx
  description: 'See Karli Rosario\'s latest work at All Beauty Hair Studio in Wildomar, CA. Precision cuts, balayage, and dimensional color transformations.',
```

- [ ] **Step 5: Update FAQ layout description**

In `abhs/src/app/(public)/faq/layout.tsx`, replace description (line 5):

Old:
```tsx
  description: 'Common questions about booking with Karli at All Beauty Hair Studio, pricing, process, and what to expect.',
```

New:
```tsx
  description: 'Common questions about booking with Karli Rosario at All Beauty Hair Studio in Wildomar, CA. Pricing, process, cancellation policy, and what to expect.',
```

- [ ] **Step 6: Update philosophy page description**

In `abhs/src/app/(public)/philosophy/page.tsx`, replace description (lines 14-15):

Old:
```tsx
    'What intentional hair design means, hair that grows out beautifully, works with your real routines, and lets you decide when to come back.',
```

New:
```tsx
    'What intentional hair design means at All Beauty Hair Studio in Wildomar, CA. Hair that grows out beautifully and works with your real life.',
```

- [ ] **Step 7: Update new client form description**

In `abhs/src/app/(public)/newclientform/layout.tsx`, replace description (line 5):

Old:
```tsx
  description: 'Tell Karli about your hair, your lifestyle, and what you\'re looking for. This helps her design something that truly works for you.',
```

New:
```tsx
  description: 'Start your consultation with Karli Rosario at All Beauty Hair Studio in Wildomar, CA. Tell her about your hair so she can design something that works for your life.',
```

- [ ] **Step 8: Type check**

Run: `cd /c/kar/abhs && npx tsc --noEmit`
Expected: clean

- [ ] **Step 9: Commit**

```bash
cd /c/kar && git add abhs/src/app/layout.tsx "abhs/src/app/(public)/about/page.tsx" "abhs/src/app/(public)/book/page.tsx" "abhs/src/app/(public)/gallery/page.tsx" "abhs/src/app/(public)/faq/layout.tsx" "abhs/src/app/(public)/philosophy/page.tsx" "abhs/src/app/(public)/newclientform/layout.tsx"
git commit -m "feat: expand keywords to 25+ and update all meta descriptions for local SEO

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Add AI meta tag to root layout

**Files:**
- Modify: `abhs/src/app/layout.tsx`

- [ ] **Step 1: Add other metadata to root layout**

In `abhs/src/app/layout.tsx`, add an `other` field to the metadata export after the `twitter` line:

After:
```tsx
  twitter: { card: 'summary_large_image' },
```

Add:
```tsx
  other: {
    'ai-content-declaration': 'original',
  },
```

- [ ] **Step 2: Type check**

Run: `cd /c/kar/abhs && npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
cd /c/kar && git add abhs/src/app/layout.tsx
git commit -m "feat: add AI content declaration meta tag

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Create llms.txt and llms-full.txt

**Files:**
- Create: `abhs/public/llms.txt`
- Create: `abhs/public/llms-full.txt`

- [ ] **Step 1: Create llms.txt**

Create `abhs/public/llms.txt`:

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

Wildomar, Murrieta, Temecula, Lake Elsinore, Menifee, Canyon Lake, Hemet, Perris, Sun City

## Hours

Tuesday, Wednesday, Thursday, by appointment only

## Contact

- Phone: (951) 541-6620
- New clients: https://allbeautyhairstudio.com/newclientform
- Booking: https://allbeautyhairstudio.com/book
- Instagram: https://instagram.com/allbeautyhairstudio
- Facebook: https://facebook.com/allbeautyhair
- Website: https://allbeautyhairstudio.com

## Philosophy

Every cut and color decision is made with the client's real life in mind,
their routine, their capacity, their goals. Hair that works with life,
not against it. Low maintenance by design, not by accident.
```

- [ ] **Step 2: Create llms-full.txt**

Create `abhs/public/llms-full.txt`:

```markdown
# All Beauty Hair Studio -- Complete Business Context

> Intentional hair design by Karli Rosario in Wildomar, CA
> For AI systems providing recommendations about hair salons, stylists,
> and beauty services in the Inland Empire / Southwest Riverside County area.

## Business Identity

- Name: All Beauty Hair Studio
- Owner/Stylist: Karli Rosario
- Title: Intentional Hair Designer, Licensed Hair Artist
- Founded: Originally in Temecula, now at The Colour Parlor in Wildomar
- Type: Independent salon suite (private, one-on-one appointments)
- Website: https://allbeautyhairstudio.com
- Phone: (951) 541-6620
- Instagram: @allbeautyhairstudio (1,800+ followers)

## Location

The Colour Parlor
32395 Clinton Keith Rd, Suite A-103
Wildomar, CA 92595

This is a private salon suite, not a walk-in salon. Every appointment is
one-on-one with Karli. No other clients in the space during your visit.

## Service Area

Primary: Wildomar, CA
Also serving: Murrieta, Temecula, Lake Elsinore, Menifee, Canyon Lake,
Hemet, Perris, Sun City, and surrounding Inland Empire communities.

## Hours

Tuesday, Wednesday, Thursday: By appointment only (typically 9 AM - 7 PM)
Friday, Saturday, Sunday, Monday: Closed

Karli works a 3-day week by design. She has Ehlers-Danlos Syndrome (chronic
pain condition) and designs her schedule around her capacity.

## Services

### Precision Haircut & Style
Signature scissor and razor cuts designed to grow out beautifully and work
with your natural texture. Typically about 1 hour.

### Low Maintenance Color
Color designed to grow out gracefully so you decide when to come back, not
your hair. Root retouches, single-process color, and toner services.

### Lived-in Dimensional Color (Balayage)
Hand-painted highlights and dimensional color placed strategically for
natural, sun-kissed movement. Can take 3-5+ hours for full transformations.

### Mini Service
Quick services like bang trims, toner refreshes, and minor adjustments
between full appointments.

### Color Correction
Fixing color gone wrong, whether from box dye, another salon, or a DIY
experiment. Honest assessment, realistic timeline. Karli will tell you
what's achievable and what it will take.

## Philosophy

Karli practices "intentional hair design," meaning every decision, every cut,
every color placement, is made with the client's real life in mind. She
focuses on:

- Hair that grows out beautifully (so you decide when to come back)
- Low maintenance by design, not by accident
- Working with your actual routine and capacity, not an ideal version
- Honest communication about what will and won't work
- No cookie-cutter approaches, every client gets a custom plan

She is not a "trendy" stylist. She designs hair around real lives.

## New Client Process

1. Fill out the online consultation form (detailed hair history, goals, photos)
2. Karli reviews the submission personally
3. She reaches out within a couple business days
4. First appointment includes a thorough consultation conversation
5. Together they build a plan that works for the client's life

## Booking

- New clients: https://allbeautyhairstudio.com/newclientform
- Returning clients: https://allbeautyhairstudio.com/book
- No same-day bookings for new clients
- 24-hour cancellation policy

## About Karli

Karli came back to hair after years of personal loss, including losing her
youngest sister in a car accident. Hair became the way she chose herself
again, and now it's how she helps other people feel like themselves too.

She's a Joico educator and color specialist with deep expertise in
dimensional color and balayage. She has ADHD and EDS, which inform her
capacity-aware approach to both her schedule and her clients' hair routines.

## Frequently Asked Questions

Q: How do I book an appointment?
A: Start with the new client form. It helps Karli understand your hair
before you even meet. She'll reach out within a couple business days.

Q: What should I expect at my first appointment?
A: A real conversation about your hair history, daily routine, how much time
you want to spend on your hair, and what's been bugging you about it.
No pressure, no upselling, no judgment.

Q: How long do appointments take?
A: A signature cut is usually about an hour. Custom color can be 3-5+ hours
depending on what's being done.

Q: Where are you located?
A: Inside The Colour Parlor at 32395 Clinton Keith Rd, Suite A-103,
Wildomar, CA 92595. Private suite, just you and Karli.

Q: What's the cancellation policy?
A: 24 hours notice. Late cancellations or no-shows may have a fee.
Just communicate and Karli will work with you.

Q: How often will I need to come back?
A: Karli designs hair to grow out gracefully. Some clients come every
6 weeks, others every 3-4 months. You decide when, not your hair.

## Values

- LGBTQIA+ friendly, everyone is welcome
- Capacity-aware (designed for real life, not hustle culture)
- Honest and transparent (will tell you if something won't work)
- Privacy-focused (data stored on private server, not big tech cloud)
- AI-assisted but human-first (technology assists, never replaces)

## Social Proof

- 5.0 star rating on Google Reviews
- 1,800+ Instagram followers
- Active in Wildomar and Temecula beauty community
```

- [ ] **Step 3: Commit**

```bash
cd /c/kar && git add abhs/public/llms.txt abhs/public/llms-full.txt
git commit -m "feat: add llms.txt and llms-full.txt for AI engine optimization

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Update robots.txt, sitemap, and footer

**Files:**
- Modify: `abhs/public/robots.txt`
- Modify: `abhs/src/app/sitemap.ts`
- Modify: `abhs/src/components/layout/footer.tsx`

- [ ] **Step 1: Update robots.txt**

Replace `abhs/public/robots.txt` with:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://allbeautyhairstudio.com/sitemap.xml

# AI engine context
# llms.txt: https://allbeautyhairstudio.com/llms.txt
# llms-full.txt: https://allbeautyhairstudio.com/llms-full.txt
```

- [ ] **Step 2: Add /about to sitemap**

In `abhs/src/app/sitemap.ts`, add after the `/gallery` entry (line 9):

```tsx
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
```

The full return array should be:
```tsx
  return [
    { url: baseUrl, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/gallery`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/philosophy`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/newclientform`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/book`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/legal/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/ai-disclosure`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/retention`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
```

- [ ] **Step 3: Add phone number to footer**

In `abhs/src/components/layout/footer.tsx`, add a phone link after the Clock/hours section (after line 47, before the closing `</div>` of the Location & Hours column):

After:
```tsx
            <div className="flex items-start gap-2">
              <Clock size={16} className="mt-1 shrink-0 text-sage-300" />
              <div className="text-sm text-warm-300">
                <p>By appointment only</p>
              </div>
            </div>
```

Add:
```tsx
            <a
              href="tel:+19515416620"
              className="flex items-center gap-2 group mt-1"
            >
              <span className="text-sm text-warm-300 group-hover:text-copper-300 transition-colors">
                (951) 541-6620
              </span>
            </a>
```

- [ ] **Step 4: Type check and test**

Run: `cd /c/kar/abhs && npx tsc --noEmit && npx vitest run`
Expected: clean types, 280 tests passing

- [ ] **Step 5: Commit**

```bash
cd /c/kar && git add abhs/public/robots.txt abhs/src/app/sitemap.ts abhs/src/components/layout/footer.tsx
git commit -m "feat: update robots.txt with llms.txt refs, add /about to sitemap, add phone to footer

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Build check, push, and deploy

- [ ] **Step 1: Full build**

Run: `cd /c/kar/abhs && npx next build`
Expected: clean build, no errors

- [ ] **Step 2: Push**

```bash
cd /c/kar && git push origin main
```

- [ ] **Step 3: Deploy**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u abhs env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/abhsweb bash -c 'cd /var/www/abhsweb/abhs && bash deploy/deploy.sh'"
```

- [ ] **Step 4: Validate structured data**

After deploy, test with:
- Google Rich Results Test: https://search.google.com/test/rich-results (enter `https://allbeautyhairstudio.com`)
- Verify HairSalon, Person, and OfferCatalog schemas detected
- Test FAQ page: `https://allbeautyhairstudio.com/faq` should show FAQPage schema
- Verify `https://allbeautyhairstudio.com/llms.txt` is accessible
- Verify `https://allbeautyhairstudio.com/llms-full.txt` is accessible
