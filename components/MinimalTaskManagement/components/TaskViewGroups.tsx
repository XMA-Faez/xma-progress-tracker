/**
 * Component for rendering task groups based on view mode
 */

import React, { memo } from 'react';
import { TeamMember } from '@/types';
import { TaskGroup, getStageDisplayName } from '@/components/task-management';
import { VIEW_MODES, TASK_ICONS } from '../constants';
import { TaskGroup as TaskGroupType } from '../types';

interface TaskViewGroupsProps {
  viewMode: string;
  filteredTaskGroups: TaskGroupType[];
  filteredClientGroups: TaskGroupType[];
  filteredAssigneeGroups: TaskGroupType[];
  teamMembers: TeamMember[];
  selectedTasks: string[];
  deletingTasks: string[];
  onToggleSelect: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: any) => void;
  onPriorityUpdate: (taskId: string, priority: any) => void;
  onAssignmentUpdate: (taskId: string, memberIds: string[]) => void;
  onDelete: (taskId: string, taskName: string) => void;
  isUpdatingStatus: boolean;
  isUpdatingPriority: boolean;
  isUpdatingAssignment: boolean;
}

export const TaskViewGroups = memo(function TaskViewGroups({
  viewMode,
  filteredTaskGroups,
  filteredClientGroups,
  filteredAssigneeGroups,
  teamMembers,
  selectedTasks,
  deletingTasks,
  onToggleSelect,
  onStatusUpdate,
  onPriorityUpdate,
  onAssignmentUpdate,
  onDelete,
  isUpdatingStatus,
  isUpdatingPriority,
  isUpdatingAssignment,
}: TaskViewGroupsProps) {
  // Common props for TaskGroup component
  const getCommonGroupProps = () => ({
    teamMembers,
    selectedTasks,
    deletingTasks,
    onToggleSelect,
    onStatusUpdate,
    onPriorityUpdate,
    onAssignmentUpdate,
    onDelete,
    isUpdatingStatus,
    isUpdatingPriority,
    isUpdatingAssignment,
  });

  return (
    <div className="space-y-4">
      {viewMode === VIEW_MODES.TASKS &&
        filteredTaskGroups.map((group) => (
          <TaskGroup
            key={group.name}
            title={getStageDisplayName(group.name)}
            tasks={group.tasks}
            count={group.count}
            showClient={true}
            {...getCommonGroupProps()}
          />
        ))}

      {viewMode === VIEW_MODES.CLIENTS &&
        filteredClientGroups.map((group) => (
          <TaskGroup
            key={group.id}
            title={group.name}
            icon={group.name === 'Internal Tasks' ? TASK_ICONS.INTERNAL : TASK_ICONS.CLIENT}
            tasks={group.tasks}
            count={group.count}
            showClient={false}
            {...getCommonGroupProps()}
          />
        ))}

      {viewMode === VIEW_MODES.ASSIGNEES &&
        filteredAssigneeGroups.map((group) => (
          <TaskGroup
            key={group.id}
            title={group.name}
            icon={group.name === 'Unassigned' ? TASK_ICONS.UNASSIGNED : TASK_ICONS.ASSIGNED}
            tasks={group.tasks}
            count={group.count}
            showClient={true}
            {...getCommonGroupProps()}
          />
        ))}
    </div>
  );
});