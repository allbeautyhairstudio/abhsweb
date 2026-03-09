export const PIPELINE_STAGES = [
  { id: 'inquiry', label: 'Inquiry', color: 'bg-brand-200', description: 'Client expressed interest' },
  { id: 'intake_submitted', label: 'Intake Submitted', color: 'bg-brand-300', description: 'Intake form completed' },
  { id: 'fit_assessment', label: 'Fit Assessment', color: 'bg-amber-200', description: 'Quick Scan completed' },
  { id: 'payment', label: 'Payment', color: 'bg-amber-300', description: 'Awaiting or confirming payment' },
  { id: 'analysis_prep', label: 'Analysis & Prep', color: 'bg-orange-200', description: 'Running analysis prompts' },
  { id: 'session_scheduled', label: 'Session Scheduled', color: 'bg-orange-300', description: 'Session date set' },
  { id: 'session_complete', label: 'Session Complete', color: 'bg-sage-300', description: '90-min session delivered' },
  { id: 'deliverables_sent', label: 'Deliverables Sent', color: 'bg-sage-500', description: 'Package delivered to client' },
  { id: 'followup_scheduled', label: 'Follow-Up Scheduled', color: 'bg-emerald-200', description: '30-day check-in scheduled' },
  { id: 'followup_complete', label: 'Follow-Up Complete', color: 'bg-emerald-400', description: 'Check-in done, outcome recorded' },
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number]['id'];

export const STAGE_CHECKLISTS: Record<PipelineStage, string[]> = {
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

export const DELIVERABLE_TYPES = [
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
