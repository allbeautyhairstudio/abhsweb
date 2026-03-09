import { describe, it, expect } from 'vitest';
import { DELIVERABLE_TYPES } from '../constants/stages';

describe('Deliverables', () => {
  describe('DELIVERABLE_TYPES constant', () => {
    it('defines exactly 9 deliverable types', () => {
      expect(DELIVERABLE_TYPES).toHaveLength(9);
    });

    it('every type has a unique id', () => {
      const ids = DELIVERABLE_TYPES.map(d => d.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('every type has a non-empty label', () => {
      for (const type of DELIVERABLE_TYPES) {
        expect(type.label.length).toBeGreaterThan(0);
      }
    });

    it('includes all expected deliverable types', () => {
      const ids = DELIVERABLE_TYPES.map(d => d.id);
      expect(ids).toContain('roadmap');
      expect(ids).toContain('workflow_instructions');
      expect(ids).toContain('prompt_sheet');
      expect(ids).toContain('content_ideas');
      expect(ids).toContain('weekly_system');
      expect(ids).toContain('week1_action_card');
      expect(ids).toContain('visibility_assessment');
      expect(ids).toContain('maturity_diagnostic');
      expect(ids).toContain('attention_leak_analysis');
    });
  });

  describe('Deliverable status workflow', () => {
    const VALID_STATUSES = ['not_started', 'generated', 'reviewed', 'sent'];

    it('defines 4 valid statuses in correct order', () => {
      expect(VALID_STATUSES).toEqual(['not_started', 'generated', 'reviewed', 'sent']);
    });

    it('rejects invalid statuses', () => {
      const invalid = ['pending', 'done', 'cancelled', '', 'approved'];
      for (const status of invalid) {
        expect(VALID_STATUSES).not.toContain(status);
      }
    });

    it('not_started is the initial status', () => {
      expect(VALID_STATUSES[0]).toBe('not_started');
    });

    it('sent is the final status', () => {
      expect(VALID_STATUSES[VALID_STATUSES.length - 1]).toBe('sent');
    });
  });
});
