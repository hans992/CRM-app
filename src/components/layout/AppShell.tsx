"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CheckSquare, BarChart3, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import type { User } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Deals", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

interface AppShellProps {
  user: User;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
          collapsed ? "w-[4rem]" : "w-56"
        }`}
      >
        <div className="flex h-14 items-center border-b border-slate-200 px-3">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-semibold text-slate-900">CRM</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary mx-auto">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </Link>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="flex h-14 items-center justify-end gap-2 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm">
          <span className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {user.name}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
