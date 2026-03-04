import Link from "next/link";
import { notFound } from "next/navigation";
import { getContactById } from "@/app/actions/contact";
import { ContactDetailView } from "./ContactDetailView";
import { getCompanies } from "@/app/actions/contact";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  const contact = await getContactById(id);
  if (!contact) notFound();
  const companies = await getCompanies();

  return (
    <>
      <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/contacts"
            className="text-sm font-medium text-muted-foreground hover:text-slate-900"
          >
            ← Contacts
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {contact.name}
          </h1>
        </div>
      </header>

      <ContactDetailView contact={contact} companies={companies} />
    </>
  );
}
