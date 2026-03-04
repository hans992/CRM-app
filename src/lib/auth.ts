/**
 * Authentication utilities
 * Uses NextAuth.js session; RBAC preserved
 */

import { auth } from "@/auth";

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SALES_REP = "SALES_REP",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Get current user from NextAuth session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const u = session.user as { id?: string; email: string; name?: string; role?: string };
  return {
    id: u.id ?? "",
    email: u.email,
    name: u.name ?? u.email,
    role: (u.role as UserRole) ?? UserRole.SALES_REP,
  };
}

export function canAccessAllDeals(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MANAGER;
}
