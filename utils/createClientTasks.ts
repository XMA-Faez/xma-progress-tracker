import { createClient } from '@/lib/supabase-server'
import { defaultTasks } from './defaultTasks'
import { ClientTask } from '@/types'

export async function createClientTasks(clientId: string): Promise<ClientTask[]> {
  const supabase = await createClient()
  
  // Get assignment rules
  const { data: assignmentRules } = await supabase
    .from('assignment_rules')
    .select('*')
  
  // Create tasks with assignments
  const tasksWithAssignments = defaultTasks.map(task => {
    // Find matching assignment rule
    const rule = assignmentRules?.find(r => 
      r.task_name === task.name && 
      r.task_type === task.type && 
      r.stage === task.stage
    )
    
    return {
      ...task,
      client_id: clientId,
      assigned_to: rule?.assigned_to || null,
      status: 'not_started' as const,
      priority: 'medium' as const,
      due_date: null,
      notes: null
    }
  })
  
  // Insert tasks into database
  const { data: createdTasks, error } = await supabase
    .from('client_tasks')
    .insert(tasksWithAssignments)
    .select()
  
  if (error) {
    console.error('Error creating client tasks:', error)
    throw error
  }
  
  return createdTasks as ClientTask[]
}