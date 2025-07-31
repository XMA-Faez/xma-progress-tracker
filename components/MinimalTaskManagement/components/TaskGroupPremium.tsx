/**
 * Premium Enhanced TaskGroup Component
 * Displays a group of tasks with premium styling and animations
 */

"use client";

import { ClientTask, TaskStatus, TaskPriority, TeamMember } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TaskCardPremium } from "./TaskCardPremium";
import { LucideIcon } from "lucide-react";

interface TaskGroupPremiumProps {
  title: string;
  icon?: LucideIcon;
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

export function TaskGroupPremium({
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
}: TaskGroupPremiumProps) {
  const IconComponent = icon;
  
  return (
    <div className="space-y-4">
      {/* Premium Group Header */}
      <div className="task-group-header-premium">
        <h3 className="task-group-title-premium flex items-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-slate-400" />}
          {title}
        </h3>
        <Badge className="task-group-badge-premium">{count}</Badge>
      </div>

      {/* Premium Tasks Grid */}
      <div className="grid gap-4">
        {tasks.map((task, index) => (
          <div key={task.id}>
            <TaskCardPremium
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
          </div>
        ))}
      </div>
    </div>
  );
}

