/**
 * Utility functions for MinimalTaskManagement
 */

import { ClientTask } from '@/types';
import { TaskGroup } from './types';

/**
 * Filters task groups based on filtered tasks
 */
export function filterTaskGroups<T extends { tasks: ClientTask[] }>(
  groups: T[],
  filteredTasks: ClientTask[]
): (T & { count: number })[] {
  const filteredTaskIds = new Set(filteredTasks.map(task => task.id));
  
  return groups
    .map(group => {
      const filteredGroupTasks = group.tasks.filter(task => 
        filteredTaskIds.has(task.id)
      );
      
      return {
        ...group,
        tasks: filteredGroupTasks,
        count: filteredGroupTasks.length,
      };
    })
    .filter(group => group.count > 0);
}

/**
 * Extracts task names from task IDs
 */
export function getTaskNamesByIds(
  taskIds: string[],
  tasks: ClientTask[]
): string {
  const taskMap = new Map(tasks.map(task => [task.id, task.name]));
  
  return taskIds
    .map(id => taskMap.get(id) || 'Unknown')
    .join(', ');
}

/**
 * Calculates task statistics
 */
export function calculateTaskStats(tasks: ClientTask[]) {
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const totalCount = tasks.length;
  
  return {
    completedCount,
    totalCount,
    completionPercentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
  };
}