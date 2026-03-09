import Link from 'next/link';
import { getAllClients, searchClients } from '@/lib/queries/clients';
import { StatusBadge } from '@/components/clients/status-badge';
import { ClientSearch } from '@/components/clients/client-search';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = q ? searchClients(q) : getAllClients();

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
          href="/clients/new"
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
                  href="/clients/new"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-brand-600 transition-colors"
                >
                  <UserPlus size={18} />
                  Add First Client
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-3 md:hidden">
                {clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="block p-3 rounded-lg bg-muted hover:bg-brand-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-brand-700">{client.q02_client_name}</span>
                      <StatusBadge status={client.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {client.q01_business_name ?? '—'}
                      {client.q05_service_type ? ` · ${client.q05_service_type}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {client.inquiry_date ?? client.created_at?.slice(0, 10) ?? '—'}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inquiry Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-medium text-brand-700 hover:text-brand-500 hover:underline"
                          >
                            {client.q02_client_name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.q01_business_name ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.q05_service_type ?? '—'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={client.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.inquiry_date ?? client.created_at?.slice(0, 10) ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
