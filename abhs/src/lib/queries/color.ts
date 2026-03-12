import { getDb } from '../db';
import { COLOR_BRANDS } from '../constants/color-brands';

// ─── Row Types ──────────────────────────────────────────────

export interface ColorLineRow {
  id: number;
  brand_name: string;
  line_name: string;
  is_custom: number;
  created_at: string;
}

export interface ColorShadeRow {
  id: number;
  color_line_id: number;
  shade_name: string;
  shade_code: string | null;
  is_custom: number;
}

export interface ColorFormulaRow {
  id: number;
  client_id: number;
  created_at: string;
  service_date: string;
  color_line_id: number | null;
  shade_id: number | null;
  custom_shade: string | null;
  developer_volume: string | null;
  ratio: string | null;
  processing_time: number | null;
  technique: string | null;
  placement: string | null;
  notes: string | null;
}

/** Formula with joined brand/line/shade names for display */
export interface ColorFormulaWithNames extends ColorFormulaRow {
  brand_name: string | null;
  line_name: string | null;
  shade_name: string | null;
  shade_code: string | null;
}

export interface ColorInventoryRow {
  id: number;
  color_line_id: number;
  shade_id: number | null;
  quantity: number;
  minimum_stock: number;
  unit: string;
  last_restocked: string | null;
  updated_at: string;
}

/** Inventory with joined names for display */
export interface ColorInventoryWithNames extends ColorInventoryRow {
  brand_name: string;
  line_name: string;
  shade_name: string | null;
  shade_code: string | null;
}

// ─── Seed Data ──────────────────────────────────────────────

/** Seed pre-populated brands/lines/shades if color_lines is empty. */
export function seedColorBrands(): void {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as cnt FROM color_lines').get() as { cnt: number };
  if (count.cnt > 0) return;

  const insertLine = db.prepare(
    'INSERT INTO color_lines (brand_name, line_name, is_custom) VALUES (?, ?, 0)'
  );
  const insertShade = db.prepare(
    'INSERT INTO color_shades (color_line_id, shade_name, shade_code, is_custom) VALUES (?, ?, ?, 0)'
  );

  const seedAll = db.transaction(() => {
    for (const brand of COLOR_BRANDS) {
      for (const line of brand.lines) {
        const lineResult = insertLine.run(brand.brand, line.name);
        const lineId = lineResult.lastInsertRowid as number;
        for (const shade of line.shades) {
          insertShade.run(lineId, shade.name, shade.code ?? null);
        }
      }
    }
  });

  seedAll();
}

// ─── Color Lines ────────────────────────────────────────────

/** Get all color lines, optionally filtered by brand. */
export function getColorLines(brand?: string): ColorLineRow[] {
  const db = getDb();
  seedColorBrands();
  if (brand) {
    return db.prepare(
      'SELECT id, brand_name, line_name, is_custom, created_at FROM color_lines WHERE brand_name = ? ORDER BY line_name'
    ).all(brand) as ColorLineRow[];
  }
  return db.prepare(
    'SELECT id, brand_name, line_name, is_custom, created_at FROM color_lines ORDER BY brand_name, line_name'
  ).all() as ColorLineRow[];
}

/** Get distinct brand names. */
export function getColorBrands(): string[] {
  const db = getDb();
  seedColorBrands();
  const rows = db.prepare(
    'SELECT DISTINCT brand_name FROM color_lines ORDER BY brand_name'
  ).all() as Array<{ brand_name: string }>;
  return rows.map(r => r.brand_name);
}

/** Create a custom color line. Returns the new ID. */
export function createColorLine(brandName: string, lineName: string): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO color_lines (brand_name, line_name, is_custom) VALUES (?, ?, 1)'
  ).run(brandName, lineName);
  return result.lastInsertRowid as number;
}

// ─── Color Shades ───────────────────────────────────────────

/** Get all shades for a color line. */
export function getShadesByLineId(lineId: number): ColorShadeRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT id, color_line_id, shade_name, shade_code, is_custom FROM color_shades WHERE color_line_id = ? ORDER BY shade_name'
  ).all(lineId) as ColorShadeRow[];
}

