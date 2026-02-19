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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Deal</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Deal Name */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Deal Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="e.g., Enterprise Software License"
              />
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="5000"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="stage"
                className="block text-sm font-medium text-gray-700"
              >
                Status *
              </label>
              <select
                id="stage"
                name="stage"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">Select a stage</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* Close Date */}
            <div>
              <label
                htmlFor="closeDate"
                className="block text-sm font-medium text-gray-700"
              >
                Close Date
              </label>
              <input
                type="date"
                id="closeDate"
                name="closeDate"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
