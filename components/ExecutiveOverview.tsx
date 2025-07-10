'use client'

import { useState } from 'react'
import { Client, TeamMember, ClientTask } from '@/types'
import { TeamPerformance } from './TeamPerformance'
import { ProductionOverview } from './ProductionOverview'

interface ExecutiveOverviewProps {
  clients: (Client & { client_tasks: ClientTask[] })[]
  teamMembers: TeamMember[]
  tasks: (ClientTask & { clients?: { name: string }, team_members?: TeamMember })[]
}

export function ExecutiveOverview({ clients, teamMembers, tasks }: ExecutiveOverviewProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'pipeline'>('performance')

  const overdueTasks = tasks.filter(task => 
    task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'completed'
  )

  const blockedTasks = tasks.filter(task => 
    task.status === 'blocked' || 
    task.status === 'waiting_for_client' ||
    task.status === 'revision_needed'
  )

  return (
    <div className="space-y-6">
      {/* Key Metrics - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Projects</p>
              <p className="text-3xl font-bold text-white">{clients.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-white">{tasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-400">{overdueTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 text-2xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Blocked Tasks</p>
              <p className="text-3xl font-bold text-yellow-400">{blockedTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-2xl">🚫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 font-medium transition-colors ${
              activeTab === 'performance'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Team Performance
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-2 font-medium transition-colors ${
              activeTab === 'pipeline'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Project Pipeline
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'performance' && (
          <TeamPerformance 
            clients={clients} 
            teamMembers={teamMembers} 
            tasks={tasks} 
          />
        )}

        {activeTab === 'pipeline' && (
          <ProductionOverview clients={clients} />
        )}
      </div>
    </div>
  )
}
