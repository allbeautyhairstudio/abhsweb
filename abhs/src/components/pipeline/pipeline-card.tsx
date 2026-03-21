'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PipelineCardProps {
  client: {
    id: number;
    q02_client_name: string;
    q01_business_name: string | null;
    q05_service_type: string | null;
    updated_at: string;
  };
  onMoveNext: () => void;
  onMovePrev: () => void;
  isFirstStage: boolean;
  isLastStage: boolean;
}

function getDaysInStage(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

export function PipelineCard({ client, onMoveNext, onMovePrev, isFirstStage, isLastStage }: PipelineCardProps) {
  const days = getDaysInStage(client.updated_at);

  return (
    <div className="bg-white rounded border border-border/50 px-2 py-1.5 hover:shadow-sm transition-shadow">
      <Link href={`/admin/clients/${client.id}`} className="block">
        <p className="font-medium text-brand-800 text-xs truncate">
          {client.q02_client_name}
        </p>
        {client.q01_business_name && (
          <p className="text-[10px] text-muted-foreground truncate">
            {client.q01_business_name}
          </p>
        )}
      </Link>
      <div className="flex items-center justify-between mt-1">
        <span className={`flex items-center gap-0.5 text-[10px] ${
          days > 7 ? 'text-status-overdue' : 'text-muted-foreground'
        }`}>
          <Clock size={10} />
          {days}d
        </span>
        <div className="flex items-center">
          {!isFirstStage && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Move ${client.q02_client_name} back`}
              className="h-7 w-7 min-h-[44px] min-w-[44px] p-0 text-muted-foreground hover:text-brand-800 hover:bg-brand-100 md:h-5 md:w-5 md:min-h-0 md:min-w-0"
              onClick={(e) => {
                e.preventDefault();
                onMovePrev();
              }}
            >
              <ChevronLeft size={14} className="md:size-3" />
            </Button>
          )}
          {!isLastStage && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Move ${client.q02_client_name} forward`}
              className="h-7 w-7 min-h-[44px] min-w-[44px] p-0 text-brand-600 hover:text-brand-800 hover:bg-brand-100 md:h-5 md:w-5 md:min-h-0 md:min-w-0"
              onClick={(e) => {
                e.preventDefault();
                onMoveNext();
              }}
            >
              <ChevronRight size={14} className="md:size-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
