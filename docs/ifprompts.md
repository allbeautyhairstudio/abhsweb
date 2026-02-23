# AI Marketing Reset — Backend Analysis Prompts
**Version:** 1.0
**Created:** February 22, 2026
**Who Uses This:** Karli (internal — NOT client-facing)
**When:** Every client, pre-session. Paste intake data into any AI tool and run these prompts.
**Agent:** Diagnostic Analyst

---

## HOW TO USE THIS FILE

1. Client submits the JotForm intake
2. Export the intake as PDF (or copy the responses)
3. Open ChatGPT, Claude, or your preferred AI tool
4. Paste the intake data where indicated in each prompt
5. Run the prompts in this order:
   - **Quick Scan** first (5 min — confirms fit before you invest time)
   - **Master Analysis** second (produces all deliverables in one pass)
   - **Attention Leak Deep-Dive**, **Client Profile Summary**, and **Special Notes Integration** as needed

**Time budget:** 30-45 minutes total for all analysis

---

## PROMPT 1: QUICK SCAN (Fit Assessment)

**Purpose:** Determine fit/no-fit in under 5 minutes. Use this before accepting a client or beginning full analysis.
**When to use:** Immediately after intake is submitted, before confirming payment/scheduling.
**Time:** ~5 minutes

### The Prompt

```
ROLE
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
[PASTE FULL INTAKE RESPONSES HERE]
```

### What to Do With the Output
- **GREEN:** Proceed to payment + scheduling. Run Master Analysis.
- **YELLOW:** Proceed, but note the flag. Adjust session approach accordingly.
- **RED:** Send a kind decline message. Consider referring them elsewhere.

---

## PROMPT 2: MASTER ANALYSIS (Full Diagnostic)

**Purpose:** Process the complete intake and produce ALL 9 core deliverables in one pass. This is the workhorse prompt — everything Karli needs for the 90-minute session.
**When to use:** After client is confirmed and paid. This is your main prep work.
**Time:** Run the prompt (~2 min), review and personalize output (~30-40 min)

### The Prompt

