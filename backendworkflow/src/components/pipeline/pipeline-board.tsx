'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PIPELINE_STAGES } from '@/lib/constants/stages';
import { PipelineColumn } from './pipeline-column';
import { StageMoveDialog } from './stage-move-dialog';

interface ClientSummary {
  id: number;
  status: string;
  q02_client_name: string;
  q01_business_name: string | null;
  q05_service_type: string | null;
  updated_at: string;
}

interface PipelineBoardProps {
  initialClients: ClientSummary[];
}

export function PipelineBoard({ initialClients }: PipelineBoardProps) {
  const [clients, setClients] = useState(initialClients);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{
    clientId: number;
    clientName: string;
    currentStage: string;
    targetStage: string;
    direction: 'forward' | 'backward';
  } | null>(null);
  const router = useRouter();

  // Group clients by stage
  const clientsByStage: Record<string, ClientSummary[]> = {};
  for (const stage of PIPELINE_STAGES) {
    clientsByStage[stage.id] = clients.filter(c => c.status === stage.id);
  }

  const handleMoveClient = useCallback((clientId: number, clientName: string, direction: 'forward' | 'backward') => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === client.status);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= PIPELINE_STAGES.length) return;

    const targetStage = PIPELINE_STAGES[targetIndex].id;
    setMoveTarget({
      clientId,
      clientName,
      currentStage: client.status,
      targetStage,
      direction,
    });
    setDialogOpen(true);
  }, [clients]);

  async function confirmMove() {
    if (!moveTarget) return;

    const res = await fetch(`/api/clients/${moveTarget.clientId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: moveTarget.targetStage }),
    });

    if (res.ok) {
      setClients(prev =>
        prev.map(c =>
          c.id === moveTarget.clientId
            ? { ...c, status: moveTarget.targetStage, updated_at: new Date().toISOString() }
            : c
        )
      );
    }

    setDialogOpen(false);
    setMoveTarget(null);
    router.refresh();
  }

  const row1 = PIPELINE_STAGES.slice(0, 5);
  const row2 = PIPELINE_STAGES.slice(5, 10);

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {row1.map((stage, i) => (
            <PipelineColumn
              key={stage.id}
              stageId={stage.id}
              label={stage.label}
              color={stage.color + ' text-brand-900'}
              clients={clientsByStage[stage.id] || []}
              isFirstStage={i === 0}
              isLastStage={false}
              onMoveClient={(clientId, clientName, direction) => handleMoveClient(clientId, clientName, direction)}
            />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {row2.map((stage, i) => (
            <PipelineColumn
              key={stage.id}
              stageId={stage.id}
              label={stage.label}
              color={stage.color + ' text-brand-900'}
              clients={clientsByStage[stage.id] || []}
              isFirstStage={false}
              isLastStage={i === row2.length - 1}
              onMoveClient={(clientId, clientName, direction) => handleMoveClient(clientId, clientName, direction)}
            />
          ))}
        </div>
      </div>

      {moveTarget && (
        <StageMoveDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          clientName={moveTarget.clientName}
          clientId={moveTarget.clientId}
          currentStage={moveTarget.currentStage}
          targetStage={moveTarget.targetStage}
          direction={moveTarget.direction}
          onConfirm={confirmMove}
        />
      )}
    </>
  );
}
