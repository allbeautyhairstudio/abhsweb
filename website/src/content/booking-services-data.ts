/**
 * Custom service descriptions for the /book page.
 * Written by Karli — displayed exactly as provided.
 * Matched to Square catalog services by name pattern at runtime.
 */

export interface BookingServiceContent {
  /** Unique local ID for matching */
  id: string;
  /** Display name shown on booking page */
  displayName: string;
  /** Pattern to match against Square service name (case-insensitive startsWith) */
  squareNamePattern: string;
  /** Karli's multi-paragraph description — array of paragraph strings */
  description: string[];
  /** Optional bullet list within the description */
  bulletPoints?: string[];
  /** Display price (shown to user) */
  displayPrice: string;
  /** Display duration */
  displayDuration: string;
  /** Badge text (e.g., "Most Popular", "Free") */
  badge?: string;
  /** true = cannot combine with other services (Consultation) */
  isStandalone?: boolean;
  /** true = category header for mini services (not bookable itself) */
  isMiniCategory?: boolean;
  /** true = show consultation-required notice */
  consultationRequired?: boolean;
  /** Sort order for display */
  sortOrder: number;
}

export const bookingServices: BookingServiceContent[] = [
  {
    id: 'consultation',
    displayName: 'Consultation',
    squareNamePattern: 'Consultation',
    description: [
      'This is where we slow things down.',
      'A consultation is for anyone who wants clarity before committing \u2014 whether you\u2019re new, considering a change, or simply want a plan that feels thoughtful and realistic.',
      'We\u2019ll talk through your hair history, your routine, how you want your hair to live with you, and what level of maintenance actually feels good in your life. I\u2019ll explain options honestly, outline what to expect long-term, and help you decide what makes sense \u2014 without pressure.',
      'Think of this as a grounded starting point.',
      'If you\u2019re unsure what to book, begin here. We\u2019ll decide together.',
    ],
    displayPrice: 'Free',
    displayDuration: '45 min',
    badge: 'Free',
    isStandalone: true,
    sortOrder: 1,
  },
  {
    id: 'artisan-cut',
    displayName: 'Artisan Cut',
    squareNamePattern: 'Artisan Cut',
    description: [
      'The Artisan Cut is my most customizable haircut and the foundation of how I approach hair.',
      'This service allows me to fully tailor the cut to your texture, growth patterns, lifestyle, and styling habits. Using advanced cutting techniques and intentional weight removal, I design shape, movement, and balance so your hair grows out beautifully and continues to look intentional weeks later \u2014 not just the day you leave the salon.',
      'This cut gives me the creative flexibility to refine how your hair sits, moves, and behaves day to day. Tools like precision scissor work and razor cutting allow for softness, control, and longevity, while still keeping the result modern and wearable.',
    ],
    bulletPoints: [
      'feels customized, not cookie-cutter',
      'styles more easily at home',
      'grows out gracefully',
      'and lets you decide when you come back, not your hair',
    ],
    displayPrice: '$85',
    displayDuration: '1 hr 30 min',
    badge: 'Most Popular',
    sortOrder: 2,
  },
  {
    id: 'signature-cut',
    displayName: 'Signature Cut',
    squareNamePattern: 'Signature Cut',
    description: [
      'A refined, intentional haircut designed to maintain shape and balance.',
      'This option is ideal for guests who are happy with their current cut and are looking for thoughtful upkeep, subtle refinement, or a clean refresh.',
      'As with all my work, this cut is designed with longevity in mind \u2014 so it continues to look good well beyond the appointment.',
    ],
    displayPrice: '$65',
    displayDuration: '1 hr',
    sortOrder: 3,
  },
  {
    id: 'root-retouch',
    displayName: 'Root Retouch',
    squareNamePattern: 'Root Retouch',
    description: [
      'A root retouch is designed to restore balance at the scalp when your natural regrowth no longer matches your existing color.',
      'When I design a root retouch, I\u2019m not just matching color \u2014 I\u2019m thinking about how it will age, how often you want to return, and whether your regrowth feels intentional or demanding.',
      'This service is best for clients with approximately two inches or less of regrowth who are maintaining an existing color plan.',
      'If you\u2019re unsure whether you need a root retouch, a refresh, or a different approach entirely, a consultation is always the best place to start.',
    ],
    bulletPoints: [
      'refreshing an all-over color as it grows out',
      'gray coverage at the root',
      'soft gray blending for a more diffused, low-maintenance result',
    ],
    displayPrice: '$90',
    displayDuration: '1 hr 30 min',
    sortOrder: 4,
  },
  {
    id: 'all-over-color',
    displayName: 'All-Over Color | Base Enhancement',
    squareNamePattern: 'All-Over Color',
    description: [
      'All-Over Color is designed to enhance, refresh, or intentionally shift your natural or existing base color.',
      'When I design an all-over color, I\u2019m thinking about how it will grow out, how often you want to return, and how it fits into your day-to-day life \u2014 not just how it looks when you leave the chair.',
      'If you\u2019re unsure whether this or a Custom Color session is the right fit, a consultation will help us choose intentionally.',
    ],
    bulletPoints: [
      'deepening or enriching your current shade',
      'shifting tone while maintaining consistency from roots to ends',
      'gray coverage or soft blending',
      'clients who want a polished, cohesive color without dimensional techniques',
    ],
    displayPrice: '$160',
    displayDuration: '2 hr',
    sortOrder: 5,
  },
  {
    id: 'custom-color-3hr',
    displayName: 'Custom Color | 3-Hour Session',
    squareNamePattern: 'Custom Color | 3-Hour',
    description: [
      'This is a time-based, fully customized color service designed around what your hair needs, not a specific technique.',
      'We reserve three hours to create brightness, dimension, blending, or coverage in a way that grows out beautifully and fits your lifestyle.',
      'Techniques are chosen during your appointment based on your hair, goals, and maintenance preferences \u2014 the focus is on achieving the right result within this time frame.',
      'Ideal for clients wanting intentional color without committing to an all-day appointment or frequent touch-ups.',
      'If you\u2019re unsure how much time your hair needs, a consultation helps us decide together.',
    ],
    displayPrice: '$250',
    displayDuration: '3 hr',
    sortOrder: 6,
  },
  {
    id: 'custom-color-4hr',
    displayName: 'Custom Color | 4-Hour Session',
    squareNamePattern: 'Custom Color | 4-Hour',
    description: [
      'This 4-hour custom color session is ideal for clients with longer or thicker hair, or anyone looking to make a more noticeable change.',
      'The focus is on having enough time to thoughtfully design and execute your color without rushing \u2014 whether that means more hair to work through, more depth to build, or a larger shift in tone or placement.',
      'Techniques vary based on your goals. What matters most is having the right amount of time to do the work well, while still prioritizing longevity, balance, and wearability.',
    ],
    displayPrice: '$340',
    displayDuration: '4 hr',
    sortOrder: 7,
  },
  {
    id: 'custom-color-extended',
    displayName: 'Custom Color | Extended Session',
    squareNamePattern: 'Custom Color | Extended',
    description: [
      'This is a time-based color session designed for services requiring 5 hours or more and a higher level of planning.',
      'Extended Sessions are reserved for work that is more complex, transformative, or product-intensive \u2014 including creative color, color corrections, significant blonding changes, gray transitions, or services on extra long or dense hair.',
      'An in-person consultation is required before booking this service. This allows us to clearly define your goals, determine the appropriate amount of time, and create a thoughtful plan before your appointment.',
      'Because Extended Sessions often consume a full day and require additional product and preparation, they are priced at a higher hourly rate than standard Custom Color sessions.',
      'If you\u2019re unsure which service to book, start with a consultation and we\u2019ll decide together.',
    ],
    displayPrice: '$500',
    displayDuration: '5 hr',
    consultationRequired: true,
    sortOrder: 8,
  },
  {
    id: 'mini-services',
    displayName: 'Mini Services',
    squareNamePattern: '',
    description: [
      'Mini Services are designed to support your hair between full appointments \u2014 thoughtfully, not reactively.',
      'These are not shortcuts or replacements for full services. They\u2019re intentional touch-ups that help extend the life of your cut or color while keeping your hair feeling polished and aligned.',
      'Think of them as small, strategic adjustments that keep your hair working with you \u2014 not calling the shots.',
      'If you\u2019re unsure which option fits best, we\u2019ll decide together.',
    ],
    bulletPoints: [
      'are stretching time between full appointments',
      'want to refresh specific areas without a full overhaul',
      'prefer maintenance that feels calm, efficient, and purposeful',
    ],
    displayPrice: 'Price varies',
    displayDuration: '30 min+',
    isMiniCategory: true,
    sortOrder: 9,
  },
];

/**
 * Match a Square service to its local content entry by name pattern.
 * Returns null for mini services (they use Square names with prefix stripped).
 */
export function matchServiceToContent(
  squareName: string,
  contentList: BookingServiceContent[] = bookingServices
): BookingServiceContent | null {
  // Mini services don't have individual content entries
  if (squareName.startsWith('Mini Services')) return null;

  return (
    contentList.find(
      (c) =>
        !c.isMiniCategory &&
        c.squareNamePattern &&
        squareName.toLowerCase().startsWith(c.squareNamePattern.toLowerCase())
    ) ?? null
  );
}