/** Create a custom shade. Returns the new ID. */
export function createColorShade(
  lineId: number,
  shadeName: string,
  shadeCode: string | null
): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO color_shades (color_line_id, shade_name, shade_code, is_custom) VALUES (?, ?, ?, 1)'
  ).run(lineId, shadeName, shadeCode);
  return result.lastInsertRowid as number;
}

// ─── Color Formulas ─────────────────────────────────────────

/** Get all formulas for a client, newest first, with joined names. */
export function getFormulasByClientId(clientId: number): ColorFormulaWithNames[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      f.id, f.client_id, f.created_at, f.service_date,
      f.color_line_id, f.shade_id, f.custom_shade,
      f.developer_volume, f.ratio, f.processing_time,
      f.technique, f.placement, f.notes,
      cl.brand_name, cl.line_name,
      cs.shade_name, cs.shade_code
    FROM color_formulas f
    LEFT JOIN color_lines cl ON f.color_line_id = cl.id
    LEFT JOIN color_shades cs ON f.shade_id = cs.id
    WHERE f.client_id = ?
    ORDER BY f.service_date DESC, f.created_at DESC
  `).all(clientId) as ColorFormulaWithNames[];
}

/** Get a single formula by ID. */
export function getFormulaById(formulaId: number): ColorFormulaWithNames | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT
      f.id, f.client_id, f.created_at, f.service_date,
      f.color_line_id, f.shade_id, f.custom_shade,
      f.developer_volume, f.ratio, f.processing_time,
      f.technique, f.placement, f.notes,
      cl.brand_name, cl.line_name,
      cs.shade_name, cs.shade_code
    FROM color_formulas f
    LEFT JOIN color_lines cl ON f.color_line_id = cl.id
    LEFT JOIN color_shades cs ON f.shade_id = cs.id
    WHERE f.id = ?
  `).get(formulaId) as ColorFormulaWithNames | undefined;
}

/** Create a new formula. Returns the new ID. */
export function createFormula(data: {
  client_id: number;
  service_date: string;
  color_line_id?: number | null;
  shade_id?: number | null;
  custom_shade?: string | null;
  developer_volume?: string | null;
  ratio?: string | null;
  processing_time?: number | null;
  technique?: string | null;
  placement?: string | null;
  notes?: string | null;
}): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO color_formulas (
      client_id, service_date, color_line_id, shade_id, custom_shade,
      developer_volume, ratio, processing_time, technique, placement, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.client_id,
    data.service_date,
    data.color_line_id ?? null,
    data.shade_id ?? null,
    data.custom_shade ?? null,
    data.developer_volume ?? null,
    data.ratio ?? null,
    data.processing_time ?? null,
    data.technique ?? null,
    data.placement ?? null,
    data.notes ?? null
  );
  return result.lastInsertRowid as number;
}

/** Update an existing formula. Returns true if updated. */
export function updateFormula(
  formulaId: number,
  data: Partial<Omit<ColorFormulaRow, 'id' | 'client_id' | 'created_at'>>
): boolean {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.service_date !== undefined) { fields.push('service_date = ?'); values.push(data.service_date); }
  if (data.color_line_id !== undefined) { fields.push('color_line_id = ?'); values.push(data.color_line_id); }
  if (data.shade_id !== undefined) { fields.push('shade_id = ?'); values.push(data.shade_id); }
  if (data.custom_shade !== undefined) { fields.push('custom_shade = ?'); values.push(data.custom_shade); }
  if (data.developer_volume !== undefined) { fields.push('developer_volume = ?'); values.push(data.developer_volume); }
  if (data.ratio !== undefined) { fields.push('ratio = ?'); values.push(data.ratio); }
  if (data.processing_time !== undefined) { fields.push('processing_time = ?'); values.push(data.processing_time); }
  if (data.technique !== undefined) { fields.push('technique = ?'); values.push(data.technique); }
  if (data.placement !== undefined) { fields.push('placement = ?'); values.push(data.placement); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

  if (fields.length === 0) return false;

  values.push(formulaId);
  const result = db.prepare(
    `UPDATE color_formulas SET ${fields.join(', ')} WHERE id = ?`
  ).run(...values);
  return result.changes > 0;
}

