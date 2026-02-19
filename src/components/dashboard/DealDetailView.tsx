"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";
import type { Deal } from "@prisma/client";
import { OptimisticNoteForm } from "./OptimisticNoteForm";

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

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  if (!isOpen || !deal) return null;

  function handleNoteAdded(newNote: Note) {
    setLocalNotes([newNote, ...localNotes]);
  }

  const sortedNotes = [...localNotes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 sm:items-center sm:justify-center">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{deal.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {formatCurrency(deal.value)} • {deal.stage}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4">
          <div className="mb-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4" />
              Activity Timeline
            </h3>

            {/* Optimistic Note Form */}
            <OptimisticNoteForm
              dealId={deal.id}
              initialNotes={notes}
              onNoteAdded={handleNoteAdded}
            />

            {/* Timeline */}
            <div className="space-y-4">
              {sortedNotes.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No activity yet. Add a note to track progress on this deal.
                </p>
              ) : (
                sortedNotes.map((note, index) => (
                  <div key={note.id} className="relative flex gap-4">
                    {/* Timeline line */}
                    {index < sortedNotes.length - 1 && (
                      <div className="absolute left-2 top-6 h-full w-0.5 bg-gray-200" />
                    )}
                    {/* Dot */}
                    <div className="relative z-10 h-4 w-4 rounded-full bg-blue-500" />
                    {/* Content */}
                    <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm text-gray-900">{note.content}</p>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(note.createdAt)}</p>
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
