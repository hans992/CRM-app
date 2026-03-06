"use client";

import { useState, useEffect, useRef } from "react";
import { X, MessageSquare } from "lucide-react";
import type { Deal } from "@prisma/client";
import { OptimisticNoteForm } from "./OptimisticNoteForm";
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from "@/lib/modal-a11y";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface DealDetailViewProps {
  deal: Deal | null;
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(value: number) {
  if (!isFinite(value) || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function DealDetailView({ deal, notes, isOpen, onClose }: DealDetailViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const open = isOpen && !!deal;

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEscapeKey(open, onClose);
  useBodyScrollLock(open);
  useFocusTrap(open, dialogRef);

  if (!open || !deal) return null;

  function handleNoteAdded(newNote: Note) {
    setLocalNotes([newNote, ...localNotes]);
  }

  const sortedNotes = [...localNotes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-detail-title"
        className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-surface shadow-modal sm:h-auto sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-surface px-6 py-4">
          <div>
            <h2 id="deal-detail-title" className="text-xl font-semibold text-slate-900">
              {deal.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(deal.value)} • {deal.stage}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
            data-autofocus
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-6 py-4">
          <div className="mb-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
              <MessageSquare className="h-4 w-4" />
              Activity Timeline
            </h3>

            <OptimisticNoteForm
              dealId={deal.id}
              initialNotes={notes}
              onNoteAdded={handleNoteAdded}
            />

            <div className="space-y-4">
              {sortedNotes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No activity yet. Add a note to track progress on this deal.
                </p>
              ) : (
                sortedNotes.map((note, index) => (
                  <div key={note.id} className="relative flex gap-4">
                    {index < sortedNotes.length - 1 && (
                      <div className="absolute left-2 top-6 h-full w-0.5 bg-slate-200" />
                    )}
                    <div className="relative z-10 h-4 w-4 shrink-0 rounded-full bg-primary" />
                    <div className="flex-1 rounded-xl border border-slate-200 bg-surface-muted p-3">
                      <p className="text-sm text-slate-900">{note.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
