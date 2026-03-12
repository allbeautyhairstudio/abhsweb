import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Client Form',
  description: 'Tell Karli about your hair, your lifestyle, and what you\'re looking for. This helps her design something that truly works for you.',
};

export default function NewClientFormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
