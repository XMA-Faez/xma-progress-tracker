'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TeamMember, ClientTask, TaskStatus } from '@/types'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskCard } from './TaskCard'

interface TeamDashboardProps {
  teamMembers: TeamMember[]
}

export function TeamDashboard({ teamMembers }: TeamDashboardProps) {
  const [tasks, setTasks] = useState<ClientTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('client_tasks')
      .select(`
        *,
        clients (name),
        team_members (name, role),
        task_assignments (
          team_member_id,
          team_members (id, name, role)
        )
      `)
      .order('due_date', { ascending: true, nullsLast: true })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

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
      fetchTasks()
    }
  }

  const getTasksByMember = (memberId: string) => {
    return tasks.filter(task => 
      task.task_assignments?.some(a => a.team_member_id === memberId)
    )
  }

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      'not_started': 'bg-gray-500',
      'in_progress': 'bg-blue-500',
      'waiting_for_client': 'bg-yellow-500',
      'waiting_for_team': 'bg-orange-500',
      'blocked': 'bg-red-500',
      'review_required': 'bg-purple-500',
      'client_review': 'bg-indigo-500',
      'revision_needed': 'bg-pink-500',
      'completed': 'bg-green-500',
      'on_hold': 'bg-gray-400'
    }
    return colors[status] || 'bg-gray-500'
  }

  if (loading) {
    return <div className="text-white text-center py-8">Loading team dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Team Member Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedMember(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedMember === null
              ? 'bg-cyan-600 text-white'
              : 'glass-card text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Team
        </button>
        {teamMembers.map(member => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMember === member.id
                ? 'bg-cyan-600 text-white'
                : 'glass-card text-gray-300 hover:bg-gray-600'
            }`}
          >
            {member.name}
            <span className="ml-2 text-sm opacity-75">
              ({getTasksByMember(member.id).length})
            </span>
          </button>
        ))}
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers
          .filter(member => selectedMember === null || member.id === selectedMember)
          .map(member => {
            const memberTasks = getTasksByMember(member.id)
            const statusCounts = memberTasks.reduce((acc, task) => {
              acc[task.status] = (acc[task.status] || 0) + 1
              return acc
            }, {} as Record<TaskStatus, number>)

            return (
              <div key={member.id} className="glass-card backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{memberTasks.length}</div>
                    <div className="text-gray-400 text-sm">tasks</div>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status as TaskStatus)}`} />
                      <span className="text-xs text-gray-300">{count}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Tasks */}
                <div className="space-y-3">
                  {memberTasks.slice(0, 5).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusUpdate={updateTaskStatus}
                      showClient={true}
                    />
                  ))}
                  {memberTasks.length > 5 && (
                    <div className="text-center text-gray-400 text-sm">
                      +{memberTasks.length - 5} more tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
