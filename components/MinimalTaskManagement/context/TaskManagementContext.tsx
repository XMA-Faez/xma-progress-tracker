/**
 * TaskManagement Context - Centralized state management
 * 
 * This context eliminates prop drilling by providing centralized access to:
 * - Task data and operations
 * - Selection state management
 * - Filter state management
 * - Loading states and UI state
 */

"use client";

import React, { createContext, useContext } from 'react';
import { ClientTask, TeamMember, TaskStatus, TaskPriority } from '@/types';
import { Client } from '../types';
import { DEFAULT_NEW_TASK } from '@/components/task-management';

// ============================================================================
// Core Data Context
// ============================================================================

export interface TaskDataContextValue {
  tasks: ClientTask[];
  filteredTasks: ClientTask[];
  teamMembers: TeamMember[];
  clients: Client[];
  isLoading: boolean;
  error: Error | null;
}

export const TaskDataContext = createContext<TaskDataContextValue | null>(null);

// ============================================================================
// Filter Context
// ============================================================================

export interface TaskFilterContextValue {
  filters: {
    searchTerm: string;
    filterStatus: string;
    filterCategory: string;
    filterClient: string;
    filterAssignee: string;
    filterPriority: string;
    viewMode: string;
    showCompleted: boolean;
    showAdvancedFilters: boolean;
    updateSearchTerm: (term: string) => void;
    updateFilterStatus: (status: string) => void;
    updateFilterCategory: (category: string) => void;
    updateFilterClient: (client: string) => void;
    updateFilterAssignee: (assignee: string) => void;
    updateFilterPriority: (priority: string) => void;
    updateViewMode: (mode: string) => void;
    updateShowCompleted: (show: boolean) => void;
    updateShowAdvancedFilters: (show: boolean) => void;
  };
}

export const TaskFilterContext = createContext<TaskFilterContextValue | null>(null);

// ============================================================================
// Selection Context
// ============================================================================

export interface TaskSelectionContextValue {
  selectedTasks: string[];
  deletingTasks: string[];
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (tasks: ClientTask[]) => void;
  clearSelection: () => void;
  markTasksAsDeleting: (taskIds: string[]) => void;
  unmarkTasksAsDeleting: (taskIds: string[]) => void;
}

export const TaskSelectionContext = createContext<TaskSelectionContextValue | null>(null);

// ============================================================================
// Operations Context
// ============================================================================

export interface TaskOperationsContextValue {
  // Loading states
  isCreating: boolean;
  isUpdatingStatus: boolean;
  isUpdatingPriority: boolean;
  isUpdatingAssignment: boolean;
  
  // Operation handlers
  handleCreateTask: (task: typeof DEFAULT_NEW_TASK) => Promise<void>;
  handleTaskStatusUpdate: (taskId: string, status: TaskStatus) => void;
  handleTaskAssignment: (taskId: string, memberIds: string[]) => void;
  handleTaskPriorityUpdate: (taskId: string, priority: TaskPriority) => void;
  handleDeleteTask: (taskId: string, taskName: string) => void;
  handleBulkDelete: () => void;
}

export const TaskOperationsContext = createContext<TaskOperationsContextValue | null>(null);

// ============================================================================
// UI State Context
// ============================================================================

export interface TaskUIContextValue {
  isCreatingTask: boolean;
  setIsCreatingTask: (value: boolean) => void;
}

export const TaskUIContext = createContext<TaskUIContextValue | null>(null);

// ============================================================================
// Computed Data Context (for filtered groups)
// ============================================================================

export interface TaskComputedContextValue {
  filteredTaskGroups: any[];
  filteredClientGroups: any[];
  filteredAssigneeGroups: any[];
}

export const TaskComputedContext = createContext<TaskComputedContextValue | null>(null);

// ============================================================================
// Context Hooks with Error Handling
// ============================================================================

export function useTaskData(): TaskDataContextValue {
  const context = useContext(TaskDataContext);
  if (!context) {
    throw new Error('useTaskData must be used within a TaskDataProvider');
  }
  return context;
}

export function useTaskFilters(): TaskFilterContextValue {
  const context = useContext(TaskFilterContext);
  if (!context) {
    throw new Error('useTaskFilters must be used within a TaskFilterProvider');
  }
  return context;
}

export function useTaskSelection(): TaskSelectionContextValue {
  const context = useContext(TaskSelectionContext);
  if (!context) {
    throw new Error('useTaskSelection must be used within a TaskSelectionProvider');
  }
  return context;
}

export function useTaskOperations(): TaskOperationsContextValue {
  const context = useContext(TaskOperationsContext);
  if (!context) {
    throw new Error('useTaskOperations must be used within a TaskOperationsProvider');
  }
  return context;
}

export function useTaskUI(): TaskUIContextValue {
  const context = useContext(TaskUIContext);
  if (!context) {
    throw new Error('useTaskUI must be used within a TaskUIProvider');
  }
  return context;
}

export function useTaskComputed(): TaskComputedContextValue {
  const context = useContext(TaskComputedContext);
  if (!context) {
    throw new Error('useTaskComputed must be used within a TaskComputedProvider');
  }
  return context;
}