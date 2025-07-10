'use client'

import { useState } from 'react'
import { ClientTask, TeamMember, TaskStatus } from '@/types'
import { TaskStatusBadge } from './TaskStatusBadge'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface MyTasksDashboardProps {
  tasks: ClientTask[]
  teamMember: TeamMember
}

export function MyTasksDashboard({ tasks: initialTasks, teamMember }: MyTasksDashboardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')
  const supabase = createClientComponentClient()

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const { error } = await supabase
      .from('client_tasks')
      .update({ 
        status: newStatus,
        completed: newStatus === 'completed',
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
    } else {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, completed: newStatus === 'completed' }
          : task
      ))
    }
  }

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter)

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {} as Record<TaskStatus, number>)

  const activeTasks = tasks.filter(t => 
    t.status === 'in_progress' || t.status === 'review_required'
  )
  const blockedTasks = tasks.filter(t => 
    t.status === 'blocked' || t.status === 'waiting_for_client' || t.status === 'waiting_for_team'
  )
  const completedTasks = tasks.filter(t => t.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <p className="text-slate-400 text-sm">Total Tasks</p>
          <p className="text-3xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
          <p className="text-blue-300 text-sm">Active</p>
          <p className="text-3xl font-bold text-blue-400">{activeTasks.length}</p>
        </div>
        <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6">
          <p className="text-yellow-300 text-sm">Blocked/Waiting</p>
          <p className="text-3xl font-bold text-yellow-400">{blockedTasks.length}</p>
        </div>
        <div className="bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
          <p className="text-green-300 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-400">{completedTasks.length}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'in_progress'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          In Progress ({statusCounts['in_progress'] || 0})
        </button>
        <button
          onClick={() => setFilter('waiting_for_client')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'waiting_for_client'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Waiting for Client ({statusCounts['waiting_for_client'] || 0})
        </button>
        <button
          onClick={() => setFilter('blocked')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'blocked'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Blocked ({statusCounts['blocked'] || 0})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-400">No tasks found with this filter</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-white">{task.name}</h3>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Client: {task.clients?.name}</p>
                    <p>Stage: {task.stage} • Touchpoint: #{task.touchpoint}</p>
                    {task.description && (
                      <p className="text-slate-300 mt-2">{task.description}</p>
                    )}
                  </div>
                </div>
                
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                  className="ml-4 bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_client">Waiting for Client</option>
                  <option value="waiting_for_team">Waiting for Team</option>
                  <option value="blocked">Blocked</option>
                  <option value="review_required">Review Required</option>
                  <option value="client_review">Client Review</option>
                  <option value="revision_needed">Revision Needed</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
