/**
 * Premium Enhanced TaskManagementContent Component
 * Applies premium styling classes to all sub-components
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
import { TaskViewGroupsPremium } from './TaskViewGroupsPremium';
import { Client } from '../types';
import { calculateTaskStats } from '../utils';

interface TaskManagementContentPremiumProps {
  // Data
  tasks: ClientTask[];
  filteredTasks: ClientTask[];
  teamMembers: TeamMember[];
  clients: Client[];
  
  // Filter state
  filters: any;
  
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

export const TaskManagementContentPremium = memo(function TaskManagementContentPremium({
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
}: TaskManagementContentPremiumProps) {
  const { completedCount, totalCount } = calculateTaskStats(filteredTasks);

  return (
    <div className="space-y-8" data-admin-page>
      {/* Premium Header */}
      <div className="task-header-premium">
        <TaskHeader
          totalTasks={totalCount}
          completedTasks={completedCount}
          isCreating={isCreating}
          onCreateClick={onCreateClick}
        />
      </div>

      {/* Premium Filters */}
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

      {/* Premium Create Task Form */}
      {isCreatingTask && (
          <CreateTaskForm
            teamMembers={teamMembers}
            clients={clients}
            isCreating={isCreating}
            onClose={onCreateClose}
            onSubmit={onCreateSubmit}
          />
      )}

      {/* Premium Bulk Actions */}
      <div className="">
        <BulkActions
          selectedCount={selectedTasks.length}
          totalCount={filteredTasks.length}
          isDeletingTasks={deletingTasks.length > 0}
          onSelectAll={onSelectAll}
          onClearSelection={onClearSelection}
          onBulkDelete={onBulkDelete}
        />
      </div>

      {/* Premium Task Display */}
      <TaskViewGroupsPremium
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
