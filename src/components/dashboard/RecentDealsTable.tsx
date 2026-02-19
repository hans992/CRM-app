"use client";

import { useState } from "react";
import type { Deal } from "@prisma/client";
import { FileQuestion, Download, Trash2, Edit } from "lucide-react";
import { bulkDeleteDeals, bulkUpdateDealStatus } from "@/app/actions/deal-bulk";
import { DealDetailView } from "./DealDetailView";

interface RecentDealsTableProps {
  deals: Deal[];
  notes: Array<{ dealId: string; id: string; content: string; createdAt: Date }>;
}

const STAGE_COLORS: Record<string, string> = {
  "Closed Won": "bg-green-100 text-green-800",
  "Negotiating": "bg-blue-100 text-blue-800",
  "Prospecting": "bg-amber-100 text-amber-800",
  "Qualified": "bg-cyan-100 text-cyan-800",
  "Lost": "bg-red-100 text-red-800",
};

const STAGES = [
  "Prospecting",
  "Qualified",
  "Negotiating",
  "Closed Won",
  "Lost",
];

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
  }).format(new Date(date));
}

function StatusBadge({ stage }: { stage: string }) {
  const colorClass = STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {stage}
    </span>
  );
}

function downloadCSV(deals: Deal[]) {
  const headers = ["Deal Name", "Amount", "Status", "Date"];
  const rows = deals.map((deal) => [
    deal.title,
    formatCurrency(deal.value),
    deal.stage,
    formatDate(deal.createdAt),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `deals-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function RecentDealsTable({ deals, notes }: RecentDealsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  function toggleSelect(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  function toggleSelectAll() {
    if (selectedIds.size === recentDeals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(recentDeals.map((d) => d.id)));
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} deal(s)?`)) return;

    setIsBulkActionLoading(true);
    const result = await bulkDeleteDeals(Array.from(selectedIds));
    setIsBulkActionLoading(false);

    if (result.success) {
      setSelectedIds(new Set());
      window.location.reload();
    } else {
      alert(result.error || "Failed to delete deals");
    }
  }

  async function handleBulkStatusUpdate(newStatus: string) {
    setIsBulkActionLoading(true);
    const result = await bulkUpdateDealStatus(Array.from(selectedIds), newStatus);
    setIsBulkActionLoading(false);

    if (result.success) {
      setSelectedIds(new Set());
      window.location.reload();
    } else {
      alert(result.error || "Failed to update deals");
    }
  }

  const dealNotes = selectedDeal
    ? notes.filter((n) => n.dealId === selectedDeal.id)
    : [];

  if (recentDeals.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <FileQuestion className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No deals found</h3>
        <p className="mt-2 text-sm text-gray-500">
          {deals.length === 0
            ? 'Add your first deal to see it here. Click "Add Deal" to get started.'
            : "No deals match the current filters. Try adjusting your filters."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deals</h2>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleBulkStatusUpdate(e.target.value);
                  }}
                  disabled={isBulkActionLoading}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">Change status...</option>
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                  className="flex items-center gap-1 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
            <button
              onClick={() => downloadCSV(recentDeals)}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-12 px-4 py-3 sm:px-6">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === recentDeals.length && recentDeals.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                >
                  Deal Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentDeals.map((deal) => (
                <tr
                  key={deal.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <td
                    className="px-4 py-4 sm:px-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(deal.id)}
                      onChange={() => toggleSelect(deal.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 sm:px-6">
                    {deal.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 sm:px-6">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <StatusBadge stage={deal.stage} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:px-6">
                    {formatDate(deal.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DealDetailView
        deal={selectedDeal}
        notes={dealNotes}
        isOpen={selectedDeal !== null}
        onClose={() => setSelectedDeal(null)}
      />
    </>
  );
}
