"use client";

import { ClientTask, TaskStatus, TaskPriority, TeamMember } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { getStageDisplayName } from "./utils";

interface TaskGroupProps {
  title: string;
  icon?: string;
  tasks: ClientTask[];
  count: number;
  teamMembers: TeamMember[];
  selectedTasks: string[];
  deletingTasks: string[];
  showClient?: boolean;
  onToggleSelect: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: TaskStatus) => void;
  onPriorityUpdate: (taskId: string, priority: TaskPriority) => void;
  onAssignmentUpdate: (taskId: string, memberIds: string[]) => void;
  onDelete: (taskId: string, taskName: string) => void;
  isUpdatingStatus?: boolean;
  isUpdatingPriority?: boolean;
  isUpdatingAssignment?: boolean;
}

export function TaskGroup({
  title,
  icon,
  tasks,
  count,
  teamMembers,
  selectedTasks,
  deletingTasks,
  showClient = true,
  onToggleSelect,
  onStatusUpdate,
  onPriorityUpdate,
  onAssignmentUpdate,
  onDelete,
  isUpdatingStatus = false,
  isUpdatingPriority = false,
  isUpdatingAssignment = false,
}: TaskGroupProps) {
  return (
    <div className="space-y-3">
      {/* Group Header */}
      <div className="flex items-center gap-3 px-1">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        <Badge variant="outline" className="text-slate-400 text-xs">
          {count}
        </Badge>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            teamMembers={teamMembers}
            isSelected={selectedTasks.includes(task.id)}
            isDeleting={deletingTasks.includes(task.id)}
            showClient={showClient}
            onToggleSelect={onToggleSelect}
            onStatusUpdate={onStatusUpdate}
            onPriorityUpdate={onPriorityUpdate}
            onAssignmentUpdate={onAssignmentUpdate}
            onDelete={onDelete}
            isUpdatingStatus={isUpdatingStatus}
            isUpdatingPriority={isUpdatingPriority}
            isUpdatingAssignment={isUpdatingAssignment}
          />
        ))}
      </div>
    </div>
  );
}