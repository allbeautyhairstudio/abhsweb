'use client';

import { useState } from 'react';
import { ShadePicker } from './shade-picker';
import { DEVELOPER_VOLUMES, COLOR_TECHNIQUES, COLOR_PLACEMENTS } from '@/lib/constants/color-brands';

interface FormulaFormProps {
  clientId: number;
  initialData?: {
    id?: number;
    service_date?: string;
    color_line_id?: number | null;
    shade_id?: number | null;
    custom_shade?: string | null;
    developer_volume?: string | null;
    ratio?: string | null;
    processing_time?: number | null;
    technique?: string | null;
    placement?: string | null;
    notes?: string | null;
  };
  onSaved: () => void;
  onCancel: () => void;
}

export function FormulaForm({ clientId, initialData, onSaved, onCancel }: FormulaFormProps) {
  const isEdit = !!initialData?.id;

  const [serviceDate, setServiceDate] = useState(
    initialData?.service_date || new Date().toISOString().slice(0, 10)
  );
  const [colorLineId, setColorLineId] = useState<number | null>(initialData?.color_line_id ?? null);
  const [shadeId, setShadeId] = useState<number | null>(initialData?.shade_id ?? null);
  const [customShade, setCustomShade] = useState(initialData?.custom_shade || '');
  const [developerVolume, setDeveloperVolume] = useState(initialData?.developer_volume || '');
  const [ratio, setRatio] = useState(initialData?.ratio || '');
  const [processingTime, setProcessingTime] = useState(
    initialData?.processing_time?.toString() || ''
  );
  const [technique, setTechnique] = useState(initialData?.technique || '');
  const [placement, setPlacement] = useState(initialData?.placement || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDate) return;
    setSubmitting(true);

    try {
      const payload = {
        client_id: clientId,
        service_date: serviceDate,
        color_line_id: colorLineId,
        shade_id: shadeId,
        custom_shade: customShade || null,
        developer_volume: developerVolume || null,
        ratio: ratio || null,
        processing_time: processingTime ? Number(processingTime) : null,
        technique: technique || null,
        placement: placement || null,
        notes: notes || null,
      };

      const url = isEdit
        ? `/api/color/formulas/${initialData.id}`
        : '/api/color/formulas';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSaved();
      }
    } catch (err) {
      console.error('Failed to save formula:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold">
        {isEdit ? 'Edit Formula' : 'New Color Formula'}
      </h3>

      {/* Service Date */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Service Date</label>
        <input
          type="date"
          value={serviceDate}
          onChange={e => setServiceDate(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md text-sm bg-background"
        />
      </div>

      {/* Shade Picker */}
      <ShadePicker
        selectedLineId={colorLineId}
        selectedShadeId={shadeId}
        customShade={customShade}
        onLineChange={setColorLineId}
        onShadeChange={setShadeId}
        onCustomShadeChange={setCustomShade}
      />

      {/* Developer + Ratio row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Developer Volume</label>
          <select
            value={developerVolume}
            onChange={e => setDeveloperVolume(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select...</option>
            {DEVELOPER_VOLUMES.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Mix Ratio</label>
          <input
            type="text"
            value={ratio}
            onChange={e => setRatio(e.target.value)}
            placeholder="e.g. 1:1, 1:2"
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          />
        </div>
      </div>

      {/* Processing Time */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Processing Time (minutes)</label>
        <input
          type="number"
          value={processingTime}
          onChange={e => setProcessingTime(e.target.value)}
          min="0"
          max="600"
          placeholder="e.g. 35"
          className="w-full px-3 py-2 border rounded-md text-sm bg-background"
        />
      </div>

      {/* Technique + Placement row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Technique</label>
          <select
            value={technique}
            onChange={e => setTechnique(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select...</option>
            {COLOR_TECHNIQUES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Placement</label>
          <select
            value={placement}
            onChange={e => setPlacement(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select...</option>
            {COLOR_PLACEMENTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Any additional notes about this formula..."
          className="w-full px-3 py-2 border rounded-md text-sm resize-y bg-background"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || !serviceDate}
          className="px-4 py-2 bg-forest-500 text-white rounded-md text-sm font-medium hover:bg-forest-600 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Formula' : 'Save Formula'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
