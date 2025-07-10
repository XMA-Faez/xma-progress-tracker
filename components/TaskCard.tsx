'use client'

import { useState } from 'react'
import { ClientTask, TaskStatus } from '@/types'
import { TaskStatusBadge } from './TaskStatusBadge'

interface TaskCardProps {
  task: ClientTask
  onStatusUpdate: (taskId: string, newStatus: TaskStatus) => void
  showClient?: boolean
}

export function TaskCard({ task, onStatusUpdate, showClient = false }: TaskCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'waiting_for_client', label: 'Waiting for Client' },
    { value: 'waiting_for_team', label: 'Waiting for Team' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'review_required', label: 'Review Required' },
    { value: 'client_review', label: 'Client Review' },
    { value: 'revision_needed', label: 'Revision Needed' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' }
  ]

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusUpdate(task.id, newStatus)
    setIsDropdownOpen(false)
  }

  const getTaskTypeColor = (type: string) => {
    const colors = {
      'call': 'border-l-red-500',
      'project': 'border-l-blue-500',
      'revision': 'border-l-yellow-500'
    }
    return colors[type as keyof typeof colors] || 'border-l-slate-500'
  }

  const getAssignedNames = () => {
    if (!task.task_assignments || task.task_assignments.length === 0) {
      return 'Unassigned'
    }
    
    const names = task.task_assignments
      .map(a => a.team_members?.name)
      .filter(Boolean)
    
    if (names.length === 0) return 'Unassigned'
    if (names.length === 1) return names[0]
    if (names.length === 2) return names.join(' & ')
    return `${names[0]} +${names.length - 1}`
  }

  return (
    <div className={`bg-slate-900/50 rounded-lg border-l-4 ${getTaskTypeColor(task.type)} p-4 hover:bg-slate-900/70 transition-colors`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-white text-sm mb-1">{task.name}</h4>
          {showClient && task.clients?.name && (
            <p className="text-slate-400 text-xs mb-1">{task.clients.name}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{task.stage}</span>
            <span>•</span>
            <span>#{task.touchpoint}</span>
            <span>•</span>
            <span className="text-slate-400">{getAssignedNames()}</span>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="ml-2"
          >
            <TaskStatusBadge status={task.status} className="cursor-pointer hover:opacity-80" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-10">
              <div className="py-1">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors ${
                      task.status === option.value ? 'bg-slate-700 text-white' : 'text-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {task.due_date && (
        <div className="text-xs text-slate-400 mt-2">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
