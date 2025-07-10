'use client'

import { TaskStatus } from '@/types'

interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function TaskStatusBadge({ status, className = '' }: TaskStatusBadgeProps) {
  const statusConfig = {
    'not_started': { label: 'Not Started', color: 'bg-slate-500 text-white' },
    'in_progress': { label: 'In Progress', color: 'bg-blue-500 text-white' },
    'waiting_for_client': { label: 'Waiting for Client', color: 'bg-yellow-500 text-black' },
    'waiting_for_team': { label: 'Waiting for Team', color: 'bg-orange-500 text-white' },
    'blocked': { label: 'Blocked', color: 'bg-red-500 text-white' },
    'review_required': { label: 'Review Required', color: 'bg-purple-500 text-white' },
    'client_review': { label: 'Client Review', color: 'bg-indigo-500 text-white' },
    'revision_needed': { label: 'Revision Needed', color: 'bg-pink-500 text-white' },
    'completed': { label: 'Completed', color: 'bg-green-500 text-white' },
    'on_hold': { label: 'On Hold', color: 'bg-slate-400 text-white' }
  }

  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      {config.label}
    </span>
  )
}
