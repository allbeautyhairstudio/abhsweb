export interface PromptTemplate {
  code: string;
  name: string;
  category: 'backend_analysis' | 'content_ideas' | 'client_workflows' | 'weekly_system';
  tier: 1 | 2 | 3 | 4;
  description: string;
  when_to_use: string;
  time_estimate: string;
  template: string;
  chain_dependency?: string;
  has_dynamic_placeholders: boolean;
}

export const PROMPT_CATEGORIES = [
  { id: 'backend_analysis', label: 'Backend Analysis', tier: 1, description: "Karli's prep tools — run before every session" },
  { id: 'content_ideas', label: '10 Content Ideas', tier: 2, description: 'Generate tailored content ideas for client deliverables' },
  { id: 'client_workflows', label: 'Client Workflows', tier: 3, description: 'Copy-paste prompts the client uses ongoing' },
  { id: 'weekly_system', label: 'Weekly System', tier: 4, description: 'Personalized weekly marketing system' },
] as const;

// ---------------------------------------------------------------------------
// TIER 1: BACKEND ANALYSIS PROMPTS (from ifprompts.md)
// ---------------------------------------------------------------------------

const QS: PromptTemplate = {
  code: 'QS',
  name: 'Quick Scan (Fit Assessment)',
  category: 'backend_analysis',
  tier: 1,
  description: 'Determine fit/no-fit in under 5 minutes',
  when_to_use: 'Immediately after intake is submitted, before confirming payment/scheduling',
  time_estimate: '~5 min',
  has_dynamic_placeholders: false,
  template: `ROLE
You are a business fit assessor for a marketing reset service designed for local service-based businesses.

TASK
Review this intake form and provide a quick fit assessment. I need to know:
1. Is this person a good fit for a one-time marketing reset?
2. What's their primary need in one sentence?
3. Any red flags or special considerations?

ASSESSMENT CATEGORIES
Rate this client as one of the following:

GREEN — GOOD FIT
Clear service business, identifiable marketing gaps, realistic expectations, willing to implement.

YELLOW — FIT WITH NOTES
Good fit but may need expectation management. Examples: very low confidence, unrealistic timeline expectations, emotional state that needs careful handling, limited capacity.

RED — NOT A FIT (or not yet)
Examples: Not a service business, needs therapy not marketing, business model isn't viable, expectations cannot be met with this service, needs ongoing management not a one-time reset.

INTEREST FLAGS
Also flag any of these if present:
- HIGH OPPORTUNITY: Clear quick wins available, high motivation, strong existing foundation
- WATCH: Constraint that could limit implementation (time, confidence, burnout)
- REDIRECT: Marketing may not be their actual bottleneck (pricing, burnout, personal crisis, business model issue)

FORMAT
Keep your response under 200 words. Be direct.

INTAKE DATA
[PASTE FULL INTAKE RESPONSES HERE]`,
};

