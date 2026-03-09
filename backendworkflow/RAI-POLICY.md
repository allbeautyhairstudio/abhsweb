# Responsible AI (RAI) Use Policy

**AI Marketing Reset for Service-Based Businesses**
**Last Updated: February 2026**

---

## Purpose

This policy governs how artificial intelligence tools are used within the AI Marketing Reset service. It ensures that AI is used ethically, transparently, and in the best interest of every client.

---

## Core Principles

### 1. Human-in-the-Loop Always
AI generates analysis and recommendations. Karli reviews, personalizes, and delivers every output. No AI-generated content reaches a client without human review and approval.

### 2. Transparency
Clients are informed during onboarding that AI tools assist in the analysis process. The intake consent checkbox (Q48) covers this disclosure. Karli presents insights as "here's what I found" — never as "the AI said."

### 3. No Automated Decisions
Fit assessments (GREEN/YELLOW/RED) are AI-suggested, not AI-decided. Karli makes the final call on every client acceptance, recommendation, and deliverable.

### 4. Bias Awareness
Analysis prompts include instructions to consider:
- The client's geographic market and local context
- The client's stated constraints and capacity
- The client's emotional state and comfort level
- Cultural and demographic considerations

The system flags potential bias points (e.g., recommending social media to someone who explicitly said they avoid it).

### 5. Data Minimization
Only intake data relevant to the current prompt is included. The dashboard does not send data to any AI service automatically — Karli copies prompts manually and pastes them into her chosen AI tool.

### 6. No Client Data Stored in AI Tools
All client data is stored locally on Karli's machine only. AI tools (ChatGPT, Claude, etc.) receive data only via manual paste and are subject to their own data retention policies. Karli communicates this to clients.

### 7. Output Validation
The dashboard includes a "Review Checklist" reminder before any AI-generated content is marked as ready for the client. Every deliverable must be reviewed for:
- Factual accuracy
- Appropriate tone (warm, clear, non-corporate)
- Alignment with the client's stated goals and constraints
- Absence of generic or irrelevant recommendations

### 8. Continuous Improvement
AI outputs that are inaccurate, unhelpful, or biased are noted in client notes. These patterns inform prompt refinement and service improvement.

---

## RAI Touchpoints in the Dashboard

| Location | Reminder |
|----------|----------|
| **Add Client page** | Consent reminder about AI usage displayed |
| **Prompts tab** | Banner: "Review all AI outputs before sharing with clients" |
| **Session Prep** | Checklist item: "Have you reviewed and personalized all AI-generated materials?" |
| **Deliverables** | Confirmation before marking as "sent": "Have you reviewed this deliverable for accuracy and tone?" |

---

## Data Handling

- **Storage**: All client data is stored locally in a SQLite database on Karli's machine
- **No external transmission**: The dashboard makes zero external API calls or network requests
- **No tracking**: Zero analytics, telemetry, or third-party scripts
- **Backups**: Automated local database backups (rolling 7-day retention)
- **Export**: Client data is exportable as JSON for portability
- **Deletion**: Hard delete available via explicit action, cascades to all related records

---

## Client Communication

When discussing AI usage with clients:
- "AI tools help me analyze your intake data more thoroughly"
- "Every recommendation has been reviewed and personalized by me"
- "Your data stays on my computer — it's not stored in any AI service"
- "You can request a copy or deletion of your data at any time"

---

## Review Schedule

This policy is reviewed quarterly and updated as AI tools, best practices, and regulations evolve.
