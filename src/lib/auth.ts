/**
 * Authentication utilities
 * In a real app, this would integrate with NextAuth.js or similar
 * For now, we'll use a simple session simulation
 */

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
 * Get current user from session
 * In production, this would read from cookies/JWT
 */
export async function getCurrentUser(): Promise<User | null> {
  // Simulate session - in production, use NextAuth or similar
  // For demo purposes, fetch the default user from database
  // In real app: const session = await getServerSession();
  
  const { prisma } = await import("@/lib/prisma");
  
  // For demo: fetch the first user (created by seed script)
  // In production: const userId = session?.user?.id;
  const user = await prisma.user.findFirst({
    where: { email: "demo@example.com" },
  });
  
  if (!user) {
    // If no user exists, create a default one
    const newUser = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
        role: UserRole.SALES_REP,
      },
    });
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as UserRole,
    };
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };
}

export function canAccessAllDeals(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MANAGER;
}
