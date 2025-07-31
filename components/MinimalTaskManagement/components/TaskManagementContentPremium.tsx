/**
 * Premium Enhanced TaskManagementContent Component
 * 
 * Refactored to eliminate prop drilling by using Context API.
 * Now has ZERO props and gets all data from context, making it much cleaner and more maintainable.
 */

import React, { memo } from 'react';
import {
  TaskHeader,
  TaskFilters,
  CreateTaskForm,
  BulkActions,
} from '@/components/task-management';
import { TaskViewGroupsPremium } from './TaskViewGroupsPremium';
import { useTaskManagement } from '../hooks/useTaskManagement';

/**
 * Premium Header Section - Uses context to get data
 */
const TaskHeaderPremium = memo(function TaskHeaderPremium() {
  const { 
    completedTasksCount, 
    totalTasksCount, 
    isCreating, 
    openCreateTaskModal 
  } = useTaskManagement();

  return (
    <div className="task-header-premium">
      <TaskHeader
        totalTasks={totalTasksCount}
        completedTasks={completedTasksCount}
        isCreating={isCreating}
        onCreateClick={openCreateTaskModal}
      />
    </div>
  );
});

/**
 * Premium Filters Section - Uses context to get data
 */
const TaskFiltersPremium = memo(function TaskFiltersPremium() {
  const { filters, teamMembers, clients } = useTaskManagement();

  return (
    <div className="task-filters-premium">
      <TaskFilters
        filters={filters}
        teamMembers={teamMembers}
        clients={clients}
        onSearchChange={filters.updateSearchTerm}
        onStatusChange={filters.updateFilterStatus}
        onCategoryChange={filters.updateFilterCategory}
        onClientChange={filters.updateFilterClient}
        onAssigneeChange={filters.updateFilterAssignee}
        onPriorityChange={filters.updateFilterPriority}
        onViewModeChange={filters.updateViewMode}
        onShowCompletedChange={filters.updateShowCompleted}
        onShowAdvancedFiltersChange={filters.updateShowAdvancedFilters}
      />
    </div>
  );
});

/**
 * Premium Create Task Form Section - Uses context to get data
 */
const CreateTaskFormPremium = memo(function CreateTaskFormPremium() {
  const { 
    isCreatingTask, 
    teamMembers, 
    clients, 
    isCreating, 
    closeCreateTaskModal,
    createTask
  } = useTaskManagement();

  if (!isCreatingTask) return null;

  return (
    <CreateTaskForm
      teamMembers={teamMembers}
      clients={clients}
      isCreating={isCreating}
      onClose={closeCreateTaskModal}
      onSubmit={createTask}
    />
  );
});

/**
 * Premium Bulk Actions Section - Uses context to get data
 */
const BulkActionsPremium = memo(function BulkActionsPremium() {
  const { 
    selectedCount,
    totalFilteredCount,
    isDeletingTasks,
    selectAllTasks,
    clearSelection,
    bulkDeleteTasks
  } = useTaskManagement();

  return (
    <div className="">
      <BulkActions
        selectedCount={selectedCount}
        totalCount={totalFilteredCount}
        isDeletingTasks={isDeletingTasks}
        onSelectAll={selectAllTasks}
        onClearSelection={clearSelection}
        onBulkDelete={bulkDeleteTasks}
      />
    </div>
  );
});

/**
 * Premium Task Display Section - Uses context to get data
 */
const TaskDisplayPremium = memo(function TaskDisplayPremium() {
  const {
    filters,
    filteredTaskGroups,
    filteredClientGroups,
    filteredAssigneeGroups,
    teamMembers,
    selectedTasks,
    deletingTasks,
    toggleTaskSelection,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskAssignment,
    deleteTask,
    isUpdatingStatus,
    isUpdatingPriority,
    isUpdatingAssignment,
  } = useTaskManagement();

  return (
    <TaskViewGroupsPremium
      viewMode={filters.viewMode}
      filteredTaskGroups={filteredTaskGroups}
      filteredClientGroups={filteredClientGroups}
      filteredAssigneeGroups={filteredAssigneeGroups}
      teamMembers={teamMembers}
      selectedTasks={selectedTasks}
      deletingTasks={deletingTasks}
      onToggleSelect={toggleTaskSelection}
      onStatusUpdate={updateTaskStatus}
      onPriorityUpdate={updateTaskPriority}
      onAssignmentUpdate={updateTaskAssignment}
      onDelete={deleteTask}
      isUpdatingStatus={isUpdatingStatus}
      isUpdatingPriority={isUpdatingPriority}
      isUpdatingAssignment={isUpdatingAssignment}
    />
  );
});

/**
 * Main TaskManagementContentPremium Component
 * 
 * Now completely prop-free! All data comes from context.
 * This demonstrates the power of the Context API for eliminating prop drilling.
 */
export const TaskManagementContentPremium = memo(function TaskManagementContentPremium() {
  return (
    <div className="space-y-8" data-admin-page>
      {/* Premium Header */}
      <TaskHeaderPremium />

      {/* Premium Filters */}
      <TaskFiltersPremium />

      {/* Premium Create Task Form */}
      <CreateTaskFormPremium />

      {/* Premium Bulk Actions */}
      <BulkActionsPremium />

      {/* Premium Task Display */}
      <TaskDisplayPremium />
    </div>
  );
});
