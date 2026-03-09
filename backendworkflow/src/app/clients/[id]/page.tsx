import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClientById } from '@/lib/queries/clients';
import { PIPELINE_STAGES, STAGE_CHECKLISTS } from '@/lib/constants/stages';
import { StatusBadge } from '@/components/clients/status-badge';
import { ClientDetailTabs } from '@/components/clients/client-detail-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from '@/components/clients/export-button';
import { DeleteClientButton } from '@/components/clients/delete-client-button';
import { ArrowLeft, Calendar, Mail, MapPin, Briefcase, ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(Number(id));

  if (!client) notFound();

  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === client.status);
  const checklist = STAGE_CHECKLISTS[client.status as keyof typeof STAGE_CHECKLISTS] ?? [];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="space-y-3">
        <div>
          <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-600 mb-2">
            <ArrowLeft size={14} /> Back to Clients
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-800">{client.q02_client_name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            {client.q01_business_name && (
              <span className="flex items-center gap-1"><Briefcase size={14} /> {client.q01_business_name}</span>
            )}
            {client.q05_service_type && (
              <span>{client.q05_service_type}</span>
            )}
            {client.q04_city_state && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {client.q04_city_state}</span>
            )}
            {client.q03_email && (
              <span className="flex items-center gap-1"><Mail size={14} /> {client.q03_email}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportButton clientId={client.id} />
          <DeleteClientButton clientId={client.id} clientName={client.q02_client_name} />
          {(client.status === 'session_scheduled' || client.status === 'analysis_prep') && client.session_date && (
            <Link
              href={`/session-prep/${client.id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-100 text-brand-700 text-sm font-medium hover:bg-brand-200 transition-colors"
            >
              <ClipboardList size={16} />
              Session Prep
            </Link>
          )}
          <StatusBadge status={client.status} />
        </div>
      </div>

      {/* Stage Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-1">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.id} className="flex-1 flex flex-col items-center">
                <div
                  className={`h-2 w-full rounded-full ${
                    i <= currentStageIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                <span className={`text-[10px] mt-1 text-center hidden md:block ${
                  i === currentStageIndex ? 'text-brand-700 font-medium' : 'text-muted-foreground'
                }`}>
                  {stage.label}
                </span>
                {i === currentStageIndex && (
                  <span className="text-[10px] mt-1 text-center text-brand-700 font-medium md:hidden">
                    {stage.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Dates + Checklist Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800 text-base flex items-center gap-2">
              <Calendar size={16} /> Key Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['Inquiry', client.inquiry_date],
                ['Intake', client.intake_date],
                ['Payment', client.payment_date],
                ['Session', client.session_date],
                ['Deliverables Sent', client.deliverables_sent_date],
                ['Follow-Up', client.followup_date],
                ['Follow-Up Complete', client.followup_complete_date],
              ].map(([label, date]) => (
                <div key={label as string}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{(date as string) ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Current Stage Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800 text-base">
              Current Stage: {PIPELINE_STAGES[currentStageIndex]?.label ?? client.status}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checklist.length > 0 ? (
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-0.5 accent-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No checklist for this stage.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <ClientDetailTabs client={client} />
    </div>
  );
}
