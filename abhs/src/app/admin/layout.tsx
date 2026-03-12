export const metadata = {
  title: 'BuiltByBas — CRM Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-section">{children}</div>;
}
