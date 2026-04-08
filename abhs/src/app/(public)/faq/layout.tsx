import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about booking with Karli Rosario at All Beauty Hair Studio in Wildomar, CA. Pricing, process, cancellation policy, and what to expect.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