```
ROLE
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
• Business type, location, and positioning
• Ideal client profile (based on their description)
• Primary services and revenue drivers
• Current client flow (where clients come from now)
• Capacity and key constraints
• What's already working (call this out — it builds confidence)

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
• Name it clearly (e.g., "No Google Business presence," "Relying only on referrals")
• Explain why it matters in plain language
• Rate the impact: HIGH / MEDIUM / LOW
• Suggest a specific fix

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
• What to do (specific action)
• Why it matters (connects to their situation)
• How long it takes (realistic time estimate)
• Which workflow or prompt supports it (reference the deliverable files)

Do NOT suggest complex funnels, daily posting, or paid ads unless their capacity and stage clearly support it.

STEP 5 — SIMPLE CLIENT-ATTRACTION SYSTEM (Weekly Plan)
Design a simple weekly system based on their stated time capacity:

Time capacity from intake: [reference their answer to question 38]

The system must include (scaled to their capacity):
• 1 visibility action — getting seen by potential clients
• 1 trust-building action — giving people a reason to choose them
• 1 retention action — keeping existing clients engaged
• 1 referral action — activating word-of-mouth

For each action, specify:
• What to do
• How long it takes
• Suggested day/time
• Which prompt to use (reference ncworkflowprompts.md)

If they selected "Under 30 minutes" — prioritize the single highest-impact action only.
If they selected "None right now" — provide a "bare minimum" plan (one action per week, under 15 min).

STEP 6 — AI-POWERED WORKFLOWS
Recommend which of the 3 workflows are most relevant to this client:

Workflow 1: The Content Engine (batch content creation)
Workflow 2: The Client Magnet (engagement to conversion)
Workflow 3: The Retention Loop (re-engagement and referrals)

For each recommended workflow:
• Why it's relevant to their situation
• Which specific prompts they should start with
• How to customize it for their business type
• Expected time investment

If the client indicated low AI comfort (question 36: "Never"), include a note:
"Start with just ONE prompt from Workflow [X]. Try it once. See what happens. You can always add more later."

STEP 7 — CONTENT & VISIBILITY IDEAS
Provide 10 tailored content/visibility ideas for this specific business.

Each idea should include:
• The idea (one sentence)
• Content type: educational / trust-building / social proof / behind-the-scenes / community / retention / promotion / FAQ / engagement / credibility
• Why it works for their business specifically
• Platform suggestion (Instagram, Facebook, Google Business, text/email, in-person)

Make ideas specific to their industry, services, and ideal client.
Mix quick-wins (under 5 min) with higher-effort pieces (15-20 min).
Include at least 2 ideas that don't require social media (for Avoiders).

STEP 8 — REFERRAL & RETENTION OPPORTUNITY
Identify ONE high-impact referral or retention opportunity specific to this business.

Include:
• What it is
• Why it matters (with math if possible — "If each happy client refers 1 person per quarter, that's X new clients per year")
• How to implement it (3 simple steps)
• Suggested language they can use (actual words/scripts)

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
□ Action 1: [specific action] — ~[X] minutes
□ Action 2: [specific action] — ~[X] minutes
□ Action 3: [specific action] — ~[X] minutes

STEP 10 — INTEREST FLAGS & SPECIAL NOTES
Flag any of the following if detected:

HIGH OPPORTUNITY:
• Quick wins available (specify which)
• High motivation detected
• Strong existing foundation to build on
• Underpriced services with clear room to raise rates

WATCH:
• Time constraints that may limit implementation
• Low confidence that may cause hesitation
• Burnout indicators — may need lighter load initially
• Unrealistic expectations that need gentle management

REDIRECT:
• Marketing is not the actual bottleneck — identify what is
• Emotional state suggests they may need support beyond marketing
• Business model concerns (viability, pricing structure, market fit)
• Personal crisis indicators — handle with extreme care

If any REDIRECT flags are present, note: "Consider addressing [X] before or alongside the marketing system. The reset can still provide value, but implementation may be limited until [X] is resolved."

---

OUTPUT FORMATTING
• Use clear headers and bullet points
• Keep language encouraging and non-judgmental
• Use "you" language (as if speaking to the client)
• Bold the most important recommendations
• Keep total output under 3,000 words (Karli needs to scan this quickly)

TONE
Write as if you're a knowledgeable friend who sees their potential — not a consultant lecturing them on what they should be doing. Frame everything as "here's what's possible" not "here's what's wrong."

If the intake reveals that marketing is not the primary bottleneck (e.g., pricing is too low, burnout is severe, business model needs restructuring), identify the actual bottleneck and recommend addressing it before or alongside implementing a visibility system.

Consider the client's geographic market when making recommendations. A hairstylist in rural Oklahoma has different opportunities than one in downtown LA.
```

### What to Do With the Output
1. Read through the full analysis (~5 min)
2. Highlight anything that needs personalizing or adjusting
3. Check interest flags — these shape your session approach
4. Pull out key talking points for the 90-minute session
5. Feed relevant sections into the roadmap generator (`ncroadmap.md`)

---

## PROMPT 3: ATTENTION LEAK DEEP-DIVE

**Purpose:** Deeper analysis of where and why the client is losing potential business. Use when the Master Analysis flags complex leaks or when you want more actionable detail for the session.
**When to use:** After Master Analysis, when you want to go deeper on the "where they're losing clients" conversation.
**Time:** ~3 minutes to run, ~10 minutes to review

### The Prompt

