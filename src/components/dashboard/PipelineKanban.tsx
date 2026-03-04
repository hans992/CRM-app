"use client";

import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { updateDealStage } from "@/app/actions/deal";
import type { Deal } from "@prisma/client";

type DealWithOwner = Deal & { owner: { id: string; name: string; email: string } | null };

const STAGES = ["Prospecting", "Qualified", "Negotiating", "Closed Won", "Lost"];

const STAGE_COLORS: Record<string, string> = {
  "Closed Won": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Negotiating": "bg-primary-50 border-primary-200",
  "Prospecting": "bg-amber-50 border-amber-200",
  "Qualified": "bg-cyan-50 border-cyan-200",
  "Lost": "bg-red-50 border-red-200",
};

function formatCurrency(value: number) {
  if (!isFinite(value) || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

interface PipelineKanbanProps {
  deals: DealWithOwner[];
}

export function PipelineKanban({ deals }: PipelineKanbanProps) {
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const dealsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = deals.filter((d) => d.stage === stage);
      return acc;
    },
    {} as Record<string, DealWithOwner[]>
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const dealId = String(active.id);
    const newStage = String(over.id);
    if (!STAGES.includes(newStage)) return;
    const result = await updateDealStage(dealId, newStage);
    if (!result.error) router.refresh();
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage] ?? []}
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  stage,
  deals,
}: {
  stage: string;
  deals: DealWithOwner[];
}) {
  const { setNodeRef, isOver } = useDroppableStage(stage);
  const borderColor = STAGE_COLORS[stage]?.split(" ").find((c) => c.startsWith("border-")) ?? "border-slate-200";

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] max-w-[280px] flex-col rounded-xl border-2 bg-white p-3 transition-colors ${
        isOver ? "ring-2 ring-primary ring-offset-2" : ""
      } ${borderColor}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{stage}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {deals.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {deals.map((deal) => (
          <KanbanCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({ deal }: { deal: DealWithOwner }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggableDeal(deal.id);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`min-h-20 cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow active:cursor-grabbing hover:shadow-md ${
        isDragging ? "opacity-90 shadow-lg" : ""
      }`}
    >
      <p className="font-medium text-slate-900 line-clamp-3">{deal.title}</p>
      <p className="mt-1 text-sm font-semibold text-primary whitespace-nowrap">{formatCurrency(deal.value)}</p>
      {deal.owner && (
        <p className="mt-1 text-xs text-slate-500">{deal.owner.name}</p>
      )}
    </div>
  );
}

function useDroppableStage(stage: string) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return { setNodeRef, isOver };
}

function useDraggableDeal(dealId: string) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dealId,
  });
  return { attributes, listeners, setNodeRef, isDragging };
}
