"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { taskFormSchema, type TaskFormValues, TASK_STATUSES } from "@/lib/zod-schemas";
import { createTask } from "@/app/actions/task";

interface AddTaskButtonProps {
  users: { id: string; name: string; email: string }[];
}

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  dueDate: "",
  status: "TODO",
  assigneeId: "",
};

const inputBase =
  "mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1";
const inputError = "border-red-500 focus:border-red-500 focus:ring-red-500";
const inputOk = "border-slate-200 focus:border-primary-500 focus:ring-primary-500";

export function AddTaskButton({ users }: AddTaskButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  async function onSubmit(data: TaskFormValues) {
    const formData = new FormData();
    formData.set("title", data.title);
    if (data.description) formData.set("description", data.description);
    if (data.dueDate) formData.set("dueDate", data.dueDate);
    formData.set("status", data.status);
    formData.set("assigneeId", data.assigneeId);

    const result = await createTask(formData);

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
        Add task
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">New task</h2>
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
                <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">
                  Title *
                </label>
                <input
                  id="task-title"
                  type="text"
                  className={`${inputBase} ${errors.title ? inputError : inputOk}`}
                  {...register("title")}
                />
                {errors.title?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="task-description"
                  rows={2}
                  className={`${inputBase} ${errors.description ? inputError : inputOk}`}
                  {...register("description")}
                />
                {errors.description?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="task-dueDate" className="block text-sm font-medium text-slate-700">
                  Due date
                </label>
                <input
                  id="task-dueDate"
                  type="date"
                  className={`${inputBase} ${errors.dueDate ? inputError : inputOk}`}
                  {...register("dueDate")}
                />
                {errors.dueDate?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.dueDate.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="task-status" className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="task-status"
                  className={`${inputBase} ${errors.status ? inputError : inputOk}`}
                  {...register("status")}
                >
                  <option value="TODO">To do</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="DONE">Done</option>
                </select>
                {errors.status?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-700">
                  Assignee *
                </label>
                <select
                  id="task-assignee"
                  className={`${inputBase} ${errors.assigneeId ? inputError : inputOk}`}
                  {...register("assigneeId")}
                >
                  <option value="">Select assignee</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                {errors.assigneeId?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.assigneeId.message}</p>
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