const MA: PromptTemplate = {
  code: 'MA',
  name: 'Master Analysis (Full Diagnostic)',
  category: 'backend_analysis',
  tier: 1,
  description: 'Process complete intake and produce all 9 core deliverables in one pass',
  when_to_use: 'After client is confirmed and paid — main prep work',
  time_estimate: '~30-40 min',
  has_dynamic_placeholders: false,
  template: `ROLE
You are an expert strategist specializing in local service-based businesses and client-attraction systems.

Your role is to analyze the business intake below and produce a clear, realistic, capacity-aware marketing reset.

Focus on simplicity, clarity, and sustainable growth — NOT complex marketing funnels.

CONTEXT
This business is seeking clarity on how to attract and retain clients without spending excessive time on marketing.

Many service providers feel overwhelmed, inconsistent, or confused by modern marketing tools.

Recommendations must be:
- realistic for limited time and energy
- easy to implement with no marketing background
- aligned with their current stage and emotional state
- sustainable long-term (not a burst of activity that fades)

INTAKE DATA
[PASTE FULL INTAKE RESPONSES HERE]

---

STEP 1 — BUSINESS SNAPSHOT
Summarize in a brief paragraph:
- Business type, location, and positioning
- Ideal client profile (based on their description)
- Primary services and revenue drivers
- Current client flow (where clients come from now)
- Capacity and key constraints
- What's already working (call this out — it builds confidence)

STEP 2 — STAGE & READINESS DIAGNOSIS
Based on the intake responses, determine:

Business Stage (select one):
- New / building from scratch
- Established but inconsistent bookings
- Fully booked but want better clients or higher pricing
- Overwhelmed / burned out
- Stagnant / plateaued

Marketing Maturity (select one):
- None — no intentional marketing
- Random posting — no strategy behind it
- Inconsistent strategy — knows what to do but doesn't do it regularly
- Active but ineffective — doing the work without seeing results
- Optimized and scaling — systems in place and working

Emotional State (select one or two):
- Overwhelmed
- Confused
- Resistant
- Burned out
- Curious and ready

Client Archetype (select one):
- The Overwhelmed Poster — posts but sees no results, needs simplification
- The Avoider — doesn't post or markets minimally, needs low-barrier entry points

Explain your assessment briefly (2-3 sentences).

STEP 3 — ATTENTION LEAK ANALYSIS
Identify the top 5 places this business is losing potential clients or visibility.

For each leak:
- Name it clearly (e.g., "No Google Business presence," "Relying only on referrals")
- Explain why it matters in plain language
- Rate the impact: HIGH / MEDIUM / LOW
- Suggest a specific fix

Frame these as opportunities, not failures. Use language like "Here's where you can recapture attention" not "Here's what you're doing wrong."

STEP 4 — CLIENT ATTRACTION PRIORITIES
Based on their capacity and stage, identify the 3 highest-leverage actions they should focus on.

Consider:
- Visibility: Are people finding them?
- Trust: Do people trust them enough to book?
- Retention: Are existing clients coming back?
- Referrals: Are happy clients sending new ones?
- Conversion: Are interested people actually booking?

For each priority:
- What to do (specific action)
- Why it matters (connects to their situation)
- How long it takes (realistic time estimate)
- Which workflow or prompt supports it (reference the deliverable files)

Do NOT suggest complex funnels, daily posting, or paid ads unless their capacity and stage clearly support it.

STEP 5 — SIMPLE CLIENT-ATTRACTION SYSTEM (Weekly Plan)
Design a simple weekly system based on their stated time capacity:

Time capacity from intake: [reference their answer to question 38]

The system must include (scaled to their capacity):
- 1 visibility action — getting seen by potential clients
- 1 trust-building action — giving people a reason to choose them
- 1 retention action — keeping existing clients engaged
- 1 referral action — activating word-of-mouth

For each action, specify:
- What to do
- How long it takes
- Suggested day/time
- Which prompt to use (reference ncworkflowprompts.md)

If they selected "Under 30 minutes" — prioritize the single highest-impact action only.
If they selected "None right now" — provide a "bare minimum" plan (one action per week, under 15 min).

STEP 6 — AI-POWERED WORKFLOWS
Recommend which of the 3 workflows are most relevant to this client:

Workflow 1: The Content Engine (batch content creation)
Workflow 2: The Client Magnet (engagement to conversion)
Workflow 3: The Retention Loop (re-engagement and referrals)

For each recommended workflow:
- Why it's relevant to their situation
- Which specific prompts they should start with
- How to customize it for their business type
- Expected time investment

If the client indicated low AI comfort (question 36: "Never"), include a note:
"Start with just ONE prompt from Workflow [X]. Try it once. See what happens. You can always add more later."

STEP 7 — CONTENT & VISIBILITY IDEAS
Provide 10 tailored content/visibility ideas for this specific business.

Each idea should include:
- The idea (one sentence)
- Content type: educational / trust-building / social proof / behind-the-scenes / community / retention / promotion / FAQ / engagement / credibility
- Why it works for their business specifically
- Platform suggestion (Instagram, Facebook, Google Business, text/email, in-person)

Make ideas specific to their industry, services, and ideal client.
Mix quick-wins (under 5 min) with higher-effort pieces (15-20 min).
Include at least 2 ideas that don't require social media (for Avoiders).

STEP 8 — REFERRAL & RETENTION OPPORTUNITY
Identify ONE high-impact referral or retention opportunity specific to this business.

Include:
- What it is
- Why it matters (with math if possible — "If each happy client refers 1 person per quarter, that's X new clients per year")
- How to implement it (3 simple steps)
- Suggested language they can use (actual words/scripts)

STEP 9 — 90-DAY FOCUS PLAN
Create a progressive 90-day plan:

Month 1: Foundation — [2-3 specific focus areas]
"This month is about [theme]. Your main actions are..."

Month 2: Momentum — [2-3 specific focus areas]
"Now that [Month 1 outcomes], this month focus on..."

Month 3: Optimization — [2-3 specific focus areas]
"By now you should be seeing [expected progress]. This month..."

WEEK 1 ACTION CARD
List exactly 3 actions for their first week. These must be:
- Completable in under 30 minutes total
- Require no special tools or knowledge
- Produce a visible result (something they can see or feel)

Format:
Action 1: [specific action] — ~[X] minutes
Action 2: [specific action] — ~[X] minutes
Action 3: [specific action] — ~[X] minutes

STEP 10 — INTEREST FLAGS & SPECIAL NOTES
Flag any of the following if detected:

HIGH OPPORTUNITY:
- Quick wins available (specify which)
- High motivation detected
- Strong existing foundation to build on
- Underpriced services with clear room to raise rates

WATCH:
- Time constraints that may limit implementation
- Low confidence that may cause hesitation
- Burnout indicators — may need lighter load initially
- Unrealistic expectations that need gentle management

REDIRECT:
- Marketing is not the actual bottleneck — identify what is
- Emotional state suggests they may need support beyond marketing
- Business model concerns (viability, pricing structure, market fit)
- Personal crisis indicators — handle with extreme care

If any REDIRECT flags are present, note: "Consider addressing [X] before or alongside the marketing system. The reset can still provide value, but implementation may be limited until [X] is resolved."

---

OUTPUT FORMATTING
- Use clear headers and bullet points
- Keep language encouraging and non-judgmental
- Use "you" language (as if speaking to the client)
- Bold the most important recommendations
- Keep total output under 3,000 words (Karli needs to scan this quickly)

TONE
Write as if you're a knowledgeable friend who sees their potential — not a consultant lecturing them on what they should be doing. Frame everything as "here's what's possible" not "here's what's wrong."

If the intake reveals that marketing is not the primary bottleneck (e.g., pricing is too low, burnout is severe, business model needs restructuring), identify the actual bottleneck and recommend addressing it before or alongside implementing a visibility system.

Consider the client's geographic market when making recommendations. A hairstylist in rural Oklahoma has different opportunities than one in downtown LA.`,
};

