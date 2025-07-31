/**
 * TaskManagement Provider - Compound component pattern implementation
 * 
 * This provider implements the compound component pattern to organize
 * state management into logical, focused domains while eliminating prop drilling.
 */

"use client";

import React, { useState, useCallback, ReactNode } from 'react';
import { ClientTask } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useTaskFilters as useTaskFiltersHook } from '@/hooks/useTaskFilters';
import { useFilteredTasks } from '@/hooks/useFilteredTasks';
import { useTaskSelection as useTaskSelectionHook } from '../hooks/useTaskSelection';
import { useTaskOperations as useTaskOperationsHook } from '../hooks/useTaskOperations';
import { useFilteredTaskGroups } from '../hooks/useFilteredTaskGroups';
import {
  TaskDataContext,
  TaskFilterContext,
  TaskSelectionContext,
  TaskOperationsContext,
  TaskUIContext,
  TaskComputedContext,
  type TaskDataContextValue,
  type TaskFilterContextValue,
  type TaskSelectionContextValue,
  type TaskOperationsContextValue,
  type TaskUIContextValue,
  type TaskComputedContextValue,
} from './TaskManagementContext';
import { MinimalTaskManagementProps } from '../types';

// ============================================================================
// Individual Provider Components (Compound Component Pattern)
// ============================================================================

interface ProviderProps {
  children: ReactNode;
}

/**
 * TaskDataProvider - Manages task data fetching and core data
 */
export function TaskDataProvider({ 
  children, 
  teamMembers, 
  clients 
}: ProviderProps & Pick<MinimalTaskManagementProps, 'teamMembers' | 'clients'>) {
  const { data: tasks = [], isLoading, error } = useTasks();
  const filters = useTaskFiltersHook();
  const filteredTasks = useFilteredTasks(tasks, filters);

  const value: TaskDataContextValue = {
    tasks,
    filteredTasks,
    teamMembers,
    clients,
    isLoading,
    error,
  };

  return (
    <TaskDataContext.Provider value={value}>
      {children}
    </TaskDataContext.Provider>
  );
}

/**
 * TaskFilterProvider - Manages filter state and operations
 */
export function TaskFilterProvider({ children }: ProviderProps) {
  const filters = useTaskFiltersHook();

  const value: TaskFilterContextValue = {
    filters,
  };

  return (
    <TaskFilterContext.Provider value={value}>
      {children}
    </TaskFilterContext.Provider>
  );
}

/**
 * TaskSelectionProvider - Manages task selection state
 */
export function TaskSelectionProvider({ children }: ProviderProps) {
  const selectionState = useTaskSelectionHook();

  const value: TaskSelectionContextValue = selectionState;

  return (
    <TaskSelectionContext.Provider value={value}>
      {children}
    </TaskSelectionContext.Provider>
  );
}

/**
 * TaskOperationsProvider - Manages task CRUD operations and loading states
 */
export function TaskOperationsProvider({ 
  children,
  tasks,
  selectedTasks,
  onTaskCreated,
  onBulkDeleteComplete,
  markTasksAsDeleting,
  unmarkTasksAsDeleting,
}: ProviderProps & {
  tasks: ClientTask[];
  selectedTasks: string[];
  onTaskCreated?: () => void;
  onBulkDeleteComplete?: () => void;
  markTasksAsDeleting: (taskIds: string[]) => void;
  unmarkTasksAsDeleting: (taskIds: string[]) => void;
}) {
  const operations = useTaskOperationsHook({
    tasks,
    selectedTasks,
    onTaskCreated,
    onBulkDeleteComplete,
    markTasksAsDeleting,
    unmarkTasksAsDeleting,
  });

  const value: TaskOperationsContextValue = operations;

  return (
    <TaskOperationsContext.Provider value={value}>
      {children}
    </TaskOperationsContext.Provider>
  );
}

/**
 * TaskUIProvider - Manages UI state (modals, creating state, etc.)
 */
export function TaskUIProvider({ children }: ProviderProps) {
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const value: TaskUIContextValue = {
    isCreatingTask,
    setIsCreatingTask,
  };

  return (
    <TaskUIContext.Provider value={value}>
      {children}
    </TaskUIContext.Provider>
  );
}

/**
 * TaskComputedProvider - Manages computed/derived data like filtered groups
 */
export function TaskComputedProvider({ 
  children,
  tasks,
  filteredTasks,
  teamMembers,
}: ProviderProps & {
  tasks: ClientTask[];
  filteredTasks: ClientTask[];
  teamMembers: any[];
}) {
  const { filteredTaskGroups, filteredClientGroups, filteredAssigneeGroups } =
    useFilteredTaskGroups({
      tasks,
      filteredTasks,
      teamMembers,
    });

  const value: TaskComputedContextValue = {
    filteredTaskGroups,
    filteredClientGroups,
    filteredAssigneeGroups,
  };

  return (
    <TaskComputedContext.Provider value={value}>
      {children}
    </TaskComputedContext.Provider>
  );
}

// ============================================================================
// Main Compound Provider - Composes all providers together
// ============================================================================

interface TaskManagementProviderProps extends MinimalTaskManagementProps {
  children: ReactNode;
}

/**
 * TaskManagementProvider - Main compound provider that orchestrates all contexts
 * 
 * This provider follows the compound component pattern, composing multiple
 * focused providers to create a comprehensive state management solution
 * while avoiding prop drilling.
 */
export function TaskManagementProvider({
  children,
  teamMembers,
  clients,
  currentUser,
}: TaskManagementProviderProps) {
  return (
    <TaskDataProvider teamMembers={teamMembers} clients={clients}>
      <TaskFilterProvider>
        <TaskUIProvider>
          <TaskSelectionProvider>
            <TaskManagementProviderInner>
              {children}
            </TaskManagementProviderInner>
          </TaskSelectionProvider>
        </TaskUIProvider>
      </TaskFilterProvider>
    </TaskDataProvider>
  );
}

/**
 * Inner provider that has access to data and selection contexts
 * to provide them to operations and computed providers
 */
function TaskManagementProviderInner({ children }: { children: ReactNode }) {
  const { tasks, filteredTasks, teamMembers } = React.useContext(TaskDataContext)!;
  const { selectedTasks, markTasksAsDeleting, unmarkTasksAsDeleting, clearSelection } = React.useContext(TaskSelectionContext)!;
  const { setIsCreatingTask } = React.useContext(TaskUIContext)!;

  const handleTaskCreated = useCallback(() => {
    setIsCreatingTask(false);
  }, [setIsCreatingTask]);

  const handleBulkDeleteComplete = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <TaskOperationsProvider
      tasks={tasks}
      selectedTasks={selectedTasks}
      onTaskCreated={handleTaskCreated}
      onBulkDeleteComplete={handleBulkDeleteComplete}
      markTasksAsDeleting={markTasksAsDeleting}
      unmarkTasksAsDeleting={unmarkTasksAsDeleting}
    >
      <TaskComputedProvider
        tasks={tasks}
        filteredTasks={filteredTasks}
        teamMembers={teamMembers}
      >
        {children}
      </TaskComputedProvider>
    </TaskOperationsProvider>
  );
}