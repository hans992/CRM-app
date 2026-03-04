"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signInAction } from "@/app/actions/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const urlError = searchParams.get("error");
  const displayError =
    error ||
    (urlError === "CredentialsSignin"
      ? "Invalid email or password. Run: npx prisma db seed"
      : null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signInAction(email, password);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/80 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-slate-900">CRM</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to continue
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {displayError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{displayError}</p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Leave empty for demo"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Use demo@example.com (any password). First run: npx prisma db seed
        </p>
      </div>
    </main>
  );
}
