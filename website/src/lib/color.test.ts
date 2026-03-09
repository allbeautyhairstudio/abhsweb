import { describe, it, expect } from 'vitest';
import {
  createColorLineSchema,
  createColorShadeSchema,
  createFormulaSchema,
  updateFormulaSchema,
  updateInventorySchema,
} from './validation';

// ─── Color Line Validation ──────────────────────────────────

describe('createColorLineSchema', () => {
  it('accepts valid color line', () => {
    const result = createColorLineSchema.safeParse({
      brand_name: 'Redken',
      line_name: 'Shades EQ',
    });
    expect(result.success).toBe(true);
  });

  it('defaults is_custom to 1', () => {
    const result = createColorLineSchema.safeParse({
      brand_name: 'Custom Brand',
      line_name: 'My Line',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_custom).toBe(1);
    }
  });

  it('rejects empty brand_name', () => {
    const result = createColorLineSchema.safeParse({
      brand_name: '',
      line_name: 'Shades EQ',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty line_name', () => {
    const result = createColorLineSchema.safeParse({
      brand_name: 'Redken',
      line_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects brand_name over 200 chars', () => {
    const result = createColorLineSchema.safeParse({
      brand_name: 'X'.repeat(201),
      line_name: 'Line',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Color Shade Validation ─────────────────────────────────

describe('createColorShadeSchema', () => {
  it('accepts valid shade', () => {
    const result = createColorShadeSchema.safeParse({
      color_line_id: 1,
      shade_name: '09N Cafe Au Lait',
      shade_code: '09N',
    });
    expect(result.success).toBe(true);
  });

  it('accepts shade without code', () => {
    const result = createColorShadeSchema.safeParse({
      color_line_id: 1,
      shade_name: 'Velvet Purple',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-positive color_line_id', () => {
    const result = createColorShadeSchema.safeParse({
      color_line_id: 0,
      shade_name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty shade_name', () => {
    const result = createColorShadeSchema.safeParse({
      color_line_id: 1,
      shade_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts null shade_code', () => {
    const result = createColorShadeSchema.safeParse({
      color_line_id: 5,
      shade_name: 'Custom Shade',
      shade_code: null,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Formula Validation ─────────────────────────────────────

describe('createFormulaSchema', () => {
  it('accepts minimal valid formula', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
      service_date: '2026-03-05',
    });
    expect(result.success).toBe(true);
  });

  it('accepts full formula with all fields', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
      service_date: '2026-03-05',
      color_line_id: 3,
      shade_id: 12,
      custom_shade: null,
      developer_volume: '20 Vol',
      ratio: '1:1',
      processing_time: 35,
      technique: 'Balayage',
      placement: 'Face Frame',
      notes: 'Great results, client loved it',
    });
    expect(result.success).toBe(true);
  });

  it('accepts formula with custom_shade instead of shade_id', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
      service_date: '2026-03-05',
      color_line_id: 3,
      shade_id: null,
      custom_shade: 'My Special Mix 7.5NB',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing client_id', () => {
    const result = createFormulaSchema.safeParse({
      service_date: '2026-03-05',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing service_date', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty service_date', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
      service_date: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects processing_time over 600', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
      service_date: '2026-03-05',
      processing_time: 601,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative processing_time', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
      service_date: '2026-03-05',
      processing_time: -5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive client_id', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 0,
      service_date: '2026-03-05',
    });
    expect(result.success).toBe(false);
  });

  it('accepts null optional fields', () => {
    const result = createFormulaSchema.safeParse({
      client_id: 1,
      service_date: '2026-03-05',
      color_line_id: null,
      shade_id: null,
      custom_shade: null,
      developer_volume: null,
      ratio: null,
      processing_time: null,
      technique: null,
      placement: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('updateFormulaSchema', () => {
  it('accepts partial update with just service_date', () => {
    const result = updateFormulaSchema.safeParse({
      service_date: '2026-03-10',
    });
    expect(result.success).toBe(true);
  });

  it('accepts partial update with just notes', () => {
    const result = updateFormulaSchema.safeParse({
      notes: 'Updated notes',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateFormulaSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('does not include client_id', () => {
    const result = updateFormulaSchema.safeParse({
      client_id: 1,
      service_date: '2026-03-10',
    });
    // client_id should be stripped (omitted from schema)
    expect(result.success).toBe(true);
    if (result.success) {
      expect('client_id' in result.data).toBe(false);
    }
  });

  it('rejects notes over 5000 chars', () => {
    const result = updateFormulaSchema.safeParse({
      notes: 'X'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── Inventory Validation ───────────────────────────────────

describe('updateInventorySchema', () => {
  it('accepts valid inventory entry', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      shade_id: 5,
      quantity: 3,
      minimum_stock: 1,
      unit: 'tubes',
    });
    expect(result.success).toBe(true);
  });

  it('accepts entry without shade_id (general line stock)', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: 10,
    });
    expect(result.success).toBe(true);
  });

  it('defaults unit to tubes', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unit).toBe('tubes');
    }
  });

  it('defaults minimum_stock to 1', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minimum_stock).toBe(1);
    }
  });

  it('accepts all valid units', () => {
    const units = ['tubes', 'bottles', 'packets', 'oz', 'g'] as const;
    for (const unit of units) {
      const result = updateInventorySchema.safeParse({
        color_line_id: 1,
        quantity: 1,
        unit,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid unit', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: 1,
      unit: 'gallons',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero quantity', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: 0,
    });
    expect(result.success).toBe(true);
  });

  it('accepts fractional quantity (half tubes)', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: 2.5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing color_line_id', () => {
    const result = updateInventorySchema.safeParse({
      quantity: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing quantity', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts last_restocked date', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      quantity: 10,
      last_restocked: '2026-03-05',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null shade_id', () => {
    const result = updateInventorySchema.safeParse({
      color_line_id: 1,
      shade_id: null,
      quantity: 5,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Color Brands Data ──────────────────────────────────────

describe('COLOR_BRANDS seed data', () => {
  it('has at least 8 brands', async () => {
    const { COLOR_BRANDS } = await import('./constants/color-brands');
    expect(COLOR_BRANDS.length).toBeGreaterThanOrEqual(8);
  });

  it('every brand has at least 1 line', async () => {
    const { COLOR_BRANDS } = await import('./constants/color-brands');
    for (const brand of COLOR_BRANDS) {
      expect(brand.lines.length).toBeGreaterThan(0);
    }
  });

  it('every line has at least 1 shade', async () => {
    const { COLOR_BRANDS } = await import('./constants/color-brands');
    for (const brand of COLOR_BRANDS) {
      for (const line of brand.lines) {
        expect(line.shades.length).toBeGreaterThan(0);
      }
    }
  });

  it('every shade has a name', async () => {
    const { COLOR_BRANDS } = await import('./constants/color-brands');
    for (const brand of COLOR_BRANDS) {
      for (const line of brand.lines) {
        for (const shade of line.shades) {
          expect(shade.name.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('includes Redken Shades EQ', async () => {
    const { COLOR_BRANDS } = await import('./constants/color-brands');
    const redken = COLOR_BRANDS.find(b => b.brand === 'Redken');
    expect(redken).toBeDefined();
    const shadesEQ = redken!.lines.find(l => l.name === 'Shades EQ');
    expect(shadesEQ).toBeDefined();
    expect(shadesEQ!.shades.length).toBeGreaterThan(5);
  });

  it('includes Pulp Riot vivids', async () => {
    const { COLOR_BRANDS } = await import('./constants/color-brands');
    const pulp = COLOR_BRANDS.find(b => b.brand === 'Pulp Riot');
    expect(pulp).toBeDefined();
    const vivids = pulp!.lines.find(l => l.name.includes('Semi-Permanent'));
    expect(vivids).toBeDefined();
  });
});

describe('COLOR_TECHNIQUES', () => {
  it('includes common salon techniques', async () => {
    const { COLOR_TECHNIQUES } = await import('./constants/color-brands');
    expect(COLOR_TECHNIQUES).toContain('Balayage');
    expect(COLOR_TECHNIQUES).toContain('Full Color');
    expect(COLOR_TECHNIQUES).toContain('Toner');
    expect(COLOR_TECHNIQUES).toContain('Root Touch-Up');
    expect(COLOR_TECHNIQUES).toContain('Face Frame');
  });
});

describe('COLOR_PLACEMENTS', () => {
  it('includes common placement areas', async () => {
    const { COLOR_PLACEMENTS } = await import('./constants/color-brands');
    expect(COLOR_PLACEMENTS).toContain('All Over');
    expect(COLOR_PLACEMENTS).toContain('Roots Only');
    expect(COLOR_PLACEMENTS).toContain('Face Frame');
    expect(COLOR_PLACEMENTS).toContain('Money Piece');
  });
});

describe('DEVELOPER_VOLUMES', () => {
  it('has 5 standard volumes', async () => {
    const { DEVELOPER_VOLUMES } = await import('./constants/color-brands');
    expect(DEVELOPER_VOLUMES).toHaveLength(5);
    expect(DEVELOPER_VOLUMES).toContain('10 Vol');
    expect(DEVELOPER_VOLUMES).toContain('20 Vol');
    expect(DEVELOPER_VOLUMES).toContain('40 Vol');
  });
});

describe('INVENTORY_UNITS', () => {
  it('has expected unit options', async () => {
    const { INVENTORY_UNITS } = await import('./constants/color-brands');
    expect(INVENTORY_UNITS).toContain('tubes');
    expect(INVENTORY_UNITS).toContain('oz');
    expect(INVENTORY_UNITS).toContain('g');
  });
});
