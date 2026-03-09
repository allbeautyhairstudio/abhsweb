'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormulaForm } from './formula-form';
import { Pipette, Copy, Pencil, Trash2, Plus } from 'lucide-react';

interface FormulaWithNames {
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
  brand_name: string | null;
  line_name: string | null;
  shade_name: string | null;
  shade_code: string | null;
}

interface FormulaTimelineProps {
  clientId: number;
}

export function FormulaTimeline({ clientId }: FormulaTimelineProps) {
  const [formulas, setFormulas] = useState<FormulaWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaWithNames | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFormulas = useCallback(async () => {
    try {
      const res = await fetch(`/api/color/formulas?clientId=${clientId}`);
      if (res.ok) {
        setFormulas(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch formulas:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchFormulas();
  }, [fetchFormulas]);

  const handleSaved = () => {
    setShowForm(false);
    setEditingFormula(null);
    fetchFormulas();
  };

  const handleDuplicate = async (formulaId: number) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch(`/api/color/formulas/${formulaId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_date: today }),
      });
      if (res.ok) {
        fetchFormulas();
      }
    } catch (err) {
      console.error('Failed to duplicate formula:', err);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/color/formulas/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchFormulas();
      }
    } catch (err) {
      console.error('Failed to delete formula:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Loading color history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Pipette size={16} />
          Color Formula History
        </h3>
        {!showForm && !editingFormula && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-500 text-white rounded-md text-xs font-medium hover:bg-forest-600 transition-colors"
          >
            <Plus size={14} />
            New Formula
          </button>
        )}
      </div>

      {/* Form (add/edit) */}
      {(showForm || editingFormula) && (
        <Card>
          <CardContent className="pt-6">
            <FormulaForm
              clientId={clientId}
              initialData={editingFormula || undefined}
              onSaved={handleSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingFormula(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {formulas.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Pipette size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              No color formulas yet. Add the first one above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {formulas.map(f => (
            <Card key={f.id} className="relative">
              <CardContent className="pt-4 pb-4">
                {/* Date header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium">{formatDate(f.service_date)}</span>
                    {f.technique && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {f.technique}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDuplicate(f.id)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Duplicate formula"
                      title="Duplicate for today"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => setEditingFormula(f)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Edit formula"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(f.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                      aria-label="Delete formula"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Formula details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                  {(f.brand_name || f.line_name) && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Brand / Line</dt>
                      <dd>{f.brand_name} — {f.line_name}</dd>
                    </div>
                  )}
                  {(f.shade_name || f.custom_shade) && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Shade</dt>
                      <dd>
                        {f.shade_name || f.custom_shade}
                        {f.shade_code && <span className="text-muted-foreground ml-1">({f.shade_code})</span>}
                      </dd>
                    </div>
                  )}
                  {f.developer_volume && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Developer</dt>
                      <dd>{f.developer_volume}</dd>
                    </div>
                  )}
                  {f.ratio && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Ratio</dt>
                      <dd>{f.ratio}</dd>
                    </div>
                  )}
                  {f.processing_time !== null && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Processing</dt>
                      <dd>{f.processing_time} min</dd>
                    </div>
                  )}
                  {f.placement && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Placement</dt>
                      <dd>{f.placement}</dd>
                    </div>
                  )}
                </div>

                {f.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{f.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h4 className="font-semibold text-red-700 mb-2">Delete Formula</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-3 py-2 border rounded-md text-sm hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
