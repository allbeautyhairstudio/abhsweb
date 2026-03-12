'use client';

import { useState, useEffect } from 'react';

interface ColorLine {
  id: number;
  brand_name: string;
  line_name: string;
  is_custom: number;
}

interface ColorShade {
  id: number;
  color_line_id: number;
  shade_name: string;
  shade_code: string | null;
  is_custom: number;
}

interface ShadePickerProps {
  selectedLineId: number | null;
  selectedShadeId: number | null;
  customShade: string;
  onLineChange: (lineId: number | null) => void;
  onShadeChange: (shadeId: number | null) => void;
  onCustomShadeChange: (value: string) => void;
}

export function ShadePicker({
  selectedLineId,
  selectedShadeId,
  customShade,
  onLineChange,
  onShadeChange,
  onCustomShadeChange,
}: ShadePickerProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [lines, setLines] = useState<ColorLine[]>([]);
  const [shades, setShades] = useState<ColorShade[]>([]);
  const [useCustom, setUseCustom] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newLine, setNewLine] = useState('');
  const [newShade, setNewShade] = useState('');
  const [newShadeCode, setNewShadeCode] = useState('');

  // Fetch brands on mount
  useEffect(() => {
    fetch('/api/color/lines?brands_only=true')
      .then(r => r.json())
      .then(setBrands)
      .catch(console.error);
  }, []);

  // Fetch lines when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setLines([]);
      return;
    }
    fetch(`/api/color/lines?brand=${encodeURIComponent(selectedBrand)}`)
      .then(r => r.json())
      .then(setLines)
      .catch(console.error);
  }, [selectedBrand]);

  // Fetch shades when line changes
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

  // Sync brand from selected line (for edit mode)
  useEffect(() => {
    if (selectedLineId && lines.length > 0) {
      const line = lines.find(l => l.id === selectedLineId);
      if (line && line.brand_name !== selectedBrand) {
        setSelectedBrand(line.brand_name);
      }
    }
  }, [selectedLineId, lines, selectedBrand]);

  const handleBrandChange = (brand: string) => {
    if (brand === '__custom__') {
      setUseCustom(true);
      setSelectedBrand('');
      onLineChange(null);
      onShadeChange(null);
      return;
    }
    setUseCustom(false);
    setSelectedBrand(brand);
    onLineChange(null);
    onShadeChange(null);
  };

  const handleLineChange = (lineId: string) => {
    const id = lineId ? Number(lineId) : null;
    onLineChange(id);
    onShadeChange(null);
  };

  const handleShadeChange = (shadeId: string) => {
    if (shadeId === '__custom__') {
      onShadeChange(null);
      return;
    }
    const id = shadeId ? Number(shadeId) : null;
    onShadeChange(id);
  };

  const handleCreateCustomLine = async () => {
    if (!newBrand.trim() || !newLine.trim()) return;
    try {
      const res = await fetch('/api/color/lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_name: newBrand.trim(), line_name: newLine.trim() }),
      });
      if (res.ok) {
        const { id } = await res.json();
        // Refresh brands and lines
        const brandsRes = await fetch('/api/color/lines?brands_only=true');
        setBrands(await brandsRes.json());
        setSelectedBrand(newBrand.trim());
        setUseCustom(false);
        setNewBrand('');
        setNewLine('');
        // Wait for lines to load then select
        setTimeout(() => onLineChange(id), 300);
      }
    } catch (err) {
      console.error('Failed to create custom line:', err);
    }
  };

  const handleCreateCustomShade = async () => {
    if (!selectedLineId || !newShade.trim()) return;
    try {
      const res = await fetch('/api/color/shades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color_line_id: selectedLineId,
          shade_name: newShade.trim(),
          shade_code: newShadeCode.trim() || null,
        }),
      });
      if (res.ok) {
        const { id } = await res.json();
        // Refresh shades
        const shadesRes = await fetch(`/api/color/shades?lineId=${selectedLineId}`);
        setShades(await shadesRes.json());
        onShadeChange(id);
        setNewShade('');
        setNewShadeCode('');
      }
    } catch (err) {
      console.error('Failed to create custom shade:', err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Brand selector */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Brand</label>
        {useCustom ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newBrand}
              onChange={e => setNewBrand(e.target.value)}
              placeholder="Brand name"
              className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
            />
            <input
              type="text"
              value={newLine}
              onChange={e => setNewLine(e.target.value)}
              placeholder="Line name"
              className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
            />
            <button
              type="button"
              onClick={handleCreateCustomLine}
              className="px-3 py-2 bg-forest-500 text-white rounded-md text-sm hover:bg-forest-600 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setUseCustom(false)}
              className="px-3 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <select
            value={selectedBrand}
            onChange={e => handleBrandChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select brand...</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
            <option value="__custom__">+ Create Your Own</option>
          </select>
        )}
      </div>

      {/* Line selector */}
      {selectedBrand && !useCustom && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Product Line</label>
          <select
            value={selectedLineId ?? ''}
            onChange={e => handleLineChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select line...</option>
            {lines.map(l => (
              <option key={l.id} value={l.id}>{l.line_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Shade selector */}
      {selectedLineId && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Shade</label>
          <select
            value={selectedShadeId ?? (customShade ? '__custom__' : '')}
            onChange={e => handleShadeChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select shade...</option>
            {shades.map(s => (
              <option key={s.id} value={s.id}>
                {s.shade_name}{s.shade_code ? ` (${s.shade_code})` : ''}
              </option>
            ))}
            <option value="__custom__">+ Custom Shade</option>
          </select>

          {/* Custom shade input */}
          {!selectedShadeId && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customShade || newShade}
                onChange={e => {
                  if (customShade !== undefined) onCustomShadeChange(e.target.value);
                  else setNewShade(e.target.value);
                }}
                placeholder="Shade name"
                className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
              />
              {!customShade && newShade && (
                <>
                  <input
                    type="text"
                    value={newShadeCode}
                    onChange={e => setNewShadeCode(e.target.value)}
                    placeholder="Code (opt)"
                    className="w-24 px-3 py-2 border rounded-md text-sm bg-background"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomShade}
                    className="px-3 py-2 bg-forest-500 text-white rounded-md text-sm hover:bg-forest-600 transition-colors"
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
