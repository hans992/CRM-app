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
    <>
      <div className="grid gap-3 md:hidden">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/contacts/${contact.id}`}
                  className="block truncate font-medium text-primary hover:underline"
                >
                  {contact.name}
                </Link>
                <p className="mt-0.5 truncate text-sm text-slate-600">{contact.email}</p>
              </div>
              <Link
                href={`/contacts/${contact.id}`}
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                View
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Company
                </p>
                <p className="mt-0.5 text-slate-700">{contact.company?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Deals
                </p>
                <p className="mt-0.5 text-slate-700">{contact._count.deals}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200" role="table">
            <caption className="sr-only">
              List of all contacts with name, email, company, and deal count
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Deals
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50">
                  <th scope="row" className="px-4 py-3 text-left">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {contact.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-sm text-slate-600">{contact.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{contact.company?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{contact._count.deals}</td>
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
      </div>
    </>
  );
}
