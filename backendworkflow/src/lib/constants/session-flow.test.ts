import { describe, it, expect } from 'vitest';
import { SESSION_FLOW_BLOCKS, ARCHETYPE_TIPS, WATCH_TIPS, REDIRECT_TIPS } from './session-flow';

describe('SESSION_FLOW_BLOCKS', () => {
  it('defines exactly 6 time blocks', () => {
    expect(SESSION_FLOW_BLOCKS).toHaveLength(6);
  });

  it('every block has time, label, whatHappens, and notes', () => {
    for (const block of SESSION_FLOW_BLOCKS) {
      expect(block.time).toBeTruthy();
      expect(block.label).toBeTruthy();
      expect(block.whatHappens).toBeTruthy();
      expect(block.notes).toBeTruthy();
    }
  });

  it('first block starts at 0:00', () => {
    expect(SESSION_FLOW_BLOCKS[0].time).toContain('0:00');
  });

  it('last block ends at 1:30', () => {
    expect(SESSION_FLOW_BLOCKS[5].time).toContain('1:30');
  });

  it('blocks are in chronological order', () => {
    const labels = SESSION_FLOW_BLOCKS.map(b => b.label);
    expect(labels[0]).toBe('Welcome & Connection');
    expect(labels[5]).toBe('Q&A, Next Steps & Close');
  });
});

describe('ARCHETYPE_TIPS', () => {
  it('has tips for overwhelmed_poster', () => {
    expect(ARCHETYPE_TIPS.overwhelmed_poster).toBeDefined();
    expect(ARCHETYPE_TIPS.overwhelmed_poster.length).toBeGreaterThan(0);
  });

  it('has tips for avoider', () => {
    expect(ARCHETYPE_TIPS.avoider).toBeDefined();
    expect(ARCHETYPE_TIPS.avoider.length).toBeGreaterThan(0);
  });

  it('all tips are non-empty strings', () => {
    for (const archetype of Object.keys(ARCHETYPE_TIPS)) {
      for (const tip of ARCHETYPE_TIPS[archetype]) {
        expect(typeof tip).toBe('string');
        expect(tip.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('WATCH_TIPS', () => {
  it('has at least 3 tips', () => {
    expect(WATCH_TIPS.length).toBeGreaterThanOrEqual(3);
  });

  it('all tips are non-empty strings', () => {
    for (const tip of WATCH_TIPS) {
      expect(typeof tip).toBe('string');
      expect(tip.length).toBeGreaterThan(0);
    }
  });
});

describe('REDIRECT_TIPS', () => {
  it('has at least 2 tips', () => {
    expect(REDIRECT_TIPS.length).toBeGreaterThanOrEqual(2);
  });

  it('all tips are non-empty strings', () => {
    for (const tip of REDIRECT_TIPS) {
      expect(typeof tip).toBe('string');
      expect(tip.length).toBeGreaterThan(0);
    }
  });
});
