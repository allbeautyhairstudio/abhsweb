import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { ClientContactActions } from '@/components/clients/client-contact-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClientById } from '@/lib/queries/clients';
import { getIntakeNote } from '@/lib/queries/intake-queue';
import { parseSalonIntakeNote, assessSalonIntake } from '@/lib/salon-summary';
import { IntakeDecisionBar } from '@/components/salon/intake-decision-bar';
import { IntakePhotoGallery } from '@/components/salon/intake-photo-gallery';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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
    <div className={`space-y-6 ${isReviewable ? 'pb-24' : ''}`}>
      {/* Back link */}
      <Link
        href="/admin/intake"
        className="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-warm-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Intake Queue
      </Link>

      {/* Client Header + Status Badge */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-warm-800">{client.q02_client_name}</h1>
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
                <span className="text-xs text-warm-400">Referred by: {client.referral_source}</span>
              )}
            </div>
          </div>
          {isAccepted && (
            <Link href={`/admin/clients/${numId}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-warm-50 border-warm-200">
                View Client Profile <ChevronRight className="w-3 h-3 ml-1" />
              </Badge>
            </Link>
          )}
        </div>
        {/* Overall Status Badge */}
        <div className="mt-3">
          <OverallBadge rating={summary.overallRating} />
        </div>
      </div>

      {/* Accepted/Declined status messages */}
      {isAccepted && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-3 text-sm text-emerald-700 font-medium">
            This client has been accepted and is now active.
          </CardContent>
        </Card>
      )}
      {isDeclined && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3 text-sm text-red-700 font-medium">
            This client was declined.
          </CardContent>
        </Card>
      )}

      {/* Flags */}
      {summary.flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.flags.map((flag, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                flag.type === 'HEADS_UP' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                flag.type === 'GOOD_FIT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>{flag.type.replace('_', ' ')}</span>
              <span className="text-warm-500">{flag.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Summary Card */}
      <Card className="bg-blush-50/40 border-warm-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-warm-700">At a Glance</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <SummaryRow label="Service Interest" value={intake.serviceInterest?.join(', ') || 'Not specified'} />
            <SummaryRow label="Hair Type" value={intake.hairTexture || 'Not specified'} />
            <SummaryRow label="Thickness" value={intake.hairDensity || 'Not specified'} />
            <SummaryRow label="Length" value={intake.hairLength || 'Not specified'} />
            <SummaryRow label="Condition" value={intake.hairCondition?.join(', ') || 'Not specified'} />
            <SummaryRow label="Maintenance" value={intake.maintenanceFrequency || 'Not specified'} />
          </dl>
        </CardContent>
      </Card>

      {/* Client Photos */}
      {hasPhotos && <IntakePhotoGallery photos={photoFiles} />}

      {/* In Their Own Words */}
      <Card className="bg-blush-50/40 border-warm-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-warm-700">In Their Own Words</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {intake.hairLoveHate && (
            <div>
              <p className="text-xs text-warm-400 mb-1">What they love & hate about their hair</p>
              <p className="text-sm text-warm-700 leading-relaxed">{intake.hairLoveHate}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-warm-400 mb-1">What they&apos;re hoping for</p>
            <p className="text-sm text-warm-700 leading-relaxed">{intake.whatTheyWant || 'Not specified'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Hair Details */}
      <Card className="bg-blush-50/40 border-warm-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-warm-700">Hair Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <DetailRow label="Hair History" value={intake.hairHistory?.join(', ')} />
            <DetailRow label="Color Reaction" value={intake.colorReaction?.join(', ')} />
            <DetailRow label="Shampoo" value={intake.products?.shampoo} />
            <DetailRow label="Conditioner" value={intake.products?.conditioner} />
            <DetailRow label="Hair Spray" value={intake.products?.hairSpray} />
            <DetailRow label="Dry Shampoo" value={intake.products?.dryShampoo} />
            <DetailRow label="Heat Protector" value={intake.products?.heatProtector} />
            <DetailRow label="Other Products" value={intake.products?.other} />
            <DetailRow label="Styling" value={intake.stylingDescription} />
            <DetailRow label="Daily Routine" value={intake.dailyRoutine} />
            <DetailRow label="Shampoo Frequency" value={intake.shampooFrequency} />
          </dl>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="bg-white border-warm-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-warm-400">Additional Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <DetailRow label="Medical/Allergy" value={intake.medicalInfo} />
            <DetailRow label="Availability" value={intake.availability?.join(', ')} />
          </dl>
        </CardContent>
      </Card>

      {/* Sticky Decision Bar */}
      {isReviewable && <IntakeDecisionBar clientId={numId} clientName={client.q02_client_name} />}
    </div>
  );
}

function OverallBadge({ rating }: { rating: 'green' | 'yellow' | 'red' }) {
  const config = {
    green: { label: 'Ready to Book', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    yellow: { label: 'Review Needed', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    red: { label: 'Heads Up', className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const { label, className } = config[rating];
  return <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${className}`}>{label}</span>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between sm:block">
      <dt className="text-warm-400 text-xs">{label}</dt>
      <dd className="text-warm-700 font-medium">{value}</dd>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt className="text-warm-400 text-xs sm:w-36 flex-shrink-0">{label}</dt>
      <dd className="text-warm-700">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    intake_submitted: 'bg-amber-100 text-amber-700 border-amber-300',
    ai_review: 'bg-amber-50 text-amber-700 border-amber-200',
    active_client: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    followup: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
    declined: 'bg-red-50 text-red-700 border-red-200',
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
