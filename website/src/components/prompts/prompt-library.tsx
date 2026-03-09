'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/prompts/copy-button';
import { ChevronDown, ChevronRight, Search, Link2 } from 'lucide-react';
import type { PromptTemplate } from '@/lib/constants/prompt-templates';

interface PromptLibraryProps {
  templates: PromptTemplate[];
  categories: ReadonlyArray<{ id: string; label: string; tier: number; description: string }>;
}

const TIER_COLORS: Record<number, string> = {
  1: 'bg-brand-200 text-brand-800',
  2: 'bg-sage-100 text-sage-500',
  3: 'bg-brand-100 text-brand-700',
  4: 'bg-amber-100 text-amber-700',
};

export function PromptLibrary({ templates, categories }: PromptLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = templates;

    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q)
      );
    }

    return result;
  }, [templates, activeCategory, search]);

  function toggleExpand(code: string) {
    setExpandedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    for (const cat of categories) {
      counts[cat.id] = templates.filter(t => t.category === cat.id).length;
    }
    return counts;
  }, [templates, categories]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, description, or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-brand-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-brand-100'
          }`}
        >
          All ({categoryCounts.all})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-brand-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-brand-100'
            }`}
          >
            {cat.label} ({categoryCounts[cat.id] || 0})
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {templates.length} templates
      </p>

      {/* Template Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No templates match your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((template) => {
            const isExpanded = expandedCodes.has(template.code);
            return (
              <Card key={template.code}>
                <CardHeader className="cursor-pointer py-4" onClick={() => toggleExpand(template.code)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded
                        ? <ChevronDown size={16} className="text-muted-foreground" />
                        : <ChevronRight size={16} className="text-muted-foreground" />
                      }
                      <div>
                        <CardTitle className="text-base text-brand-800">
                          {template.code} — {template.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Badge className={TIER_COLORS[template.tier] || ''}>
                        Tier {template.tier}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.time_estimate}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    {/* When to Use */}
                    <div>
                      <h4 className="text-sm font-medium text-brand-700 mb-1">When to Use</h4>
                      <p className="text-sm text-muted-foreground">{template.when_to_use}</p>
                    </div>

                    {/* Chain Dependency */}
                    {template.chain_dependency && (
                      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                        <Link2 size={14} />
                        <span>Requires: <strong>{template.chain_dependency}</strong> output first</span>
                      </div>
                    )}

                    {/* Placeholders Notice */}
                    {template.has_dynamic_placeholders && (
                      <div className="text-sm text-brand-600 bg-brand-50 px-3 py-2 rounded-lg">
                        Contains dynamic placeholders — auto-populated with client data when used from the Prompts tab.
                      </div>
                    )}

                    {/* Template Text */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-brand-700">Template</h4>
                        <CopyButton text={template.template} label="Copy Template" />
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                        {template.template}
                      </pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
