"use client";

import { Loader2 } from "lucide-react";

export function TaskLoadingState() {
  return (
    <div className="space-y-6" data-admin-page>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading tasks...</span>
      </div>
    </div>
  );
}