/**
 * Premium Enhanced MinimalTaskManagement Component
 * 
 * This wrapper adds premium visual enhancements to the MinimalTaskManagement component
 * including sophisticated animations, glass-morphism effects, and luxury styling
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
import { TaskManagementContentPremium } from "./components";
import "./MinimalTaskManagement.premium.css";

export function MinimalTaskManagementPremium({
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

  // Loading state with premium styling
  if (isLoading) {
    return (
      <div className="minimal-task-management-premium">
        <div className="loading-shimmer h-32 rounded-xl mb-6"></div>
        <div className="loading-shimmer h-24 rounded-lg mb-6"></div>
        <div className="space-y-4">
          <div className="loading-shimmer h-48 rounded-lg"></div>
          <div className="loading-shimmer h-48 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Error state with premium styling
  if (error) {
    return (
      <div className="minimal-task-management-premium">
        <div className="glass-card-primary rounded-xl p-8 text-center">
          <TaskErrorState />
        </div>
      </div>
    );
  }

  return (
    <div className="minimal-task-management-premium">
      <TaskManagementContentPremium
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
    </div>
  );
}

// Export enhanced version as default for easy adoption
export default MinimalTaskManagementPremium;