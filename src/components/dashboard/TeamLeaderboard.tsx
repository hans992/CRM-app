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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-card">
      <div className="border-b border-slate-200 bg-surface-muted px-4 py-3 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Trophy className="h-5 w-5 text-amber-500" />
          Team Leaderboard
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Ranked by total closed-won value</p>
      </div>
      <ul className="divide-y divide-slate-200">
        {entries.map((entry, index) => (
          <li
            key={entry.userId}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50/50 sm:px-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                {index < 3 ? (
                  <Medal className={`h-6 w-6 ${MEDAL_COLORS[index]}`} aria-label={`Rank ${index + 1}`} />
                ) : (
                  <span className="text-sm font-medium text-slate-400">{index + 1}</span>
                )}
              </span>
              <span className="font-medium text-slate-900">{entry.userName}</span>
            </div>
            <span className="font-semibold text-slate-900">
              {formatCurrency(entry.totalClosedWonValue)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