const ALD: PromptTemplate = {
  code: 'ALD',
  name: 'Attention Leak Deep-Dive',
  category: 'backend_analysis',
  tier: 1,
  description: 'Deeper analysis of where and why the client is losing potential business',
  when_to_use: 'After Master Analysis, when you want to go deeper on the "where they\'re losing clients" conversation',
  time_estimate: '~13 min',
  has_dynamic_placeholders: false,
  chain_dependency: 'MA',
  template: `ROLE
You are a client-flow analyst specializing in local service businesses. You identify exactly where potential clients fall off — from first awareness to booking to retention.

TASK
Using the intake data and the business snapshot below, perform a detailed attention leak analysis.

INTAKE DATA
[PASTE FULL INTAKE RESPONSES HERE]

BUSINESS SNAPSHOT (from Master Analysis)
[PASTE THE STEP 1 OUTPUT FROM THE MASTER ANALYSIS]

---

For each of the following stages, identify if there's a leak and how significant it is:

1. DISCOVERY — Can people find this business?
   - Google presence (Maps, reviews, search)
   - Social media visibility
   - Referral pathways
   - Community presence
   - Directory listings (Yelp, Booksy, StyleSeat, etc.)

2. FIRST IMPRESSION — When people find them, what do they see?
   - Profile quality (photos, bio, branding)
   - Social proof (reviews, testimonials, before/afters)
   - Clarity of services and pricing
   - Professionalism signals

3. CONSIDERATION — Why would someone choose them over alternatives?
   - Unique positioning or specialization
   - Trust signals
   - Accessibility (easy to book, clear pricing, responsive)
   - Content that demonstrates expertise

4. CONVERSION — What happens when someone is ready to book?
   - Booking friction (how many steps to book?)
   - Response time to inquiries
   - Clear call-to-action
   - Payment clarity

5. RETENTION — Are existing clients coming back?
   - Rebooking prompts
   - Follow-up communication
   - Loyalty recognition
   - Service consistency

6. REFERRAL — Are happy clients sending new ones?
   - Referral asks (do they ask for referrals?)
   - Incentive systems
   - Shareable content/experiences
   - Review generation

FORMAT
For each stage:
- Status: STRONG / LEAKING / MISSING
- What's happening (1-2 sentences)
- The fix (specific, actionable)
- Priority: FIX NOW / FIX THIS MONTH / FIX THIS QUARTER
- Time to fix: [realistic estimate]

End with a summary: "Your biggest leak is at the [STAGE] stage. Fixing this first will have the most impact because [reason]."`,
};

const CPS: PromptTemplate = {
  code: 'CPS',
  name: 'Client Profile Summary',
  category: 'backend_analysis',
  tier: 1,
  description: 'One-page snapshot for quick session prep',
  when_to_use: '10-15 minutes before the session starts — quick reference card',
  time_estimate: '~5 min',
  has_dynamic_placeholders: false,
  template: `ROLE
You are preparing a concise client brief for a marketing strategy session.

TASK
Create a one-page client profile summary I can reference during a 90-minute session. Keep it scannable — bullet points and short phrases only.

INTAKE DATA
[PASTE FULL INTAKE RESPONSES HERE]

---

FORMAT (keep to one page / under 400 words):

CLIENT AT A GLANCE
- Name:
- Business:
- Location:
- Years in business:
- Schedule fullness:
- Stage:

WHAT THEY WANT
- Primary goal:
- 90-day vision (their words):
- Services they want to sell more of:

WHAT'S WORKING
- (2-3 things already going well — mention these early in the session to build confidence)

KEY CONSTRAINTS
- Time for marketing:
- Biggest constraint:
- Tech comfort:
- AI experience:

CLIENT TYPE
- Archetype: [Overwhelmed Poster / Avoider]
- Emotional state: [from intake]
- Confidence level: [X/5]

SESSION APPROACH NOTES
- Start with: [what to acknowledge first]
- Be careful about: [sensitivities to watch for]
- Key win to deliver: [the one thing that will make this session feel worth it]

INTEREST FLAGS
- [List any HIGH OPPORTUNITY / WATCH / REDIRECT flags]`,
};

const SNI: PromptTemplate = {
  code: 'SNI',
  name: 'Special Notes Integration',
  category: 'backend_analysis',
  tier: 1,
  description: 'Process the open-ended "anything else" response for hidden signals',
  when_to_use: 'When a client writes a substantial response to the final question (Q47)',
  time_estimate: '~7 min',
  has_dynamic_placeholders: false,
  chain_dependency: 'CPS',
  template: `ROLE
You are reading between the lines of a client's final open-ended response on a business intake form. This is often where people share what really matters — the things the structured questions didn't capture.

TASK
Analyze the text below for:
1. Emotional signals — What are they really feeling? (Fear, hope, frustration, determination, shame, excitement)
2. Hidden constraints — What haven't they said directly? (Financial stress, health issues, relationship dynamics, self-doubt)
3. Unspoken expectations — What do they seem to be hoping this service will do for them?
4. Session landmines — Topics to approach carefully or avoid
5. Trust signals — What would make them feel safe and understood in the session?
6. Quick wins — Based on what they shared, is there something obvious we could address immediately that would build trust?

THEIR RESPONSE TO "Is there anything else you feel is important for me to understand about your business, your goals, or your current situation?"

[PASTE THEIR RESPONSE TO QUESTION 47 HERE]

CONTEXT (paste if available)
[PASTE THE CLIENT PROFILE SUMMARY FROM PROMPT 4, OR KEY INTAKE HIGHLIGHTS]

---

FORMAT
Keep this under 300 words. Use this structure:

WHAT THEY'RE REALLY SAYING:
[2-3 sentences — the subtext beneath their words]

HANDLE WITH CARE:
[Anything sensitive that came up — approach suggestions]

SESSION OPPORTUNITY:
[How to use this information to make the session feel personalized and powerful]

RECOMMENDED SESSION OPENER:
[Suggested first thing to say that shows you read and understood their situation — 1-2 sentences Karli can use verbatim or adapt]`,
};

