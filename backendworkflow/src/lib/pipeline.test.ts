import { describe, it, expect } from 'vitest';
import { PIPELINE_STAGES, STAGE_CHECKLISTS } from './constants/stages';
import type { PipelineStage } from './constants/stages';
import { stageTransitionSchema, checklistToggleSchema, updateDeliverableWithReviewSchema } from './validation';

/** Stage-to-date-field mapping (mirrors the API route logic). */
const STAGE_DATE_MAP: Partial<Record<PipelineStage, string>> = {
  inquiry: 'inquiry_date',
  intake_submitted: 'intake_date',
  payment: 'payment_date',
  session_scheduled: 'session_date',
  deliverables_sent: 'deliverables_sent_date',
  followup_scheduled: 'followup_date',
  followup_complete: 'followup_complete_date',
};

describe('Pipeline Stage Transitions', () => {
  describe('PIPELINE_STAGES constant', () => {
    it('defines exactly 10 stages', () => {
      expect(PIPELINE_STAGES).toHaveLength(10);
    });

    it('stages are in the correct order', () => {
      const ids = PIPELINE_STAGES.map(s => s.id);
      expect(ids).toEqual([
        'inquiry', 'intake_submitted', 'fit_assessment', 'payment',
        'analysis_prep', 'session_scheduled', 'session_complete',
        'deliverables_sent', 'followup_scheduled', 'followup_complete',
      ]);
    });

    it('every stage has unique id, label, color, and description', () => {
      const ids = new Set(PIPELINE_STAGES.map(s => s.id));
      expect(ids.size).toBe(10);
      for (const stage of PIPELINE_STAGES) {
        expect(stage.label.length).toBeGreaterThan(0);
        expect(stage.color.length).toBeGreaterThan(0);
        expect(stage.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('STAGE_CHECKLISTS', () => {
    it('has a checklist for every stage', () => {
      for (const stage of PIPELINE_STAGES) {
        const checklist = STAGE_CHECKLISTS[stage.id as PipelineStage];
        expect(checklist, `Missing checklist for ${stage.id}`).toBeDefined();
        expect(Array.isArray(checklist)).toBe(true);
        expect(checklist.length).toBeGreaterThan(0);
      }
    });

    it('analysis_prep has the most checklist items (6)', () => {
      const prep = STAGE_CHECKLISTS.analysis_prep;
      expect(prep).toHaveLength(6);
    });

    it('followup_complete has 6 checklist items', () => {
      const followup = STAGE_CHECKLISTS.followup_complete;
      expect(followup).toHaveLength(6);
    });

    it('all checklist items are non-empty strings', () => {
      for (const stage of PIPELINE_STAGES) {
        const items = STAGE_CHECKLISTS[stage.id as PipelineStage];
        for (const item of items) {
          expect(typeof item).toBe('string');
          expect(item.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Stage date auto-stamping map', () => {
    it('maps 7 stages to date columns', () => {
      expect(Object.keys(STAGE_DATE_MAP)).toHaveLength(7);
    });

    it('maps correct stages to correct date fields', () => {
      expect(STAGE_DATE_MAP.inquiry).toBe('inquiry_date');
      expect(STAGE_DATE_MAP.intake_submitted).toBe('intake_date');
      expect(STAGE_DATE_MAP.payment).toBe('payment_date');
      expect(STAGE_DATE_MAP.session_scheduled).toBe('session_date');
      expect(STAGE_DATE_MAP.deliverables_sent).toBe('deliverables_sent_date');
      expect(STAGE_DATE_MAP.followup_scheduled).toBe('followup_date');
      expect(STAGE_DATE_MAP.followup_complete).toBe('followup_complete_date');
    });

    it('does not map stages that have no dedicated date column', () => {
      expect(STAGE_DATE_MAP.fit_assessment).toBeUndefined();
      expect(STAGE_DATE_MAP.analysis_prep).toBeUndefined();
      expect(STAGE_DATE_MAP.session_complete).toBeUndefined();
    });
  });
});

describe('Bidirectional Stage Movement', () => {
  it('can calculate next stage from any non-final stage', () => {
    for (let i = 0; i < PIPELINE_STAGES.length - 1; i++) {
      const next = PIPELINE_STAGES[i + 1];
      expect(next).toBeDefined();
      expect(next.id).toBeTruthy();
    }
  });

  it('can calculate previous stage from any non-first stage', () => {
    for (let i = 1; i < PIPELINE_STAGES.length; i++) {
      const prev = PIPELINE_STAGES[i - 1];
      expect(prev).toBeDefined();
      expect(prev.id).toBeTruthy();
    }
  });

  it('first stage has no previous stage', () => {
    const firstIndex = 0;
    expect(firstIndex - 1).toBe(-1);
    expect(PIPELINE_STAGES[-1]).toBeUndefined();
  });

  it('last stage has no next stage', () => {
    const lastIndex = PIPELINE_STAGES.length - 1;
    expect(PIPELINE_STAGES[lastIndex + 1]).toBeUndefined();
  });

  it('moving backward from intake_submitted lands on inquiry', () => {
    const intakeIndex = PIPELINE_STAGES.findIndex(s => s.id === 'intake_submitted');
    expect(PIPELINE_STAGES[intakeIndex - 1].id).toBe('inquiry');
  });

  it('moving backward from followup_complete lands on followup_scheduled', () => {
    const lastIndex = PIPELINE_STAGES.findIndex(s => s.id === 'followup_complete');
    expect(PIPELINE_STAGES[lastIndex - 1].id).toBe('followup_scheduled');
  });

  it('stage transition schema accepts any valid stage for backward movement', () => {
    // Moving backward should still use a valid stage — schema accepts all stages
    for (const stage of PIPELINE_STAGES) {
      const result = stageTransitionSchema.safeParse({ stage: stage.id });
      expect(result.success, `Schema should accept ${stage.id} for backward move`).toBe(true);
    }
  });
});

describe('Stage Transition Validation Schema', () => {
  it('accepts all valid pipeline stages', () => {
    for (const stage of PIPELINE_STAGES) {
      const result = stageTransitionSchema.safeParse({ stage: stage.id });
      expect(result.success, `Should accept stage: ${stage.id}`).toBe(true);
    }
  });

  it('rejects invalid stages', () => {
    const invalid = ['', 'pending', 'active', 'done', 'cancelled', 'archived'];
    for (const stage of invalid) {
      const result = stageTransitionSchema.safeParse({ stage });
      expect(result.success, `Should reject stage: ${stage}`).toBe(false);
    }
  });

  it('rejects missing stage field', () => {
    const result = stageTransitionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-string stage', () => {
    const result = stageTransitionSchema.safeParse({ stage: 123 });
    expect(result.success).toBe(false);
  });
});

describe('Checklist Toggle Validation Schema', () => {
  it('accepts valid checklist toggle', () => {
    const result = checklistToggleSchema.safeParse({
      stage: 'inquiry',
      item: 'Send intake form link',
      completed: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts unchecking (completed = false)', () => {
    const result = checklistToggleSchema.safeParse({
      stage: 'payment',
      item: 'Confirm payment received',
      completed: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid stage', () => {
    const result = checklistToggleSchema.safeParse({
      stage: 'invalid_stage',
      item: 'Test item',
      completed: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty item', () => {
    const result = checklistToggleSchema.safeParse({
      stage: 'inquiry',
      item: '',
      completed: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-boolean completed', () => {
    const result = checklistToggleSchema.safeParse({
      stage: 'inquiry',
      item: 'Test',
      completed: 'yes',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(checklistToggleSchema.safeParse({}).success).toBe(false);
    expect(checklistToggleSchema.safeParse({ stage: 'inquiry' }).success).toBe(false);
    expect(checklistToggleSchema.safeParse({ stage: 'inquiry', item: 'Test' }).success).toBe(false);
  });
});

describe('Deliverable Update With Review Schema', () => {
  it('accepts valid update without RAI confirmation (non-sent status)', () => {
    const result = updateDeliverableWithReviewSchema.safeParse({
      deliverable_id: 1,
      status: 'generated',
    });
    expect(result.success).toBe(true);
  });

  it('accepts sent status with confirmed_review = true', () => {
    const result = updateDeliverableWithReviewSchema.safeParse({
      deliverable_id: 1,
      status: 'sent',
      confirmed_review: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts sent status with confirmed_review = false (API will reject)', () => {
    // Schema allows it — API route enforces the business rule
    const result = updateDeliverableWithReviewSchema.safeParse({
      deliverable_id: 1,
      status: 'sent',
      confirmed_review: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional content and notes', () => {
    const result = updateDeliverableWithReviewSchema.safeParse({
      deliverable_id: 5,
      status: 'reviewed',
      content: 'Some content',
      notes: 'Looks good',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = updateDeliverableWithReviewSchema.safeParse({
      deliverable_id: 1,
      status: 'pending',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing deliverable_id', () => {
    const result = updateDeliverableWithReviewSchema.safeParse({
      status: 'generated',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive deliverable_id', () => {
    expect(updateDeliverableWithReviewSchema.safeParse({ deliverable_id: 0, status: 'generated' }).success).toBe(false);
    expect(updateDeliverableWithReviewSchema.safeParse({ deliverable_id: -1, status: 'generated' }).success).toBe(false);
  });

  it('rejects content exceeding max length', () => {
    const result = updateDeliverableWithReviewSchema.safeParse({
      deliverable_id: 1,
      status: 'generated',
      content: 'x'.repeat(50001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding max length', () => {
    const result = updateDeliverableWithReviewSchema.safeParse({
      deliverable_id: 1,
      status: 'generated',
      notes: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});
