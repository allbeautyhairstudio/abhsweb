import { z } from 'zod';

/**
 * Zod validation schemas for all API inputs.
 * Runtime type-checking ensures data integrity at system boundaries.
 */

// Reusable enums matching intake form options
const yearsInBusiness = z.enum(['under_1yr', '1_3yr', '3_7yr', '7plus']).nullable().optional();
const scheduleFullness = z.enum(['under_25', '25_50', '50_75', '75_100']).nullable().optional();
const currentStage = z.enum(['just_starting', 'inconsistent', 'fully_booked', 'overwhelmed', 'stagnant']).nullable().optional();
const primaryGoal = z.enum(['more_clients', 'consistent_bookings', 'better_fit', 'increase_pricing', 'reduce_workload']).nullable().optional();
const socialActive = z.enum(['yes', 'sometimes', 'rarely_never']).nullable().optional();
const noShowsImpact = z.enum(['not_really', 'sometimes', 'frequently']).nullable().optional();
const aiUsage = z.enum(['never', 'occasionally', 'weekly', 'daily']).nullable().optional();
const timeForMarketing = z.enum(['none', 'under_30min', '30_60min', '1_2hrs', '2plus_hrs']).nullable().optional();
const newClientsMonth = z.enum(['0_2', '3_5', '6_10', '11_20', '20plus']).nullable().optional();
const pipelineStatus = z.enum([
  'inquiry', 'intake_submitted', 'fit_assessment', 'payment',
  'analysis_prep', 'session_scheduled', 'session_complete',
  'deliverables_sent', 'followup_scheduled', 'followup_complete',
]);
const fitRating = z.enum(['green', 'yellow', 'red']).nullable().optional();
const archetype = z.enum(['overwhelmed_poster', 'avoider']).nullable().optional();

// Quick-add schema (minimal client creation)
export const quickAddClientSchema = z.object({
  q02_client_name: z.string().min(1, 'Client name is required').max(200),
  q01_business_name: z.string().max(200).nullable().optional(),
  q03_email: z.string().email('Invalid email').max(200).nullable().optional(),
  q05_service_type: z.string().max(200).nullable().optional(),
  status: pipelineStatus.optional().default('inquiry'),
  inquiry_date: z.string().nullable().optional(),
});

// Full intake form schema (all 48 questions)
export const fullIntakeSchema = z.object({
  // Status fields
  status: pipelineStatus.optional(),
  fit_rating: fitRating,
  archetype: archetype,
  time_tier: z.number().int().min(1).max(4).nullable().optional(),

  // Dates
  inquiry_date: z.string().nullable().optional(),
  intake_date: z.string().nullable().optional(),
  payment_date: z.string().nullable().optional(),
  session_date: z.string().nullable().optional(),
  deliverables_sent_date: z.string().nullable().optional(),
  followup_date: z.string().nullable().optional(),
  followup_complete_date: z.string().nullable().optional(),

  // Financial
  price_paid: z.number().min(0).nullable().optional(),
  pricing_tier: z.enum(['beta', 'standard']).nullable().optional(),

  // Testimonial & Referral
  testimonial_received: z.number().int().min(0).max(1).nullable().optional(),
  testimonial_text: z.string().max(5000).nullable().optional(),
  referral_source: z.string().max(500).nullable().optional(),
  referrals_given: z.number().int().min(0).nullable().optional(),

  // Section 1: Business Snapshot
  q01_business_name: z.string().max(200).nullable().optional(),
  q02_client_name: z.string().min(1, 'Client name is required').max(200),
  q03_email: z.string().email('Invalid email').max(200).or(z.literal('')).nullable().optional(),
  q04_city_state: z.string().max(200).nullable().optional(),
  q05_service_type: z.string().max(200).nullable().optional(),
  q06_years_in_business: yearsInBusiness,
  q07_services_most_often: z.string().max(500).nullable().optional(),
  q08_most_profitable: z.string().max(500).nullable().optional(),

  // Section 2: Capacity, Workload & Stage
  q09_schedule_fullness: scheduleFullness,
  q10_clients_per_week: z.string().max(100).nullable().optional(),
  q11_current_stage: currentStage,
  q12_primary_goal: primaryGoal,
  q13_marketing_confidence: z.number().int().min(1).max(5).nullable().optional(),

  // Section 3: Ideal Clients
  q14_ideal_client: z.string().max(2000).nullable().optional(),
  q15_clients_to_avoid: z.string().max(2000).nullable().optional(),
  q16_problems_solved: z.string().max(2000).nullable().optional(),

  // Section 4: Client Flow
  q17_client_sources: z.string().max(1000).nullable().optional(), // JSON array
  q18_new_clients_month: newClientsMonth,
  q19_what_works: z.string().max(2000).nullable().optional(),
  q20_what_didnt_work: z.string().max(2000).nullable().optional(),

  // Section 5: Marketing Reality
  q21_marketing_approach: z.string().max(500).nullable().optional(),
  q22_marketing_feelings: z.string().max(1000).nullable().optional(), // JSON array
  q23_hardest_now: z.string().max(1000).nullable().optional(), // JSON array

  // Section 6: Social Media
  q24_social_active: socialActive,
  q25_platforms_used: z.string().max(1000).nullable().optional(), // JSON array
  q26_post_frequency: z.string().max(200).nullable().optional(),
  q27_best_content: z.string().max(500).nullable().optional(),
  q28_stopped_reason: z.string().max(1000).nullable().optional(), // JSON array
  q29_tolerable_activity: z.string().max(500).nullable().optional(),

  // Section 7: Offers & Pricing
  q30_sell_more_of: z.string().max(2000).nullable().optional(),
  q31_sell_less_of: z.string().max(2000).nullable().optional(),
  q32_average_price: z.string().max(100).nullable().optional(),
  q33_highest_price: z.string().max(100).nullable().optional(),
  q34_no_shows_impact: noShowsImpact,

  // Section 8: Tools & Technology
  q35_tech_comfort: z.string().max(500).nullable().optional(),
  q36_ai_usage: aiUsage,
  q37_help_wanted: z.string().max(1000).nullable().optional(), // JSON array

  // Section 9: Goals & Constraints
  q38_time_for_marketing: timeForMarketing,
  q39_biggest_constraint: z.string().max(500).nullable().optional(),
  q40_success_90_days: z.string().max(2000).nullable().optional(),

  // Section 10: Online Presence
  q41_website: z.string().max(500).nullable().optional(),
  q42_instagram_link: z.string().max(500).nullable().optional(),
  q43_other_social: z.string().max(2000).nullable().optional(),
  q44_booking_link: z.string().max(500).nullable().optional(),

  // Section 11: Trust & Proof
  q45_proof_assets: z.string().max(1000).nullable().optional(), // JSON array
  q46_google_reviews: z.string().max(100).nullable().optional(),

  // Section 12: Final
  q47_anything_else: z.string().max(5000).nullable().optional(),
  q48_consent: z.number().int().min(0).max(1).nullable().optional(),
});

