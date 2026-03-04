import Link from "next/link";
import type { Prisma } from "@prisma/client";

type ContactWithMeta = Prisma.ContactGetPayload<{
  include: {
    company: { select: { id: true; name: true } };
    _count: { select: { deals: true } };
  };
}>;

interface ContactsListProps {
  contacts: ContactWithMeta[];
}

export function ContactsList({ contacts }: ContactsListProps) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-muted-foreground">
        <p className="font-medium">No contacts found</p>
        <p className="mt-1 text-sm">Add a contact or try a different search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Company
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Deals
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link
                  href={`/contacts/${contact.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {contact.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{contact.email}</td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {contact.company?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {contact._count.deals}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/contacts/${contact.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
