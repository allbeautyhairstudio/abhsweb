# Completed Scope — Archived Sections from Handoff Document

**Purpose:** These sections were moved from `handoff.md` to reduce file bloat. They represent completed work whose source of truth now lives in dedicated files. Preserved here for historical reference.

**Archived:** February 22, 2026

---

## Former Section 7: INTAKE FORM (FINAL DRAFT)

> **Source of truth is now:** `c:\kar\docs\intakeform.md` (production-ready, all 7 gaps fixed, 48 questions)

**Platform:** JotForm (familiar to Karli, exports PDF, supports conditional logic)
**Estimated completion time:** 10-12 minutes
**Conditional logic:** Section 7 branches based on social media activity (Yes vs No/Rarely)

### INTRODUCTION (Client-Facing)

> **Before we begin...**
>
> This intake helps me understand your business, your capacity, and the kind of clients you want more of.
>
> Some questions may feel new. Some you may not have thought about before. That's completely okay.
>
> The goal isn't perfect answers. The goal is direction.
>
> Together, this helps us clarify:
> - how you want your business to be perceived
> - the type of clients you want to attract
> - what is (and isn't) working right now
> - how to attract the right clients without overwhelm
>
> Building and maintaining a steady client base at any stage of business can feel daunting. There is no magic wand. What we are creating is clarity — and a simple system designed around your real capacity and lifestyle.
>
> Answer honestly. Simple answers are perfect.

### EXPECTATIONS & SCOPE

> **What this reset provides:**
> - clarity on where your clients are coming from (and where they're not)
> - a simple, sustainable client-attraction system
> - guidance tailored to your capacity and goals
> - practical next steps you can implement immediately
>
> **What this reset is not:**
> - ongoing marketing management
> - social media management
> - a guarantee of specific results
> - a requirement to spend hours online
>
> Your results will come from consistent implementation of the simple system we build together.
>
> **A note about modern marketing:**
> Most service providers were trained to perfect their craft — not to navigate modern marketing. If this feels confusing or overwhelming, you're not alone. There are no wrong answers here. This process simply helps tailor your reset to where you are right now.

### SECTION 1: Business Snapshot
1. Business name
2. City & state
3. Type of service you provide
4. How long have you been in business? (Under 1yr / 1-3yr / 3-7yr / 7+yr)
5. Which services do you provide most often?
6. Which services are most profitable for you?

### SECTION 2: Capacity & Workload
7. How full is your schedule/workload right now? (Under 25% / 25-50% / 50-75% / 75-100%)
8. How many clients/jobs can you realistically take per week?
9. Which best describes your current goal? (Need more clients / More consistent bookings / Better-fit clients / Increase pricing / Reduce workload & burnout)

### SECTION 3: Business Stage & Readiness
10. Which best describes your current stage? (Just starting / Established but inconsistent / Fully booked but want better clients or higher pricing / Overwhelmed or burned out / Stagnant or plateaued)
11. How confident do you feel about marketing your business? (1-5 scale)

### SECTION 4: Your Ideal Clients
12. Describe your ideal client/customer
13. What type of clients do you prefer NOT to work with?
14. What problems do people typically hire you to solve?

### SECTION 5: Current Client Flow
15. Where do most of your clients currently come from? (checkboxes: referrals / repeat clients / social media / Google search / walk-ins / paid ads / community networking / other)
16. What has worked best for bringing in clients?
17. What have you tried that did NOT work?

### SECTION 6: Marketing Reality
18. Which best describes your current marketing approach? (Don't market at all / Post occasionally / Post regularly no results / Rely on referrals / Tried things nothing clear / Overwhelmed by modern marketing)
19. When you think about marketing, you feel: (excited / overwhelmed / confused / resistant / exhausted / unsure where to start)
20. What feels hardest right now? (Knowing what to post / Finding time / Understanding social media / Getting new clients / Raising prices / Staying consistent / Knowing what works)

### SECTION 7: Social Media & Visibility
21. Are you currently active on social media for your business? (Yes / No / Rarely)

**IF YES:**
22. Which platforms do you use?
23. How often do you post?
24. What content seems to perform best?

**IF NO or RARELY:**
25. What has stopped you from being active? (time / anxiety or discomfort / not sure what to post / doesn't seem to work / not interested / other)

26. If you only had to do ONE visibility activity weekly, what would you tolerate most? (one social post / one story / asking for reviews / referral outreach / email-text clients / community networking)

### SECTION 8: Offers & Pricing
27. What services or offers would you like to sell MORE of?
28. What would you like to sell LESS of (or stop offering)?
29. Do no-shows or cancellations impact your income? (not really / sometimes / frequently)

### SECTION 9: Tools & Technology
30. Which best describes you? (Avoid technology / Use social media but not strategy / Comfortable posting not marketing / Like learning new tools / Excited about AI & automation)
31. Do you currently use AI tools? (Never / Occasionally / Weekly / Daily)
32. What would you most like help with? (ideas / captions-content / marketing strategy / offers & pricing / saving time / automation)

### SECTION 10: Goals & Constraints
33. How much time can you realistically dedicate to marketing each week? (none / under 30min / 30-60min / 1-2hrs / 2+hrs)
34. What is your biggest constraint right now? (time / money / confidence / consistency / unclear brand-message / burnout / not sure what works)
35. What would success look like 90 days from now?

### YOUR ONLINE PRESENCE (Optional but Recommended)
36. Website (if any)
37. Social media links
38. Booking link

### FINAL
39. Is there anything else you feel is important for me to understand about your business right now?

---

### INTAKE FORM — IDENTIFIED GAPS (from Claude assessment)

These were flagged during review and addressed in `intakeform.md`:

1. **Overlap between Sections 2, 3, and 6** — Consolidated Section 3 into Section 2.
2. **Section 4 question wording** — Rewritten to: "Think about your favorite client — the one you wish you had 10 more of."
3. **Missing: Average service price and highest-priced service** — Added to Section 8.
4. **Missing: Monthly new client volume** — Added.
5. **Online presence section should not be optional** — Made required with "N/A" options.
6. **Missing: Trust/proof assets question** — Added back.
7. **Missing: Consent/agreement checkbox** — Added.

**Status:** ALL 7 GAPS FIXED in `intakeform.md`. Original 39 questions expanded to 48.

---

## Former Section 8: AI STRATEGIST OPERATING PROMPT

> **Source of truth is now:** `c:\kar\docs\ifprompts.md` (5 backend analysis prompts, all gaps fixed)

This is the internal prompt Karli uses to analyze intake data. NOT client-facing.

```
ROLE
You are an expert strategist specializing in local service-based businesses
and client-attraction systems.

Your role is to analyze the business intake below and produce a clear,
realistic, capacity-aware marketing reset.

Focus on simplicity, clarity, and sustainable growth — NOT complex
marketing funnels.

CONTEXT
This business is seeking clarity on how to attract and retain clients
without spending excessive time on marketing.

Many service providers feel overwhelmed, inconsistent, or confused
by modern marketing tools.

Recommendations must be:
- realistic for limited time & energy
- easy to implement
- aligned with their current stage
- sustainable long-term

INPUT
Below is the completed intake form.
Analyze all responses before generating recommendations.

[PASTE JOTFORM PDF TEXT HERE]

STEP 1 — BUSINESS SNAPSHOT
Summarize:
• business type & positioning
• ideal client profile
• primary services & revenue drivers
• current client flow
• capacity & constraints
Keep concise.

STEP 2 — STAGE & READINESS DIAGNOSIS
Determine:
Business Stage: new/building | inconsistent bookings | plateaued |
fully booked but misaligned | burned out/overwhelmed

Marketing Maturity: none | random posting | inconsistent strategy |
active but ineffective | optimized & scaling

Emotional State Indicators: overwhelmed | confused | resistant |
burned out | curious & ready

Explain briefly.

STEP 3 — ATTENTION LEAK ANALYSIS
Identify where potential clients are being lost.
Examples:
• unclear positioning
• inconsistent visibility
• weak proof or trust signals
• referral opportunities unused
• pricing misalignment
• messaging confusion
Limit to the top 5 leaks.

STEP 4 — CLIENT ATTRACTION PRIORITIES
Based on capacity and stage, identify the highest leverage actions.
Focus on:
✔ visibility
✔ trust
✔ retention
✔ referral loops
✔ conversion clarity
Do NOT suggest complex funnels or daily posting unless appropriate.

STEP 5 — SIMPLE CLIENT-ATTRACTION SYSTEM
Design a simple weekly system they can maintain.
Include:
• 1 visibility action
• 1 trust-building action
• 1 retention action
• 1 referral action
System must fit within their stated time capacity.

STEP 6 — AI-POWERED WORKFLOWS
Create 3 simple AI workflows tailored to their comfort level.
Each workflow should include:
• purpose
• when to use (trigger)
• copy-paste prompt template
• expected output
• how it saves time
Avoid technical jargon.

STEP 7 — CONTENT & VISIBILITY IDEAS
Provide 10 tailored visibility ideas aligned with their business
and ideal client.
These may include:
• educational
• trust-building
• social proof
• retention reminders
• community positioning
Focus on usefulness, not trends.

STEP 8 — REFERRAL & RETENTION OPPORTUNITY
Identify ONE high-impact referral or retention improvement opportunity.
Explain why it matters.

STEP 9 — 90-DAY FOCUS PLAN
Provide:
Month 1 Focus
Month 2 Focus
Month 3 Focus
Keep simple and progressive.

STEP 10 — TONE & STYLE
Output must be:
• clear
• encouraging
• non-judgmental
• simple language
• practical
• not overwhelming
Avoid marketing jargon and complexity.

If the intake reveals that marketing is not the primary bottleneck,
identify the actual bottleneck and recommend addressing it before
implementing a visibility system.

Consider the client's geographic market when making recommendations.
```

**Quick Prep Prompt (for time-crunched sessions):**
> "Summarize the top 3 leverage opportunities and biggest client attraction leak from this intake."

### PROMPT GAPS IDENTIFIED (from Claude assessment):

1. **Step 6 needs more specificity** — Fixed in `ifprompts.md`. Each workflow now has trigger, prompt template, and expected output.
2. **No edge case handling** — Fixed. Integrated into the prompt above.
3. **No local market context** — Fixed. Integrated into the prompt above.

**Status:** ALL 3 GAPS FIXED. Expanded into 5 specialized prompts in `ifprompts.md`.

---

## Former Sections 18-21: OPERATIONAL BACKEND BUILD PLAN

> **Status:** ALL COMPLETE. All 9 files built and live in `c:\kar\docs\`.

### Section 18: Build Plan Overview & File Map

#### What Was Built

The operational backend for the AI Marketing Reset service — every prompt, workflow, system, and template Karli needs to analyze client intake data and deliver the 9 core deliverables during a 90-minute session.

#### How It All Connects

```
CLIENT SUBMITS INTAKE (JotForm)
        |
        v
KARLI'S BACKEND ANALYSIS
  ifprompts.md ──────── 5 analysis prompts process the intake data
        |                 - Master Analysis (produces all 9 deliverables)
        |                 - Quick Scan (fit/no-fit in 5 min)
        |                 - Attention Leak Deep-Dive
        |                 - Client Profile Summary
        |                 - Special Notes Integration
        v
ROADMAP GENERATION
  ncroadmap.md ──────── Turns analysis into client-facing roadmap
        |                 - Business summary + positive callouts
        |                 - Attention leak report (framed as opportunities)
        |                 - 90-day focus plan (Month 1/2/3)
        |                 - Week 1 Action Card
        |                 - Interest flags (opportunity/watch/redirect)
        v
90-MINUTE SESSION (masterplan.md has the minute-by-minute flow)
        |
        v
CLIENT RECEIVES DELIVERABLE PACKAGE:
  ncworkflow.md ─────── 3 step-by-step workflows they follow
  ncworkflowprompts.md ─ 15+ copy-paste prompts they reuse forever
  prompts.md ──────────── 10 ready-to-post ideas with generation prompts
  wsprompts.md ─────────── Customized weekly system
        |
        v
30-DAY FOLLOW-UP (structure in masterplan.md)
```

#### File Map

**Backend Files (Karli uses):**

| File                   | Purpose                              | When                       |
|------------------------|--------------------------------------|----------------------------|
| `teams.md`             | Agent personas & build instructions  | During build only          |
| `intakeform.md`        | Production-ready intake form         | Setup + ongoing            |
| `ifprompts.md`         | 5 backend analysis prompts           | Every client, pre-session  |
| `ncroadmap.md`         | Roadmap generator + templates        | Every client, pre-session  |
| `masterplan.md`        | Operational bible — ties everything  | Reference for every client |

**Client-Facing Files (given to client):**

| File                   | Purpose                              | When                                |
|------------------------|--------------------------------------|-------------------------------------|
| `ncworkflow.md`        | 3 granular content workflows         | Given to client in session          |
| `ncworkflowprompts.md` | 15+ copy-paste AI prompts            | Client uses forever                 |
| `prompts.md`           | 10 content ideas + generation prompts| Pre-session + given to client       |
| `wsprompts.md`         | Weekly system generator prompts      | Every client, pre-session           |

#### Design Principles Applied Across All Files

- **Tone:** Per Section 9 — "clarity" not "strategy," "simple system" not "marketing plan," "what's next" not "what's broken"
- **Scalability:** 80% templated framework, 20% personalization per client
- **Time cap:** All backend work must fit within 2.5-3 hours per client
- **Accessibility:** All client-facing materials must be usable by someone with zero AI experience
- **Stage-aware:** All prompts route differently based on the 5 client stages
- **Archetype-aware:** All workflows address both the Overwhelmed Poster and the Avoider
- **Edge cases:** All analysis prompts catch burnout, non-viable businesses, emotional redirects
- **AI-agnostic:** Client prompts work in ChatGPT, Claude, Gemini, or any AI tool
- **Capacity-aware:** Weekly systems calibrated to 4 time tiers (under 30min / 30-60min / 1-2hrs / 2+hrs)

---

### Section 19: Agent Team Roster

These specialized AI agents (Claude Code subagents) were used to build the operational backend:

| Agent                  | SME Domain                                    | Built                                    | Quality Standard                                                     |
|------------------------|-----------------------------------------------|------------------------------------------|----------------------------------------------------------------------|
| **Intake Architect**   | UX writing, form psychology, onboarding       | `intakeform.md`                          | 10-12 min completable, all 7 gaps fixed, JotForm-ready               |
| **Diagnostic Analyst** | Business analysis, marketing audit             | `ifprompts.md`                           | Master Analysis produces all 9 deliverables in one pass              |
| **Roadmap Planner**    | Client journey mapping, 90-day planning        | `ncroadmap.md`                           | All 5 stages + 2 archetypes with differentiated output               |
| **Workflow Engineer**  | AI prompt engineering, implementation          | `ncworkflow.md` + `ncworkflowprompts.md` | Followable by someone with zero AI experience                        |
| **Content Strategist** | Social media content, local marketing          | `prompts.md`                             | Industry-agnostic templates personalized via intake data             |
| **Systems Designer**   | Weekly cadences, habit design, capacity-aware  | `wsprompts.md`                           | Weekly system works within all 4 time tiers                          |

---

### Section 20: Execution Strategy

All 5 phases completed:

| Phase                        | Files Created                                           | Status   |
|------------------------------|---------------------------------------------------------|----------|
| Phase 1: Foundation          | `teams.md` + `intakeform.md`                            | COMPLETE |
| Phase 2: Analysis Engine     | `ifprompts.md` + `ncroadmap.md`                         | COMPLETE |
| Phase 3: Client Deliverables | `ncworkflow.md` + `ncworkflowprompts.md` + `prompts.md` | COMPLETE |
| Phase 4: Systems             | `wsprompts.md`                                          | COMPLETE |
| Phase 5: Integration         | `masterplan.md`                                         | COMPLETE |

---

### Section 21: Verification Checklist

Pre-beta launch checklist (to be verified during client-zero testing):

- [ ] Every prompt produces usable output on first try (test as client zero)
- [ ] Workflows are followable by someone with zero AI experience
- [ ] Weekly system fits within all 4 stated time constraints
- [ ] All documents use approved language/tone (Section 9 guidelines)
- [ ] All 9 core deliverables are produced by the analysis pipeline
- [ ] All 5 client stages receive differentiated recommendations
- [ ] Both archetypes (Overwhelmed Poster / Avoider) are handled
- [ ] Edge cases are caught (burnout, non-viable, emotional state)
- [ ] 80/20 template ratio is maintained (scalable, not over-customized)
- [ ] Total time per client stays within 2.5-3 hour cap
- [ ] Competitive differentiation is clear in all client-facing materials
- [ ] Referral incentive system is integrated into workflows
- [ ] 30-day follow-up structure is documented
- [ ] Cancellation/refund policy is defined
- [ ] All prompts work across multiple AI tools (ChatGPT, Claude, Gemini)

---

*End of archived sections. For current project status, see `handoff.md` Section 24.*
