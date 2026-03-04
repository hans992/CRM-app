"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

export function DealsViewToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "board" ? "board" : "table";
  const base = pathname || "/";
  const paramsTable = new URLSearchParams(searchParams.toString());
  paramsTable.set("view", "table");
  const tableUrl = `${base}?${paramsTable.toString()}`;
  const paramsBoard = new URLSearchParams(searchParams.toString());
  paramsBoard.set("view", "board");
  const boardUrl = `${base}?${paramsBoard.toString()}`;

  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
      <Link
        href={tableUrl}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === "table" ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <List className="h-4 w-4" />
        Table
      </Link>
      <Link
        href={boardUrl}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === "board" ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        Board
      </Link>
    </div>
  );
}