// ---------------------------------------------------------------------------
// TIER 2: CONTENT IDEAS (from prompts.md — AI Generation Prompts only)
// ---------------------------------------------------------------------------

const CI_1: PromptTemplate = {
  code: 'CI-1',
  name: 'Educational Tip',
  category: 'content_ideas',
  tier: 2,
  description: 'Positions you as an expert — gives people a reason to follow you',
  when_to_use: 'Pre-session: generate tailored educational content ideas',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE] in [CITY/AREA]. Write an educational social media post about [TOPIC — e.g., "why you shouldn't wash your hair every day" or "how to maintain results between appointments"].

Include:
- A surprising fact or tip that most people don't know
- A brief explanation in plain language (2-3 sentences)
- A gentle call to action inviting them to book

Keep it under 120 words. Warm and knowledgeable tone — like explaining something to a friend, not lecturing.`,
};

const CI_2: PromptTemplate = {
  code: 'CI-2',
  name: 'Trust Builder',
  category: 'content_ideas',
  tier: 2,
  description: 'Shows clients why they should choose you over someone else',
  when_to_use: 'Pre-session: generate trust-building content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE]. Write a trust-building social media post about [SPECIFIC PRACTICE — e.g., "why I use specific product brands" or "my consultation process" or "how I customize every service"].

Focus on why this matters to the CLIENT, not just that I do it. Make me sound thoughtful and intentional — not braggy.

Keep it under 100 words. End with something that makes people feel safe choosing me.`,
};

const CI_3: PromptTemplate = {
  code: 'CI-3',
  name: 'Social Proof Spotlight',
  category: 'content_ideas',
  tier: 2,
  description: 'Nothing sells like other people\'s positive experiences',
  when_to_use: 'Pre-session: generate social proof content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE]. A client recently said: "[CLIENT QUOTE OR PARAPHRASE OF THEIR POSITIVE FEEDBACK]." The service they got was [SERVICE].

Write a social proof post that:
- Highlights their experience naturally (not over-the-top)
- Connects their result to what other potential clients might want
- Ends with an invitation to book

Keep it under 80 words. Genuine and warm — not like a testimonial ad.`,
};

const CI_4: PromptTemplate = {
  code: 'CI-4',
  name: 'Behind-the-Scenes',
  category: 'content_ideas',
  tier: 2,
  description: 'Makes you relatable and human — people book with people they feel connected to',
  when_to_use: 'Pre-session: generate behind-the-scenes content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE]. Write a behind-the-scenes social media post about [SCENARIO — e.g., "my morning routine before clients arrive" or "how I set up my workspace" or "what happens between appointments"].

Make it feel authentic and personal — like they're getting a peek into my real day. Include a moment of personality (humor, warmth, or honesty).

Keep it under 100 words. No corporate tone. This should feel like a story, not an ad.`,
};

const CI_5: PromptTemplate = {
  code: 'CI-5',
  name: 'Community Connection',
  category: 'content_ideas',
  tier: 2,
  description: 'Positions you as part of your local community',
  when_to_use: 'Pre-session: generate community-focused content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE] in [CITY/AREA]. Write a community-focused social media post about [A LOCAL BUSINESS, EVENT, OR COMMUNITY THING YOU WANT TO HIGHLIGHT].

What I love about them: [1-2 SENTENCES].

Make the post feel genuine — like a personal recommendation, not a paid ad. End with a question that invites engagement ("Who's your favorite...?" or "Have you tried...?").

Keep it under 80 words.`,
};

const CI_6: PromptTemplate = {
  code: 'CI-6',
  name: 'Retention Reminder',
  category: 'content_ideas',
  tier: 2,
  description: 'Gently reminds existing and past clients to rebook',
  when_to_use: 'Pre-session: generate rebooking reminder content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE]. Write a gentle rebooking reminder post for clients who might be overdue for [SERVICE].

Typical rebooking timeframe is every [TIMEFRAME — 4-6 weeks, monthly, quarterly, etc.].

What happens when they wait too long: [CONSEQUENCE — e.g., "color fading," "muscle tension building up," "skin issues getting harder to treat"].

Make it helpful, not guilt-trippy. Frame it as caring about their results, not nagging. End with a booking link.

Keep it under 80 words.`,
};

const CI_7: PromptTemplate = {
  code: 'CI-7',
  name: 'Strategic Promotion',
  category: 'content_ideas',
  tier: 2,
  description: 'Promotes your services without sounding desperate',
  when_to_use: 'Pre-session: generate promotional content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE]. Write a promotional post for [WHAT YOU'RE PROMOTING — a specific service, seasonal offer, new availability, or special package].

Details:
- What it is: [DESCRIPTION]
- Price: [PRICE OR "regular pricing"]
- Availability: [SPOTS/TIMEFRAME]

Make it sound exciting but not desperate. Frame it as an opportunity, not a sale. Keep urgency real (limited spots, limited time) — no fake scarcity.

Keep it under 100 words. End with clear booking instructions.`,
};

const CI_8: PromptTemplate = {
  code: 'CI-8',
  name: 'FAQ Buster',
  category: 'content_ideas',
  tier: 2,
  description: 'Answers questions people have but never ask — removes objections',
  when_to_use: 'Pre-session: generate FAQ content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE]. Write a FAQ-style social media post answering this common question:

"[THE QUESTION YOUR CLIENTS FREQUENTLY ASK]"

My honest answer is: [YOUR ANSWER IN A FEW SENTENCES]

Make the post feel like I'm personally answering someone's question — not reading from a script. Keep it informative and reassuring. End with an invitation to ask more questions or book.

Keep it under 100 words.`,
};

