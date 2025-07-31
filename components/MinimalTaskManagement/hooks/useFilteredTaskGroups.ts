/**
 * Custom hook for managing filtered task groups
 */

import { useMemo } from 'react';
import { ClientTask, TeamMember } from '@/types';
import { useTaskGroups, useClientGroups, useAssigneeGroups } from '@/hooks/useTaskGroups';
import { filterTaskGroups } from '../utils';

interface UseFilteredTaskGroupsProps {
  tasks: ClientTask[];
  filteredTasks: ClientTask[];
  teamMembers: TeamMember[];
}

export function useFilteredTaskGroups({
  tasks,
  filteredTasks,
  teamMembers,
}: UseFilteredTaskGroupsProps) {
  // Get base groups
  const taskGroups = useTaskGroups(tasks);
  const clientGroups = useClientGroups(tasks);
  const assigneeGroups = useAssigneeGroups(tasks, teamMembers);

  // Memoize filtered groups
  const filteredTaskGroups = useMemo(
    () => filterTaskGroups(taskGroups, filteredTasks),
    [taskGroups, filteredTasks]
  );

  const filteredClientGroups = useMemo(
    () => filterTaskGroups(clientGroups, filteredTasks),
    [clientGroups, filteredTasks]
  );

  const filteredAssigneeGroups = useMemo(
    () => filterTaskGroups(assigneeGroups, filteredTasks),
    [assigneeGroups, filteredTasks]
  );

  return {
    filteredTaskGroups,
    filteredClientGroups,
    filteredAssigneeGroups,
  };
}