"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
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
import { GripVertical } from "lucide-react";

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
  const stageNodesRef = useRef<Record<string, HTMLDivElement | null>>({});
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

  const setStageNode = useCallback((stage: string, node: HTMLDivElement | null) => {
    stageNodesRef.current[stage] = node;
  }, []);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
        {STAGES.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() =>
              stageNodesRef.current[stage]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
              })
            }
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`Scroll to ${stage} column`}
          >
            {stage}
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage] ?? []}
            onStageNode={setStageNode}
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  stage,
  deals,
  onStageNode,
}: {
  stage: string;
  deals: DealWithOwner[];
  onStageNode?: (stage: string, node: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppableStage(stage);
  const borderColor = STAGE_COLORS[stage]?.split(" ").find((c) => c.startsWith("border-")) ?? "border-slate-200";
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      onStageNode?.(stage, node);
    },
    [onStageNode, setNodeRef, stage]
  );

  return (
    <div
      ref={setRefs}
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
  const router = useRouter();
  const [savingStage, setSavingStage] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggableDeal(deal.id);

  async function handleStageChange(nextStage: string) {
    if (!STAGES.includes(nextStage)) return;
    if (nextStage === deal.stage) return;
    setSavingStage(true);
    const result = await updateDealStage(deal.id, nextStage);
    setSavingStage(false);
    if (!result.error) router.refresh();
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-20 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-90 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-slate-900 line-clamp-3">{deal.title}</p>
        <button
          type="button"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={`Drag ${deal.title}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-sm font-semibold text-primary whitespace-nowrap">{formatCurrency(deal.value)}</p>
      {deal.owner && (
        <p className="mt-1 text-xs text-slate-500">{deal.owner.name}</p>
      )}

      <div className="mt-2">
        <label htmlFor={`deal-stage-${deal.id}`} className="sr-only">
          Stage for {deal.title}
        </label>
        <select
          id={`deal-stage-${deal.id}`}
          value={deal.stage}
          onChange={(e) => handleStageChange(e.target.value)}
          disabled={savingStage}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60"
          aria-label={`Move ${deal.title} to a new stage`}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
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