const CI_9: PromptTemplate = {
  code: 'CI-9',
  name: 'Engagement Driver',
  category: 'content_ideas',
  tier: 2,
  description: 'Gets people interacting — tells the algorithm to show your content to more people',
  when_to_use: 'Pre-session: generate engagement content',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE] in [CITY/AREA]. My ideal clients are [IDEAL CLIENT DESCRIPTION].

Give me 5 engagement post ideas — questions, polls, or "this or that" options that would get my ideal clients to respond and interact.

Make them fun and easy to answer (not serious business questions). They should relate to my industry but feel casual and lighthearted.

For each one, write the full post (under 50 words each).`,
};

const CI_10: PromptTemplate = {
  code: 'CI-10',
  name: 'Credibility Marker',
  category: 'content_ideas',
  tier: 2,
  description: 'Subtle proof that you\'re experienced and trustworthy',
  when_to_use: 'Pre-session: generate credibility content',
  time_estimate: '~10 min',
  has_dynamic_placeholders: true,
  template: `I'm a [SERVICE TYPE] with [YEARS] years of experience. Write a credibility-building post that:
- Mentions my experience naturally (not as bragging)
- Shares one unexpected lesson or insight I've gained
- Connects that lesson to how I serve my clients better
- Ends with a thought that makes people feel confident choosing me

Use this lesson/insight as the core: [YOUR LESSON — e.g., "the most important part of my job isn't the technical skill — it's listening" or "I've learned that less is usually more"]

Keep it under 100 words. Reflective and genuine tone.`,
};

// ---------------------------------------------------------------------------
// TIER 3: CLIENT WORKFLOW PROMPTS (from ncworkflowprompts.md)
// ---------------------------------------------------------------------------

// Content Engine
const CE_1: PromptTemplate = {
  code: 'CE-1',
  name: 'Content Idea Brainstorm',
  category: 'client_workflows',
  tier: 3,
  description: 'Gets 10 content ideas to choose from',
  when_to_use: 'Start of content creation session',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE] based in [YOUR CITY/AREA]. My ideal clients are [DESCRIBE YOUR IDEAL CLIENT IN 1-2 SENTENCES]. My most popular services are [YOUR TOP 2-3 SERVICES].

Give me 10 content ideas I can post on [YOUR PLATFORM — Instagram/Facebook/etc.] this week. Mix these types:
- 2 educational (teach something useful)
- 2 trust-building (show why someone should choose me)
- 2 social proof (highlight results or client experiences)
- 2 behind-the-scenes (show my personality or process)
- 2 engagement (get people talking or responding)

Keep each idea to 1-2 sentences. Make them specific to my business, not generic.`,
};

const CE_2: PromptTemplate = {
  code: 'CE-2',
  name: 'Post Drafter',
  category: 'client_workflows',
  tier: 3,
  description: 'Turns one content idea into a ready-to-post caption',
  when_to_use: 'After picking an idea from your brainstorm',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `Write a [PLATFORM — Instagram/Facebook/etc.] post for my [YOUR SERVICE TYPE] business.

The topic is: [PASTE THE CONTENT IDEA YOU PICKED]

My business name is [YOUR BUSINESS NAME] and I'm based in [YOUR CITY/AREA].

Write it in a [PICK YOUR TONE: warm and friendly / professional but approachable / casual and fun / confident and direct] voice.

Keep it under 150 words. Include a call to action at the end (like asking a question, inviting them to book, or encouraging them to share). Don't use hashtags yet — I'll add those separately.`,
};

const CE_3: PromptTemplate = {
  code: 'CE-3',
  name: 'Post Revision',
  category: 'client_workflows',
  tier: 3,
  description: 'Revise a drafted post that doesn\'t feel right',
  when_to_use: 'When the drafted post doesn\'t feel right',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `Here's a post I drafted but it doesn't feel right:

[PASTE THE POST YOU WANT TO REVISE]

What I don't like about it: [EXPLAIN WHAT FEELS OFF — too salesy, too long, doesn't sound like me, too generic, etc.]

Rewrite it keeping the same main idea but make it [WHAT YOU WANT INSTEAD — shorter, more personal, more casual, more educational, less pushy, etc.].`,
};

const CE_4: PromptTemplate = {
  code: 'CE-4',
  name: 'Hashtag & Caption Enhancer',
  category: 'client_workflows',
  tier: 3,
  description: 'Add hashtags and optimize caption after post is drafted',
  when_to_use: 'After your post is drafted and you want to optimize',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `Here's my [PLATFORM] post:

[PASTE YOUR FINAL POST]

My business is a [YOUR SERVICE TYPE] in [YOUR CITY/AREA].

Give me:
1. 15-20 relevant hashtags (mix of popular, niche, and local)
2. A stronger opening line if mine could be better (the first line people see before "...more")
3. Any emoji suggestions that fit naturally (don't overdo it)`,
};

const CE_5: PromptTemplate = {
  code: 'CE-5',
  name: 'Content Repurposer',
  category: 'client_workflows',
  tier: 3,
  description: 'Adapt a successful post for another platform or format',
  when_to_use: 'When you have a post that performed well',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `Here's a post that did well on [ORIGINAL PLATFORM]:

[PASTE YOUR SUCCESSFUL POST]

Repurpose this for [NEW PLATFORM OR FORMAT — Instagram Story / Facebook post / Google Business update / email to clients / text message to past clients].

Keep the core message but adjust the format and length for [NEW PLATFORM]. Add a call to action appropriate for that platform.`,
};

