import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/80 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1>
          <p className="mt-2 text-muted-foreground">Please log in to access the dashboard.</p>
        </div>
      </main>
    );
  }
  return <AppShell user={user}>{children}</AppShell>;
}
