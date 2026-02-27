"use client";

import { useOptimistic, useState } from "react";
import { Plus } from "lucide-react";
import { createNote } from "@/app/actions/note";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface OptimisticNoteFormProps {
  dealId: string;
  initialNotes: Note[];
  onNoteAdded: (note: Note) => void;
}

export function OptimisticNoteForm({
  dealId,
  initialNotes,
  onNoteAdded,
}: OptimisticNoteFormProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [optimisticNotes, addOptimisticNote] = useOptimistic(
    initialNotes,
    (state, newNote: Note) => [newNote, ...state]
  );

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const tempNote: Note = {
      id: `temp-${Date.now()}`,
      content: noteContent.trim(),
      createdAt: new Date(),
    };

    // Optimistically add the note
    addOptimisticNote(tempNote);
    setIsAddingNote(false);
    const contentToSave = noteContent.trim();
    setNoteContent("");
    setIsSubmitting(true);

    try {
      const result = await createNote(dealId, contentToSave);
      setIsSubmitting(false);

      if (result.success && result.note) {
        onNoteAdded(result.note);
      } else {
        // Revert on error - reload to get correct state
        window.location.reload();
      }
    } catch (error) {
      setIsSubmitting(false);
      window.location.reload();
    }
  }

  return (
    <>
      {isAddingNote ? (
        <form onSubmit={handleAddNote} className="mb-4 rounded-xl border border-slate-200 bg-surface-muted p-4">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add a note about this deal..."
            className="w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={3}
            required
            disabled={isSubmitting}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Note"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingNote(false);
                setNoteContent("");
              }}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-surface px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingNote(true)}
          className="mb-4 flex items-center gap-2 rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      )}
    </>
  );
}
