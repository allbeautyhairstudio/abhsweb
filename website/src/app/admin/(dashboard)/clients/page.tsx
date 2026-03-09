import Link from 'next/link';
import { getAllClients, searchClients } from '@/lib/queries/clients';
import { ClientSearch } from '@/components/clients/client-search';
import { ClientsTable } from '@/components/clients/clients-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; biz?: string }>;
}) {
  const { q, biz } = await searchParams;
  const businessType = biz === 'reset' ? 'reset' : 'salon';
  const clients = q ? searchClients(q, businessType) : getAllClients(businessType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''}
            {q ? ` matching "${q}"` : ''}
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-brand-600 transition-colors self-start sm:self-auto"
        >
          <UserPlus size={18} />
          New Client
        </Link>
      </div>

      {/* Search */}
      <ClientSearch />

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800">All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {q ? 'No clients match your search.' : 'No clients yet. Add your first client to get started.'}
              </p>
              {!q && (
                <Link
                  href="/admin/clients/new"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-brand-600 transition-colors"
                >
                  <UserPlus size={18} />
                  Add First Client
                </Link>
              )}
            </div>
          ) : (
            <ClientsTable clients={clients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
