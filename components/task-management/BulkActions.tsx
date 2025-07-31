"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  isDeletingTasks: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

export function BulkActions({
  selectedCount,
  totalCount,
  isDeletingTasks,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="glass-card-secondary rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300">
          {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="h-7 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Select All ({totalCount})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7 text-xs text-slate-400 hover:text-slate-300"
        >
          Clear
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="h-7 text-xs"
          disabled={isDeletingTasks}
        >
          {isDeletingTasks ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Selected
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