```
ROLE
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
   • Google presence (Maps, reviews, search)
   • Social media visibility
   • Referral pathways
   • Community presence
   • Directory listings (Yelp, Booksy, StyleSeat, etc.)

2. FIRST IMPRESSION — When people find them, what do they see?
   • Profile quality (photos, bio, branding)
   • Social proof (reviews, testimonials, before/afters)
   • Clarity of services and pricing
   • Professionalism signals

3. CONSIDERATION — Why would someone choose them over alternatives?
   • Unique positioning or specialization
   • Trust signals
   • Accessibility (easy to book, clear pricing, responsive)
   • Content that demonstrates expertise

4. CONVERSION — What happens when someone is ready to book?
   • Booking friction (how many steps to book?)
   • Response time to inquiries
   • Clear call-to-action
   • Payment clarity

5. RETENTION — Are existing clients coming back?
   • Rebooking prompts
   • Follow-up communication
   • Loyalty recognition
   • Service consistency

6. REFERRAL — Are happy clients sending new ones?
   • Referral asks (do they ask for referrals?)
   • Incentive systems
   • Shareable content/experiences
   • Review generation

FORMAT
For each stage:
• Status: STRONG / LEAKING / MISSING
• What's happening (1-2 sentences)
• The fix (specific, actionable)
• Priority: FIX NOW / FIX THIS MONTH / FIX THIS QUARTER
• Time to fix: [realistic estimate]

End with a summary: "Your biggest leak is at the [STAGE] stage. Fixing this first will have the most impact because [reason]."
```

---

## PROMPT 4: CLIENT PROFILE SUMMARY

**Purpose:** One-page snapshot for quick session prep. Use this to refresh your memory right before the 90-minute call.
**When to use:** 10-15 minutes before the session starts. Quick reference card.
**Time:** ~2 minutes to run, ~3 minutes to review

### The Prompt

```
ROLE
You are preparing a concise client brief for a marketing strategy session.

TASK
Create a one-page client profile summary I can reference during a 90-minute session. Keep it scannable — bullet points and short phrases only.

INTAKE DATA
[PASTE FULL INTAKE RESPONSES HERE]

---

FORMAT (keep to one page / under 400 words):

CLIENT AT A GLANCE
• Name:
• Business:
• Location:
• Years in business:
• Schedule fullness:
• Stage:

WHAT THEY WANT
• Primary goal:
• 90-day vision (their words):
• Services they want to sell more of:

WHAT'S WORKING
• (2-3 things already going well — mention these early in the session to build confidence)

KEY CONSTRAINTS
• Time for marketing:
• Biggest constraint:
• Tech comfort:
• AI experience:

CLIENT TYPE
• Archetype: [Overwhelmed Poster / Avoider]
• Emotional state: [from intake]
• Confidence level: [X/5]

SESSION APPROACH NOTES
• Start with: [what to acknowledge first]
• Be careful about: [sensitivities to watch for]
• Key win to deliver: [the one thing that will make this session feel worth it]

INTEREST FLAGS
• [List any HIGH OPPORTUNITY / WATCH / REDIRECT flags]
```

---

## PROMPT 5: SPECIAL NOTES INTEGRATION

**Purpose:** Process the open-ended "anything else" response (Question 47) for hidden signals the structured questions might have missed.
**When to use:** When a client writes a substantial response to the final question. Skip this if they left it blank or wrote something brief.
**Time:** ~2 minutes to run, ~5 minutes to review

### The Prompt

```
ROLE
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
[Suggested first thing to say that shows you read and understood their situation — 1-2 sentences Karli can use verbatim or adapt]
```

---

## PROMPT USAGE CHEAT SHEET

| Situation | Which Prompt(s) | Time |
|-----------|-----------------|------|
| New intake just came in — should I take this client? | Quick Scan only | 5 min |
| Client confirmed — full prep | Master Analysis → Client Profile Summary | 40-50 min |
| Client wrote a lot in the final question | Add Special Notes Integration | +7 min |
| Session prep — need to go deeper on leaks | Add Attention Leak Deep-Dive | +13 min |
| Quick refresh before the call | Client Profile Summary only | 5 min |
| Full prep (thorough) | All 5 prompts in order | 60 min |
| Standard prep (recommended) | Quick Scan → Master Analysis → Client Profile Summary | 45 min |

**Recommended flow for most clients:** Quick Scan → Master Analysis → Client Profile Summary = ~45 minutes total prep
