'use client';

import { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExportButton({ clientId }: { clientId: number }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  async function handleExport() {
    setStatus('loading');
    try {
      const res = await fetch(`/api/clients/${clientId}/export`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `client-${clientId}-export.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('idle');
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={status === 'loading'}
      className={status === 'done' ? 'text-emerald-600 border-emerald-300' : ''}
    >
      {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
      {status === 'done' && <Check size={14} />}
      {status === 'idle' && <Download size={14} />}
      <span className="ml-1">
        {status === 'loading' ? 'Exporting...' : status === 'done' ? 'Exported!' : 'Export JSON'}
      </span>
    </Button>
  );
}
