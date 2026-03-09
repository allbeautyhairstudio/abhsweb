'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STAGE_CHECKLISTS } from '@/lib/constants/stages';
import { ShieldCheck } from 'lucide-react';

interface ChecklistState {
  [item: string]: boolean;
}

export function SessionPrepChecklist({ clientId }: { clientId: number }) {
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [loading, setLoading] = useState(true);

  const items = STAGE_CHECKLISTS.session_scheduled;

  useEffect(() => {
    async function fetchChecklist() {
      try {
        const res = await fetch(`/api/clients/${clientId}/checklist?stage=session_scheduled`);
        if (res.ok) {
          const data = await res.json();
          setChecklist(data);
        }
      } catch (err) {
        console.error('Failed to fetch checklist:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchChecklist();
  }, [clientId]);

  const handleToggle = async (item: string) => {
    const newCompleted = !checklist[item];
    setChecklist(prev => ({ ...prev, [item]: newCompleted }));

    try {
      await fetch(`/api/clients/${clientId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'session_scheduled',
          item,
          completed: newCompleted,
        }),
      });
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
      // Revert on error
      setChecklist(prev => ({ ...prev, [item]: !newCompleted }));
    }
  };

  const completedCount = items.filter(item => checklist[item]).length;
  const allDone = completedCount === items.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <p className="text-muted-foreground text-sm">Loading checklist...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={allDone ? 'border-sage-300' : ''}>
      <CardHeader>
        <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
          <ShieldCheck size={18} className="text-sage-600" />
          Pre-Session Checklist
          <span className="text-xs text-muted-foreground font-normal ml-auto">
            {completedCount}/{items.length} complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <label
              key={item}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={!!checklist[item]}
                onChange={() => handleToggle(item)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
              />
              <span
                className={`text-sm ${
                  checklist[item]
                    ? 'text-muted-foreground line-through'
                    : 'text-brand-800 group-hover:text-brand-600'
                }`}
              >
                {item}
              </span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
