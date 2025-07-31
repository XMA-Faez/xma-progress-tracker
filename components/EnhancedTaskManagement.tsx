'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { TeamMember, ClientTask, TaskStatus, TaskPriority, TaskCategory } from '@/types'
import { MultiTeamSelect } from './MultiTeamSelect'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Textarea } from './ui/textarea'
import { Plus, Search, Filter, X, Users, Calendar } from 'lucide-react'

interface Client {
  id: string
  name: string
}

interface TaskGroup {
  name: string
  tasks: ClientTask[]
  count: number
  clients: string[]
  statuses: TaskStatus[]
}

interface ClientGroup {
  id: string
  name: string
  tasks: ClientTask[]
  count: number
  statuses: TaskStatus[]
}

interface EnhancedTaskManagementProps {
  teamMembers: TeamMember[]
  clients: Client[]
  tasks: ClientTask[]
  currentUser: TeamMember
}

export function EnhancedTaskManagement({
  teamMembers,
  clients,
  tasks: initialTasks,
  currentUser
}: EnhancedTaskManagementProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    client_id: '',
    type: 'project' as const,
    stage: 'onboarding' as const,
    priority: 'medium' as TaskPriority,
    due_date: '',
    assigned_to: [] as string[],
    task_category: 'client_facing' as TaskCategory
  })

  const supabase = createClient()

  // Group tasks by name for better management
  const taskGroups = useMemo(() => {
    const groups: Record<string, TaskGroup> = {}

    tasks.forEach(task => {
      if (!groups[task.name]) {
        groups[task.name] = {
          name: task.name,
          tasks: [],
          count: 0,
          clients: [],
          statuses: []
        }
      }

      groups[task.name].tasks.push(task)
      groups[task.name].count++

      // Collect unique clients
      if (task.clients?.name && !groups[task.name].clients.includes(task.clients.name)) {
        groups[task.name].clients.push(task.clients.name)
      }

      // Collect unique statuses
      if (!groups[task.name].statuses.includes(task.status)) {
        groups[task.name].statuses.push(task.status)
      }
    })

    return Object.values(groups).sort((a, b) => b.count - a.count)
  }, [tasks])

  // Group tasks by client
  const clientGroups = useMemo(() => {
    const groups: Record<string, ClientGroup> = {}

    tasks.forEach(task => {
      const clientKey = task.task_category === 'internal' ? 'internal' : (task.client_id || 'unassigned')
      const clientName = task.task_category === 'internal' ? 'Internal Tasks' : (task.clients?.name || 'Unassigned')

      if (!groups[clientKey]) {
        groups[clientKey] = {
          id: clientKey,
          name: clientName,
          tasks: [],
          count: 0,
          statuses: []
        }
      }

      groups[clientKey].tasks.push(task)
      groups[clientKey].count++

      // Collect unique statuses
      if (!groups[clientKey].statuses.includes(task.status)) {
        groups[clientKey].statuses.push(task.status)
      }
    })

    return Object.values(groups).sort((a, b) => {
      if (a.name === 'Internal Tasks') return -1
      if (b.name === 'Internal Tasks') return 1
      return b.count - a.count
    })
  }, [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClient = filterClient === 'all' || task.client_id === filterClient
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesCategory = filterCategory === 'all' || task.task_category === filterCategory
      const matchesCompleted = showCompleted || task.status !== 'completed'
      
      return matchesSearch && matchesClient && matchesStatus && matchesCategory && matchesCompleted
    })
  }, [tasks, searchTerm, filterClient, filterStatus, filterCategory, showCompleted])

  // Filter task groups
  const filteredTaskGroups = useMemo(() => {
    return taskGroups.filter(group => {
      const hasMatchingTasks = group.tasks.some(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesClient = filterClient === 'all' || task.client_id === filterClient
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus
        const matchesCategory = filterCategory === 'all' || task.task_category === filterCategory
        const matchesCompleted = showCompleted || task.status !== 'completed'

        return matchesSearch && matchesClient && matchesStatus && matchesCategory && matchesCompleted
      })

      return hasMatchingTasks
    })
  }, [taskGroups, searchTerm, filterClient, filterStatus, filterCategory, showCompleted])

  // Filter client groups
  const filteredClientGroups = useMemo(() => {
    return clientGroups.filter(group => {
      const hasMatchingTasks = group.tasks.some(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesClient = filterClient === 'all' || task.client_id === filterClient
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus
        const matchesCategory = filterCategory === 'all' || task.task_category === filterCategory
        const matchesCompleted = showCompleted || task.status !== 'completed'

        return matchesSearch && matchesClient && matchesStatus && matchesCategory && matchesCompleted
      })

      return hasMatchingTasks
    })
  }, [clientGroups, searchTerm, filterClient, filterStatus, filterCategory, showCompleted])

  const handleTaskStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('client_tasks')
        .update({
          status: newStatus,
          completed: newStatus === 'completed',
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)

      if (error) throw error

      // Update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, completed: newStatus === 'completed' }
          : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleTaskAssignment = async (taskId: string, memberIds: string[]) => {
    try {
      // Delete existing assignments for this task
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

      // Update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              task_assignments: memberIds.map(id => ({
                team_member_id: id,
                team_members: teamMembers.find(m => m.id === id)
              }))
            }
          : task
      ))
    } catch (error) {
      console.error('Error assigning task:', error)
      alert('Failed to assign task. Please try again.')
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      'not_started': 'bg-slate-500/90 text-slate-100',
      'in_progress': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'waiting_for_client': 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
      'waiting_for_team': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      'blocked': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      'review_required': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'client_review': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      'revision_needed': 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
      'completed': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
      'on_hold': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
    return colors[status] || 'bg-slate-500/90 text-slate-100'
  }

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      'low': 'border-l-emerald-400 bg-emerald-50/5',
      'medium': 'border-l-amber-400 bg-amber-50/5',
      'high': 'border-l-orange-400 bg-orange-50/5',
      'urgent': 'border-l-red-400 bg-red-50/5'
    }
    return colors[priority] || 'border-l-slate-400 bg-slate-50/5'
  }

  const refreshTasks = () => {
    // This would typically refetch tasks from the server
    // For now, we'll just close the templates panel
    setShowTemplates(false)
    window.location.reload() // Simple refresh for demo
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Bulk Actions */}
      <Card className="glass-card border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks, clients, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="client_facing">🏢 Client Tasks</SelectItem>
                    <SelectItem value="internal">⚙️ Internal Tasks</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterClient} onValueChange={setFilterClient}>
                  <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50">
                    <SelectValue placeholder="Filter by client" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked === true)}
                />
                <label htmlFor="show-completed" className="text-sm text-slate-300">
                  Show completed
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'tasks' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tasks')}
                  className="h-8"
                >
                  <Users className="h-4 w-4 mr-1" />
                  By Tasks
                </Button>
                <Button
                  variant={viewMode === 'clients' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('clients')}
                  className="h-8"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  By Clients
                </Button>
              </div>
            </div>
          </div>



          {/* Statistics */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <span className="text-slate-300">Total Tasks: </span>
              <span className="text-white font-medium">{filteredTasks.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <span className="text-slate-300">
                {viewMode === 'tasks' ? 'Unique Task Types' : 'Active Clients'}:
              </span>
              <span className="text-white font-medium">
                {viewMode === 'tasks' ? filteredTaskGroups.length : filteredClientGroups.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span className="text-slate-300">Completed: </span>
              <span className="text-white font-medium">{filteredTasks.filter(t => t.status === 'completed').length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Display */}
      {viewMode === 'tasks' ? (
        <div className="space-y-6">
          {filteredTaskGroups.map(group => (
            <Card key={group.name} className="glass-card border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg text-white">{group.name}</CardTitle>
                  <Badge variant="outline" className="text-slate-300">
                    {group.count} task{group.count !== 1 ? 's' : ''}
                  </Badge>
                  <div className="flex gap-1">
                    {group.statuses.map(status => (
                      <Badge key={status} className={`${getStatusColor(status)} text-xs px-2 py-1`}>
                        {status.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {group.tasks
                    .filter(task => filteredTasks.includes(task))
                    .map(task => (
                    <div key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)} bg-slate-900/30 rounded-lg p-4 hover:bg-slate-900/50 transition-all`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">
                              {task.task_category === 'client_facing' ? '🏢' : '⚙️'}
                            </span>
                            {task.task_category === 'client_facing' && task.clients && (
                              <span className="text-cyan-300 font-medium">{task.clients.name}</span>
                            )}
                            <Badge className={`${getStatusColor(task.status)} text-xs px-2 py-1`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-400">
                            <p>Stage: {task.stage} • Type: {task.type} • Priority: {task.priority}</p>
                            {task.description && (
                              <p className="text-slate-300 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Status</label>
                            <Select value={task.status} onValueChange={(value: TaskStatus) => handleTaskStatusUpdate(task.id, value)}>
                              <SelectTrigger className="w-full bg-slate-900/50 border-slate-600/50 text-white text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Assigned to</label>
                            <MultiTeamSelect
                              teamMembers={teamMembers}
                              selectedIds={task.task_assignments?.map(a => a.team_member_id) || []}
                              onChange={(memberIds) => handleTaskAssignment(task.id, memberIds)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClientGroups.map(group => (
            <Card key={group.id} className="glass-card border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    {group.name === 'Internal Tasks' ? '⚙️' : '🏢'}
                    {group.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-slate-300">
                    {group.count} task{group.count !== 1 ? 's' : ''}
                  </Badge>
                  <div className="flex gap-1">
                    {group.statuses.map(status => (
                      <Badge key={status} className={`${getStatusColor(status)} text-xs px-2 py-1`}>
                        {status.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {group.tasks
                    .filter(task => filteredTasks.includes(task))
                    .map(task => (
                    <div key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)} bg-slate-900/30 rounded-lg p-4 hover:bg-slate-900/50 transition-all`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">{task.name}</h4>
                            <Badge className={`${getStatusColor(task.status)} text-xs px-2 py-1`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-400">
                            <p>Stage: {task.stage} • Type: {task.type} • Priority: {task.priority}</p>
                            {task.description && (
                              <p className="text-slate-300 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Status</label>
                            <Select value={task.status} onValueChange={(value: TaskStatus) => handleTaskStatusUpdate(task.id, value)}>
                              <SelectTrigger className="w-full bg-slate-900/50 border-slate-600/50 text-white text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Assigned to</label>
                            <MultiTeamSelect
                              teamMembers={teamMembers}
                              selectedIds={task.task_assignments?.map(a => a.team_member_id) || []}
                              onChange={(memberIds) => handleTaskAssignment(task.id, memberIds)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
