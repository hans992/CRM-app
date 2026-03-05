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
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar: hidden on mobile, visible from md up */}
      <aside
        className={`hidden flex-col border-r border-slate-200 bg-white transition-all duration-200 md:flex ${
          collapsed ? "w-[4rem]" : "w-56"
        }`}
      >
        <div className="flex h-14 items-center border-b border-slate-200 px-3">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-semibold text-slate-900">CRM</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </Link>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 p-2" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" aria-hidden /> : <ChevronLeft className="h-5 w-5" aria-hidden />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content + top bar */}
      <main className="flex-1 overflow-auto flex flex-col min-h-screen md:min-h-0">
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-2 backdrop-blur-sm sm:px-4">
          <span className="text-sm font-semibold text-slate-900 md:hidden">CRM</span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface-muted px-2 py-1 text-xs font-medium text-slate-500 sm:px-3 dark:text-slate-400">
              {user.name}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
        <div className="flex-1 p-2 pb-20 sm:p-4 sm:pb-20 md:pb-4 lg:p-6 xl:p-8">{children}</div>
      </main>

      {/* Bottom navigation: visible on mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                isActive ? "text-primary" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
