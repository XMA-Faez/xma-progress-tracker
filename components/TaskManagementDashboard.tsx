'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { TeamMember, ClientTask, TaskStatus, TaskPriority, TaskCategory } from '@/types'
import { MultiTeamSelect } from './MultiTeamSelect'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'

interface Client {
  id: string
  name: string
}

interface TaskManagementDashboardProps {
  teamMembers: TeamMember[]
  clients: Client[]
  tasks: ClientTask[]
  currentUser: TeamMember
}

export function TaskManagementDashboard({ 
  teamMembers, 
  clients, 
  tasks: initialTasks, 
  currentUser 
}: TaskManagementDashboardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
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

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClient = filterClient === 'all' || task.client_id === filterClient
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesAssignee = filterAssignee === 'all' ||
                           (filterAssignee === 'unassigned' ? !task.task_assignments?.length :
                            task.task_assignments?.some(a => a.team_member_id === filterAssignee))
    const matchesCategory = filterCategory === 'all' || task.task_category === filterCategory

    return matchesSearch && matchesClient && matchesStatus && matchesAssignee && matchesCategory
  })

  const handleCreateTask = async () => {
    if (!newTask.name) return
    if (newTask.task_category === 'client_facing' && !newTask.client_id) return

    try {
      // Get max order index for the client (or all tasks for internal)
      const relevantTasks = newTask.task_category === 'client_facing'
        ? tasks.filter(t => t.client_id === newTask.client_id)
        : tasks.filter(t => t.task_category === 'internal')
      const maxOrder = Math.max(...relevantTasks.map(t => t.order_index), 0)
      const nextTouchpoint = Math.max(...relevantTasks.map(t => t.touchpoint), 0) + 1

      // Create the task
      const { data: createdTask, error: taskError } = await supabase
        .from('client_tasks')
        .insert({
          name: newTask.name,
          description: newTask.description,
          client_id: newTask.task_category === 'client_facing' ? newTask.client_id : null,
          type: newTask.type,
          stage: newTask.stage,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          status: 'not_started' as TaskStatus,
          completed: false,
          order_index: maxOrder + 1,
          touchpoint: nextTouchpoint,
          task_category: newTask.task_category
        })
        .select(`
          *,
          clients (id, name)
        `)
        .single()

      if (taskError) throw taskError

      // Create task assignments
      if (newTask.assigned_to.length > 0) {
        const assignments = newTask.assigned_to.map(memberId => ({
          task_id: createdTask.id,
          team_member_id: memberId
        }))

        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments)

        if (assignmentError) throw assignmentError

        // Add assignment info to the created task
        createdTask.task_assignments = assignments.map(a => ({
          team_member_id: a.team_member_id,
          team_members: teamMembers.find(m => m.id === a.team_member_id)
        }))
      }

      // Update local state
      setTasks(prev => [createdTask, ...prev])
      
      // Reset form
      setNewTask({
        name: '',
        description: '',
        client_id: '',
        type: 'project',
        stage: 'onboarding',
        priority: 'medium',
        due_date: '',
        assigned_to: [],
        task_category: 'client_facing'
      })
      setIsCreatingTask(false)

    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  const handleAssignTask = async (taskId: string, selectedIds: string[]) => {
    try {
      // Delete existing assignments
      await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId)

      // Create new assignments
      if (selectedIds.length > 0) {
        const assignments = selectedIds.map(memberId => ({
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
              task_assignments: selectedIds.map(id => ({
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
      'low': 'border-l-emerald-400 bg-emerald-50/5 border-emerald-400/20',
      'medium': 'border-l-amber-400 bg-amber-50/5 border-amber-400/20',
      'high': 'border-l-orange-400 bg-orange-50/5 border-orange-400/20',
      'urgent': 'border-l-red-400 bg-red-50/5 border-red-400/20'
    }
    return colors[priority] || 'border-l-slate-400 bg-slate-50/5 border-slate-400/20'
  }

  const getPriorityBadgeColor = (priority: TaskPriority) => {
    const colors = {
      'low': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'medium': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'high': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'urgent': 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[priority] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="glass-card rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="focus:bg-slate-700">All Tasks</SelectItem>
                  <SelectItem value="client_facing" className="focus:bg-slate-700">🏢 Client Tasks</SelectItem>
                  <SelectItem value="internal" className="focus:bg-slate-700">⚙️ Internal Tasks</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50">
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="focus:bg-slate-700">All Clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id} className="focus:bg-slate-700">
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
                  <SelectItem value="all" className="focus:bg-slate-700">All Statuses</SelectItem>
                  <SelectItem value="not_started" className="focus:bg-slate-700">Not Started</SelectItem>
                  <SelectItem value="in_progress" className="focus:bg-slate-700">In Progress</SelectItem>
                  <SelectItem value="completed" className="focus:bg-slate-700">Completed</SelectItem>
                  <SelectItem value="blocked" className="focus:bg-slate-700">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50">
                  <SelectValue placeholder="Filter by assignee" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="focus:bg-slate-700">All Assignees</SelectItem>
                  <SelectItem value="unassigned" className="focus:bg-slate-700">Unassigned</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id} className="focus:bg-slate-700">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Create Task Button */}
          <Button
            onClick={() => setIsCreatingTask(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <span className="text-slate-300">Total Tasks: </span>
            <span className="text-white font-medium">{filteredTasks.length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <span className="text-slate-300">Client Tasks: </span>
            <span className="text-white font-medium">{filteredTasks.filter(t => t.task_category === 'client_facing').length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <span className="text-slate-300">Internal Tasks: </span>
            <span className="text-white font-medium">{filteredTasks.filter(t => t.task_category === 'internal').length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
            <span className="text-slate-300">Completed: </span>
            <span className="text-white font-medium">{filteredTasks.filter(t => t.status === 'completed').length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600"></div>
            <span className="text-slate-300">Blocked: </span>
            <span className="text-white font-medium">{filteredTasks.filter(t => t.status === 'blocked').length}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Create Task Form */}
      {isCreatingTask && (
        <Card className="glass-card border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              Create New Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Task Category</label>
                <Select value={newTask.task_category} onValueChange={(value: TaskCategory) => setNewTask(prev => ({ ...prev, task_category: value, client_id: value === 'internal' ? '' : prev.client_id }))}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="client_facing" className="focus:bg-slate-700 text-white">🏢 Client Task</SelectItem>
                    <SelectItem value="internal" className="focus:bg-slate-700 text-white">⚙️ Internal Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Task Name</label>
                <Input
                  value={newTask.name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter task name"
                  className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white"
                />
              </div>

              {newTask.task_category === 'client_facing' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
                  <Select value={newTask.client_id} onValueChange={(value) => setNewTask(prev => ({ ...prev, client_id: value }))}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 text-white">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id} className="focus:bg-slate-700 text-white">
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
                className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <Select value={newTask.type} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="call" className="focus:bg-slate-700 text-white">📞 Call</SelectItem>
                    <SelectItem value="project" className="focus:bg-slate-700 text-white">🚀 Project</SelectItem>
                    <SelectItem value="revision" className="focus:bg-slate-700 text-white">🔄 Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Stage</label>
                <Select value={newTask.stage} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, stage: value }))}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="onboarding" className="focus:bg-slate-700 text-white">🎯 Onboarding</SelectItem>
                    <SelectItem value="pre-production" className="focus:bg-slate-700 text-white">📋 Pre-production</SelectItem>
                    <SelectItem value="production" className="focus:bg-slate-700 text-white">⚡ Production</SelectItem>
                    <SelectItem value="launch" className="focus:bg-slate-700 text-white">🚀 Launch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <Select value={newTask.priority} onValueChange={(value: TaskPriority) => setNewTask(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low" className="focus:bg-slate-700 text-emerald-300">🟢 Low</SelectItem>
                    <SelectItem value="medium" className="focus:bg-slate-700 text-amber-300">🟡 Medium</SelectItem>
                    <SelectItem value="high" className="focus:bg-slate-700 text-orange-300">🟠 High</SelectItem>
                    <SelectItem value="urgent" className="focus:bg-slate-700 text-red-300">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Assign To</label>
              <MultiTeamSelect
                teamMembers={teamMembers}
                selectedIds={newTask.assigned_to}
                onChange={(selectedIds) => setNewTask(prev => ({ ...prev, assigned_to: selectedIds }))}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
              <Button
                variant="outline"
                onClick={() => setIsCreatingTask(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg"
              >
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="glass-card border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-slate-400 text-lg mb-4">No tasks match your current filters</p>
              <p className="text-slate-500 text-sm mb-6">Try adjusting your search criteria or create a new task to get started</p>
              <Button
                onClick={() => setIsCreatingTask(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} className={`glass-card border-l-4 ${getPriorityColor(task.priority)} backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-200 group`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Task Header */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {task.task_category === 'client_facing' ? '🏢' : '⚙️'}
                        </span>
                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {task.name}
                        </h3>
                      </div>
                      <Badge className={`${getStatusColor(task.status)} border-0 font-medium px-3 py-1`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={`${getPriorityBadgeColor(task.priority)} border font-medium px-3 py-1`}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge className={`${
                        task.task_category === 'client_facing'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      } border font-medium px-3 py-1`}>
                        {task.task_category === 'client_facing' ? 'Client' : 'Internal'}
                      </Badge>
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        {task.task_category === 'client_facing' && task.clients && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Client:</span>
                            <span className="text-white font-medium">{task.clients.name}</span>
                          </div>
                        )}
                        {task.task_category === 'internal' && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Category:</span>
                            <span className="text-purple-300 font-medium">Internal Task</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Stage:</span>
                          <span className="text-cyan-300 capitalize">{task.stage.replace('_', ' ')}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">Type:</span>
                          <span className="text-cyan-300 capitalize">{task.type}</span>
                        </div>
                      </div>

                      {task.due_date && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Due:</span>
                          <span className={`font-medium ${
                            new Date(task.due_date) < new Date()
                              ? 'text-red-400'
                              : new Date(task.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                          }`}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {task.description && (
                      <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
                        <p className="text-slate-300 text-sm leading-relaxed">{task.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Assignment Section */}
                  <div className="lg:w-64 space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Assigned To
                    </label>
                    <MultiTeamSelect
                      teamMembers={teamMembers}
                      selectedIds={task.task_assignments?.map(a => a.team_member_id) || []}
                      onChange={(selectedIds) => handleAssignTask(task.id, selectedIds)}
                      className="w-full"
                    />

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700/30">
                      <span>#{task.touchpoint}</span>
                      <span>•</span>
                      <span>{task.stage}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
