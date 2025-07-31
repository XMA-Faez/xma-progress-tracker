/**
 * Main content component for task management
 * Handles the display logic and composition of sub-components
 */

import React, { memo } from 'react';
import { TeamMember, ClientTask } from '@/types';
import {
  TaskHeader,
  TaskFilters,
  CreateTaskForm,
  BulkActions,
  DEFAULT_NEW_TASK,
} from '@/components/task-management';
import { TaskViewGroups } from './TaskViewGroups';
import { Client } from '../types';
import { calculateTaskStats } from '../utils';

interface TaskManagementContentProps {
  // Data
  tasks: ClientTask[];
  filteredTasks: ClientTask[];
  teamMembers: TeamMember[];
  clients: Client[];
  
  // Filter state
  filters: any; // Type from useTaskFilters hook
  
  // UI state
  isCreatingTask: boolean;
  selectedTasks: string[];
  deletingTasks: string[];
  
  // Task groups
  filteredTaskGroups: any[];
  filteredClientGroups: any[];
  filteredAssigneeGroups: any[];
  
  // Loading states
  isCreating: boolean;
  isUpdatingStatus: boolean;
  isUpdatingPriority: boolean;
  isUpdatingAssignment: boolean;
  
  // Callbacks
  onCreateClick: () => void;
  onCreateClose: () => void;
  onCreateSubmit: (task: typeof DEFAULT_NEW_TASK) => Promise<void>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onToggleSelect: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: any) => void;
  onPriorityUpdate: (taskId: string, priority: any) => void;
  onAssignmentUpdate: (taskId: string, memberIds: string[]) => void;
  onDelete: (taskId: string, taskName: string) => void;
}

export const TaskManagementContent = memo(function TaskManagementContent({
  tasks,
  filteredTasks,
  teamMembers,
  clients,
  filters,
  isCreatingTask,
  selectedTasks,
  deletingTasks,
  filteredTaskGroups,
  filteredClientGroups,
  filteredAssigneeGroups,
  isCreating,
  isUpdatingStatus,
  isUpdatingPriority,
  isUpdatingAssignment,
  onCreateClick,
  onCreateClose,
  onCreateSubmit,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onToggleSelect,
  onStatusUpdate,
  onPriorityUpdate,
  onAssignmentUpdate,
  onDelete,
}: TaskManagementContentProps) {
  const { completedCount, totalCount } = calculateTaskStats(filteredTasks);

  return (
    <div className="space-y-6" data-admin-page>
      {/* Header */}
      <TaskHeader
        totalTasks={totalCount}
        completedTasks={completedCount}
        isCreating={isCreating}
        onCreateClick={onCreateClick}
      />

      {/* Filters */}
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

      {/* Create Task Form */}
      {isCreatingTask && (
        <CreateTaskForm
          teamMembers={teamMembers}
          clients={clients}
          isCreating={isCreating}
          onClose={onCreateClose}
          onSubmit={onCreateSubmit}
        />
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedTasks.length}
        totalCount={filteredTasks.length}
        isDeletingTasks={deletingTasks.length > 0}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        onBulkDelete={onBulkDelete}
      />

      {/* Task Display */}
      <TaskViewGroups
        viewMode={filters.viewMode}
        filteredTaskGroups={filteredTaskGroups}
        filteredClientGroups={filteredClientGroups}
        filteredAssigneeGroups={filteredAssigneeGroups}
        teamMembers={teamMembers}
        selectedTasks={selectedTasks}
        deletingTasks={deletingTasks}
        onToggleSelect={onToggleSelect}
        onStatusUpdate={onStatusUpdate}
        onPriorityUpdate={onPriorityUpdate}
        onAssignmentUpdate={onAssignmentUpdate}
        onDelete={onDelete}
        isUpdatingStatus={isUpdatingStatus}
        isUpdatingPriority={isUpdatingPriority}
        isUpdatingAssignment={isUpdatingAssignment}
      />
    </div>
  );
});