// Client update schema (partial — any field can be updated)
export const updateClientSchema = fullIntakeSchema.partial();

// Note creation schema
export const createNoteSchema = z.object({
  client_id: z.number().int().positive(),
  note_type: z.enum(['general', 'session_note', 'follow_up_note', 'analysis_note', 'interest_flag']).default('general'),
  content: z.string().min(1, 'Note content is required').max(10000),
});

// Deliverable update schema
export const updateDeliverableSchema = z.object({
  status: z.enum(['not_started', 'generated', 'reviewed', 'sent']),
  content: z.string().max(50000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

// Revenue entry schema
export const createRevenueSchema = z.object({
  client_id: z.number().int().positive().nullable().optional(),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500).nullable().optional(),
  entry_type: z.enum(['session', 'referral_bonus', 'other']).default('session'),
});

// AI output paste-back schema (Phase 3: auto-populate)
export const saveAiOutputSchema = z.object({
  prompt_code: z.string().min(1).max(20),
  ai_output: z.string().min(1).max(100000),
});

// Stage transition schema (Phase 4: pipeline)
export const stageTransitionSchema = z.object({
  stage: pipelineStatus,
});

// Checklist toggle schema (Phase 4: pipeline)
export const checklistToggleSchema = z.object({
  stage: pipelineStatus,
  item: z.string().min(1).max(500),
  completed: z.boolean(),
});

// Deliverable update with RAI confirmation (Phase 4: pipeline)
export const updateDeliverableWithReviewSchema = z.object({
  deliverable_id: z.number().int().positive(),
  status: z.enum(['not_started', 'generated', 'reviewed', 'sent']),
  content: z.string().max(50000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  confirmed_review: z.boolean().optional(),
});

export type QuickAddClient = z.infer<typeof quickAddClientSchema>;
export type FullIntakeData = z.infer<typeof fullIntakeSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
export type CreateNote = z.infer<typeof createNoteSchema>;
export type UpdateDeliverable = z.infer<typeof updateDeliverableSchema>;
export type CreateRevenue = z.infer<typeof createRevenueSchema>;
export type SaveAiOutput = z.infer<typeof saveAiOutputSchema>;
export type StageTransition = z.infer<typeof stageTransitionSchema>;
export type ChecklistToggle = z.infer<typeof checklistToggleSchema>;
export type UpdateDeliverableWithReview = z.infer<typeof updateDeliverableWithReviewSchema>;

// Fit assessment action schema (accept/decline from fit assessment tab)
export const fitAssessmentActionSchema = z.object({
  fit_rating: z.enum(['green', 'yellow', 'red']),
  archetype: z.enum(['overwhelmed_poster', 'avoider']).nullable(),
  action: z.enum(['accept', 'decline']),
  decline_reason: z.string().max(2000).optional(),
});

export type FitAssessmentAction = z.infer<typeof fitAssessmentActionSchema>;
