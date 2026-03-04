"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Building2, Pencil, Trash2 } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { updateContact, deleteContact } from "@/app/actions/contact";

type ContactWithDeals = Prisma.ContactGetPayload<{
  include: {
    company: { select: { id: true; name: true } };
    deals: {
      include: {
        owner: { select: { id: true; name: true; email: true } };
        notes: { orderBy: { createdAt: "desc" }; take: 20 };
      };
    };
  };
}>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d));
}

const STAGE_COLORS: Record<string, string> = {
  "Closed Won": "bg-emerald-100 text-emerald-800",
  "Negotiating": "bg-primary-100 text-primary-700",
  "Prospecting": "bg-amber-100 text-amber-800",
  "Qualified": "bg-cyan-100 text-cyan-800",
  "Lost": "bg-red-100 text-red-800",
};

interface ContactDetailViewProps {
  contact: ContactWithDeals;
  companies: { id: string; name: string }[];
}

export function ContactDetailView({ contact, companies }: ContactDetailViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateContact(contact.id, formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this contact? Deals will be unlinked.")) return;
    const result = await deleteContact(contact.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/contacts");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {!editing ? (
                <>
                  <h2 className="text-lg font-semibold text-slate-900">{contact.name}</h2>
                  <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {contact.phone}
                      </span>
                    )}
                    {contact.company && (
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {contact.company.name}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <p className="rounded bg-red-50 px-2 py-1 text-sm text-red-700">{error}</p>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Name</label>
                    <input
                      name="name"
                      defaultValue={contact.name}
                      required
                      className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Email</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={contact.email}
                      required
                      className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Phone</label>
                    <input
                      name="phone"
                      defaultValue={contact.phone ?? ""}
                      className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Company</label>
                    <select
                      name="companyId"
                      defaultValue={contact.companyId ?? ""}
                      className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    >
                      <option value="">— None —</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="rounded border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Deals & activity
        </h3>
        {contact.deals.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">
            No deals linked to this contact.
          </div>
        ) : (
          <div className="space-y-4">
            {contact.deals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href="/"
                    className="font-medium text-primary hover:underline"
                  >
                    {deal.title}
                  </Link>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      STAGE_COLORS[deal.stage] ?? "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {deal.stage}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatCurrency(deal.value)}
                  {deal.owner && ` · ${deal.owner.name}`}
                </p>
                {deal.notes.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="text-xs font-medium text-slate-500">Recent notes</p>
                    <ul className="mt-1 space-y-1 text-sm text-slate-600">
                      {deal.notes.slice(0, 3).map((note) => (
                        <li key={note.id}>
                          {note.content.slice(0, 80)}
                          {note.content.length > 80 ? "…" : ""}
                          <span className="ml-1 text-xs text-slate-400">
                            {formatDate(note.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
