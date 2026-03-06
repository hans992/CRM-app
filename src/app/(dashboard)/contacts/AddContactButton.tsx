"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "@/lib/zod-schemas";
import { createContact, getCompanies } from "@/app/actions/contact";
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from "@/lib/modal-a11y";

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  companyId: "",
};

const inputBase =
  "mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1";
const inputError = "border-red-500 focus:border-red-500 focus:ring-red-500";
const inputOk = "border-slate-200 focus:border-primary-500 focus:ring-primary-500";

export function AddContactButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      getCompanies().then(setCompanies);
    }
  }, [open]);

  useEscapeKey(open, () => setOpen(false));
  useBodyScrollLock(open);
  useFocusTrap(open, dialogRef);

  async function onSubmit(data: ContactFormValues) {
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("email", data.email);
    if (data.phone) formData.set("phone", data.phone);
    if (data.companyId) formData.set("companyId", data.companyId);

    const result = await createContact(formData);

    if (result.error) {
      setError("root.serverError", { type: "server", message: result.error });
      return;
    }
    reset(defaultValues);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          reset(defaultValues);
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Add contact
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-contact-title"
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 id="add-contact-title" className="text-lg font-semibold text-slate-900">
                New contact
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {errors.root?.serverError?.message && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errors.root.serverError.message}
                </p>
              )}
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  data-autofocus
                  className={`${inputBase} ${errors.name ? inputError : inputOk}`}
                  {...register("name")}
                />
                {errors.name?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className={`${inputBase} ${errors.email ? inputError : inputOk}`}
                  {...register("email")}
                />
                {errors.email?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  className={`${inputBase} ${errors.phone ? inputError : inputOk}`}
                  {...register("phone")}
                />
                {errors.phone?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact-company" className="block text-sm font-medium text-slate-700">
                  Company
                </label>
                <select
                  id="contact-company"
                  className={`${inputBase} ${errors.companyId ? inputError : inputOk}`}
                  {...register("companyId")}
                >
                  <option value="">— None —</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.companyId?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.companyId.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
