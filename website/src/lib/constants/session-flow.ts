/**
 * 90-Minute Session Flow — extracted from docs/masterplan.md Section 5.
 * Static reference data rendered on the Session Prep page.
 */

export const SESSION_FLOW_BLOCKS = [
  {
    time: '0:00–0:10',
    label: 'Welcome & Connection',
    whatHappens: 'Welcome them. Set expectations. Ask 1-2 clarifying questions from their intake.',
    notes: 'Build rapport first. Don\'t dive into "findings." Make them feel comfortable.',
  },
  {
    time: '0:10–0:30',
    label: 'Diagnosis & Attention Leaks',
    whatHappens: 'Walk through their business snapshot. Share what\'s already working (start positive). Present attention leaks as opportunities.',
    notes: 'Frame as "here\'s where you can recapture attention" — never "here\'s what\'s wrong." Use the roadmap as guide.',
  },
  {
    time: '0:30–0:50',
    label: 'Weekly System & Attraction Plan',
    whatHappens: 'Present their customized weekly system. Walk through each action. Show how it fits their time capacity.',
    notes: 'This is the "relief" moment. Keep it simple. If they look overwhelmed, simplify further.',
  },
  {
    time: '0:50–1:10',
    label: 'AI Workflows & Live Demo',
    whatHappens: 'Introduce the 1-2 most relevant workflows. Do a LIVE DEMO: open ChatGPT, paste a prompt with their details, show the output.',
    notes: 'This is the "wow" moment. Live demo builds confidence. Let them see it\'s not scary.',
  },
  {
    time: '1:10–1:25',
    label: '90-Day Plan & Week 1 Action Card',
    whatHappens: 'Walk through Month 1, 2, 3 briefly. Zoom in on Week 1 Action Card. Make sure they know exactly what to do first.',
    notes: 'The Week 1 Card is the most important deliverable. If they leave knowing these 3 actions, the session worked.',
  },
  {
    time: '1:25–1:30',
    label: 'Q&A, Next Steps & Close',
    whatHappens: 'Answer questions. Confirm deliverable delivery. Mention 30-day check-in. Ask for initial reaction/feedback.',
    notes: 'End strong. "You\'re not starting from zero anymore. You have a system."',
  },
] as const;

export const ARCHETYPE_TIPS: Record<string, readonly string[]> = {
  overwhelmed_poster: [
    'Acknowledge they\'ve been working hard — the problem isn\'t effort, it\'s direction',
    'Focus on the Content Engine workflow — replace random posting with strategic batching',
    'Show them how fewer, better posts can outperform daily random content',
  ],
  avoider: [
    'Don\'t make them feel guilty about not posting',
    'Lead with the Retention Loop — it barely requires social media',
    'Show non-social-media options first (texting clients, asking for reviews, referral outreach)',
    'Only introduce social media if they\'re open to it',
  ],
} as const;

export const WATCH_TIPS = [
  'Move slower through the material',
  'Check in frequently: "How does this feel? Too much?"',
  'Be ready to simplify the weekly system on the spot',
  'Emphasize: "You don\'t have to do all of this. Start with one thing."',
] as const;

export const REDIRECT_TIPS = [
  'Address the real bottleneck first (first 5-10 minutes after diagnosis)',
  'Be honest but compassionate: "I want to flag something before we go further..."',
  'Still deliver the marketing system, but note which pieces to prioritize after the underlying issue is addressed',
] as const;
