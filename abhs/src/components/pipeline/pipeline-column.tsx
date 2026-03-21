'use client';

import { Badge } from '@/components/ui/badge';
import { PipelineCard } from './pipeline-card';

interface ClientSummary {
  id: number;
  q02_client_name: string;
  q01_business_name: string | null;
  q05_service_type: string | null;
  updated_at: string;
}

interface PipelineColumnProps {
  stageId: string;
  label: string;
  color: string;
  clients: ClientSummary[];
  isFirstStage: boolean;
  isLastStage: boolean;
  onMoveClient: (clientId: number, clientName: string, direction: 'forward' | 'backward') => void;
}

export function PipelineColumn({
  stageId,
  label,
  color,
  clients,
  isFirstStage,
  isLastStage,
  onMoveClient,
}: PipelineColumnProps) {
  return (
    <div
      id={`stage-${stageId}`}
      className="flex flex-col bg-muted/50 rounded-lg md:min-w-0"
    >
      {/* Column Header */}
      <div className={`px-2 py-1.5 rounded-t-lg ${color}`}>
        <div className="flex items-center justify-between gap-1">
          <span className="font-medium text-xs truncate">{label}</span>
          <Badge variant="secondary" className="bg-white/40 text-inherit text-[10px] h-4 px-1">
            {clients.length}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-1.5 space-y-1 min-h-[80px] overflow-y-auto max-h-[240px]">
        {clients.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-3">No clients</p>
        ) : (
          clients.map((client) => (
            <PipelineCard
              key={client.id}
              client={client}
              isFirstStage={isFirstStage}
              isLastStage={isLastStage}
              onMoveNext={() => onMoveClient(client.id, client.q02_client_name, 'forward')}
              onMovePrev={() => onMoveClient(client.id, client.q02_client_name, 'backward')}
            />
          ))
        )}
      </div>
    </div>
  );
}
