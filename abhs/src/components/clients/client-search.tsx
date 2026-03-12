'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function ClientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  function handleSearch(value: string) {
    setQuery(value);
    const params = new URLSearchParams();
    if (value.trim()) params.set('q', value.trim());
    router.push(`/admin/clients${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search clients by name, business, email, or service..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 w-full max-w-md"
      />
    </div>
  );
}
