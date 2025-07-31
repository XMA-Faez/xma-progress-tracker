/**
 * Premium Enhanced TaskCard Component
 * Individual task card with luxurious styling and micro-interactions
 */

"use client";

import { ClientTask, TaskStatus, TaskPriority, TeamMember } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiTeamSelect } from "@/components/MultiTeamSelect";
import { Loader2, Trash2, Calendar, Users, Flag, AlertCircle, Minus, AlertTriangle, Zap } from "lucide-react";
import { getStatusColor, getPriorityColor, getStageDisplayName } from "@/components/task-management/utils";
import { TASK_CATEGORY_CONFIG, STAGE_CONFIG } from "@/components/task-management/constants";

interface TaskCardPremiumProps {
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

export function TaskCardPremium({
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
}: TaskCardPremiumProps) {
  const CategoryIcon = TASK_CATEGORY_CONFIG[task.task_category]?.icon;
  const StageIcon = STAGE_CONFIG[task.stage as keyof typeof STAGE_CONFIG]?.icon;

  return (
    <div
      className={`task-card-premium group ${
        isSelected ? "ring-2 ring-cyan-500/50" : ""
      }`}
    >
      {/* Priority Border */}
      <div 
        className={`task-card-priority-border ${getPriorityColor(task.priority)}`}
        style={{
          background: task.priority === 'urgent' 
            ? 'linear-gradient(180deg, oklch(0.62 0.22 30), oklch(0.62 0.22 40))' 
            : task.priority === 'high'
            ? 'linear-gradient(180deg, oklch(0.65 0.22 50), oklch(0.65 0.22 60))'
            : task.priority === 'medium'
            ? 'linear-gradient(180deg, oklch(0.70 0.20 90), oklch(0.70 0.20 100))'
            : 'linear-gradient(180deg, oklch(0.65 0.18 150), oklch(0.65 0.18 160))'
        }}
      />

      {/* Task Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(task.id)}
            className="checkbox-premium focus-premium"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {CategoryIcon && <CategoryIcon className="h-4 w-4 text-slate-400" />}
              <h4 className="task-title-premium flex-1">{task.name}</h4>
              {showClient && task.clients && (
                <span className="text-cyan-400 text-sm font-medium bg-cyan-400/10 px-2 py-1 rounded-md">
                  {task.clients.name}
                </span>
              )}
            </div>
            {task.description && (
              <p className="task-description-premium line-clamp-2">{task.description}</p>
            )}
            <div className="task-meta-premium">
              <span className="flex items-center gap-1">
                {StageIcon && <StageIcon className="w-3 h-3" />}
                {getStageDisplayName(task.stage)}
              </span>
              <span>•</span>
              <span>{task.type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flag className="w-3 h-3" />
                <span className="capitalize">{task.priority}</span>
              </span>
              {!showClient && task.clients && (
                <>
                  <span>•</span>
                  <span className="text-cyan-400">{task.clients.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge & Delete Button */}
        <div className="flex items-center gap-3">
          <Badge className={`task-status-badge-premium ${getStatusColor(task.status)}`}>
            {task.status.replace("_", " ")}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id, task.name)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover-lift"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Actions with Premium Styling */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-700/30">
        {/* Status Selector */}
        <div className="flex-1">
          <Select
            value={task.status}
            onValueChange={(value: TaskStatus) => onStatusUpdate(task.id, value)}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="select-premium h-9 text-xs focus-premium">
              {isUpdatingStatus ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span>Updating...</span>
                </div>
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent className="glass-card">
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
            <SelectTrigger className="select-premium h-9 text-xs focus-premium">
              {isUpdatingPriority ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span>Updating...</span>
                </div>
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Minus className="h-3 w-3 text-green-400" />
                  <span>Low</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-400" />
                  <span>Medium</span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-orange-400" />
                  <span>High</span>
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-red-400" />
                  <span>Urgent</span>
                </div>
              </SelectItem>
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
              className=""
              disabled={isUpdatingAssignment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
