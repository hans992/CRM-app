"use client";

import { useRouter } from "next/navigation";
import { updateTaskStatus, deleteTask } from "@/app/actions/task";
import { Calendar, User, Trash2 } from "lucide-react";

export interface TaskForList {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: string;
  assigneeId: string;
  assignee: { id: string; name: string; email: string };
  deal: { id: string; title: string; stage: string } | null;
  contact: { id: string; name: string; email: string } | null;
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d));
}

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-800",
  IN_PROGRESS: "bg-primary-100 text-primary-700",
  DONE: "bg-emerald-100 text-emerald-800",
};

interface TasksListProps {
  tasks: TaskForList[];
  users: { id: string; name: string; email: string }[];
}

export function TasksList({ tasks, users }: TasksListProps) {
  const router = useRouter();

  async function handleStatusChange(taskId: string, status: "TODO" | "IN_PROGRESS" | "DONE") {
    await updateTaskStatus(taskId, status);
    router.refresh();
  }

  async function handleDelete(taskId: string) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId);
    router.refresh();
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-muted-foreground">
        <p className="font-medium">No tasks found</p>
        <p className="mt-1 text-sm">Add a task or adjust filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">{task.title}</p>
            {task.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{task.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {task.assignee.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(task.dueDate)}
              </span>
              {task.deal && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                  Deal: {task.deal.title}
                </span>
              )}
              {task.contact && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                  {task.contact.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <select
              value={task.status}
              onChange={(e) =>
                handleStatusChange(task.id, e.target.value as "TODO" | "IN_PROGRESS" | "DONE")
              }
              className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-medium ${
                STATUS_COLORS[task.status] ?? "bg-slate-100 text-slate-800"
              }`}
            >
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
            <button
              type="button"
              onClick={() => handleDelete(task.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
