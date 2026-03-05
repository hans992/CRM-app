"use client";

import { useCallback, useState } from "react";
import ReactGridLayout, { WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import type { Layout } from "react-grid-layout";
import type { DashboardLayoutItem } from "@/lib/dashboard-preferences";
import { updateDashboardLayout } from "@/app/actions/preferences";

const GridLayoutWithWidth = WidthProvider(ReactGridLayout);

const COLS = 12;
const ROW_HEIGHT = 100;
const MARGIN: [number, number] = [16, 16];

interface DashboardGridProps {
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  children: React.ReactNode;
  /** When true, dragging and resizing are disabled (e.g. during loading). */
  disabled?: boolean;
}

export function DashboardGrid({
  layout,
  onLayoutChange,
  children,
  disabled = false,
}: DashboardGridProps) {
  const [saving, setSaving] = useState(false);

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      onLayoutChange(newLayout);
      setSaving(true);
      // Persists full layout (including w/h from resize and x/y from drag) to the API.
      updateDashboardLayout(newLayout as DashboardLayoutItem[]).then(() => {
        setSaving(false);
      });
    },
    [onLayoutChange]
  );

  return (
    <div className="relative w-full overflow-x-auto min-w-0">
      {saving && (
        <div className="absolute right-0 top-0 z-10 rounded bg-slate-800 px-2 py-1 text-xs text-white">
          Saving…
        </div>
      )}
      <GridLayoutWithWidth
        className="layout"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        margin={MARGIN}
        isDraggable={!disabled}
        isResizable={!disabled}
        resizeHandles={["se"]}
        compactType="vertical"
        preventCollision={false}
      >
        {children}
      </GridLayoutWithWidth>
    </div>
  );
}
