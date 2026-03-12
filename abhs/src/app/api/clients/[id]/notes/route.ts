import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/queries/clients';
import { getNotesByClientId, createNote, getNoteById, deleteNote } from '@/lib/queries/notes';
import { createNoteSchema } from '@/lib/validation';
import { escapeHtml } from '@/lib/sanitize';
import { isAuthenticated } from '@/lib/admin-auth';

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/** GET: Return all notes for a client (excluding internal checklist notes). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = getClientById(numId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const allNotes = getNotesByClientId(numId);

    // Filter out internal checklist notes — those are managed by the checklist API
    let notes = allNotes.filter(n => n.note_type !== 'checklist');

    // Optional type filter
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    if (typeFilter) {
      notes = notes.filter(n => n.note_type === typeFilter);
    }

    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/clients/[id]/notes error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

/** POST: Create a new note for a client. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = getClientById(numId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const raw = await request.json();
    const parsed = createNoteSchema.safeParse({ ...raw, client_id: numId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const sanitizedContent = escapeHtml(parsed.data.content);
    const noteId = createNote(numId, parsed.data.note_type, sanitizedContent);

    return NextResponse.json({ success: true, id: noteId });
  } catch (error) {
    console.error('POST /api/clients/[id]/notes error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

/** DELETE: Delete a specific note (with ownership verification). */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = Number(searchParams.get('noteId'));
    if (isNaN(noteId) || noteId < 1) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    // Verify the note exists and belongs to this client
    const note = getNoteById(noteId);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    if (note.client_id !== numId) {
      return NextResponse.json({ error: 'Note does not belong to this client' }, { status: 403 });
    }

    // Prevent deleting internal checklist notes
    if (note.note_type === 'checklist') {
      return NextResponse.json({ error: 'Cannot delete checklist entries via notes API' }, { status: 400 });
    }

    deleteNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/clients/[id]/notes error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
