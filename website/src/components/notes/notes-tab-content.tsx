'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquarePlus, Filter, Trash2 } from 'lucide-react';

interface Note {
  id: number;
  client_id: number;
  created_at: string;
  note_type: string;
  content: string;
}

const NOTE_TYPES = [
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' },
  { value: 'session_note', label: 'Session Note', color: 'bg-blue-100 text-blue-700' },
  { value: 'follow_up_note', label: 'Follow-Up', color: 'bg-amber-100 text-amber-700' },
  { value: 'analysis_note', label: 'Analysis', color: 'bg-purple-100 text-purple-700' },
  { value: 'interest_flag', label: 'Interest Flag', color: 'bg-orange-100 text-orange-700' },
] as const;

function getNoteTypeConfig(noteType: string) {
  return NOTE_TYPES.find(t => t.value === noteType) ?? NOTE_TYPES[0];
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function NotesTabContent({ clientId }: { clientId: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [noteType, setNoteType] = useState<string>('general');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_type: noteType, content: content.trim() }),
      });
      if (res.ok) {
        setContent('');
        setNoteType('general');
        await fetchNotes();
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deletingNoteId === null) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/notes?noteId=${deletingNoteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeletingNoteId(null);
        await fetchNotes();
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredNotes = filter === 'all'
    ? notes
    : notes.filter(n => n.note_type === filter);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Loading notes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800 flex items-center gap-2 text-base">
            <MessageSquarePlus size={18} />
            Add Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                {NOTE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={submitting || !content.trim()} size="sm">
                {submitting ? 'Saving...' : 'Add Note'}
              </Button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a note..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md text-sm resize-y bg-background"
              maxLength={10000}
            />
          </form>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted-foreground" />
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-brand-200 text-brand-800'
              : 'bg-muted text-muted-foreground hover:bg-brand-100'
          }`}
        >
          All ({notes.length})
        </button>
        {NOTE_TYPES.map((type) => {
          const count = notes.filter(n => n.note_type === type.value).length;
          if (count === 0) return null;
          return (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === type.value
                  ? 'bg-brand-200 text-brand-800'
                  : 'bg-muted text-muted-foreground hover:bg-brand-100'
              }`}
            >
              {type.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground text-sm">
              {notes.length === 0
                ? 'No notes yet. Add your first note above.'
                : 'No notes match this filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotes.map((note) => {
            const typeConfig = getNoteTypeConfig(note.note_type);
            return (
              <Card key={note.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className={`${typeConfig.color} text-xs border-0`}>
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <button
                      onClick={() => { setDeletingNoteId(note.id); setDeleteDialogOpen(true); }}
                      className="text-muted-foreground hover:text-red-600 transition-colors p-1 shrink-0"
                      aria-label={`Delete note from ${formatDate(note.created_at)}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
