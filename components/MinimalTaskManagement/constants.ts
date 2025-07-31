/**
 * Constants for MinimalTaskManagement component
 */

import { Lock, Building2, User, Users } from 'lucide-react';

export const MESSAGES = {
  DELETE_TASK_CONFIRM: (taskName: string) =>
    `Are you sure you want to delete "${taskName}"? This action cannot be undone.`,
  DELETE_TASKS_CONFIRM: (count: number, taskNames: string) =>
    `Are you sure you want to delete ${count} tasks (${taskNames})? This action cannot be undone.`,
  CREATE_TASK_ERROR: 'Failed to create task. Please try again.',
  DELETE_TASK_ERROR: 'Failed to delete task. Please try again.',
} as const;

export const TASK_ICONS = {
  INTERNAL: Lock,
  CLIENT: Building2,
  UNASSIGNED: User,
  ASSIGNED: Users,
} as const;

export const VIEW_MODES = {
  TASKS: 'tasks',
  CLIENTS: 'clients',
  ASSIGNEES: 'assignees',
} as const;

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];