import { Mail, Phone, MessageSquare, Star } from 'lucide-react';

interface ClientContactActionsProps {
  email?: string | null;
  phone?: string | null;
  preferredContact?: string | null;
  /** 'full' = icon + label text, 'compact' = icons only */
  variant?: 'full' | 'compact';
}

/** Strip formatting from phone: (555) 123-4567 → 5551234567 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function PreferredStar({ isPreferred }: { isPreferred: boolean }) {
  if (!isPreferred) return null;
  return (
    <Star
      size={10}
      className="absolute -top-1 -right-1 text-amber-500 fill-amber-500"
      aria-label="Preferred contact method"
    />
  );
}

/**
 * Clickable contact action links (email, call, text).
 * Server component — pure anchor tags + icons, no client state.
 */
export function ClientContactActions({
  email,
  phone,
  preferredContact,
  variant = 'full',
}: ClientContactActionsProps) {
  const hasEmail = !!email;
  const hasPhone = !!phone;

  if (!hasEmail && !hasPhone) return null;

  const digits = hasPhone ? cleanPhone(phone) : '';

  // Support comma-separated preferred_contact (e.g. "text,email") + legacy "either"/"call"
  const prefs = preferredContact?.split(',').map((s) => s.trim()) ?? [];
  const emailPreferred = prefs.includes('email') || preferredContact === 'either';
  const textPreferred = prefs.includes('text') || preferredContact === 'either';
  const callPreferred = prefs.includes('call') || preferredContact === 'either';

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {hasEmail && (
          <a
            href={`mailto:${email}`}
            className="relative inline-flex items-center justify-center p-1 rounded hover:bg-muted transition-colors"
            aria-label={`Email ${email}`}
            title={`Email: ${email}`}
          >
            <Mail size={14} className="text-muted-foreground" />
            <PreferredStar isPreferred={emailPreferred} />
          </a>
        )}
        {hasPhone && (
          <a
            href={`tel:${digits}`}
            className="relative inline-flex items-center justify-center p-1 rounded hover:bg-muted transition-colors"
            aria-label={`Call ${phone}`}
            title={`Call: ${phone}`}
          >
            <Phone size={14} className="text-muted-foreground" />
            <PreferredStar isPreferred={callPreferred} />
          </a>
        )}
        {hasPhone && (
          <a
            href={`sms:${digits}`}
            className="relative inline-flex items-center justify-center p-1 rounded hover:bg-muted transition-colors"
            aria-label={`Text ${phone}`}
            title={`Text: ${phone}`}
          >
            <MessageSquare size={14} className="text-muted-foreground" />
            <PreferredStar isPreferred={textPreferred} />
          </a>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasEmail && (
        <a
          href={`mailto:${email}`}
          className="relative inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-700 transition-colors"
          aria-label={`Email ${email}`}
        >
          <Mail size={14} />
          <span>{email}</span>
          <PreferredStar isPreferred={emailPreferred} />
        </a>
      )}
      {hasPhone && (
        <a
          href={`tel:${digits}`}
          className="relative inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-700 transition-colors"
          aria-label={`Call ${phone}`}
        >
          <Phone size={14} />
          <span>{phone}</span>
          <PreferredStar isPreferred={callPreferred} />
        </a>
      )}
      {hasPhone && (
        <a
          href={`sms:${digits}`}
          className="relative inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-700 transition-colors"
          aria-label={`Text ${phone}`}
        >
          <MessageSquare size={14} />
          <span>Text</span>
          <PreferredStar isPreferred={textPreferred} />
        </a>
      )}
    </div>
  );
}
