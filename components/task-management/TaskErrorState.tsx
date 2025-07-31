"use client";

import { Button } from "@/components/ui/button";

export function TaskErrorState() {
  return (
    <div className="space-y-6" data-admin-page>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load tasks</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}