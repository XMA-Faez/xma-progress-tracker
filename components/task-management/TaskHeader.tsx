"use client";

import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

interface TaskHeaderProps {
  totalTasks: number;
  completedTasks: number;
  isCreating: boolean;
  onCreateClick: () => void;
}

export function TaskHeader({ totalTasks, completedTasks, isCreating, onCreateClick }: TaskHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Tasks</h1>
        <p className="text-sm text-slate-400">
          {totalTasks} tasks • {completedTasks} completed
        </p>
      </div>
      <Button onClick={onCreateClick} className="btn-glass" disabled={isCreating}>
        {isCreating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        New Task
      </Button>
    </div>
  );
}