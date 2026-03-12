/**
 * Pre-populated color brand/line/shade data for Color Lab.
 * Seeded into DB on first access if color_lines table is empty.
 *
 * Brands Karli commonly uses + popular professional lines.
 * "Create Your Own" option handled in UI (is_custom = 1 in DB).
 */

export interface ColorBrandSeed {
  brand: string;
  lines: {
    name: string;
    shades: { name: string; code?: string }[];
  }[];
}

export const COLOR_BRANDS: ColorBrandSeed[] = [
  {
    brand: 'Redken',
    lines: [
      {
        name: 'Shades EQ',
        shades: [
          { name: '01B Onyx', code: '01B' },
          { name: '02B Midnight Sky', code: '02B' },
          { name: '03N Espresso', code: '03N' },
          { name: '04N Storm', code: '04N' },
          { name: '05N Walnut', code: '05N' },
          { name: '06N Moroccan Sand', code: '06N' },
          { name: '06NB Brandy', code: '06NB' },
          { name: '07NB Chestnut', code: '07NB' },
          { name: '08N Mojave', code: '08N' },
          { name: '08V Iridescent Quartz', code: '08V' },
          { name: '09AA Papaya', code: '09AA' },
          { name: '09G Vanilla Creme', code: '09G' },
          { name: '09N Cafe Au Lait', code: '09N' },
          { name: '09P Opal Glow', code: '09P' },
          { name: '09T Chrome', code: '09T' },
          { name: '010N Delicate Natural', code: '010N' },
          { name: '010T Platinum', code: '010T' },
          { name: '010VV Lavender Ice', code: '010VV' },
        ],
      },
      {
        name: 'Color Fusion',
        shades: [
          { name: '3N Natural', code: '3N' },
          { name: '4N Natural', code: '4N' },
          { name: '5N Natural', code: '5N' },
          { name: '6N Natural', code: '6N' },
          { name: '7N Natural', code: '7N' },
          { name: '8N Natural', code: '8N' },
          { name: '5Cr Copper Red', code: '5Cr' },
          { name: '6Cr Copper Red', code: '6Cr' },
          { name: '7Cr Copper Red', code: '7Cr' },
        ],
      },
      {
        name: 'Cover Fusion',
        shades: [
          { name: '5NN Natural Natural', code: '5NN' },
          { name: '6NN Natural Natural', code: '6NN' },
          { name: '7NN Natural Natural', code: '7NN' },
          { name: '8NN Natural Natural', code: '8NN' },
          { name: '5NA Natural Ash', code: '5NA' },
          { name: '6NA Natural Ash', code: '6NA' },
        ],
      },
    ],
  },
  {
    brand: 'Wella',
    lines: [
      {
        name: 'Koleston Perfect',
        shades: [
          { name: '2/0 Black', code: '2/0' },
          { name: '4/0 Medium Brown', code: '4/0' },
          { name: '5/0 Light Brown', code: '5/0' },
          { name: '6/0 Dark Blonde', code: '6/0' },
          { name: '7/0 Medium Blonde', code: '7/0' },
          { name: '8/0 Light Blonde', code: '8/0' },
          { name: '9/0 Very Light Blonde', code: '9/0' },
          { name: '6/71 Dark Blonde Brown Ash', code: '6/71' },
          { name: '7/71 Medium Blonde Brown Ash', code: '7/71' },
          { name: '8/71 Light Blonde Brown Ash', code: '8/71' },
        ],
      },
      {
        name: 'Illumina Color',
        shades: [
          { name: '5/ Light Brown', code: '5/' },
          { name: '6/ Dark Blonde', code: '6/' },
          { name: '7/ Medium Blonde', code: '7/' },
          { name: '8/ Light Blonde', code: '8/' },
          { name: '9/ Very Light Blonde', code: '9/' },
          { name: '10/ Lightest Blonde', code: '10/' },
          { name: '7/35 Medium Gold Mahogany Blonde', code: '7/35' },
          { name: '8/69 Light Violet Cendre Blonde', code: '8/69' },
        ],
      },
      {
        name: 'Color Touch',
        shades: [
          { name: '4/0 Medium Brown', code: '4/0' },
          { name: '5/0 Light Brown', code: '5/0' },
          { name: '6/0 Dark Blonde', code: '6/0' },
          { name: '7/0 Medium Blonde', code: '7/0' },
          { name: '8/0 Light Blonde', code: '8/0' },
          { name: '9/16 Very Light Blonde Ash Violet', code: '9/16' },
          { name: '10/6 Lightest Blonde Violet', code: '10/6' },
        ],
      },
    ],
  },
  {
    brand: 'Schwarzkopf',
    lines: [
      {
        name: 'Igora Royal',
        shades: [
          { name: '3-0 Dark Brown', code: '3-0' },
          { name: '4-0 Medium Brown', code: '4-0' },
          { name: '5-0 Light Brown', code: '5-0' },
          { name: '6-0 Dark Blonde', code: '6-0' },
          { name: '7-0 Medium Blonde', code: '7-0' },
          { name: '8-0 Light Blonde', code: '8-0' },
          { name: '9-0 Extra Light Blonde', code: '9-0' },
          { name: '6-12 Dark Blonde Cendre Ash', code: '6-12' },
          { name: '7-12 Medium Blonde Cendre Ash', code: '7-12' },
          { name: '9-12 Extra Light Blonde Cendre Ash', code: '9-12' },
        ],
      },
      {
        name: 'Igora Vibrance',
        shades: [
          { name: '4-0 Medium Brown', code: '4-0' },
          { name: '5-0 Light Brown', code: '5-0' },
          { name: '6-0 Dark Blonde', code: '6-0' },
          { name: '7-0 Medium Blonde', code: '7-0' },
          { name: '8-0 Light Blonde', code: '8-0' },
          { name: '9-0 Extra Light Blonde', code: '9-0' },
          { name: '9.5-1 Platinum Cendre', code: '9.5-1' },
        ],
      },
    ],
  },
  {
    brand: 'Joico',
    lines: [
      {
        name: 'LumiShine',
        shades: [
          { name: '4N Natural Medium Brown', code: '4N' },
          { name: '5N Natural Light Brown', code: '5N' },
          { name: '6N Natural Dark Blonde', code: '6N' },
          { name: '7N Natural Medium Blonde', code: '7N' },
          { name: '8N Natural Light Blonde', code: '8N' },
          { name: '9N Natural Very Light Blonde', code: '9N' },
          { name: '6NWB Natural Warm Beige Dark Blonde', code: '6NWB' },
          { name: '7NWB Natural Warm Beige Medium Blonde', code: '7NWB' },
        ],
      },
      {
        name: 'Vero K-PAK',
        shades: [
          { name: '4N Dark Brown', code: '4N' },
          { name: '5N Medium Brown', code: '5N' },
          { name: '6N Light Brown', code: '6N' },
          { name: '7N Dark Blonde', code: '7N' },
          { name: '8N Medium Blonde', code: '8N' },
        ],
      },
    ],
  },
  {
    brand: 'Kenra',
    lines: [
      {
        name: 'Kenra Color',
        shades: [
          { name: '4N Natural Brown', code: '4N' },
          { name: '5N Natural Light Brown', code: '5N' },
          { name: '6N Natural Dark Blonde', code: '6N' },
          { name: '7N Natural Medium Blonde', code: '7N' },
          { name: '8N Natural Light Blonde', code: '8N' },
          { name: '9N Natural Very Light Blonde', code: '9N' },
          { name: '10N Natural Extra Light Blonde', code: '10N' },
          { name: '7SM Silver Metallic', code: '7SM' },
          { name: '8SM Silver Metallic', code: '8SM' },
        ],
      },
      {
        name: 'Demi-Permanent',
        shades: [
          { name: '5N Natural', code: '5N' },
          { name: '6N Natural', code: '6N' },
          { name: '7N Natural', code: '7N' },
          { name: '8N Natural', code: '8N' },
          { name: '9N Natural', code: '9N' },
        ],
      },
    ],
  },
  {
    brand: 'Matrix',
    lines: [
      {
        name: 'SoColor',
        shades: [
          { name: '4N Dark Brown Neutral', code: '4N' },
          { name: '5N Light Brown Neutral', code: '5N' },
          { name: '6N Dark Blonde Neutral', code: '6N' },
          { name: '7N Medium Blonde Neutral', code: '7N' },
          { name: '8N Light Blonde Neutral', code: '8N' },
          { name: '6NW Dark Blonde Neutral Warm', code: '6NW' },
          { name: '7NW Medium Blonde Neutral Warm', code: '7NW' },
          { name: '8NW Light Blonde Neutral Warm', code: '8NW' },
        ],
      },
      {
        name: 'Color Sync',
        shades: [
          { name: '5N Light Brown Neutral', code: '5N' },
          { name: '6N Dark Blonde Neutral', code: '6N' },
          { name: '7N Medium Blonde Neutral', code: '7N' },
          { name: '8N Light Blonde Neutral', code: '8N' },
          { name: '9N Very Light Blonde Neutral', code: '9N' },
          { name: '10N Extra Light Blonde Neutral', code: '10N' },
          { name: 'Sheer Acidic Toner Clear', code: 'Clear' },
        ],
      },
    ],
  },
  {
    brand: 'Pravana',
    lines: [
      {
        name: 'ChromaSilk',
        shades: [
          { name: '4N Natural Brown', code: '4N' },
          { name: '5N Natural Light Brown', code: '5N' },
          { name: '6N Natural Dark Blonde', code: '6N' },
          { name: '7N Natural Medium Blonde', code: '7N' },
          { name: '8N Natural Light Blonde', code: '8N' },
          { name: '9N Natural Very Light Blonde', code: '9N' },
        ],
      },
      {
        name: 'Vivids',
        shades: [
          { name: 'Blue' },
          { name: 'Green' },
          { name: 'Magenta' },
          { name: 'Neon Blue' },
          { name: 'Neon Green' },
          { name: 'Neon Orange' },
          { name: 'Neon Pink' },
          { name: 'Neon Yellow' },
          { name: 'Orange' },
          { name: 'Pink' },
          { name: 'Red' },
          { name: 'Silver' },
          { name: 'Violet' },
          { name: 'Wild Orchid' },
          { name: 'Yellow' },
        ],
      },
    ],
  },
  {
    brand: 'Pulp Riot',
    lines: [
      {
        name: 'Semi-Permanent',
        shades: [
          { name: 'Absinthe (Green)' },
          { name: 'Candy (Pink)' },
          { name: 'Cupid (Rose Gold)' },
          { name: 'Fireball (Red-Orange)' },
          { name: 'Jam (Dark Purple)' },
          { name: 'Lemon (Yellow)' },
          { name: 'Mercury (Silver)' },
          { name: 'Nemesis (Blue)' },
          { name: 'Nightfall (Navy)' },
          { name: 'Nirvana (Lilac)' },
          { name: 'Velvet (Purple)' },
        ],
      },
      {
        name: 'Faction8',
        shades: [
          { name: '4-0 Natural Brown', code: '4-0' },
          { name: '5-0 Natural Light Brown', code: '5-0' },
          { name: '6-0 Natural Dark Blonde', code: '6-0' },
          { name: '7-0 Natural Medium Blonde', code: '7-0' },
          { name: '8-0 Natural Light Blonde', code: '8-0' },
          { name: '10-0 Natural Lightest Blonde', code: '10-0' },
        ],
      },
    ],
  },
];

/** Developer volume options */
export const DEVELOPER_VOLUMES = ['5 Vol', '10 Vol', '20 Vol', '30 Vol', '40 Vol'] as const;

/** Common color techniques */
export const COLOR_TECHNIQUES = [
  'Full Color',
  'Root Touch-Up',
  'Balayage',
  'Foil Highlights',
  'Partial Highlights',
  'Lowlights',
  'Toner',
  'Gloss',
  'Color Melt',
  'Shadow Root',
  'Ombre',
  'Face Frame',
  'Money Piece',
  'Cap Highlights',
  'Corrective Color',
  'Vivid/Fashion Color',
] as const;

/** Common placement descriptions */
export const COLOR_PLACEMENTS = [
  'All Over',
  'Roots Only',
  'Mid-Lengths to Ends',
  'Crown',
  'Face Frame',
  'Money Piece',
  'Back Section',
  'Top Half',
  'Bottom Half',
  'Nape',
  'Temple',
  'Full Head Foils',
  'Partial (Top)',
  'Partial (Sides)',
  'Custom Zone',
] as const;

/** Inventory unit options */
export const INVENTORY_UNITS = ['tubes', 'bottles', 'packets', 'oz', 'g'] as const;
