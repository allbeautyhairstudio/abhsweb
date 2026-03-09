export interface Service {
  id: string;
  name: string;
  description: string;
  details: string[];
  icon: 'scissors' | 'palette' | 'sparkles' | 'clock';
  karlisTake: string;
  price?: string;
  duration?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  subtitle: string;
  karliIntro: string;
  services: Service[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'precision-cuts',
    title: 'Precision Cuts',
    subtitle:
      'Every cut is designed to grow out beautifully, work with your natural texture, and fit your lifestyle.',
    karliIntro:
      'I don\u2019t do autopilot haircuts. Every single person who sits in my chair has different hair, a different face shape, a different morning routine, and a different life. A cut should work for YOUR life \u2014 not look amazing for two weeks and then fall apart. I design cuts that still look intentional at week six, week eight, even longer. That\u2019s the whole point.',
    services: [
      {
        id: 'artisan-cut',
        name: 'Artisan Cut',
        description:
          'The most customized cutting experience. Includes a thorough consultation to understand your hair goals, lifestyle, and maintenance preferences.',
        details: [
          'In-depth consultation included',
          'Customized to your texture, face shape, and lifestyle',
          'Designed for graceful grow-out',
          'Wash, cut, and style',
        ],
        icon: 'scissors',
        karlisTake:
          'This is my favorite service to do. We take the time to really talk \u2014 about your hair, your life, what\u2019s working and what isn\u2019t. Every head of hair is different, and this is where I get to design something that\u2019s truly yours.',
      },
      {
        id: 'signature-cut',
        name: 'Signature Cut',
        description:
          'A precision cut for clients who know what they want. Clean, intentional, and built to last between visits.',
        details: [
          'Simplified precision option',
          'Wash, cut, and style',
          'Great for maintenance appointments',
        ],
        icon: 'scissors',
        karlisTake:
          'For my clients who already know their hair and know what they want \u2014 we skip the deep dive and I just do what I do. Same precision, same intention, just streamlined because we\u2019ve already built that foundation together.',
      },
    ],
  },
  {
    id: 'intentional-color',
    title: 'Intentional Color',
    subtitle:
      'Color that enhances your natural tones and grows out gracefully \u2014 so you decide when to come back, not your roots.',
    karliIntro:
      'Here\u2019s the thing about color \u2014 most people have been taught that they NEED to come back every 4\u20136 weeks or their hair will look bad. That\u2019s a design problem, not a you problem. I place color strategically so it grows out gracefully. No harsh lines. No panic at week five. You come back when YOU\u2019re ready, not because your roots are screaming at you.',
    services: [
      {
        id: 'custom-color-3hr',
        name: 'Custom Color | 3-Hour Session',
        description:
          'A full custom color session for single-process color, root touch-ups with toning, or partial highlights.',
        details: [
          'Consultation, color, and style',
          'Ideal for most color services',
          'Formulated for longevity',
        ],
        icon: 'palette',
        karlisTake:
          'This covers most of what people need. Whether it\u2019s a fresh single process, a toner refresh, or partial highlights \u2014 three hours gives us room to do it right without rushing.',
      },
      {
        id: 'custom-color-4hr',
        name: 'Custom Color | 4-Hour Session',
        description:
          'Extended session for more complex color work \u2014 full highlights, color corrections, or multi-dimensional color.',
        details: [
          'Multi-step color processes',
          'Full highlight or balayage',
          'Color correction',
        ],
        icon: 'palette',
        karlisTake:
          'When there\u2019s more going on \u2014 a full head of highlights, balayage, or fixing something that went sideways somewhere else \u2014 this is the session for that. Complex color deserves time and attention, not a rush job.',
      },
      {
        id: 'custom-color-extended',
        name: 'Custom Color | Extended Session',
        description:
          'For the most involved transformations \u2014 significant color changes, extensive corrections, or combination services.',
        details: [
          'Major transformations',
          'Complex corrections',
          'Cut + color combination services',
        ],
        icon: 'palette',
        karlisTake:
          'This is for the big stuff. Going from dark to light, major color corrections, or when you want a full transformation with a cut. I\u2019ll be honest with you about what\u2019s realistic in one session and what might need a plan.',
      },
      {
        id: 'root-retouch',
        name: 'Root Retouch',
        description:
          'Maintenance for your existing color. Quick and efficient, designed to keep you looking fresh without a full session.',
        details: [
          'Root coverage or refresh',
          'Maintains your current color',
          'Efficient maintenance appointment',
        ],
        icon: 'palette',
        karlisTake:
          'Sometimes you just need a refresh, not a reinvention. This keeps your color looking intentional without a full session. In and out, looking great.',
      },
      {
        id: 'all-over-color',
        name: 'All-Over Color | Base Enhancement',
        description:
          'A single-process color that enhances your natural base \u2014 adding richness, depth, or covering gray.',
        details: [
          'Single-process application',
          'Natural-looking enhancement',
          'Gray coverage available',
        ],
        icon: 'palette',
        karlisTake:
          'I love this service for people who want to enhance what they already have. It\u2019s not about becoming someone else \u2014 it\u2019s about making your natural color richer, deeper, or blending gray in a way that looks like you, just more polished.',
      },
    ],
  },
  {
    id: 'maintenance-planning',
    title: 'Maintenance & Planning',
    subtitle:
      'Strategic support to keep your hair looking its best between full appointments.',
    karliIntro:
      'Not everything needs to be a big appointment. Sometimes you need a plan. Sometimes you just need a bang trim so you can see again. This category exists because hair is ongoing, and I want to make sure you have support between the big stuff \u2014 without it feeling like a whole production every time.',
    services: [
      {
        id: 'consultation',
        name: 'Consultation',
        description:
          'A strategic planning session to design your hair journey. We start with your life, not a Pinterest board.',
        details: [
          'Hair history and goals discussion',
          'Lifestyle and maintenance assessment',
          'Custom plan for your hair',
          'No obligation \u2014 just clarity',
        ],
        icon: 'sparkles',
        karlisTake:
          'This is where the magic starts. We don\u2019t start with a reference photo \u2014 we start with your life. How much time do you actually spend on your hair? What frustrates you? What do you love? I\u2019d rather know all of that before I ever pick up a tool.',
      },
    ],
  },
  {
    id: 'mini-services',
    title: 'Mini Services',
    subtitle:
      'Designed to support your hair between full appointments \u2014 thoughtfully, not reactively. Price varies \u00B7 30 min+',
    karliIntro:
      'These are not shortcuts or replacements for full services. They\u2019re intentional touch-ups that help extend the life of your cut or color while keeping your hair feeling polished and aligned. Think of them as small, strategic adjustments that keep your hair working with you \u2014 not calling the shots. If you\u2019re unsure which option fits best, we\u2019ll decide together.',
    services: [
      {
        id: 'halo-highlight',
        name: 'Halo Highlight',
        description:
          'Subtle, sun-kissed dimension placed around the crown and face \u2014 the "I just got back from vacation" look.',
        details: ['Strategically placed for natural effect', 'Great for extending time between full highlights'],
        icon: 'palette',
        karlisTake: 'This is one of my favorite quick refreshes. A little light around the face changes everything.',
        price: '$160',
        duration: '2 hr',
      },
      {
        id: 'face-frame-highlights',
        name: 'Face Frame Highlights',
        description:
          'Brightening highlights focused around your face \u2014 the pieces you see the most.',
        details: ['Frames and lifts the face', 'Quick way to refresh your color'],
        icon: 'palette',
        karlisTake: 'If you want a noticeable change without a full highlight, this is it. These pieces do the heavy lifting.',
        price: '$80',
        duration: '1 hr 30 min',
      },
      {
        id: 't-zone-refresh',
        name: 'T Zone Refresh',
        description:
          'A targeted refresh along the part line and hairline \u2014 where regrowth shows first.',
        details: ['Covers visible regrowth at the part', 'Quick and efficient'],
        icon: 'palette',
        karlisTake: 'For when your part is the only thing bothering you and you don\u2019t need a full appointment.',
        price: '$35',
        duration: '45 min',
      },
      {
        id: 'toner-refresh',
        name: 'Toner Refresh',
        description:
          'Revives your tone between color appointments \u2014 keeps brassiness away and your color looking fresh.',
        details: ['Corrects warmth or brassiness', 'Extends the life of your color'],
        icon: 'palette',
        karlisTake: 'Toner is the unsung hero of color. This keeps everything looking intentional between your big appointments.',
        price: '$75',
        duration: '55 min',
      },
      {
        id: '8-foil-highlight',
        name: '8 Foil Highlight',
        description:
          'A small, strategic set of foils \u2014 just enough to add dimension or refresh specific areas.',
        details: ['8 foils placed where they count', 'Partial highlight for targeted lift'],
        icon: 'palette',
        karlisTake: 'Sometimes you only need a few foils in the right spots to make everything feel fresh again.',
        price: '$100',
        duration: '1 hr 30 min',
      },
      {
        id: 'partial-highlight',
        name: '15\u201318 Foil Partial Highlight',
        description:
          'A more substantial partial highlight \u2014 adds significant dimension without a full head of foils.',
        details: ['15\u201318 strategically placed foils', 'Great midpoint between mini and full'],
        icon: 'palette',
        karlisTake: 'This is the sweet spot for a lot of my clients \u2014 enough coverage to feel refreshed, not so much that you\u2019re in the chair all day.',
        price: '$160',
        duration: '2 hr 30 min',
      },
      {
        id: 'signature-blowdry',
        name: 'Signature Blowdry',
        description:
          'A polished blowout that leaves your hair feeling salon-fresh. Perfect before an event or just because.',
        details: ['Professional wash and blowdry', 'Styled to your preference'],
        icon: 'sparkles',
        karlisTake: 'Sometimes you just want to feel amazing. No cut, no color \u2014 just really, really good hair.',
        price: '$45',
        duration: '40 min',
      },
      {
        id: 'scalp-treatment',
        name: 'Scalp Treatment',
        description:
          'A therapeutic treatment for your scalp \u2014 nourishing, restorative, and incredibly relaxing.',
        details: ['Deep cleanse and nourishment', 'Promotes healthy hair growth'],
        icon: 'sparkles',
        karlisTake: 'Healthy hair starts at the scalp. This is one of those services people don\u2019t know they need until they try it.',
        price: '$65',
        duration: '30 min',
      },
      {
        id: 'deep-conditioning',
        name: 'Deep Conditioning Treatment',
        description:
          'Intensive moisture and repair for hair that needs extra care \u2014 dry, damaged, or chemically treated.',
        details: ['Deep hydration and protein balance', 'Restores strength and shine'],
        icon: 'sparkles',
        karlisTake: 'If your hair is telling you it\u2019s tired, this is the reset. Think of it as a spa day for your strands.',
        price: '$65',
        duration: '30 min',
      },
      {
        id: 'express-haircut',
        name: 'Express Haircut',
        description:
          'A streamlined precision cut for when you know what you want and just need it done right.',
        details: ['Quick, efficient cut', 'No wash \u2014 dry cut or bang trim'],
        icon: 'scissors',
        karlisTake: 'In and out, no fuss. For when your bangs are in your eyes or you just need a clean-up.',
        price: '$35',
        duration: '30 min',
      },
    ],
  },
];
