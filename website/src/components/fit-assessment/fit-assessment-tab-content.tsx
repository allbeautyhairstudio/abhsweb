'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Target,
  Zap,
  MessageSquare,
  Users,
  AlertTriangle,
  Star,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
} from 'lucide-react';
import { ScoreCard } from './score-card';
import { PROMPT_TEMPLATES } from '@/lib/constants/prompt-templates';
import { populatePrompt } from '@/lib/prompts/auto-populate';
import { DECLINE_EMAIL_TEMPLATE } from '@/lib/constants/scoring-rules';
import type { FitAssessment, Flag } from '@/lib/scoring';
import type { ClientRow } from '@/lib/queries/clients';

interface FitAssessmentTabContentProps {
  clientId: number;
  client: ClientRow;
}

function ratingBadge(rating: 'green' | 'yellow' | 'red') {
  const styles = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    yellow: 'bg-amber-100 text-amber-800 border-amber-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };
  const labels = { green: 'Good Fit', yellow: 'Fit With Notes', red: 'Not a Fit' };
  return (
    <Badge variant="outline" className={`${styles[rating]} text-sm px-3 py-1`}>
      {labels[rating]}
    </Badge>
  );
}

function flagBadge(flag: Flag) {
  const styles: Record<string, string> = {
    WATCH: 'bg-amber-50 text-amber-800 border-amber-200',
    HIGH_OPPORTUNITY: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    REDIRECT: 'bg-red-50 text-red-800 border-red-200',
  };
  const icons: Record<string, React.ReactNode> = {
    WATCH: <AlertTriangle size={12} />,
    HIGH_OPPORTUNITY: <Star size={12} />,
    REDIRECT: <ArrowRight size={12} />,
  };
  return (
    <div key={flag.label} className={`flex items-start gap-2 p-3 rounded-lg border ${styles[flag.type] ?? ''}`}>
      <span className="mt-0.5 shrink-0">{icons[flag.type]}</span>
      <div>
        <div className="text-sm font-medium">{flag.label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{flag.detail}</div>
      </div>
    </div>
  );
}

function archetypeLabel(archetype: string): string {
  switch (archetype) {
    case 'overwhelmed_poster': return 'Overwhelmed Poster';
    case 'avoider': return 'Avoider / Non-Poster';
    default: return 'Undetermined';
  }
}

export function FitAssessmentTabContent({ clientId, client }: FitAssessmentTabContentProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<FitAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Accept dialog state
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptRating, setAcceptRating] = useState<'green' | 'yellow'>('green');
  const [acceptArchetype, setAcceptArchetype] = useState<'overwhelmed_poster' | 'avoider'>('overwhelmed_poster');
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Decline dialog state
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineAlternative, setDeclineAlternative] = useState('');
  const [declineLoading, setDeclineLoading] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Quick Scan prompt state
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [clientId]);

  async function fetchAssessment() {
    try {
      const res = await fetch(`/api/clients/${clientId}/fit-assessment`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);

        // Pre-fill accept dialog with detected values
        if (data.overallRating === 'green' || data.overallRating === 'yellow') {
          setAcceptRating(data.overallRating as 'green' | 'yellow');
        }
        if (data.archetype?.archetype && data.archetype.archetype !== 'undetermined') {
          setAcceptArchetype(data.archetype.archetype);
        }
      } else {
        setError('Failed to load assessment');
      }
    } catch (err) {
      console.error('Failed to fetch assessment:', err);
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }

  // Build the Quick Scan prompt with auto-populated data
  function getPopulatedQuickScan(): string {
    const qsTemplate = PROMPT_TEMPLATES.find(t => t.code === 'QS');
    if (!qsTemplate) return '';
    const result = populatePrompt(qsTemplate, client as unknown as Record<string, unknown>);
    return result.populated_prompt;
  }

  async function handleCopyPrompt() {
    const text = getPopulatedQuickScan();
    await navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  }

  async function handleAccept() {
    setAcceptLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/fit-assessment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fit_rating: acceptRating,
          archetype: acceptArchetype,
          action: 'accept',
        }),
      });
      if (res.ok) {
        setAccepted(true);
        setAcceptOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to accept client:', err);
    } finally {
      setAcceptLoading(false);
    }
  }

  function buildDeclineEmail(): string {
    const name = client.q02_client_name || '[Client]';
    let email = DECLINE_EMAIL_TEMPLATE.replace('[CLIENT_NAME]', String(name));
    email = email.replace('[REASON]', declineReason || 'Based on where your business is right now, I think there are other steps that would serve you better first.');
    email = email.replace('[ALTERNATIVE]', declineAlternative || 'If you\'d like, I\'m happy to point you toward some resources that might help with where you are right now.');
    return email;
  }

  async function handleDecline() {
    setDeclineLoading(true);
    try {
      // Copy email to clipboard
      const email = buildDeclineEmail();
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);

      // Record the decline
      const res = await fetch(`/api/clients/${clientId}/fit-assessment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fit_rating: 'red',
          archetype: null,
          action: 'decline',
          decline_reason: declineReason || undefined,
        }),
      });
      if (res.ok) {
        setDeclined(true);
        setDeclineOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to decline client:', err);
    } finally {
      setDeclineLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Computing fit assessment...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !assessment) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-red-600">{error || 'Unable to compute assessment'}</p>
        </CardContent>
      </Card>
    );
  }

  // Post-action states
  if (accepted) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
          <h3 className="text-lg font-semibold text-emerald-700 mb-1">Client Accepted</h3>
          <p className="text-sm text-muted-foreground">
            {client.q02_client_name} has been moved to the AI Summary stage.
            Next step: send payment link.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (declined) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <XCircle size={48} className="mx-auto text-red-400 mb-3" />
          <h3 className="text-lg font-semibold text-red-600 mb-1">Client Declined</h3>
          <p className="text-sm text-muted-foreground">
            The compassionate decline email has been copied to your clipboard.
            Paste it into your email app to send.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: Overall Rating + Actions */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Overall Assessment:</span>
              {ratingBadge(assessment.overallRating)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setAcceptOpen(true)}
              >
                <CheckCircle2 size={14} className="mr-1" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeclineOpen(true)}
              >
                <XCircle size={14} className="mr-1" />
                Decline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard
          title="Service Fit"
          score={assessment.serviceFit.score}
          label={assessment.serviceFit.label}
          breakdown={assessment.serviceFit.breakdown}
          icon={<Target size={16} />}
        />
        <ScoreCard
          title="Readiness"
          score={assessment.readiness.score}
          label={assessment.readiness.label}
          breakdown={assessment.readiness.breakdown}
          icon={<Zap size={16} />}
        />
        <ScoreCard
          title="Engagement"
          score={assessment.engagement.score}
          label={assessment.engagement.label}
          breakdown={assessment.engagement.breakdown}
          icon={<MessageSquare size={16} />}
        />
      </div>

      {/* Archetype + Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Archetype */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
              <Users size={16} />
              Client Archetype
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="text-lg font-semibold">
                {archetypeLabel(assessment.archetype.archetype)}
              </span>
              {assessment.archetype.stageLabel && (
                <span className="text-sm text-muted-foreground ml-2">
                  &mdash; {assessment.archetype.stageLabel} Stage
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{assessment.archetype.reasoning}</p>
            <Badge
              variant="outline"
              className="mt-2 text-xs"
            >
              Confidence: {assessment.archetype.confidence}
            </Badge>
          </CardContent>
        </Card>

        {/* Flags */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
              <AlertTriangle size={16} />
              Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assessment.flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No flags detected.</p>
            ) : (
              <div className="space-y-2">
                {assessment.flags.map((flag) => flagBadge(flag))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Highlights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-brand-800 text-base">Key Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          {assessment.highlights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No highlights available. Check if intake data has been entered.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {assessment.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-brand-500 mt-0.5 shrink-0">&bull;</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quick Scan Prompt */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
              <ClipboardCopy size={16} />
              Quick Scan Prompt
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPrompt}
              className={promptCopied ? 'text-emerald-600 border-emerald-300' : ''}
            >
              {promptCopied ? <Check size={14} /> : <Copy size={14} />}
              <span className="ml-1">{promptCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            Copy this prompt and paste it into Claude or your preferred AI tool for a deeper fit analysis.
          </p>
          <button
            onClick={() => setPromptExpanded(!promptExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-700 transition-colors"
            aria-expanded={promptExpanded}
          >
            {promptExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {promptExpanded ? 'Hide prompt preview' : 'Show prompt preview'}
          </button>
          {promptExpanded && (
            <pre className="mt-3 p-4 bg-muted rounded-lg text-xs whitespace-pre-wrap overflow-auto max-h-96 border">
              {getPopulatedQuickScan()}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Accept Dialog */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emerald-700">Accept Client</DialogTitle>
            <DialogDescription>
              Confirm the fit assessment for <strong>{client.q02_client_name}</strong>.
              This will advance them to the Fit Assessment stage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Fit Rating</label>
              <select
                value={acceptRating}
                onChange={(e) => setAcceptRating(e.target.value as 'green' | 'yellow')}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="green">Green — Good Fit</option>
                <option value="yellow">Yellow — Fit With Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Archetype</label>
              <select
                value={acceptArchetype}
                onChange={(e) => setAcceptArchetype(e.target.value as 'overwhelmed_poster' | 'avoider')}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="overwhelmed_poster">Overwhelmed Poster</option>
                <option value="avoider">Avoider / Non-Poster</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)} disabled={acceptLoading}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAccept}
              disabled={acceptLoading}
            >
              {acceptLoading ? 'Accepting...' : 'Accept Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">Decline Client</DialogTitle>
            <DialogDescription>
              Customize the compassionate decline email for <strong>{client.q02_client_name}</strong>.
              The email will be copied to your clipboard when you confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Reason (for the email)</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., It sounds like you might benefit more from business coaching before tackling marketing..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm resize-y bg-background"
                maxLength={2000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alternative suggestion (optional)</label>
              <textarea
                value={declineAlternative}
                onChange={(e) => setDeclineAlternative(e.target.value)}
                placeholder="e.g., I'd recommend checking out [resource] for where you are right now..."
                rows={2}
                className="w-full px-3 py-2 border rounded-md text-sm resize-y bg-background"
                maxLength={2000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Preview</label>
              <pre className="p-3 bg-muted rounded-lg text-xs whitespace-pre-wrap border max-h-48 overflow-auto">
                {buildDeclineEmail()}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineOpen(false)} disabled={declineLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={declineLoading}
            >
              {declineLoading ? 'Processing...' : emailCopied ? 'Copied & Recorded' : 'Copy Email & Record Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