// Client Magnet
const CM_1: PromptTemplate = {
  code: 'CM-1',
  name: 'Engagement Response',
  category: 'client_workflows',
  tier: 3,
  description: 'Respond to potential clients who showed interest',
  when_to_use: 'Someone commented, DM\'d, or asked about your services',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE]. Someone just [DESCRIBE WHAT THEY DID — commented on my post asking about X / DM'd me saying Y / asked me in person about Z].

Help me write a response that:
1. Acknowledges what they said (shows I'm listening)
2. Gives them a helpful answer or tip
3. Gently opens the door to booking without being pushy

Keep it conversational — like I'm texting a friend, not writing a sales pitch. Under 75 words.`,
};

const CM_2: PromptTemplate = {
  code: 'CM-2',
  name: 'Follow-Up Message',
  category: 'client_workflows',
  tier: 3,
  description: 'Follow up with warm leads who didn\'t book',
  when_to_use: 'Someone showed interest but didn\'t book',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I had a conversation with a potential client about [WHAT YOU DISCUSSED]. They seemed interested but didn't book.

Write a follow-up message I can send [HOW — text / DM / email] that:
1. References our previous conversation naturally
2. Adds one more piece of value (a tip, helpful info, or answer to a common question about [YOUR SERVICE])
3. Makes booking easy by including my booking link
4. Doesn't feel pushy or desperate

Keep it under 60 words. Warm and genuine.`,
};

const CM_3: PromptTemplate = {
  code: 'CM-3',
  name: 'New Client Welcome',
  category: 'client_workflows',
  tier: 3,
  description: 'Welcome message for new bookings',
  when_to_use: 'Someone just booked',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `A new client just booked a [SERVICE TYPE] appointment with me. Their name is [CLIENT NAME].

Write a short welcome message I can send via [text / DM / email] that:
1. Thanks them for booking
2. Builds excitement about their upcoming appointment
3. Tells them anything they should know beforehand (like [ANY PREP INSTRUCTIONS — arrive 10 min early, come with clean hair, etc.])
4. Makes them feel like they made a great decision

Keep it warm and under 80 words.`,
};

const CM_4: PromptTemplate = {
  code: 'CM-4',
  name: 'Pricing Response',
  category: 'client_workflows',
  tier: 3,
  description: 'Handle "how much?" questions confidently',
  when_to_use: 'Someone asks about your pricing',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE]. Someone just asked me how much I charge for [SPECIFIC SERVICE].

My price for this is [YOUR PRICE].

Write a response that:
1. Shares the price confidently (no apologizing)
2. Briefly explains what's included or what makes it worth it
3. Invites them to book or ask more questions
4. Feels warm, not transactional

Keep it under 60 words. I want to send this via [text / DM].`,
};

const CM_5: PromptTemplate = {
  code: 'CM-5',
  name: 'Handling Hesitation',
  category: 'client_workflows',
  tier: 3,
  description: 'Respond to objections gracefully',
  when_to_use: 'A potential client expresses doubt or pushback',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `A potential client said: "[WHAT THEY SAID — e.g., 'That's a little more than I expected' or 'I need to think about it' or 'I've been doing it myself']"

They were asking about [YOUR SERVICE].

Write a response that:
1. Validates their concern (don't dismiss it)
2. Gently reframes the value
3. Leaves the door open without pressure
4. Stays warm and genuine — not defensive

Keep it under 75 words.`,
};

// Retention Loop
const RL_1: PromptTemplate = {
  code: 'RL-1',
  name: 'Client Check-In',
  category: 'client_workflows',
  tier: 3,
  description: 'Personal check-in with recent clients',
  when_to_use: 'Weekly — pick 3-5 recent clients',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE]. I saw a client named [CLIENT NAME] recently for [SERVICE THEY GOT].

Write a short check-in message I can text or DM them that:
1. References something specific about their visit (like "[SOMETHING SPECIFIC — their new color, the style we tried, the issue we worked on]")
2. Gives them one useful aftercare or maintenance tip
3. Makes rebooking easy by mentioning my availability or including my booking link

Keep it personal, warm, and under 50 words. It should feel like a text from someone who cares, not a marketing message.`,
};

const RL_2: PromptTemplate = {
  code: 'RL-2',
  name: 'Review Request',
  category: 'client_workflows',
  tier: 3,
  description: 'Ask happy clients for Google/Yelp reviews',
  when_to_use: 'Monthly — send to 3-5 clients who had great experiences',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE] and I'd like to ask a happy client for a Google review (or [YELP / FACEBOOK / OTHER PLATFORM]).

Their name is [CLIENT NAME] and they recently got [SERVICE]. They [WHAT MADE THEIR EXPERIENCE GREAT — loved their results, said they'd definitely come back, etc.].

Write a short, personal message asking them to leave a review. Include:
1. A genuine thank-you
2. Why their review matters to my business (keep it honest, not dramatic)
3. A direct link to my review page: [YOUR GOOGLE REVIEW LINK or "I'll add my link"]

Keep it under 60 words. Make it feel like a personal ask, not a mass message.`,
};

const RL_3: PromptTemplate = {
  code: 'RL-3',
  name: 'Referral Ask',
  category: 'client_workflows',
  tier: 3,
  description: 'Activate word-of-mouth referrals',
  when_to_use: 'Monthly — send to your happiest, most connected clients',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE]. I want to ask one of my favorite clients, [CLIENT NAME], to refer friends or family.

My referral incentive is: [YOUR INCENTIVE — $50 off their next visit / a free add-on / 15% off their next service / etc.]

