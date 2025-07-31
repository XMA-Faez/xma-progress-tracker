/**
 * Custom hook for task operations (CRUD operations)
 */

import { useCallback } from 'react';
import { TaskStatus, TaskPriority, ClientTask } from '@/types';
import {
  useCreateTask,
  useUpdateTaskStatus,
  useUpdateTaskAssignment,
  useUpdateTaskPriority,
  useDeleteTask,
} from '@/hooks/useTasks';
import { MESSAGES } from '../constants';
import { DEFAULT_NEW_TASK } from '@/components/task-management';

interface UseTaskOperationsProps {
  tasks: ClientTask[];
  selectedTasks: string[];
  onTaskCreated?: () => void;
  onTaskDeleted?: (taskId: string) => void;
  onBulkDeleteComplete?: () => void;
  markTasksAsDeleting: (taskIds: string[]) => void;
  unmarkTasksAsDeleting: (taskIds: string[]) => void;
}

export function useTaskOperations({
  tasks,
  selectedTasks,
  onTaskCreated,
  onTaskDeleted,
  onBulkDeleteComplete,
  markTasksAsDeleting,
  unmarkTasksAsDeleting,
}: UseTaskOperationsProps) {
  // Mutations
  const createTaskMutation = useCreateTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const updateAssignmentMutation = useUpdateTaskAssignment();
  const updatePriorityMutation = useUpdateTaskPriority();
  const deleteTaskMutation = useDeleteTask();

  // Create task handler
  const handleCreateTask = useCallback(
    async (newTask: typeof DEFAULT_NEW_TASK) => {
      createTaskMutation.mutate(newTask, {
        onSuccess: () => {
          onTaskCreated?.();
        },
        onError: (error) => {
          console.error('Error creating task:', error);
          alert(MESSAGES.CREATE_TASK_ERROR);
        },
      });
    },
    [createTaskMutation, onTaskCreated]
  );

  // Update handlers
  const handleTaskStatusUpdate = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      updateStatusMutation.mutate({ taskId, status: newStatus });
    },
    [updateStatusMutation]
  );

  const handleTaskAssignment = useCallback(
    (taskId: string, memberIds: string[]) => {
      updateAssignmentMutation.mutate({ taskId, memberIds });
    },
    [updateAssignmentMutation]
  );

  const handleTaskPriorityUpdate = useCallback(
    (taskId: string, priority: TaskPriority) => {
      updatePriorityMutation.mutate({ taskId, priority });
    },
    [updatePriorityMutation]
  );

  // Delete handlers
  const handleDeleteTask = useCallback(
    (taskId: string, taskName: string) => {
      if (confirm(MESSAGES.DELETE_TASK_CONFIRM(taskName))) {
        markTasksAsDeleting([taskId]);
        
        deleteTaskMutation.mutate(taskId, {
          onSuccess: () => {
            unmarkTasksAsDeleting([taskId]);
            onTaskDeleted?.(taskId);
          },
          onError: (error) => {
            console.error('Error deleting task:', error);
            alert(MESSAGES.DELETE_TASK_ERROR);
            unmarkTasksAsDeleting([taskId]);
          },
        });
      }
    },
    [deleteTaskMutation, markTasksAsDeleting, unmarkTasksAsDeleting, onTaskDeleted]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedTasks.length === 0) return;

    const taskNames = selectedTasks
      .map(id => tasks.find(t => t.id === id)?.name || 'Unknown')
      .join(', ');

    if (confirm(MESSAGES.DELETE_TASKS_CONFIRM(selectedTasks.length, taskNames))) {
      markTasksAsDeleting(selectedTasks);

      // Delete tasks one by one
      Promise.all(
        selectedTasks.map(taskId =>
          new Promise((resolve, reject) => {
            deleteTaskMutation.mutate(taskId, {
              onSuccess: () => {
                unmarkTasksAsDeleting([taskId]);
                resolve(taskId);
              },
              onError: (error) => {
                console.error('Error deleting task:', error);
                unmarkTasksAsDeleting([taskId]);
                reject(error);
              },
            });
          })
        )
      ).then(() => {
        onBulkDeleteComplete?.();
      }).catch(() => {
        alert('Some tasks failed to delete. Please try again.');
      });
    }
  }, [
    selectedTasks,
    tasks,
    deleteTaskMutation,
    markTasksAsDeleting,
    unmarkTasksAsDeleting,
    onBulkDeleteComplete,
  ]);

  return {
    // Mutations state
    isCreating: createTaskMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdatingPriority: updatePriorityMutation.isPending,
    isUpdatingAssignment: updateAssignmentMutation.isPending,
    
    // Handlers
    handleCreateTask,
    handleTaskStatusUpdate,
    handleTaskAssignment,
    handleTaskPriorityUpdate,
    handleDeleteTask,
    handleBulkDelete,
  };
}