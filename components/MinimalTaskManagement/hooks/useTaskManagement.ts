/**
 * useTaskManagement - Consolidated hook for task management operations
 * 
 * This hook provides a unified API for accessing all task management functionality,
 * eliminating the need to import multiple context hooks and simplifying component logic.
 */

import { useCallback } from 'react';
import {
  useTaskData,
  useTaskFilters,
  useTaskSelection,
  useTaskOperations,
  useTaskUI,
  useTaskComputed,
} from '../context/TaskManagementContext';

/**
 * Main task management hook that consolidates all task-related functionality
 * 
 * @returns Comprehensive task management interface with all operations and state
 */
export function useTaskManagement() {
  // Get all context values
  const dataContext = useTaskData();
  const filterContext = useTaskFilters();
  const selectionContext = useTaskSelection();
  const operationsContext = useTaskOperations();
  const uiContext = useTaskUI();
  const computedContext = useTaskComputed();

  // Create consolidated selection handlers that work with filtered tasks
  const handleSelectAll = useCallback(() => {
    selectionContext.selectAllTasks(dataContext.filteredTasks);
  }, [selectionContext.selectAllTasks, dataContext.filteredTasks]);

  const handleCreateTask = useCallback(async (task: Parameters<typeof operationsContext.handleCreateTask>[0]) => {
    await operationsContext.handleCreateTask(task);
  }, [operationsContext.handleCreateTask]);

  // Return consolidated interface
  return {
    // ============================================================================
    // Data & State
    // ============================================================================
    
    // Core data
    tasks: dataContext.tasks,
    filteredTasks: dataContext.filteredTasks,
    teamMembers: dataContext.teamMembers,
    clients: dataContext.clients,
    
    // Loading states
    isLoading: dataContext.isLoading,
    error: dataContext.error,
    isCreating: operationsContext.isCreating,
    isUpdatingStatus: operationsContext.isUpdatingStatus,
    isUpdatingPriority: operationsContext.isUpdatingPriority,
    isUpdatingAssignment: operationsContext.isUpdatingAssignment,
    
    // UI state
    isCreatingTask: uiContext.isCreatingTask,
    
    // Selection state
    selectedTasks: selectionContext.selectedTasks,
    deletingTasks: selectionContext.deletingTasks,
    
    // Filter state
    filters: filterContext.filters,
    
    // Computed data
    filteredTaskGroups: computedContext.filteredTaskGroups,
    filteredClientGroups: computedContext.filteredClientGroups,
    filteredAssigneeGroups: computedContext.filteredAssigneeGroups,

    // ============================================================================
    // Operations
    // ============================================================================
    
    // Task CRUD operations
    createTask: handleCreateTask,
    updateTaskStatus: operationsContext.handleTaskStatusUpdate,
    updateTaskPriority: operationsContext.handleTaskPriorityUpdate,
    updateTaskAssignment: operationsContext.handleTaskAssignment,
    deleteTask: operationsContext.handleDeleteTask,
    bulkDeleteTasks: operationsContext.handleBulkDelete,
    
    // Selection operations
    toggleTaskSelection: selectionContext.toggleTaskSelection,
    selectAllTasks: handleSelectAll,
    clearSelection: selectionContext.clearSelection,
    
    // UI operations
    setIsCreatingTask: uiContext.setIsCreatingTask,
    openCreateTaskModal: () => uiContext.setIsCreatingTask(true),
    closeCreateTaskModal: () => uiContext.setIsCreatingTask(false),

    // ============================================================================
    // Computed Values
    // ============================================================================
    
    // Selection stats
    selectedCount: selectionContext.selectedTasks.length,
    totalFilteredCount: dataContext.filteredTasks.length,
    hasSelectedTasks: selectionContext.selectedTasks.length > 0,
    isDeletingTasks: selectionContext.deletingTasks.length > 0,
    
    // Task stats
    completedTasksCount: dataContext.filteredTasks.filter(task => task.status === 'completed').length,
    totalTasksCount: dataContext.filteredTasks.length,
  };
}

/**
 * Specialized hooks for specific domains (optional, for components that only need specific functionality)
 */

/**
 * Hook for components that only need task data
 */
export function useTaskDataOnly() {
  const { tasks, filteredTasks, teamMembers, clients, isLoading, error } = useTaskData();
  
  return {
    tasks,
    filteredTasks,
    teamMembers,
    clients,
    isLoading,
    error,
  };
}

/**
 * Hook for components that only need selection functionality
 */
export function useTaskSelectionOnly() {
  const selectionContext = useTaskSelection();
  const { filteredTasks } = useTaskData();
  
  const handleSelectAll = useCallback(() => {
    selectionContext.selectAllTasks(filteredTasks);
  }, [selectionContext.selectAllTasks, filteredTasks]);
  
  return {
    selectedTasks: selectionContext.selectedTasks,
    deletingTasks: selectionContext.deletingTasks,
    toggleTaskSelection: selectionContext.toggleTaskSelection,
    selectAllTasks: handleSelectAll,
    clearSelection: selectionContext.clearSelection,
    selectedCount: selectionContext.selectedTasks.length,
    hasSelectedTasks: selectionContext.selectedTasks.length > 0,
    isDeletingTasks: selectionContext.deletingTasks.length > 0,
  };
}

/**
 * Hook for components that only need filter functionality
 */
export function useTaskFiltersOnly() {
  const { filters } = useTaskFilters();
  
  return {
    filters,
    searchTerm: filters.searchTerm,
    viewMode: filters.viewMode,
    showCompleted: filters.showCompleted,
    showAdvancedFilters: filters.showAdvancedFilters,
  };
}

/**
 * Hook for components that only need operations
 */
export function useTaskOperationsOnly() {
  const operationsContext = useTaskOperations();
  
  return {
    // Loading states
    isCreating: operationsContext.isCreating,
    isUpdatingStatus: operationsContext.isUpdatingStatus,
    isUpdatingPriority: operationsContext.isUpdatingPriority,
    isUpdatingAssignment: operationsContext.isUpdatingAssignment,
    
    // Operations
    createTask: operationsContext.handleCreateTask,
    updateTaskStatus: operationsContext.handleTaskStatusUpdate,
    updateTaskPriority: operationsContext.handleTaskPriorityUpdate,
    updateTaskAssignment: operationsContext.handleTaskAssignment,
    deleteTask: operationsContext.handleDeleteTask,
    bulkDeleteTasks: operationsContext.handleBulkDelete,
  };
}