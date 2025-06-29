export type TaskType = 'call' | 'project' | 'revision'

export type Stage = 'onboarding' | 'pre-production' | 'production' | 'launch'

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
  created_at: string
  updated_at: string
}

export interface ClientTask extends Task {
  client_id: string
  completed_at?: string
}