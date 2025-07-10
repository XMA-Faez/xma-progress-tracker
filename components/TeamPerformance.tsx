'use client'

import { useState, useEffect } from 'react'
import { Client, TeamMember, ClientTask, Stage, TaskStatus } from '@/types'
import { TaskStatusBadge } from './TaskStatusBadge'

interface TeamPerformanceProps {
  clients: Client[]
  teamMembers: TeamMember[]
  tasks: (ClientTask & { clients?: { name: string }, team_members?: TeamMember })[]
}

export function TeamPerformance({ clients, teamMembers, tasks }: TeamPerformanceProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')

  const getTasksByMember = (memberId: string) => {
    return tasks.filter(task => 
      task.task_assignments?.some(a => a.team_member_id === memberId)
    )
  }

  const getOverdueTasks = () => {
    const now = new Date()
    return tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < now && 
      task.status !== 'completed'
    )
  }

  const getBlockedTasks = () => {
    return tasks.filter(task => 
      task.status === 'blocked' || 
      task.status === 'waiting_for_client' ||
      task.status === 'revision_needed'
    )
  }

  const getClientsByStage = () => {
    const stages: Stage[] = ['onboarding', 'pre-production', 'production', 'launch']
    
    return stages.map(stage => {
      const stageClients = clients.filter(client => {
        const clientTasks = tasks.filter(task => task.client_id === client.id)
        return getCurrentStage(clientTasks) === stage
      })
      return { stage, count: stageClients.length, clients: stageClients }
    })
  }

  const getCurrentStage = (clientTasks: ClientTask[]): Stage => {
    const stageOrder = ['onboarding', 'pre-production', 'production', 'launch']
    
    for (let i = stageOrder.length - 1; i >= 0; i--) {
      const stage = stageOrder[i] as Stage
      const stageTasks = clientTasks.filter(task => task.stage === stage)
      if (stageTasks.some(task => {
        // Handle both new status field and old completed field
        if (task.status) {
          return task.status !== 'completed'
        } else {
          return !task.completed
        }
      })) {
        return stage
      }
    }
    
    return 'launch'
  }

  const getCompletionRate = (memberId: string) => {
    const memberTasks = getTasksByMember(memberId)
    if (memberTasks.length === 0) return 0
    const completedTasks = memberTasks.filter(task => {
      // Handle both new status field and old completed field
      if (task.status) {
        return task.status === 'completed'
      } else {
        return task.completed
      }
    }).length
    return Math.round((completedTasks / memberTasks.length) * 100)
  }

  const getWorkload = (memberId: string) => {
    const memberTasks = getTasksByMember(memberId)
    const activeTasks = memberTasks.filter(task => {
      // For workload, if no status field, assume any non-completed task is active
      if (task.status) {
        return task.status === 'in_progress' || task.status === 'review_required'
      } else {
        return !task.completed
      }
    }).length
    
    if (activeTasks >= 5) return 'high'
    if (activeTasks >= 3) return 'medium'
    return 'low'
  }

  const getWorkloadColor = (workload: string) => {
    const colors = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500'
    }
    return colors[workload as keyof typeof colors] || 'bg-gray-500'
  }

  const stageDistribution = getClientsByStage()
  const overdueTasks = getOverdueTasks()
  const blockedTasks = getBlockedTasks()

  return (
    <div className="space-y-6">

      {/* Team Performance */}
      <div className="space-y-6">
        {teamMembers.map(member => {
          const memberTasks = getTasksByMember(member.id)
          const completionRate = getCompletionRate(member.id)
          const workload = getWorkload(member.id)
          const activeTasks = memberTasks.filter(task => 
            task.status === 'in_progress' || 
            task.status === 'review_required'
          ).length

          return (
            <div key={member.id} className="flex items-center justify-between py-4 border-b border-gray-700/30">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium text-white">{member.name}</h3>
                    <p className="text-sm text-gray-400">{member.role}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getWorkloadColor(workload)}`} title={`${workload} workload`} />
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Active</div>
                    <div className="text-lg font-semibold text-white">{activeTasks}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Total</div>
                    <div className="text-lg font-semibold text-white">{memberTasks.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Completion</div>
                    <div className="text-lg font-semibold text-white">{completionRate}%</div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Critical Issues - Minimal */}
      {(overdueTasks.length > 0 || blockedTasks.length > 0) && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6">Critical Issues</h2>
          <div className="space-y-8">
            {overdueTasks.length > 0 && (
              <div>
                <h3 className="font-medium text-red-400 mb-4">Overdue Tasks ({overdueTasks.length})</h3>
                <div className="space-y-3">
                  {overdueTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between py-3 border-l-2 border-red-500 pl-4">
                      <div>
                        <div className="font-medium text-white">{task.name}</div>
                        <div className="text-sm text-gray-400">
                          {task.clients?.name} • {task.team_members?.name}
                        </div>
                      </div>
                      <div className="text-sm text-red-300">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {blockedTasks.length > 0 && (
              <div>
                <h3 className="font-medium text-yellow-400 mb-4">Blocked Tasks ({blockedTasks.length})</h3>
                <div className="space-y-3">
                  {blockedTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between py-3 border-l-2 border-yellow-500 pl-4">
                      <div>
                        <div className="font-medium text-white">{task.name}</div>
                        <div className="text-sm text-gray-400">
                          {task.clients?.name} • {task.team_members?.name}
                        </div>
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
