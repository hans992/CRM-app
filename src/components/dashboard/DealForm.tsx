"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { dealFormSchema, type DealFormValues, DEAL_STAGES } from "@/lib/zod-schemas";
import { createDeal } from "@/app/actions/deal";
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from "@/lib/modal-a11y";

interface DealFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultValues: DealFormValues = {
  title: "",
  value: "",
  stage: "",
  closeDate: "",
};

export function DealForm({ isOpen, onClose }: DealFormProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues,
  });

  useEscapeKey(isOpen, onClose);
  useBodyScrollLock(isOpen);
  useFocusTrap(isOpen, dialogRef);

  if (!isOpen) return null;

  async function onSubmit(data: DealFormValues) {
    const formData = new FormData();
    formData.set("title", data.title);
    formData.set("value", data.value);
    formData.set("stage", data.stage);
    if (data.closeDate) formData.set("closeDate", data.closeDate);

    const result = await createDeal(formData);

    if (result.success) {
      reset(defaultValues);
      onClose();
      window.location.reload();
    } else {
      // Server-side error (e.g. auth) – could set a form-level error state
      alert(result.error || "Failed to create deal");
    }
  }

  const inputBase =
    "mt-1 block w-full rounded-lg border bg-surface px-3 py-2 shadow-sm focus:outline-none focus:ring-1";
  const inputError =
    "border-red-500 focus:border-red-500 focus:ring-red-500";
  const inputOk =
    "border-slate-300 focus:border-primary-500 focus:ring-primary-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-form-title"
        className="relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-surface shadow-modal sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="deal-form-title" className="text-xl font-semibold text-slate-900">
            Add New Deal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700"
              >
                Deal Name *
              </label>
              <input
                type="text"
                id="title"
                placeholder="e.g., Enterprise Software License"
                className={`${inputBase} ${errors.title ? inputError : inputOk}`}
                data-autofocus
                {...register("title")}
              />
              {errors.title?.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-slate-700"
              >
                Amount ($) *
              </label>
              <input
                type="number"
                id="value"
                min={0}
                step={0.01}
                placeholder="5000"
                className={`${inputBase} ${errors.value ? inputError : inputOk}`}
                {...register("value")}
              />
              {errors.value?.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.value.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="stage"
                className="block text-sm font-medium text-slate-700"
              >
                Status *
              </label>
              <select
                id="stage"
                className={`${inputBase} ${errors.stage ? inputError : inputOk}`}
                {...register("stage")}
              >
                <option value="">Select a stage</option>
                {DEAL_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              {errors.stage?.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.stage.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="closeDate"
                className="block text-sm font-medium text-slate-700"
              >
                Close Date
              </label>
              <input
                type="date"
                id="closeDate"
                className={`${inputBase} ${errors.closeDate ? inputError : inputOk}`}
                {...register("closeDate")}
              />
              {errors.closeDate?.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.closeDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 bg-surface px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Creating...
                </>
              ) : (
                "Create Deal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
