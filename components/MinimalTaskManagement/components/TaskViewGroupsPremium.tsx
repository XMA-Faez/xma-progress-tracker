/**
 * Premium Enhanced TaskViewGroups Component
 * Renders task groups with premium styling and animations
 */

import React, { memo } from 'react';
import { TeamMember } from '@/types';
import { getStageDisplayName } from '@/components/task-management';
import { STAGE_CONFIG } from '@/components/task-management/constants';
import { TaskGroupPremium } from './TaskGroupPremium';
import { VIEW_MODES, TASK_ICONS } from '../constants';
import { TaskGroup as TaskGroupType } from '../types';

interface TaskViewGroupsPremiumProps {
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

export const TaskViewGroupsPremium = memo(function TaskViewGroupsPremium({
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
}: TaskViewGroupsPremiumProps) {
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
    <div className="space-y-6">
      {viewMode === VIEW_MODES.TASKS &&
        filteredTaskGroups.map((group, index) => {
          const stageIcon = STAGE_CONFIG[group.name as keyof typeof STAGE_CONFIG]?.icon;
          return (
            <div key={group.name} className="task-group-premium" style={{ animationDelay: `${index * 0.1}s` }}>
              <TaskGroupPremium
                title={getStageDisplayName(group.name)}
                icon={stageIcon}
                tasks={group.tasks}
                count={group.count}
                showClient={true}
                {...getCommonGroupProps()}
              />
            </div>
          );
        })}

      {viewMode === VIEW_MODES.CLIENTS &&
        filteredClientGroups.map((group, index) => {
          const clientIcon = group.name === 'Internal Tasks' ? TASK_ICONS.INTERNAL : TASK_ICONS.CLIENT;
          return (
            <div key={group.id} className="task-group-premium" style={{ animationDelay: `${index * 0.1}s` }}>
              <TaskGroupPremium
                title={group.name}
                icon={clientIcon}
                tasks={group.tasks}
                count={group.count}
                showClient={false}
                {...getCommonGroupProps()}
              />
            </div>
          );
        })}

      {viewMode === VIEW_MODES.ASSIGNEES &&
        filteredAssigneeGroups.map((group, index) => {
          const assigneeIcon = group.name === 'Unassigned' ? TASK_ICONS.UNASSIGNED : TASK_ICONS.ASSIGNED;
          return (
            <div key={group.id} className="task-group-premium" style={{ animationDelay: `${index * 0.1}s` }}>
              <TaskGroupPremium
                title={group.name}
                icon={assigneeIcon}
                tasks={group.tasks}
                count={group.count}
                showClient={true}
                {...getCommonGroupProps()}
              />
            </div>
          );
        })}
    </div>
  );
});