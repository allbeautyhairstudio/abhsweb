import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about booking with Karli at All Beauty Hair Studio — pricing, process, and what to expect.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
