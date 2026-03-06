import { getTasks, getUsersForAssign } from "@/app/actions/task";
import { TasksList, type TaskForList } from "./TasksList";
import { AddTaskButton } from "./AddTaskButton";
import { TaskFilters } from "./TaskFilters";

interface TasksPageProps {
  searchParams: Promise<{ assignee?: string; status?: string }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const assigneeId = params.assignee || undefined;
  const status = params.status || undefined;
  const [tasks, users] = await Promise.all([
    getTasks({ assigneeId, status }) as unknown as Promise<TaskForList[]>,
    getUsersForAssign(),
  ]);

  return (
    <>
      <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Tasks
        </h1>
        <AddTaskButton users={users} />
      </header>

      <TaskFilters users={users} />

      <div className="mt-6">
        <TasksList tasks={tasks} users={users} />
      </div>
    </>
  );
}
