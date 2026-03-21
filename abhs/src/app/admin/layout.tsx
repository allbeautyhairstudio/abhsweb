export const metadata = {
  title: 'BuiltByBas — CRM Dashboard',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-section">{children}</div>;
}
