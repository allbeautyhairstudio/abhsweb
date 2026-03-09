// ─── Business Types ─────────────────────────────────────────
export type BusinessType = 'salon' | 'reset';

// ─── Salon Pipeline (5 stages) ──────────────────────────────
export const SALON_PIPELINE_STAGES = [
  { id: 'intake_submitted', label: 'New Intake', color: 'bg-brand-300', description: 'Intake form received, pending review' },
  { id: 'ai_review', label: 'Under Review', color: 'bg-amber-200', description: 'AI Summary generated, awaiting review' },
  { id: 'active_client', label: 'Active Client', color: 'bg-sage-400', description: 'Accepted, ongoing relationship' },
  { id: 'followup', label: 'Follow-Up', color: 'bg-emerald-300', description: 'Check-in or rebooking needed' },
  { id: 'declined', label: 'Declined', color: 'bg-red-200', description: 'Not a fit right now' },
] as const;

export type SalonPipelineStage = typeof SALON_PIPELINE_STAGES[number]['id'];

export const SALON_STAGE_CHECKLISTS: Record<SalonPipelineStage, string[]> = {
  intake_submitted: ['Review AI Summary', 'Check hair history for red flags', 'Decide: Accept or Decline'],
  ai_review: ['Review consultation readiness score', 'Check complexity flags', 'Accept or decline client'],
  active_client: ['Track visit history', 'Log color formulas', 'Update hair profile as needed'],
  followup: ['Check in on hair maintenance', 'Offer rebooking', 'Request testimonial if appropriate'],
  declined: ['Send decline email', 'Document reason', 'Archive record'],
};

export const SALON_DELIVERABLE_TYPES = [
  { id: 'consultation_notes', label: 'Consultation Notes' },
  { id: 'hair_plan', label: 'Hair Plan' },
  { id: 'product_recommendations', label: 'Product Recommendations' },
] as const;

// ─── Marketing Reset Pipeline (10 stages) ───────────────────
export const RESET_PIPELINE_STAGES = [
  { id: 'inquiry', label: 'Inquiry', color: 'bg-brand-200', description: 'Client expressed interest' },
  { id: 'intake_submitted', label: 'Intake Submitted', color: 'bg-brand-300', description: 'Intake form completed' },
  { id: 'fit_assessment', label: 'AI Summary', color: 'bg-amber-200', description: 'Quick Scan completed' },
  { id: 'payment', label: 'Payment', color: 'bg-amber-300', description: 'Awaiting or confirming payment' },
  { id: 'analysis_prep', label: 'Analysis & Prep', color: 'bg-orange-200', description: 'Running analysis prompts' },
  { id: 'session_scheduled', label: 'Session Scheduled', color: 'bg-orange-300', description: 'Session date set' },
  { id: 'session_complete', label: 'Session Complete', color: 'bg-sage-300', description: '90-min session delivered' },
  { id: 'deliverables_sent', label: 'Deliverables Sent', color: 'bg-sage-500', description: 'Package delivered to client' },
  { id: 'followup_scheduled', label: 'Follow-Up Scheduled', color: 'bg-emerald-200', description: '30-day check-in scheduled' },
  { id: 'followup_complete', label: 'Follow-Up Complete', color: 'bg-emerald-400', description: 'Check-in done, outcome recorded' },
] as const;

export type ResetPipelineStage = typeof RESET_PIPELINE_STAGES[number]['id'];

// Backward compatibility alias
export const PIPELINE_STAGES = RESET_PIPELINE_STAGES;
export type PipelineStage = ResetPipelineStage;

/** Get the correct pipeline stages for a business type */
export function getStagesForBusinessType(businessType: BusinessType) {
  return businessType === 'salon' ? SALON_PIPELINE_STAGES : RESET_PIPELINE_STAGES;
}

/** Get all valid stage IDs for a business type */
export function getValidStageIds(businessType: BusinessType): string[] {
  return getStagesForBusinessType(businessType).map(s => s.id);
}

/** Check if a stage ID is valid for a given business type */
export function isValidStageForBusiness(stageId: string, businessType: BusinessType): boolean {
  return getValidStageIds(businessType).includes(stageId);
}

export const RESET_STAGE_CHECKLISTS: Record<ResetPipelineStage, string[]> = {
  inquiry: ['Send intake form link'],
  intake_submitted: ['Run Quick Scan prompt', 'Determine fit (GREEN/YELLOW/RED)'],
  fit_assessment: ['Send acceptance or decline message', 'Send payment link if accepted'],
  payment: ['Confirm payment received', 'Record payment amount', 'Send scheduling link'],
  analysis_prep: [
    'Run Master Analysis',
    'Run Client Profile Summary',
    'Run Special Notes (if needed)',
    'Generate Roadmap',
    'Generate 10 Content Ideas',
    'Generate Weekly System',
  ],
  session_scheduled: ['Confirm session date', 'Review prep materials day-before', 'Test video link', 'Review and personalize all AI-generated materials'],
  session_complete: ['Add session notes', 'Finalize deliverables', 'Review and personalize outputs'],
  deliverables_sent: ['Send complete deliverable package', 'Confirm client received it'],
  followup_scheduled: ['Set 30-day follow-up date', 'Add calendar reminder'],
  followup_complete: [
    'Complete 30-day check-in',
    'Record what client implemented',
    'Record results',
    'Request testimonial (if positive)',
    'Offer referral incentive',
    'Document outcome',
  ],
};

// Backward compatibility alias
export const STAGE_CHECKLISTS = RESET_STAGE_CHECKLISTS;

export const RESET_DELIVERABLE_TYPES = [
  { id: 'roadmap', label: 'Marketing Reset Roadmap' },
  { id: 'workflow_instructions', label: 'Workflow Instructions' },
  { id: 'prompt_sheet', label: 'Copy-Paste Prompt Sheet' },
  { id: 'content_ideas', label: '10 Tailored Content Ideas' },
  { id: 'weekly_system', label: 'Customized Weekly System' },
  { id: 'week1_action_card', label: 'Week 1 Action Card' },
  { id: 'visibility_assessment', label: 'Visibility & Client Flow Assessment' },
  { id: 'maturity_diagnostic', label: 'Marketing Maturity Diagnostic' },
  { id: 'attention_leak_analysis', label: 'Attention Leak Analysis' },
] as const;

// Backward compatibility alias
export const DELIVERABLE_TYPES = RESET_DELIVERABLE_TYPES;

/** Get the correct deliverable types for a business type */
export function getDeliverablesForBusinessType(businessType: BusinessType) {
  return businessType === 'salon' ? SALON_DELIVERABLE_TYPES : RESET_DELIVERABLE_TYPES;
}

/** Get the correct stage checklists for a business type */
export function getChecklistsForBusinessType(businessType: BusinessType) {
  return businessType === 'salon' ? SALON_STAGE_CHECKLISTS : RESET_STAGE_CHECKLISTS;
}
