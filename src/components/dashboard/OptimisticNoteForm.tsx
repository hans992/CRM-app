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
        <form onSubmit={handleAddNote} className="mb-4 rounded-lg border border-gray-200 p-4">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add a note about this deal..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            rows={3}
            required
            disabled={isSubmitting}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingNote(true)}
          className="mb-4 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      )}
    </>
  );
}
