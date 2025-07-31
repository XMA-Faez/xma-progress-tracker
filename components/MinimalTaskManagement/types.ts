/**
 * Type definitions for MinimalTaskManagement component
 */

import { TeamMember } from '@/types';

export interface Client {
  id: string;
  name: string;
}

export interface MinimalTaskManagementProps {
  teamMembers: TeamMember[];
  clients: Client[];
  currentUser: TeamMember;
}

export interface TaskGroup<T = any> {
  id?: string;
  name: string;
  tasks: T[];
  count: number;
}

export interface TaskOperationCallbacks {
  onCreateTask: (task: any) => Promise<void>;
  onUpdateStatus: (taskId: string, status: any) => void;
  onUpdateAssignment: (taskId: string, memberIds: string[]) => void;
  onUpdatePriority: (taskId: string, priority: any) => void;
  onDeleteTask: (taskId: string, taskName: string) => void;
  onBulkDelete: () => void;
  onToggleSelection: (taskId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export interface TaskSelectionState {
  selectedTasks: string[];
  deletingTasks: string[];
}

export interface TaskUIState {
  isCreatingTask: boolean;
  setIsCreatingTask: (value: boolean) => void;
}