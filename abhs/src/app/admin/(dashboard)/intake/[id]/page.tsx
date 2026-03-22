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
import { IntakeChatPanel } from '@/components/salon/intake-chat-panel';
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
    <div className={`${isReviewable ? 'pb-24' : ''}`}>
      {/* Back link */}
      <Link
        href="/admin/intake"
        className="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-warm-600 transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Back to Intake Queue
      </Link>

      {/* ═══ TOP: What Karli Needs to Know ═══ */}
      <Card className="bg-blush-50/40 border-warm-100 mb-6">
        <CardContent className="py-5">
          {/* Client header row */}
          <div className="flex items-start justify-between mb-3">
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
            <div className="flex items-center gap-2">
              <OverallBadge rating={summary.overallRating} />
              {isAccepted && (
                <Link href={`/admin/clients/${numId}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-warm-50 border-warm-200">
                    View Client Profile <ChevronRight className="w-3 h-3 ml-1" />
                  </Badge>
                </Link>
              )}
            </div>
          </div>

          {/* Accepted/Declined status */}
          {isAccepted && (
            <div className="mb-3 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium">
              This client has been accepted and is now active.
            </div>
          )}
          {isDeclined && (
            <div className="mb-3 py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              This client was declined.
            </div>
          )}

          {/* Flags */}
          {summary.flags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
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

          {/* AI Highlights */}
          {summary.highlights.length > 0 && (
            <ul className="space-y-1">
              {summary.highlights.map((highlight, i) => (
                <li key={i} className="text-sm text-warm-600 flex items-start gap-2">
                  <span className="text-copper-400 mt-0.5">&#x2022;</span>
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ═══ MAIN: Two-column layout (intake left, chat right when built) ═══ */}
      <div className="flex gap-6">
        {/* Left column: Consultation Form Q&A */}
        <div className="flex-1 min-w-0">
          <Card className="bg-blush-50/40 border-warm-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-warm-700">Consultation Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-warm-100">

              {/* Step 1: About You */}
              <div className="pb-5">
                <p className="text-xs font-medium text-copper-500 uppercase tracking-wide mb-3">About You</p>
                <div className="space-y-4">
                  <QA question="Name" answer={intake.name} />
                  <QA question="Pronouns" answer={intake.pronouns} />
                  <QA question="Email" answer={intake.email} />
                  <QA question="Phone" answer={intake.phone} />
                  <QA question="Which contact method is best to reach you?" answer={intake.preferredContact} />
                </div>
              </div>

              {/* Step 2: Your Hair */}
              <div className="py-5">
                <p className="text-xs font-medium text-copper-500 uppercase tracking-wide mb-3">Your Hair</p>
                <div className="space-y-4">
                  <QA question="Please tell me what you love and hate about your hair currently?" answer={intake.hairLoveHate} />
                  <QA question="What service/s are you interested in?" answer={intake.serviceInterest?.join(', ')} />
                  <QA question="How would you describe your hair texture?" answer={intake.hairTexture} />
                  <QA question="Please select one of the following that best describes your hair length" answer={intake.hairLength} />
                  <QA question="Please select one of the following that best describes your hair" answer={intake.hairDensity} />
                  <QA question="What is the current condition of your hair? (Select all that apply)" answer={intake.hairCondition?.join(', ')} />
                </div>
              </div>

              {/* Step 3: Hair Personality & Routine */}
              <div className="py-5">
                <p className="text-xs font-medium text-copper-500 uppercase tracking-wide mb-3">Hair Personality &amp; Routine</p>
                <div className="space-y-4">
                  <QA question="When it comes to your hair, which best describes you?" answer={intake.stylingDescription} />
                  <QA question="What does your day-to-day hair routine usually look like?" answer={intake.dailyRoutine} />
                  <QA question="How often do you shampoo and condition your hair?" answer={intake.shampooFrequency} />
                </div>
              </div>

              {/* Step 4: Hair History */}
              <div className="py-5">
                <p className="text-xs font-medium text-copper-500 uppercase tracking-wide mb-3">Hair History</p>
                <div className="space-y-4">
                  <QA question="Let's talk hair history. Click all that apply within the last 2 years" answer={intake.hairHistory?.join(', ')} />
                  <QA question="Have you ever had a reaction to hair color before?" answer={intake.colorReaction?.join(', ')} />
                  <div>
                    <p className="text-sm text-warm-500 mb-2">What hair products do you currently use? Please specify brand.</p>
                    <div className="space-y-1.5 pl-1">
                      <ProductRow label="Shampoo" value={intake.products?.shampoo} />
                      <ProductRow label="Conditioner" value={intake.products?.conditioner} />
                      <ProductRow label="Hair Spray" value={intake.products?.hairSpray} />
                      <ProductRow label="Dry Shampoo" value={intake.products?.dryShampoo} />
                      <ProductRow label="Heat Protector" value={intake.products?.heatProtector} />
                      <ProductRow label="Other" value={intake.products?.other} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Goals & Schedule */}
              <div className="py-5">
                <p className="text-xs font-medium text-copper-500 uppercase tracking-wide mb-3">Goals &amp; Schedule</p>
                <div className="space-y-4">
                  <QA question="What are you hoping to get out of your cut and/or color?" answer={intake.whatTheyWant} />
                  <QA question="How often do you want to visit the salon for maintenance?" answer={intake.maintenanceFrequency} />
                  <QA question="Please specify your availability" answer={intake.availability?.join(', ')} />
                </div>
              </div>

              {/* Step 6: Photos */}
              {hasPhotos && (
                <div className="py-5">
                  <p className="text-xs font-medium text-copper-500 uppercase tracking-wide mb-3">Photos</p>
                  <IntakePhotoGallery photos={photoFiles} />
                </div>
              )}

              {/* Step 7: Almost Done */}
              <div className="pt-5">
                <p className="text-xs font-medium text-copper-500 uppercase tracking-wide mb-3">Things I Might Need to Know</p>
                <div className="space-y-4">
                  <QA
                    question="Please tell me any additional information you feel might be important for me to know before your appointment."
                    answer={intake.medicalInfo}
                  />
                  <QA question="How did you find me?" answer={intake.referralSource} />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Sticky Decision Bar */}
      {isReviewable && <IntakeDecisionBar clientId={numId} clientName={client.q02_client_name} />}

      {/* AI Chat Panel */}
      <IntakeChatPanel clientId={numId} clientName={client.q02_client_name} />
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

function QA({ question, answer }: { question: string; answer: string | null | undefined }) {
  return (
    <div>
      <p className="text-sm text-warm-500">{question}</p>
      <p className="text-sm text-warm-800 font-medium mt-0.5">{answer || '--'}</p>
    </div>
  );
}

function ProductRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-warm-500 w-28 flex-shrink-0">{label}:</span>
      <span className="text-warm-800 font-medium">{value}</span>
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
