// ─── Salon Pipeline (5 stages) ──────────────────────────────
export const PIPELINE_STAGES = [
  { id: 'intake_submitted', label: 'New Consultation', color: 'bg-brand-300', description: 'Consultation form received, pending review' },
  { id: 'ai_review', label: 'Under Review', color: 'bg-amber-200', description: 'AI Summary generated, awaiting review' },
  { id: 'active_client', label: 'Active Client', color: 'bg-sage-400', description: 'Accepted, ongoing relationship' },
  { id: 'followup', label: 'Follow-Up', color: 'bg-emerald-300', description: 'Check-in or rebooking needed' },
  { id: 'declined', label: 'Referral', color: 'bg-red-200', description: 'Not a fit -- referred to another stylist' },
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number]['id'];

export const STAGE_CHECKLISTS: Record<PipelineStage, string[]> = {
  intake_submitted: ['Review AI Summary', 'Check hair history for red flags', 'Decide: Accept or Decline'],
  ai_review: ['Review consultation readiness score', 'Check complexity flags', 'Accept or decline client'],
  active_client: ['Track visit history', 'Log color formulas', 'Update hair profile as needed'],
  followup: ['Check in on hair maintenance', 'Offer rebooking', 'Request testimonial if appropriate'],
  declined: ['Send referral email', 'Document reason', 'Archive record'],
};

export const DELIVERABLE_TYPES = [
  { id: 'consultation_notes', label: 'Consultation Notes' },
  { id: 'hair_plan', label: 'Hair Plan' },
  { id: 'product_recommendations', label: 'Product Recommendations' },
] as const;
