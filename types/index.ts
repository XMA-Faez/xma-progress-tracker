export type TaskType = 'call' | 'project' | 'revision'

export type Stage = 'onboarding' | 'pre-production' | 'production' | 'launch'

export type TaskStatus = 
  | 'not_started'
  | 'in_progress'
  | 'waiting_for_client'
  | 'waiting_for_team'
  | 'blocked'
  | 'review_required'
  | 'client_review'
  | 'revision_needed'
  | 'completed'
  | 'on_hold'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  color_index?: number | null
  created_at: string
  updated_at: string
}

export interface AssignmentRule {
  id: string
  task_name: string
  task_type: TaskType
  stage: Stage
  assigned_to: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  name: string
  type: TaskType
  stage: Stage
  touchpoint: number
  completed: boolean
  description: string
  order_index: number
}

export interface Client {
  id: string
  name: string
  unique_link: string
  frame_link?: string
  google_drive_link?: string
  notes?: string
  launch_date?: string
  created_at: string
  updated_at: string
}

export interface ClientTask extends Task {
  client_id: string
  assigned_to?: string
  status: TaskStatus
  due_date?: string
  priority: TaskPriority
  notes?: string
  completed_at?: string
  team_member?: TeamMember
  task_assignments?: { team_member_id: string; team_members?: TeamMember }[]
}