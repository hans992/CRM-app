"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DealForm } from "./DealForm";

export function AddDealButton() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-700"
      >
        <Plus className="h-4 w-4" />
        Add Deal
      </button>
      <DealForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