/** Delete a formula. Returns true if deleted. */
export function deleteFormula(formulaId: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM color_formulas WHERE id = ?').run(formulaId);
  return result.changes > 0;
}

/** Duplicate a formula for reuse (copies everything except dates). Returns new ID. */
export function duplicateFormula(formulaId: number, newServiceDate: string): number | null {
  const db = getDb();
  const original = db.prepare(
    'SELECT * FROM color_formulas WHERE id = ?'
  ).get(formulaId) as ColorFormulaRow | undefined;

  if (!original) return null;

  const result = db.prepare(`
    INSERT INTO color_formulas (
      client_id, service_date, color_line_id, shade_id, custom_shade,
      developer_volume, ratio, processing_time, technique, placement, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    original.client_id,
    newServiceDate,
    original.color_line_id,
    original.shade_id,
    original.custom_shade,
    original.developer_volume,
    original.ratio,
    original.processing_time,
    original.technique,
    original.placement,
    original.notes
  );
  return result.lastInsertRowid as number;
}

// ─── Color Inventory ────────────────────────────────────────

/** Get full inventory with joined names, sorted by brand/line/shade. */
export function getInventory(): ColorInventoryWithNames[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      i.id, i.color_line_id, i.shade_id, i.quantity, i.minimum_stock,
      i.unit, i.last_restocked, i.updated_at,
      cl.brand_name, cl.line_name,
      cs.shade_name, cs.shade_code
    FROM color_inventory i
    JOIN color_lines cl ON i.color_line_id = cl.id
    LEFT JOIN color_shades cs ON i.shade_id = cs.id
    ORDER BY cl.brand_name, cl.line_name, cs.shade_name
  `).all() as ColorInventoryWithNames[];
}

/** Get low-stock items (quantity < minimum_stock). */
export function getLowStockAlerts(): ColorInventoryWithNames[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      i.id, i.color_line_id, i.shade_id, i.quantity, i.minimum_stock,
      i.unit, i.last_restocked, i.updated_at,
      cl.brand_name, cl.line_name,
      cs.shade_name, cs.shade_code
    FROM color_inventory i
    JOIN color_lines cl ON i.color_line_id = cl.id
    LEFT JOIN color_shades cs ON i.shade_id = cs.id
    WHERE i.quantity < i.minimum_stock
    ORDER BY (i.quantity / i.minimum_stock) ASC
  `).all() as ColorInventoryWithNames[];
}

/** Upsert inventory — create or update stock level. */
export function upsertInventory(data: {
  color_line_id: number;
  shade_id?: number | null;
  quantity: number;
  minimum_stock?: number;
  unit?: string;
  last_restocked?: string | null;
}): number {
  const db = getDb();

  // Check if entry exists
  const existing = db.prepare(
    'SELECT id FROM color_inventory WHERE color_line_id = ? AND (shade_id = ? OR (shade_id IS NULL AND ? IS NULL))'
  ).get(data.color_line_id, data.shade_id ?? null, data.shade_id ?? null) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE color_inventory SET
        quantity = ?, minimum_stock = ?, unit = ?,
        last_restocked = COALESCE(?, last_restocked),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      data.quantity,
      data.minimum_stock ?? 1,
      data.unit ?? 'tubes',
      data.last_restocked ?? null,
      existing.id
    );
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO color_inventory (color_line_id, shade_id, quantity, minimum_stock, unit, last_restocked)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.color_line_id,
    data.shade_id ?? null,
    data.quantity,
    data.minimum_stock ?? 1,
    data.unit ?? 'tubes',
    data.last_restocked ?? null
  );
  return result.lastInsertRowid as number;
}
