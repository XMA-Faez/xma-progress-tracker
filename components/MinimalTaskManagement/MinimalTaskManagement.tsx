/**
 * MinimalTaskManagement Component
 * 
 * A streamlined task management interface that provides:
 * - Task CRUD operations with optimistic updates
 * - Multiple view modes (by stage, client, assignee)
 * - Advanced filtering and search capabilities
 * - Bulk operations support
 * - Real-time updates via React Query
 * 
 * This component has been refactored for better maintainability,
 * performance, and separation of concerns.
 */

"use client";

import React, { useState, useCallback } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { TaskLoadingState, TaskErrorState } from "@/components/task-management";

// Internal imports
import { MinimalTaskManagementProps } from "./types";
import { useTaskSelection, useTaskOperations, useFilteredTaskGroups } from "./hooks";
import { TaskManagementContent } from "./components";

export function MinimalTaskManagement({
  teamMembers,
  clients,
  currentUser,
}: MinimalTaskManagementProps) {
  // Data fetching
  const { data: tasks = [], isLoading, error } = useTasks();
  
  // Filter management
  const filters = useTaskFilters();
  const filteredTasks = useFilteredTasks(tasks, filters);
  
  // UI state
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  // Task selection management
  const {
    selectedTasks,
    deletingTasks,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    markTasksAsDeleting,
    unmarkTasksAsDeleting,
  } = useTaskSelection();
  
  // Task operations
  const {
    isCreating,
    isUpdatingStatus,
    isUpdatingPriority,
    isUpdatingAssignment,
    handleCreateTask,
    handleTaskStatusUpdate,
    handleTaskAssignment,
    handleTaskPriorityUpdate,
    handleDeleteTask,
    handleBulkDelete,
  } = useTaskOperations({
    tasks,
    selectedTasks,
    onTaskCreated: () => setIsCreatingTask(false),
    onBulkDeleteComplete: clearSelection,
    markTasksAsDeleting,
    unmarkTasksAsDeleting,
  });
  
  // Filtered task groups
  const { filteredTaskGroups, filteredClientGroups, filteredAssigneeGroups } =
    useFilteredTaskGroups({
      tasks,
      filteredTasks,
      teamMembers,
    });

  // Callbacks
  const handleSelectAll = useCallback(() => {
    selectAllTasks(filteredTasks);
  }, [selectAllTasks, filteredTasks]);

  // Loading state
  if (isLoading) {
    return <TaskLoadingState />;
  }

  // Error state
  if (error) {
    return <TaskErrorState />;
  }

  return (
    <TaskManagementContent
      tasks={tasks}
      filteredTasks={filteredTasks}
      teamMembers={teamMembers}
      clients={clients}
      filters={filters}
      isCreatingTask={isCreatingTask}
      selectedTasks={selectedTasks}
      deletingTasks={deletingTasks}
      filteredTaskGroups={filteredTaskGroups}
      filteredClientGroups={filteredClientGroups}
      filteredAssigneeGroups={filteredAssigneeGroups}
      isCreating={isCreating}
      isUpdatingStatus={isUpdatingStatus}
      isUpdatingPriority={isUpdatingPriority}
      isUpdatingAssignment={isUpdatingAssignment}
      onCreateClick={() => setIsCreatingTask(true)}
      onCreateClose={() => setIsCreatingTask(false)}
      onCreateSubmit={handleCreateTask}
      onSelectAll={handleSelectAll}
      onClearSelection={clearSelection}
      onBulkDelete={handleBulkDelete}
      onToggleSelect={toggleTaskSelection}
      onStatusUpdate={handleTaskStatusUpdate}
      onPriorityUpdate={handleTaskPriorityUpdate}
      onAssignmentUpdate={handleTaskAssignment}
      onDelete={handleDeleteTask}
    />
  );
}