Write a personal message that:
1. Tells them I appreciate them as a client
2. Mentions the referral incentive naturally (not as a sales pitch)
3. Makes it easy — "Just send them my way and mention your name"
4. Feels like a conversation, not a business request

Keep it under 70 words.`,
};

const RL_4: PromptTemplate = {
  code: 'RL-4',
  name: 'Post-Appointment Follow-Up',
  category: 'client_workflows',
  tier: 3,
  description: 'Follow up after great appointments',
  when_to_use: 'After a great appointment — send within 24 hours',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I just finished an appointment with [CLIENT NAME]. They got [SERVICE] and [HOW IT WENT — they loved it, the results were great, we tried something new, etc.].

Write a quick follow-up message I can text or DM that:
1. Says something warm about seeing them today
2. Includes one specific aftercare or maintenance tip for [THEIR SERVICE]
3. Mentions when they might want to come back ("Usually I recommend rebooking in [TIMEFRAME] for [SERVICE]")
4. Includes my booking link

Keep it under 50 words. Genuine, not robotic.`,
};

const RL_5: PromptTemplate = {
  code: 'RL-5',
  name: 'Lapsed Client Re-Engagement',
  category: 'client_workflows',
  tier: 3,
  description: 'Reconnect with inactive clients',
  when_to_use: 'When a regular client hasn\'t been in for a while',
  time_estimate: '~3 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE]. A regular client named [CLIENT NAME] usually comes in every [THEIR USUAL FREQUENCY — 4-6 weeks, monthly, etc.] for [THEIR USUAL SERVICE], but I haven't seen them in [HOW LONG — 2 months, 3 months, etc.].

Write a warm, no-pressure message to reconnect. Include:
1. A genuine "hope you're doing well"
2. Something new or seasonal I could mention: [ANYTHING NEW — new service, seasonal offer, updated hours, or just "nothing specific"]
3. An easy way to rebook: [YOUR BOOKING LINK]

Make it feel like a friend checking in — not a "we miss you!" marketing email. Under 50 words.`,
};

// Bonus
const BP_1: PromptTemplate = {
  code: 'BP-1',
  name: 'Bio/About Me Writer',
  category: 'client_workflows',
  tier: 3,
  description: 'Write or update your social media bio',
  when_to_use: 'When you need to update your bio or about section',
  time_estimate: '~10 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE] based in [YOUR CITY/AREA]. I specialize in [YOUR SPECIALTIES]. I've been doing this for [YEARS IN BUSINESS] years.

My ideal clients are [WHO YOU LOVE WORKING WITH].

What makes me different is [WHAT SETS YOU APART — your approach, your training, your personality, your specialty].

Write a [PLATFORM — Instagram bio (under 150 characters) / Google Business description (under 750 characters) / website about section (2-3 paragraphs)] that:
1. Makes it clear what I do and who I serve
2. Shows my personality
3. Includes a call to action (book now, DM me, visit my website)
4. Doesn't use cheesy marketing language`,
};

const BP_2: PromptTemplate = {
  code: 'BP-2',
  name: 'Service Description Writer',
  category: 'client_workflows',
  tier: 3,
  description: 'Write or improve service descriptions',
  when_to_use: 'When you need descriptions for your website or booking page',
  time_estimate: '~10 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE]. Write a description for this service:

Service name: [SERVICE NAME]
What it is: [BRIEF DESCRIPTION OF WHAT YOU DO]
How long it takes: [DURATION]
Price: [PRICE OR PRICE RANGE]
Who it's best for: [TYPE OF CLIENT]
What makes mine different: [YOUR UNIQUE APPROACH]

Write it in [FIRST PERSON — "I" / THIRD PERSON — "she/he/they"] voice. Keep it under 100 words. Make it sound inviting, clear, and professional — not salesy.`,
};

const BP_3: PromptTemplate = {
  code: 'BP-3',
  name: 'Monthly Content Calendar',
  category: 'client_workflows',
  tier: 3,
  description: 'Plan a month of content in one sitting',
  when_to_use: 'At the start of each month',
  time_estimate: '~15 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE] based in [YOUR CITY/AREA]. I post on [YOUR PLATFORMS] about [HOW OFTEN — once a week, 3x/week, etc.].

Create a content calendar for [MONTH/YEAR] with [NUMBER OF POSTS] posts.

For each post, give me:
- Suggested date
- Content type (educational, social proof, behind-the-scenes, engagement, etc.)
- Post idea (1-2 sentences)
- Suggested visual (photo type or Canva template idea)

Mix up the content types. Include anything seasonal or timely for [MONTH]. Keep ideas specific to my industry.`,
};

// ---------------------------------------------------------------------------
// TIER 4: WEEKLY SYSTEM PROMPTS (from wsprompts.md)
// ---------------------------------------------------------------------------

