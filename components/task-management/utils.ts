import { STAGE_CONFIG, PRIORITY_CONFIG, STATUS_COLORS } from "./constants";
import { TaskStatus, TaskPriority } from "@/types";

export const getStageOrder = (stage: string): number => {
  const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
  return config?.order || 999;
};

export const getPriorityOrder = (priority: string): number => {
  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
  return config?.order || 999;
};

export const getStageDisplayName = (stage: string): string => {
  const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
  return config?.displayName || stage;
};

export const getStatusColor = (status: TaskStatus): string => {
  return STATUS_COLORS[status] || "bg-slate-500/90 text-slate-100";
};

export const getPriorityColor = (priority: TaskPriority): string => {
  const config = PRIORITY_CONFIG[priority];
  return config?.color || "border-l-slate-400 bg-slate-50/5";
};

export const getPriorityDisplayName = (priority: TaskPriority): string => {
  const config = PRIORITY_CONFIG[priority];
  return config?.displayName || priority;
};