"use client";

import { Trophy, Medal } from "lucide-react";

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalClosedWonValue: number;
}

interface TeamLeaderboardProps {
  entries: LeaderboardEntry[];
}

const MEDAL_COLORS = [
  "text-amber-500", // Gold
  "text-gray-400",  // Silver
  "text-amber-700", // Bronze
];

/** Show top N so the list fits in the dashboard card without scrolling */
const MAX_VISIBLE_ENTRIES = 8;

function formatCurrency(value: number) {
  if (!isFinite(value) || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function TeamLeaderboard({ entries }: TeamLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Trophy className="h-5 w-5 text-amber-500" />
          Team Leaderboard
        </h2>
        <p className="text-sm text-muted-foreground">No closed-won deals yet. Rankings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-fit flex-col overflow-visible rounded-2xl border border-slate-200 bg-surface shadow-card">
      <div className="border-b border-slate-200 bg-surface-muted px-4 py-2 sm:px-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Trophy className="h-4 w-4 text-amber-500" />
          Team Leaderboard
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Ranked by total closed-won value</p>
      </div>
      <ul className="divide-y divide-slate-200 overflow-visible">
        {entries.slice(0, MAX_VISIBLE_ENTRIES).map((entry, index) => (
          <li
            key={entry.userId}
            className="flex items-center justify-between px-4 py-2 transition-colors hover:bg-slate-50/50 sm:px-6"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {index < 3 ? (
                  <Medal className={`h-5 w-5 ${MEDAL_COLORS[index]}`} aria-label={`Rank ${index + 1}`} />
                ) : (
                  <span className="text-xs font-medium text-slate-400">{index + 1}</span>
                )}
              </span>
              <span className="truncate text-sm font-medium text-slate-900">{entry.userName}</span>
            </div>
            <span className="shrink-0 font-semibold text-slate-900 text-sm">
              {formatCurrency(entry.totalClosedWonValue)}
            </span>
          </li>
        ))}
      </ul>
      {entries.length > MAX_VISIBLE_ENTRIES && (
        <p className="px-4 py-1.5 text-center text-xs text-muted-foreground">
          Top {MAX_VISIBLE_ENTRIES} shown
        </p>
      )}
    </div>
  );
}
