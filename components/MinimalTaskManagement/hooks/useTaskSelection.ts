/**
 * Custom hook for managing task selection state
 */

import { useState, useCallback } from 'react';
import { ClientTask } from '@/types';

export function useTaskSelection() {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [deletingTasks, setDeletingTasks] = useState<string[]>([]);

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  }, []);

  const selectAllTasks = useCallback((tasks: ClientTask[]) => {
    const allTaskIds = tasks.map(task => task.id);
    setSelectedTasks(allTaskIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  const markTasksAsDeleting = useCallback((taskIds: string[]) => {
    setDeletingTasks(prev => [...prev, ...taskIds]);
  }, []);

  const unmarkTasksAsDeleting = useCallback((taskIds: string[]) => {
    setDeletingTasks(prev => prev.filter(id => !taskIds.includes(id)));
  }, []);

  return {
    selectedTasks,
    deletingTasks,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    markTasksAsDeleting,
    unmarkTasksAsDeleting,
  };
}