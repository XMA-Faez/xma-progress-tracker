"use client";

import { ClientTask, TaskStatus, TaskPriority, TeamMember } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiTeamSelect } from "@/components/MultiTeamSelect";
import { Loader2, Trash2 } from "lucide-react";
import { getStatusColor, getPriorityColor, getStageDisplayName } from "./utils";
import { TASK_CATEGORY_CONFIG } from "./constants";

interface TaskCardProps {
  task: ClientTask;
  teamMembers: TeamMember[];
  isSelected: boolean;
  isDeleting: boolean;
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

export function TaskCard({
  task,
  teamMembers,
  isSelected,
  isDeleting,
  showClient = true,
  onToggleSelect,
  onStatusUpdate,
  onPriorityUpdate,
  onAssignmentUpdate,
  onDelete,
  isUpdatingStatus = false,
  isUpdatingPriority = false,
  isUpdatingAssignment = false,
}: TaskCardProps) {
  const categoryIcon = TASK_CATEGORY_CONFIG[task.task_category]?.icon || "";

  return (
    <div
      className={`group relative border-l-4 ${getPriorityColor(
        task.priority
      )} bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 transition-all duration-200 ${
        isSelected ? "ring-2 ring-cyan-500/50 bg-slate-800/60" : ""
      }`}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(task.id)}
            className="data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{categoryIcon}</span>
              <h4 className="text-white font-medium">{task.name}</h4>
              {showClient && task.clients && (
                <span className="text-cyan-300 text-sm font-medium">{task.clients.name}</span>
              )}
              <Badge className={`${getStatusColor(task.status)} text-xs px-2 py-1`}>
                {task.status.replace("_", " ")}
              </Badge>
            </div>
            {task.description && (
              <p className="text-slate-300 text-sm line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>{getStageDisplayName(task.stage)}</span>
              <span>•</span>
              <span>{task.type}</span>
              <span>•</span>
              <span className="capitalize">{task.priority}</span>
              {!showClient && task.clients && (
                <>
                  <span>•</span>
                  <span className="text-cyan-300">{task.clients.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id, task.name)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Status Selector */}
        <div className="flex-1">
          <Select
            value={task.status}
            onValueChange={(value: TaskStatus) => onStatusUpdate(task.id, value)}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-600 hover:bg-slate-900/70">
              {isUpdatingStatus ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span>Updating...</span>
                </div>
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
              <SelectItem value="waiting_for_team">Waiting for Team</SelectItem>
              <SelectItem value="review_required">Review Required</SelectItem>
              <SelectItem value="client_review">Client Review</SelectItem>
              <SelectItem value="revision_needed">Revision Needed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Selector */}
        <div className="flex-1">
          <Select
            value={task.priority}
            onValueChange={(value: TaskPriority) => onPriorityUpdate(task.id, value)}
            disabled={isUpdatingPriority}
          >
            <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-600 hover:bg-slate-900/70">
              {isUpdatingPriority ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span>Updating...</span>
                </div>
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🟠 High</SelectItem>
              <SelectItem value="urgent">🔴 Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team Assignment */}
        <div className="flex-1">
          <div className="relative">
            {isUpdatingAssignment && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
              </div>
            )}
            <MultiTeamSelect
              teamMembers={teamMembers}
              selectedIds={task.task_assignments?.map((a) => a.team_member_id) || []}
              onChange={(memberIds) => onAssignmentUpdate(task.id, memberIds)}
              className="h-8 text-xs"
              disabled={isUpdatingAssignment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}