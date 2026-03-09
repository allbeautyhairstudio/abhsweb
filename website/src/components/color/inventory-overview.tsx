'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Plus } from 'lucide-react';
import { INVENTORY_UNITS } from '@/lib/constants/color-brands';

interface InventoryItem {
  id: number;
  color_line_id: number;
  shade_id: number | null;
  quantity: number;
  minimum_stock: number;
  unit: string;
  last_restocked: string | null;
  updated_at: string;
  brand_name: string;
  line_name: string;
  shade_name: string | null;
  shade_code: string | null;
}

interface ColorLine {
  id: number;
  brand_name: string;
  line_name: string;
}

interface ColorShade {
  id: number;
  shade_name: string;
  shade_code: string | null;
}

export function InventoryOverview() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [lines, setLines] = useState<ColorLine[]>([]);
  const [shades, setShades] = useState<ColorShade[]>([]);
  const [selectedLineId, setSelectedLineId] = useState('');
  const [selectedShadeId, setSelectedShadeId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minimumStock, setMinimumStock] = useState('1');
  const [unit, setUnit] = useState('tubes');
  const [submitting, setSubmitting] = useState(false);

  // Edit inline state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editMin, setEditMin] = useState('');

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/color/inventory');
      if (res.ok) {
        setInventory(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Fetch lines for add form
  useEffect(() => {
    if (showAddForm && lines.length === 0) {
      fetch('/api/color/lines')
        .then(r => r.json())
        .then(setLines)
        .catch(console.error);
    }
  }, [showAddForm, lines.length]);

  // Fetch shades when line selected
  useEffect(() => {
    if (!selectedLineId) {
      setShades([]);
      return;
    }
    fetch(`/api/color/shades?lineId=${selectedLineId}`)
      .then(r => r.json())
      .then(setShades)
      .catch(console.error);
  }, [selectedLineId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLineId || !quantity) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/color/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color_line_id: Number(selectedLineId),
          shade_id: selectedShadeId ? Number(selectedShadeId) : null,
          quantity: Number(quantity),
          minimum_stock: Number(minimumStock) || 1,
          unit,
          last_restocked: new Date().toISOString().slice(0, 10),
        }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setSelectedLineId('');
        setSelectedShadeId('');
        setQuantity('');
        setMinimumStock('1');
        setUnit('tubes');
        fetchInventory();
      }
    } catch (err) {
      console.error('Failed to add inventory:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineUpdate = async (item: InventoryItem) => {
    try {
      await fetch('/api/color/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color_line_id: item.color_line_id,
          shade_id: item.shade_id,
          quantity: Number(editQty),
          minimum_stock: Number(editMin) || item.minimum_stock,
          unit: item.unit,
        }),
      });
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      console.error('Failed to update inventory:', err);
    }
  };

  const lowStockCount = inventory.filter(i => i.quantity < i.minimum_stock).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Package size={16} />
          Color Inventory
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {lowStockCount} low stock
            </Badge>
          )}
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-500 text-white rounded-md text-xs font-medium hover:bg-forest-600 transition-colors"
        >
          <Plus size={14} />
          Add Stock
        </button>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} below minimum stock
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Check highlighted items below and restock as needed.
            </p>
          </div>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <h4 className="text-sm font-medium">Add or Update Stock</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Product Line</label>
                  <select
                    value={selectedLineId}
                    onChange={e => { setSelectedLineId(e.target.value); setSelectedShadeId(''); }}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="">Select line...</option>
                    {lines.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.brand_name} — {l.line_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Shade (optional)</label>
                  <select
                    value={selectedShadeId}
                    onChange={e => setSelectedShadeId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    disabled={!selectedLineId}
                  >
                    <option value="">General line stock</option>
                    {shades.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.shade_name}{s.shade_code ? ` (${s.shade_code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="0"
                    step="0.5"
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={e => setMinimumStock(e.target.value)}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    {INVENTORY_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting || !selectedLineId || !quantity}
                  className="px-4 py-2 bg-forest-500 text-white rounded-md text-sm font-medium hover:bg-forest-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Inventory grid */}
      {inventory.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Package size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              No inventory tracked yet. Add stock to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {inventory.map(item => {
            const isLow = item.quantity < item.minimum_stock;
            const isEditing = editingId === item.id;

            return (
              <Card
                key={item.id}
                className={isLow ? 'border-amber-300 bg-amber-50/50' : ''}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-xs text-muted-foreground">{item.brand_name}</p>
                      <p className="text-sm font-medium">
                        {item.line_name}
                        {item.shade_name && (
                          <span className="text-muted-foreground"> — {item.shade_name}</span>
                        )}
                      </p>
                    </div>
                    {isLow && (
                      <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        value={editQty}
                        onChange={e => setEditQty(e.target.value)}
                        min="0"
                        step="0.5"
                        className="w-20 px-2 py-1 border rounded text-sm bg-background"
                      />
                      <span className="text-xs text-muted-foreground">/ min:</span>
                      <input
                        type="number"
                        value={editMin}
                        onChange={e => setEditMin(e.target.value)}
                        min="0"
                        step="0.5"
                        className="w-16 px-2 py-1 border rounded text-sm bg-background"
                      />
                      <button
                        onClick={() => handleInlineUpdate(item)}
                        className="px-2 py-1 bg-forest-500 text-white rounded text-xs hover:bg-forest-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 border rounded text-xs hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-baseline gap-2 mt-2 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditQty(item.quantity.toString());
                        setEditMin(item.minimum_stock.toString());
                      }}
                    >
                      <span className={`text-lg font-semibold ${isLow ? 'text-amber-700' : ''}`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.unit} (min: {item.minimum_stock})
                      </span>
                    </div>
                  )}

                  {item.last_restocked && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last restocked: {new Date(item.last_restocked + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
