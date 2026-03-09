'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRightLeft, X } from 'lucide-react';
import { StatusBadge } from '@/components/clients/status-badge';
import { ClientContactActions } from '@/components/clients/client-contact-actions';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PIPELINE_STAGES } from '@/lib/constants/stages';
import type { ClientRow } from '@/lib/queries/clients';

interface ClientsTableProps {
  clients: ClientRow[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [loading, setLoading] = useState(false);

  const allIds = clients.map(c => c.id);
  const allSelected = clients.length > 0 && selected.size === clients.length;
  const someSelected = selected.size > 0 && selected.size < clients.length;

  function toggleOne(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleBulkDelete() {
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        setSelected(new Set());
        setDeleteOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkStage() {
    if (!targetStage) return;
    setLoading(true);
    try {
      const res = await fetch('/api/clients/bulk-stage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), stage: targetStage }),
      });
      if (res.ok) {
        setSelected(new Set());
        setStageOpen(false);
        setTargetStage('');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (clients.length === 0) return null;

  return (
    <>
      {/* Floating action toolbar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-brand-100 border border-brand-300 rounded-lg px-4 py-2.5 mb-4 shadow-sm flex-wrap">
          <span className="text-sm font-medium text-brand-800">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStageOpen(true)}
              className="gap-1.5"
            >
              <ArrowRightLeft size={14} />
              Move to Stage
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1.5"
            >
              <Trash2 size={14} />
              Delete
            </Button>
            <button
              onClick={clearSelection}
              className="p-1.5 rounded-md text-brand-600 hover:bg-brand-200 transition-colors"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              selected.has(client.id)
                ? 'bg-brand-100 ring-1 ring-brand-300'
                : 'bg-muted hover:bg-brand-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(client.id)}
              onChange={() => toggleOne(client.id)}
              className="mt-1 h-4 w-4 rounded border-brand-300 text-primary accent-primary"
              aria-label={`Select ${client.q02_client_name}`}
            />
            <Link
              href={`/admin/clients/${client.id}`}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-brand-700">{client.q02_client_name}</span>
                <StatusBadge status={client.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {client.q01_business_name ?? '—'}
                {client.q05_service_type ? ` · ${client.q05_service_type}` : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {client.inquiry_date ?? client.created_at?.slice(0, 10) ?? '—'}
              </p>
              <div className="mt-1.5" onClick={(e) => e.preventDefault()}>
                <ClientContactActions
                  email={client.q03_email}
                  phone={client.phone}
                  preferredContact={client.preferred_contact}
                  variant="compact"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-brand-300 text-primary accent-primary"
                  aria-label="Select all clients"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inquiry Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                className={selected.has(client.id) ? 'bg-brand-50' : undefined}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(client.id)}
                    onChange={() => toggleOne(client.id)}
                    className="h-4 w-4 rounded border-brand-300 text-primary accent-primary"
                    aria-label={`Select ${client.q02_client_name}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="font-medium text-brand-700 hover:text-brand-500 hover:underline"
                  >
                    {client.q02_client_name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.q01_business_name ?? '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.q05_service_type ?? '—'}
                </TableCell>
                <TableCell>
                  <ClientContactActions
                    email={client.q03_email}
                    phone={client.phone}
                    preferredContact={client.preferred_contact}
                    variant="compact"
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge status={client.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.inquiry_date ?? client.created_at?.slice(0, 10) ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selected.size} client{selected.size !== 1 ? 's' : ''}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data for the selected client{selected.size !== 1 ? 's' : ''} will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={loading}>
              {loading ? 'Deleting...' : `Delete ${selected.size} Client${selected.size !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to stage dialog */}
      <Dialog open={stageOpen} onOpenChange={(open) => {
        setStageOpen(open);
        if (!open) setTargetStage('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move {selected.size} client{selected.size !== 1 ? 's' : ''} to stage</DialogTitle>
            <DialogDescription>
              Select the pipeline stage to move the selected client{selected.size !== 1 ? 's' : ''} to.
            </DialogDescription>
          </DialogHeader>
          <Select value={targetStage} onValueChange={setTargetStage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a stage..." />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setStageOpen(false); setTargetStage(''); }} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleBulkStage} disabled={loading || !targetStage}>
              {loading ? 'Moving...' : `Move ${selected.size} Client${selected.size !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
