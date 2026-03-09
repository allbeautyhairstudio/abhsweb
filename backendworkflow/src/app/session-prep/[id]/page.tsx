import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClientById } from '@/lib/queries/clients';
import { getNotesByClientId } from '@/lib/queries/notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/clients/status-badge';
import { SessionPrepChecklist } from '@/components/session-prep/session-prep-checklist';
import { SESSION_FLOW_BLOCKS, ARCHETYPE_TIPS, WATCH_TIPS, REDIRECT_TIPS } from '@/lib/constants/session-flow';
import { formatRelativeDate, formatDisplayDate } from '@/lib/date-utils';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  MessageCircle,
  Target,
  Clock,
  User,
  Lightbulb,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SessionPrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(Number(id));

  if (!client) notFound();

  const allNotes = getNotesByClientId(Number(id));
  const interestFlags = allNotes.filter(n => n.note_type === 'interest_flag');
  const analysisNotes = allNotes.filter(n => n.note_type === 'analysis_note');

  const sessionCountdown = formatRelativeDate(client.session_date);

  // Determine archetype tips
  const archetype = client.archetype ?? '';
  const archetypeTips = ARCHETYPE_TIPS[archetype] ?? [];

  // Determine fit rating for WATCH/REDIRECT tips
  const fitRating = (client.fit_rating ?? '').toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <Link
            href={`/clients/${client.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-600 mb-2"
          >
            <ArrowLeft size={14} /> Back to Client
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Session Prep</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">
            {client.q02_client_name} — {client.q01_business_name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={client.status} />
          {client.session_date && (
            <div>
              <p className="text-sm font-medium text-brand-600">
                <Calendar size={14} className="inline mr-1" />
                {formatDisplayDate(client.session_date)}
              </p>
              <p className="text-xs text-muted-foreground">{sessionCountdown}</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Client Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
            <User size={18} />
            Client Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Service Type</p>
              <p className="text-sm font-medium">{client.q05_service_type || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">{client.q04_city_state || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Archetype</p>
              <p className="text-sm font-medium">{archetype || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time Tier</p>
              <p className="text-sm font-medium">{client.time_tier || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fit Rating</p>
              <p className="text-sm font-medium">{client.fit_rating || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Years in Business</p>
              <p className="text-sm font-medium">{client.q06_years_in_business || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Inquiry Date</p>
              <p className="text-sm font-medium">{formatDisplayDate(client.inquiry_date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Date</p>
              <p className="text-sm font-medium">{formatDisplayDate(client.payment_date)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 2: Interest Flags & Analysis Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
              <AlertTriangle size={18} className="text-orange-500" />
              Interest Flags & Analysis Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interestFlags.length === 0 && analysisNotes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No flags or analysis notes recorded.</p>
            ) : (
              <div className="space-y-3">
                {interestFlags.map((note) => (
                  <div key={note.id} className="p-2 rounded bg-orange-50">
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-0 text-xs mb-1">
                      Interest Flag
                    </Badge>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
                {analysisNotes.map((note) => (
                  <div key={note.id} className="p-2 rounded bg-purple-50">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-0 text-xs mb-1">
                      Analysis
                    </Badge>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Talking Points */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
              <MessageCircle size={18} />
              Talking Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <TalkingPoint label="Primary Goal" value={client.q12_primary_goal} />
              <TalkingPoint label="What Feels Hardest" value={client.q23_hardest_now} />
              <TalkingPoint label="90-Day Success Vision" value={client.q40_success_90_days} />
              <TalkingPoint label="What's Working Now" value={client.q19_what_works} />
              <TalkingPoint label="Anything Else" value={client.q47_anything_else} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Session Flow Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
            <Clock size={18} />
            90-Minute Session Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SESSION_FLOW_BLOCKS.map((block, i) => (
              <div key={i} className="flex gap-3 p-2 rounded hover:bg-muted/50">
                <div className="w-20 shrink-0 text-xs font-mono text-muted-foreground pt-0.5">
                  {block.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-800">{block.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{block.whatHappens}</p>
                  <p className="text-xs text-brand-600 italic mt-0.5">{block.notes}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Archetype Tips */}
          {archetypeTips.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-brand-50 border border-brand-200">
              <p className="text-xs font-medium text-brand-700 mb-2 flex items-center gap-1">
                <Lightbulb size={14} />
                Tips for {archetype === 'overwhelmed_poster' ? 'Overwhelmed Poster' : 'Avoider'}
              </p>
              <ul className="space-y-1">
                {archetypeTips.map((tip, i) => (
                  <li key={i} className="text-xs text-brand-600">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* WATCH tips */}
          {fitRating === 'watch' && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                <AlertTriangle size={14} />
                WATCH Client — Delivery Tips
              </p>
              <ul className="space-y-1">
                {WATCH_TIPS.map((tip, i) => (
                  <li key={i} className="text-xs text-amber-600">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* REDIRECT tips */}
          {fitRating === 'redirect' && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                <AlertTriangle size={14} />
                REDIRECT Client — Delivery Tips
              </p>
              <ul className="space-y-1">
                {REDIRECT_TIPS.map((tip, i) => (
                  <li key={i} className="text-xs text-red-600">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Pre-Session Checklist */}
      <SessionPrepChecklist clientId={client.id} />
    </div>
  );
}

function TalkingPoint({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;

  // Handle JSON arrays
  let displayValue = value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      displayValue = parsed.join(', ');
    }
  } catch {
    // Not JSON, use as-is
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5">{displayValue}</p>
    </div>
  );
}
