import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ClipboardCheck, AlertTriangle, Sparkles, Brain, Heart, ChevronRight } from 'lucide-react';
import { ClientContactActions } from '@/components/clients/client-contact-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClientById } from '@/lib/queries/clients';
import { getIntakeNote } from '@/lib/queries/intake-queue';
import { parseSalonIntakeNote, assessSalonIntake } from '@/lib/salon-summary';
import { SalonScoreCard } from '@/components/salon/salon-score-card';
import { SalonReviewActions } from '@/components/salon/salon-review-actions';
import { IntakePhotoGallery } from '@/components/salon/intake-photo-gallery';
import type { SalonFlag } from '@/lib/constants/salon-scoring-rules';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function flagBadge(flag: SalonFlag) {
  const styles: Record<string, string> = {
    HEADS_UP: 'bg-amber-100 text-amber-700 border-amber-300',
    GOOD_FIT: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    NOTE: 'bg-blue-100 text-blue-700 border-blue-300',
  };
  return (
    <div key={flag.label} className="flex items-start gap-2 text-sm">
      <Badge className={`${styles[flag.type]} flex-shrink-0`}>
        {flag.type === 'HEADS_UP' ? '⚠️' : flag.type === 'GOOD_FIT' ? '✓' : 'ℹ️'} {flag.type.replace('_', ' ')}
      </Badge>
      <span className="text-muted-foreground">{flag.label}</span>
    </div>
  );
}

export default async function IntakeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId) || numId < 1) notFound();

  const client = getClientById(numId);
  if (!client) notFound();

  const noteContent = getIntakeNote(numId);
  if (!noteContent) notFound();

  // Check for photos
  const uploadDir = path.join(process.cwd(), 'data', 'uploads', String(numId));
  let photoFiles: { filename: string; type: string; url: string }[] = [];
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter(f => /\.(jpg|jpeg|png|webp|heic)$/i.test(f));
    photoFiles = files.map(filename => ({
      filename,
      type: filename.startsWith('selfie') ? 'selfie' : 'inspiration',
      url: `/api/admin/uploads/${numId}/${filename}`,
    }));
  }
  const hasPhotos = photoFiles.length > 0;

  const intake = parseSalonIntakeNote(noteContent);
  const summary = assessSalonIntake(intake, hasPhotos);

  const isReviewable = client.status === 'intake_submitted' || client.status === 'ai_review';
  const isAccepted = client.status === 'active_client' || client.status === 'followup';
  const isDeclined = client.status === 'declined';

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/intake"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Intake Queue
      </Link>

      {/* Client Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.q02_client_name}</h1>
          <div className="mt-1">
            <ClientContactActions
              email={client.q03_email}
              phone={client.phone || intake.phone}
              preferredContact={client.preferred_contact}
              variant="full"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={client.status} />
            {client.referral_source && (
              <span className="text-xs text-muted-foreground">
                Referred by: {client.referral_source}
              </span>
            )}
          </div>
        </div>
        {isAccepted && (
          <Link href={`/admin/clients/${numId}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              View Client Profile <ChevronRight className="w-3 h-3 ml-1" />
            </Badge>
          </Link>
        )}
      </div>

      {/* Accept/Decline Actions (only for reviewable intakes) */}
      {isReviewable && (
        <SalonReviewActions
          clientId={numId}
          clientName={client.q02_client_name}
          overallRating={summary.overallRating}
        />
      )}

      {/* Status message for already-processed intakes */}
      {isAccepted && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-3 text-sm text-emerald-700 font-medium">
            ✓ This client has been accepted and is now active.
          </CardContent>
        </Card>
      )}
      {isDeclined && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3 text-sm text-red-700 font-medium">
            ✗ This client was declined.
          </CardContent>
        </Card>
      )}

      {/* AI Summary Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SalonScoreCard
          title="Consultation Readiness"
          score={summary.readiness}
          icon={<ClipboardCheck size={18} />}
        />
        <SalonScoreCard
          title="Complexity"
          score={summary.complexity}
          icon={<Brain size={18} />}
          invertScale
        />
        <SalonScoreCard
          title="Engagement"
          score={summary.engagement}
          icon={<Heart size={18} />}
        />
      </div>

      {/* Flags & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No flags — straightforward client.</p>
            ) : (
              <div className="space-y-2">
                {summary.flags.map((flag) => flagBadge(flag))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-brand-500" />
              Key Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.highlights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No highlights available.</p>
            ) : (
              <ul className="space-y-1.5">
                {summary.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-brand-400 mt-0.5">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Photos */}
      {hasPhotos && <IntakePhotoGallery photos={photoFiles} />}

      {/* Full Intake Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Full Intake Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {noteContent}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    intake_submitted: 'bg-brand-200 text-brand-800 border-brand-300',
    ai_review: 'bg-amber-100 text-amber-700 border-amber-300',
    active_client: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    followup: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    declined: 'bg-red-100 text-red-700 border-red-300',
  };
  const labels: Record<string, string> = {
    intake_submitted: 'New Intake',
    ai_review: 'Under Review',
    active_client: 'Active Client',
    followup: 'Follow-Up',
    declined: 'Declined',
  };
  return (
    <Badge className={styles[status] || 'bg-gray-100'}>
      {labels[status] || status}
    </Badge>
  );
}
