"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createDeal } from "@/app/actions/deal";

interface DealFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGES = [
  "Prospecting",
  "Qualified",
  "Negotiating",
  "Closed Won",
  "Lost",
];

export function DealForm({ isOpen, onClose }: DealFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const result = await createDeal(formData);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
      // Reset form by reloading
      window.location.reload();
    } else {
      alert(result.error || "Failed to create deal");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4">
      <div className="relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-surface shadow-modal sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">Add New Deal</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700"
              >
                Deal Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g., Enterprise Software License"
              />
            </div>

            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-slate-700"
              >
                Amount ($) *
              </label>
              <input
                type="number"
                id="value"
                name="value"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="5000"
              />
            </div>

            <div>
              <label
                htmlFor="stage"
                className="block text-sm font-medium text-slate-700"
              >
                Status *
              </label>
              <select
                id="stage"
                name="stage"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select a stage</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="closeDate"
                className="block text-sm font-medium text-slate-700"
              >
                Close Date
              </label>
              <input
                type="date"
                id="closeDate"
                name="closeDate"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 bg-surface px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
