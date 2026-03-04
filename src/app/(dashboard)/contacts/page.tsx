import { Suspense } from "react";
import Link from "next/link";
import { getContacts } from "@/app/actions/contact";
import { ContactsList } from "./ContactsList";
import { ContactSearch } from "./ContactSearch";
import { AddContactButton } from "./AddContactButton";

interface ContactsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const contacts = await getContacts(search);

  return (
    <>
      <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Contacts
        </h1>
        <AddContactButton />
      </header>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-200" />}>
        <ContactSearch />
      </Suspense>

      <div className="mt-6">
        <ContactsList contacts={contacts} />
      </div>
    </>
  );
}
