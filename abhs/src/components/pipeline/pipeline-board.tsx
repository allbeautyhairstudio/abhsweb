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

interface StageConfig {
  readonly id: string;
  readonly label: string;
  readonly color: string;
  readonly description: string;
}

interface PipelineBoardProps {
  initialClients: ClientSummary[];
  stages?: readonly StageConfig[];
}

export function PipelineBoard({ initialClients, stages }: PipelineBoardProps) {
  const activeStages = stages || PIPELINE_STAGES;
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
  for (const stage of activeStages) {
    clientsByStage[stage.id] = clients.filter(c => c.status === stage.id);
  }

  const handleMoveClient = useCallback((clientId: number, clientName: string, direction: 'forward' | 'backward') => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const currentIndex = activeStages.findIndex(s => s.id === client.status);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= activeStages.length) return;

    const targetStage = activeStages[targetIndex].id;
    setMoveTarget({
      clientId,
      clientName,
      currentStage: client.status,
      targetStage,
      direction,
    });
    setDialogOpen(true);
  }, [clients, activeStages]);

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

  // Layout: salon = single row of 5, reset = two rows of 5
  const needsTwoRows = activeStages.length > 5;
  const row1 = activeStages.slice(0, 5);
  const row2 = needsTwoRows ? activeStages.slice(5, 10) : [];
  const colCount = Math.min(activeStages.length, 5);

  return (
    <>
      <div className="space-y-3">
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
          {row1.map((stage, i) => (
            <PipelineColumn
              key={stage.id}
              stageId={stage.id}
              label={stage.label}
              color={stage.color + ' text-brand-900'}
              clients={clientsByStage[stage.id] || []}
              isFirstStage={i === 0}
              isLastStage={!needsTwoRows && i === row1.length - 1}
              onMoveClient={(clientId, clientName, direction) => handleMoveClient(clientId, clientName, direction)}
            />
          ))}
        </div>
        {row2.length > 0 && (
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
        )}
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
