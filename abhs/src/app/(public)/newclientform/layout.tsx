import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Client Form',
  description: 'Start your consultation with Karli Rosario at All Beauty Hair Studio in Wildomar, CA. Tell her about your hair so she can design something that works for your life.',
};

export default function NewClientFormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