const WS_GEN: PromptTemplate = {
  code: 'WS-GEN',
  name: 'Weekly System Generator',
  category: 'weekly_system',
  tier: 4,
  description: 'Generate a personalized weekly marketing system for this client',
  when_to_use: 'Pre-session: create the client\'s customized weekly system',
  time_estimate: '~10 min',
  has_dynamic_placeholders: false,
  template: `ROLE
You are a systems designer creating a personalized weekly marketing system for a local service provider.

CLIENT DETAILS
Business type: [SERVICE TYPE]
Location: [CITY/AREA]
Time available for marketing: [FROM INTAKE — Under 30min / 30-60min / 1-2hrs / 2+ hrs]
Current stage: [FROM MASTER ANALYSIS]
Archetype: [Overwhelmed Poster / Avoider]
Biggest constraint: [FROM INTAKE]
Current marketing approach: [FROM INTAKE]
Platforms they use: [FROM INTAKE — or "none"]

TASK
Generate a personalized weekly system for this client using the [MATCHING TIER] framework.

Requirements:
1. Match their stated time capacity — never exceed it
2. Suggest specific days based on their business rhythm (if they work Tue-Thu-Sat, don't put marketing on their work days)
3. Reference specific prompts from ncworkflowprompts.md by code (CE-1, RL-2, etc.)
4. Include "what done looks like" so they know when to stop
5. Attach actions to existing routines when possible ("After your last client on...")
6. Start embarrassingly easy for Week 1 — they can always add more

TONE
Write as if you're helping a friend set up a simple system. No corporate jargon. No pressure. Make it feel doable from Day 1.

FORMAT
Use a clean weekly table. Include time estimates for every action. End with a "Week 1 Only" simplified version (just 1-2 actions).`,
};

const WS_1: PromptTemplate = {
  code: 'WS-1',
  name: 'Monday Planning',
  category: 'weekly_system',
  tier: 4,
  description: 'Set your marketing intention for the week',
  when_to_use: 'Start of each week — takes 5 minutes',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE]. Here's my schedule this week:
[LIST YOUR WORK DAYS AND APPROXIMATE SCHEDULE]

My marketing system has [NUMBER] actions per week:
[LIST YOUR WEEKLY ACTIONS — e.g., "1 content post, 3 client check-ins, 1 review ask"]

Help me plan when to do each action this week. Consider:
- I'm busiest on [BUSIEST DAYS]
- My lightest day is [LIGHTEST DAY]
- I have about [TIME] available for marketing this week

Give me a simple schedule: which action on which day, and when. Keep it realistic.`,
};

const WS_2: PromptTemplate = {
  code: 'WS-2',
  name: 'Monthly Content Calendar',
  category: 'weekly_system',
  tier: 4,
  description: 'Plan content for the next 4 weeks',
  when_to_use: 'First week of each month — takes 10-15 minutes',
  time_estimate: '~15 min',
  has_dynamic_placeholders: true,
  template: `I'm a [YOUR SERVICE TYPE] in [YOUR CITY/AREA]. I post on [YOUR PLATFORMS] about [FREQUENCY].

It's [MONTH/YEAR]. Create my content calendar for this month.

Include:
- [NUMBER] posts spread across the month
- A mix of content types: educational, trust-building, social proof, behind-the-scenes, and engagement
- Any seasonal or timely angles for [MONTH] (holidays, seasonal trends in my industry, etc.)
- One promotional post (max)

For each post give me:
- Suggested date
- Content type
- Post idea (1-2 sentences)
- Which prompt to use to draft it (CE-1, CE-2, etc.)

Keep ideas specific to my industry. Make the calendar feel manageable, not overwhelming.`,
};

const WS_3: PromptTemplate = {
  code: 'WS-3',
  name: 'Weekly Review',
  category: 'weekly_system',
  tier: 4,
  description: 'Assess what worked this week',
  when_to_use: 'End of each week — takes 5-10 minutes',
  time_estimate: '~10 min',
  has_dynamic_placeholders: true,
  template: `Here's what I did for marketing this week:

Posts published: [NUMBER — and briefly what they were about]
Client check-ins sent: [NUMBER]
Reviews requested: [NUMBER]
Referral asks: [NUMBER]
New bookings this week: [NUMBER]
Where they came from: [REFERRAL / SOCIAL MEDIA / REPEAT / WALK-IN / OTHER]

Any engagement highlights: [e.g., "Got 3 comments on my educational post" or "A past client rebooked after my check-in text"]

Based on this, tell me:
1. What worked well (keep doing)
2. What I could adjust next week
3. One thing to try that I haven't yet

Keep your response under 200 words. Be encouraging but honest.`,
};

const WS_4: PromptTemplate = {
  code: 'WS-4',
  name: 'Capacity Adjustment',
  category: 'weekly_system',
  tier: 4,
  description: 'Adjust your system when your schedule or capacity changes',
  when_to_use: 'When your situation changes and you need to adapt',
  time_estimate: '~5 min',
  has_dynamic_placeholders: true,
  template: `My marketing system was designed for [ORIGINAL TIME TIER — e.g., "1-2 hours per week"].

But my situation has changed: [EXPLAIN WHAT CHANGED — e.g., "I'm fully booked and have less time" or "I have more free time now" or "I'm feeling burned out" or "I want to ramp up because business is slow"].

My new available time is approximately [NEW TIME AVAILABLE] per week.

Adjust my weekly system to fit my new capacity. Keep the highest-impact actions and drop the lowest-impact ones first.

Show me:
- My adjusted weekly schedule
- What I'm keeping
- What I'm dropping (and why it's okay to drop it)
- When I should reassess again`,
};

// ---------------------------------------------------------------------------
// COMBINED EXPORT
// ---------------------------------------------------------------------------

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Tier 1: Backend Analysis
  QS, MA, ALD, CPS, SNI,
  // Tier 2: Content Ideas
  CI_1, CI_2, CI_3, CI_4, CI_5, CI_6, CI_7, CI_8, CI_9, CI_10,
  // Tier 3: Client Workflows
  CE_1, CE_2, CE_3, CE_4, CE_5,
  CM_1, CM_2, CM_3, CM_4, CM_5,
  RL_1, RL_2, RL_3, RL_4, RL_5,
  BP_1, BP_2, BP_3,
  // Tier 4: Weekly System
  WS_GEN, WS_1, WS_2, WS_3, WS_4,
];
