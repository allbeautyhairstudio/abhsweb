import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminSidebar />
      <main className="ml-0 lg:ml-60 min-h-screen p-4 pt-16 md:p-6 md:pt-16 lg:p-8 lg:pt-8">
        {children}
      </main>
    </>
  );
}
