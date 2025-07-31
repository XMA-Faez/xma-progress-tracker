import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { ClientTask, TaskStatus, TaskPriority, TaskCategory } from '@/types'

const supabase = createClient()

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// Fetch all tasks
export function useTasks() {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: async (): Promise<ClientTask[]> => {
      const { data, error } = await supabase
        .from('client_tasks')
        .select(`
          *,
          clients (id, name),
          task_assignments (
            team_member_id,
            team_members (id, name, role)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTask: {
      name: string
      description: string
      client_id: string
      type: string
      stage: string
      priority: TaskPriority
      due_date: string
      assigned_to: string[]
      task_category: TaskCategory
    }) => {
      // Get current tasks for order calculation
      const currentTasks = queryClient.getQueryData<ClientTask[]>(taskKeys.lists()) || []
      const maxOrder = Math.max(...currentTasks.map(t => t.order_index), 0)
      const nextTouchpoint = Math.max(...currentTasks.map(t => t.touchpoint), 0) + 1

      // Create the task
      const { data: createdTask, error: taskError } = await supabase
        .from('client_tasks')
        .insert({
          name: newTask.name,
          description: newTask.description,
          client_id: newTask.client_id || null,
          type: newTask.type,
          stage: newTask.stage,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          status: 'not_started' as TaskStatus,
          completed: false,
          order_index: maxOrder + 1,
          touchpoint: nextTouchpoint,
          task_category: newTask.task_category
        })
        .select(`
          *,
          clients (id, name)
        `)
        .single()

      if (taskError) throw taskError

      // Create task assignments
      if (newTask.assigned_to.length > 0) {
        const assignments = newTask.assigned_to.map(memberId => ({
          task_id: createdTask.id,
          team_member_id: memberId
        }))

        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments)

        if (assignmentError) throw assignmentError

        // Add assignment info to the created task
        createdTask.task_assignments = assignments.map(a => ({
          team_member_id: a.team_member_id,
          team_members: null // Will be populated by refetch
        }))
      }

      return createdTask
    },
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<ClientTask[]>(taskKeys.lists())

      // Optimistically update
      const optimisticTask: ClientTask = {
        id: `temp-${Date.now()}`,
        name: newTask.name,
        description: newTask.description,
        client_id: newTask.client_id || null,
        type: newTask.type as any,
        stage: newTask.stage as any,
        priority: newTask.priority,
        due_date: newTask.due_date || undefined,
        status: 'not_started',
        completed: false,
        order_index: Math.max(...(previousTasks?.map(t => t.order_index) || [0]), 0) + 1,
        touchpoint: Math.max(...(previousTasks?.map(t => t.touchpoint) || [0]), 0) + 1,
        task_category: newTask.task_category,
        clients: newTask.client_id ? { id: newTask.client_id, name: 'Loading...' } : undefined,
        task_assignments: []
      } as ClientTask

      queryClient.setQueryData<ClientTask[]>(taskKeys.lists(), old => 
        old ? [optimisticTask, ...old] : [optimisticTask]
      )

      return { previousTasks }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Update task status mutation
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const { error } = await supabase
        .from('client_tasks')
        .update({ 
          status,
          completed: status === 'completed',
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)

      if (error) throw error
      return { taskId, status }
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData<ClientTask[]>(taskKeys.lists())

      // Optimistically update
      queryClient.setQueryData<ClientTask[]>(taskKeys.lists(), old =>
        old?.map(task =>
          task.id === taskId
            ? { ...task, status, completed: status === 'completed' }
            : task
        ) || []
      )

      return { previousTasks }
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Update task assignment mutation
export function useUpdateTaskAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, memberIds }: { taskId: string; memberIds: string[] }) => {
      // Delete existing assignments
      await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId)

      // Create new assignments
      if (memberIds.length > 0) {
        const assignments = memberIds.map(memberId => ({
          task_id: taskId,
          team_member_id: memberId
        }))

        const { error } = await supabase
          .from('task_assignments')
          .insert(assignments)

        if (error) throw error
      }

      return { taskId, memberIds }
    },
    onMutate: async ({ taskId, memberIds }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData<ClientTask[]>(taskKeys.lists())

      // Optimistically update
      queryClient.setQueryData<ClientTask[]>(taskKeys.lists(), old =>
        old?.map(task =>
          task.id === taskId
            ? {
                ...task,
                task_assignments: memberIds.map(memberId => ({
                  team_member_id: memberId,
                  team_members: undefined // Will be populated by refetch
                }))
              }
            : task
        ) || []
      )

      return { previousTasks }
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Update task priority mutation
export function useUpdateTaskPriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, priority }: { taskId: string; priority: TaskPriority }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ priority })
        .eq('id', taskId)

      if (error) throw error
    },
    onMutate: async ({ taskId, priority }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Optimistically update to the new value
      queryClient.setQueryData(taskKeys.lists(), (old: ClientTask[] | undefined) => {
        if (!old) return []
        return old.map(task =>
          task.id === taskId
            ? { ...task, priority }
            : task
        )
      })

      return { previousTasks }
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      // Delete task assignments first
      await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId)

      // Delete the task
      const { error } = await supabase
        .from('client_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      return taskId
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData<ClientTask[]>(taskKeys.lists())

      // Optimistically remove the task
      queryClient.setQueryData<ClientTask[]>(taskKeys.lists(), old =>
        old?.filter(task => task.id !== taskId) || []
      )

      return { previousTasks }
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
