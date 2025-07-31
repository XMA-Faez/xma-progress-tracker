"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TeamMember,
  ClientTask,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from "@/types";
import { MultiTeamSelect } from "./MultiTeamSelect";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { SearchableSelect } from "./ui/searchable-select";
import {
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  useTasks,
  useCreateTask,
  useUpdateTaskStatus,
  useUpdateTaskAssignment,
  useUpdateTaskPriority,
  useDeleteTask,
} from "@/hooks/useTasks";

interface Client {
  id: string;
  name: string;
}

interface TaskGroup {
  name: string;
  tasks: ClientTask[];
  count: number;
  clients: string[];
  statuses: TaskStatus[];
}

interface ClientGroup {
  id: string;
  name: string;
  tasks: ClientTask[];
  count: number;
  statuses: TaskStatus[];
}

interface MinimalTaskManagementProps {
  teamMembers: TeamMember[];
  clients: Client[];
  currentUser: TeamMember;
}

export function MinimalTaskManagement({
  teamMembers,
  clients,
  currentUser,
}: MinimalTaskManagementProps) {
  // React Query hooks
  const { data: tasks = [], isLoading, error } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const updateAssignmentMutation = useUpdateTaskAssignment();
  const updatePriorityMutation = useUpdateTaskPriority();
  const deleteTaskMutation = useDeleteTask();

  // URL state management
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [filterClient, setFilterClient] = useState<string>(searchParams.get("client") || "all");
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get("status") || "all");
  const [filterCategory, setFilterCategory] = useState<string>(searchParams.get("category") || "all");
  const [filterAssignee, setFilterAssignee] = useState<string>(searchParams.get("assignee") || "all");
  const [filterPriority, setFilterPriority] = useState<string>(searchParams.get("priority") || "all");
  const [viewMode, setViewMode] = useState<"tasks" | "clients" | "assignees">((searchParams.get("view") as "tasks" | "clients" | "assignees") || "tasks");
  const [showCompleted, setShowCompleted] = useState(searchParams.get("completed") === "true");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(searchParams.get("advanced") === "true");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [deletingTasks, setDeletingTasks] = useState<string[]>([]);

  // Function to update URL with current filter state
  const updateURL = (updates: Record<string, string | boolean>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === "all" || value === false) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.push(newURL, { scroll: false });
  };

  // Wrapper functions that update both state and URL
  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    updateURL({ search: value });
  };

  const updateFilterClient = (value: string) => {
    setFilterClient(value);
    updateURL({ client: value });
  };

  const updateFilterStatus = (value: string) => {
    setFilterStatus(value);
    updateURL({ status: value });
  };

  const updateFilterCategory = (value: string) => {
    setFilterCategory(value);
    updateURL({ category: value });
  };

  const updateFilterAssignee = (value: string) => {
    setFilterAssignee(value);
    updateURL({ assignee: value });
  };

  const updateFilterPriority = (value: string) => {
    setFilterPriority(value);
    updateURL({ priority: value });
  };

  const updateViewMode = (value: "tasks" | "clients" | "assignees") => {
    setViewMode(value);
    updateURL({ view: value });
  };

  const updateShowCompleted = (value: boolean) => {
    setShowCompleted(value);
    updateURL({ completed: value });
  };

  const updateShowAdvancedFilters = (value: boolean) => {
    setShowAdvancedFilters(value);
    updateURL({ advanced: value });
  };

  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    client_id: "",
    type: "project" as const,
    stage: "onboarding" as const,
    priority: "medium" as TaskPriority,
    due_date: "",
    assigned_to: [] as string[],
    task_category: "client_facing" as TaskCategory,
  });

  // Stage ordering function
  const getStageOrder = (stage: string): number => {
    const stageOrder = {
      'onboarding': 1,
      'pre-production': 2,
      'production': 3,
      'launch': 4
    };
    return stageOrder[stage as keyof typeof stageOrder] || 999;
  };

  // Priority ordering function
  const getPriorityOrder = (priority: string): number => {
    const priorityOrder = {
      'urgent': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };
    return priorityOrder[priority as keyof typeof priorityOrder] || 999;
  };

  // Get stage display name with emoji
  const getStageDisplayName = (stage: string): string => {
    const stageNames = {
      'onboarding': '🎯 Onboarding',
      'pre-production': '🔧 Pre-Production',
      'production': '🏭 Production',
      'launch': '🚀 Launch'
    };
    return stageNames[stage as keyof typeof stageNames] || stage;
  };

  // Group tasks by stage for better management
  const taskGroups = useMemo(() => {
    const groups: Record<string, TaskGroup> = {};

    tasks.forEach((task) => {
      const stageName = task.stage;
      if (!groups[stageName]) {
        groups[stageName] = {
          name: stageName,
          tasks: [],
          count: 0,
          clients: [],
          statuses: [],
        };
      }

      groups[stageName].tasks.push(task);
      groups[stageName].count++;

      // Collect unique clients
      if (
        task.clients?.name &&
        !groups[stageName].clients.includes(task.clients.name)
      ) {
        groups[stageName].clients.push(task.clients.name);
      }

      // Collect unique statuses
      if (!groups[stageName].statuses.includes(task.status)) {
        groups[stageName].statuses.push(task.status);
      }
    });

    // Sort tasks within each group by priority, then by name
    Object.values(groups).forEach(group => {
      group.tasks.sort((a, b) => {
        const priorityOrderA = getPriorityOrder(a.priority);
        const priorityOrderB = getPriorityOrder(b.priority);
        if (priorityOrderA !== priorityOrderB) {
          return priorityOrderA - priorityOrderB;
        }
        return a.name.localeCompare(b.name);
      });
    });

    // Sort groups by stage order, then by count
    return Object.values(groups).sort((a, b) => {
      const stageOrderA = getStageOrder(a.name);
      const stageOrderB = getStageOrder(b.name);
      if (stageOrderA !== stageOrderB) {
        return stageOrderA - stageOrderB;
      }
      return b.count - a.count;
    });
  }, [tasks]);

  // Group tasks by client
  const clientGroups = useMemo(() => {
    const groups: Record<string, ClientGroup> = {};

    tasks.forEach((task) => {
      const clientKey =
        task.task_category === "internal"
          ? "internal"
          : task.client_id || "unassigned";
      const clientName =
        task.task_category === "internal"
          ? "Internal Tasks"
          : task.clients?.name || "Unassigned";

      if (!groups[clientKey]) {
        groups[clientKey] = {
          id: clientKey,
          name: clientName,
          tasks: [],
          count: 0,
          statuses: [],
        };
      }

      groups[clientKey].tasks.push(task);
      groups[clientKey].count++;

      // Collect unique statuses
      if (!groups[clientKey].statuses.includes(task.status)) {
        groups[clientKey].statuses.push(task.status);
      }
    });

    return Object.values(groups).sort((a, b) => {
      if (a.name === "Internal Tasks") return -1;
      if (b.name === "Internal Tasks") return 1;
      return b.count - a.count;
    });
  }, [tasks]);

  // Group tasks by assignees
  const assigneeGroups = useMemo(() => {
    const groups: Record<string, ClientGroup> = {};

    tasks.forEach((task) => {
      // Handle unassigned tasks
      if (!task.task_assignments || task.task_assignments.length === 0) {
        const unassignedKey = "unassigned";
        if (!groups[unassignedKey]) {
          groups[unassignedKey] = {
            id: unassignedKey,
            name: "Unassigned",
            tasks: [],
            count: 0,
            statuses: [],
          };
        }
        groups[unassignedKey].tasks.push(task);
        groups[unassignedKey].count++;
        if (!groups[unassignedKey].statuses.includes(task.status)) {
          groups[unassignedKey].statuses.push(task.status);
        }
      } else {
        // Handle assigned tasks (can be assigned to multiple people)
        task.task_assignments.forEach((assignment) => {
          const assigneeKey = assignment.team_member_id;
          const assigneeName = teamMembers.find(m => m.id === assignment.team_member_id)?.name || "Unknown";

          if (!groups[assigneeKey]) {
            groups[assigneeKey] = {
              id: assigneeKey,
              name: assigneeName,
              tasks: [],
              count: 0,
              statuses: [],
            };
          }

          // Only add task once per assignee (avoid duplicates)
          if (!groups[assigneeKey].tasks.find(t => t.id === task.id)) {
            groups[assigneeKey].tasks.push(task);
            groups[assigneeKey].count++;
          }

          if (!groups[assigneeKey].statuses.includes(task.status)) {
            groups[assigneeKey].statuses.push(task.status);
          }
        });
      }
    });

    return Object.values(groups).sort((a, b) => {
      if (a.name === "Unassigned") return 1; // Unassigned at bottom
      if (b.name === "Unassigned") return -1;
      return b.count - a.count; // Sort by task count
    });
  }, [tasks, teamMembers]);

  // Instant client-side filtering (no delays!)
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    const filtered = tasks.filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient =
        filterClient === "all" ||
        (filterClient === "none" && !task.client_id) ||
        task.client_id === filterClient;
      const matchesStatus =
        filterStatus === "all" || task.status === filterStatus;
      const matchesCategory =
        filterCategory === "all" || task.task_category === filterCategory;
      const matchesAssignee =
        filterAssignee === "all" ||
        (filterAssignee === "unassigned"
          ? !task.task_assignments?.length
          : task.task_assignments?.some(
              (a) => a.team_member_id === filterAssignee,
            ));
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;
      const matchesCompleted = showCompleted || task.status !== "completed";

      const result = matchesSearch &&
        matchesClient &&
        matchesStatus &&
        matchesCategory &&
        matchesAssignee &&
        matchesPriority &&
        matchesCompleted;

      return result;
    });

    return filtered;
  }, [
    tasks,
    searchTerm,
    filterClient,
    filterStatus,
    filterCategory,
    filterAssignee,
    filterPriority,
    showCompleted,
  ]);

  // Filter task groups
  const filteredTaskGroups = useMemo(() => {
    return taskGroups
      .filter((group) =>
        group.tasks.some((task) => filteredTasks.includes(task)),
      )
      .map((group) => ({
        ...group,
        tasks: group.tasks.filter((task) => filteredTasks.includes(task)),
        count: group.tasks.filter((task) => filteredTasks.includes(task))
          .length,
      }));
  }, [taskGroups, filteredTasks]);

  // Filter client groups
  const filteredClientGroups = useMemo(() => {
    return clientGroups
      .filter((group) =>
        group.tasks.some((task) => filteredTasks.includes(task)),
      )
      .map((group) => ({
        ...group,
        tasks: group.tasks.filter((task) => filteredTasks.includes(task)),
        count: group.tasks.filter((task) => filteredTasks.includes(task))
          .length,
      }));
  }, [clientGroups, filteredTasks]);

  // Filter assignee groups
  const filteredAssigneeGroups = useMemo(() => {
    return assigneeGroups
      .filter((group) =>
        group.tasks.some((task) => filteredTasks.includes(task)),
      )
      .map((group) => ({
        ...group,
        tasks: group.tasks.filter((task) => filteredTasks.includes(task)),
        count: group.tasks.filter((task) => filteredTasks.includes(task))
          .length,
      }));
  }, [assigneeGroups, filteredTasks]);

  // Optimistic task creation with React Query
  const handleCreateTask = async () => {
    if (!newTask.name) return;

    createTaskMutation.mutate(newTask, {
      onSuccess: () => {
        // Reset form
        setNewTask({
          name: "",
          description: "",
          client_id: "",
          type: "project",
          stage: "onboarding",
          priority: "medium",
          due_date: "",
          assigned_to: [],
          task_category: "client_facing",
        });
        setIsCreatingTask(false);
      },
      onError: (error) => {
        console.error("Error creating task:", error);
        alert("Failed to create task. Please try again.");
      },
    });
  };

  // Instant status updates with optimistic UI
  const handleTaskStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  // Instant assignment updates with optimistic UI
  const handleTaskAssignment = (taskId: string, memberIds: string[]) => {
    updateAssignmentMutation.mutate({ taskId, memberIds });
  };

  // Update task priority
  const handleTaskPriorityUpdate = (taskId: string, priority: TaskPriority) => {
    updatePriorityMutation.mutate({ taskId, priority });
  };

  // Delete single task with confirmation
  const handleDeleteTask = (taskId: string, taskName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${taskName}"? This action cannot be undone.`,
      )
    ) {
      setDeletingTasks(prev => [...prev, taskId]);
      deleteTaskMutation.mutate(taskId, {
        onSuccess: () => {
          setDeletingTasks(prev => prev.filter(id => id !== taskId));
        },
        onError: (error) => {
          console.error("Error deleting task:", error);
          alert("Failed to delete task. Please try again.");
          setDeletingTasks(prev => prev.filter(id => id !== taskId));
        },
      });
    }
  };

  // Bulk delete selected tasks
  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) return;

    const taskNames = selectedTasks.map(id =>
      tasks.find(t => t.id === id)?.name || 'Unknown'
    ).join(', ');

    if (confirm(`Are you sure you want to delete ${selectedTasks.length} tasks (${taskNames})? This action cannot be undone.`)) {
      setDeletingTasks(prev => [...prev, ...selectedTasks]);

      // Delete tasks one by one
      selectedTasks.forEach(taskId => {
        deleteTaskMutation.mutate(taskId, {
          onSuccess: () => {
            setDeletingTasks(prev => prev.filter(id => id !== taskId));
          },
          onError: (error) => {
            console.error("Error deleting task:", error);
            setDeletingTasks(prev => prev.filter(id => id !== taskId));
          }
        });
      });

      setSelectedTasks([]);
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Select all visible tasks
  const selectAllTasks = () => {
    const allTaskIds = filteredTasks.map(task => task.id);
    setSelectedTasks(allTaskIds);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      not_started: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
      in_progress: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      waiting_for_client:
        "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
      waiting_for_team:
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
      review_required:
        "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
      client_review:
        "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
      revision_needed: "bg-gradient-to-r from-pink-500 to-pink-600 text-white",
      completed: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
      blocked: "bg-gradient-to-r from-red-500 to-red-600 text-white",
      on_hold: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
    };
    return colors[status] || "bg-slate-500/90 text-slate-100";
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: "border-l-emerald-400 bg-emerald-50/5",
      medium: "border-l-amber-400 bg-amber-50/5",
      high: "border-l-orange-400 bg-orange-50/5",
      urgent: "border-l-red-400 bg-red-50/5",
    };
    return colors[priority] || "border-l-slate-400 bg-slate-50/5";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-admin-page>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-400">Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6" data-admin-page>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-400 mb-2">Failed to load tasks</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-admin-page>
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Tasks</h1>
          <p className="text-sm text-slate-400">
            {filteredTasks.length} tasks •{" "}
            {filteredTasks.filter((t) => t.status === "completed").length}{" "}
            completed
          </p>
        </div>
        <Button
          onClick={() => setIsCreatingTask(true)}
          className="btn-glass"
          disabled={createTaskMutation.isPending}
        >
          {createTaskMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          New Task
        </Button>
      </div>

      {/* Search and Quick Filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm(e.target.value)}
            className="pl-10 form-input"
          />
        </div>

        {/* Quick Status Filter */}
        <Select value={filterStatus} onValueChange={updateFilterStatus}>
          <SelectTrigger className="w-40 form-input">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateShowAdvancedFilters(!showAdvancedFilters)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
          <Button
            variant={viewMode === "tasks" ? "default" : "ghost"}
            size="sm"
            onClick={() => updateViewMode("tasks")}
            className="h-8 px-3"
            title="Group by Task Type"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "clients" ? "default" : "ghost"}
            size="sm"
            onClick={() => updateViewMode("clients")}
            className="h-8 px-3"
            title="Group by Client"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "assignees" ? "default" : "ghost"}
            size="sm"
            onClick={() => updateViewMode("assignees")}
            className="h-8 px-3"
            title="Group by Assignee"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className="glass-card-secondary border-slate-700/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">
                  Visibility
                </label>
                <Select
                  value={filterCategory}
                  onValueChange={updateFilterCategory}
                >
                  <SelectTrigger className="form-input h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="client_facing">
                      👁️ Client Visible
                    </SelectItem>
                    <SelectItem value="internal">🔒 Internal Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">
                  Client
                </label>
                <SearchableSelect
                  value={filterClient}
                  onValueChange={updateFilterClient}
                  placeholder="All Clients"
                  searchPlaceholder="Search clients..."
                  emptyText="No clients found."
                  options={[
                    { value: "all", label: "All Clients" },
                    { value: "none", label: "No Client" },
                    ...clients.map((client) => ({
                      value: client.id,
                      label: client.name,
                    })),
                  ]}
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">
                  Assignee
                </label>
                <Select
                  value={filterAssignee}
                  onValueChange={updateFilterAssignee}
                >
                  <SelectTrigger className="form-input h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">
                  Priority
                </label>
                <Select
                  value={filterPriority}
                  onValueChange={updateFilterPriority}
                >
                  <SelectTrigger className="form-input h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-completed"
                    checked={showCompleted}
                    onCheckedChange={(checked) =>
                      updateShowCompleted(checked === true)
                    }
                  />
                  <label
                    htmlFor="show-completed"
                    className="text-xs text-slate-400"
                  >
                    Show completed
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Task Form */}
      {isCreatingTask && (
        <Card className="glass-card border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">
                Create New Task
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingTask(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Visibility
              </label>
              <Select
                value={newTask.task_category}
                onValueChange={(value: TaskCategory) =>
                  setNewTask((prev) => ({ ...prev, task_category: value }))
                }
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_facing">
                    👁️ Client Visible
                  </SelectItem>
                  <SelectItem value="internal">🔒 Internal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Task Name
              </label>
              <Input
                value={newTask.name}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter task name"
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Client
              </label>
              <SearchableSelect
                value={newTask.client_id || "none"}
                onValueChange={(value) =>
                  setNewTask((prev) => ({
                    ...prev,
                    client_id: value === "none" ? "" : value,
                  }))
                }
                placeholder="Select client (optional for internal tasks)"
                searchPlaceholder="Search clients..."
                emptyText="No clients found."
                options={[
                  { value: "none", label: "No Client" },
                  ...clients.map((client) => ({
                    value: client.id,
                    label: client.name,
                  })),
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <Textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter task description"
                rows={3}
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type
                </label>
                <Select
                  value={newTask.type}
                  onValueChange={(value: any) =>
                    setNewTask((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">📞 Call</SelectItem>
                    <SelectItem value="project">🚀 Project</SelectItem>
                    <SelectItem value="revision">🔄 Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Stage
                </label>
                <Select
                  value={newTask.stage}
                  onValueChange={(value: any) =>
                    setNewTask((prev) => ({ ...prev, stage: value }))
                  }
                >
                  <SelectTrigger className="form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">🎯 Onboarding</SelectItem>
                    <SelectItem value="pre-production">🔧 Pre-Production</SelectItem>
                    <SelectItem value="production">🏭 Production</SelectItem>
                    <SelectItem value="launch">🚀 Launch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: TaskPriority) =>
                    setNewTask((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      due_date: e.target.value,
                    }))
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Assign To
              </label>
              <MultiTeamSelect
                teamMembers={teamMembers}
                selectedIds={newTask.assigned_to}
                onChange={(selectedIds) =>
                  setNewTask((prev) => ({ ...prev, assigned_to: selectedIds }))
                }
                className="w-full"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
              <Button
                variant="outline"
                onClick={() => setIsCreatingTask(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                disabled={createTaskMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                className="btn-glass"
                disabled={createTaskMutation.isPending || !newTask.name}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllTasks}
              className="h-7 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Select All ({filteredTasks.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-7 text-xs text-slate-400 hover:text-slate-300"
            >
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-7 text-xs"
              disabled={deletingTasks.length > 0}
            >
              {deletingTasks.length > 0 ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Selected
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Task Display - Clean & Compact */}
      {viewMode === "tasks" ? (
        <div className="space-y-4">
          {filteredTaskGroups.map((group) => (
            <div key={group.name} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center gap-3 px-1">
                <h3 className="text-lg font-medium text-white">{getStageDisplayName(group.name)}</h3>
                <Badge variant="outline" className="text-slate-400 text-xs">
                  {group.count}
                </Badge>
              </div>

              {/* Tasks Grid */}
              <div className="grid gap-3">
                {group.tasks
                  .filter((task) => filteredTasks.includes(task))
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`group relative border-l-4 ${getPriorityColor(task.priority)} bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 transition-all duration-200 ${selectedTasks.includes(task.id) ? 'ring-2 ring-cyan-500/50 bg-slate-800/60' : ''}`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            className="data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">
                              {task.task_category === "client_facing"
                                ? "👁️"
                                : "🔒"}
                            </span>
                            {task.clients && (
                              <span className="text-cyan-300 text-sm font-medium">
                                {task.clients.name}
                              </span>
                            )}
                            <Badge
                              className={`${getStatusColor(task.status)} text-xs px-2 py-1`}
                            >
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-slate-300 text-sm line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>{getStageDisplayName(task.stage)}</span>
                            <span>•</span>
                            <span>{task.type}</span>
                            <span>•</span>
                            <span className="capitalize">{task.priority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id, task.name)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            disabled={deletingTasks.includes(task.id)}
                          >
                            {deletingTasks.includes(task.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Select
                            value={task.status}
                            onValueChange={(value: TaskStatus) =>
                              handleTaskStatusUpdate(task.id, value)
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-600 hover:bg-slate-900/70">
                              {updateStatusMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">
                                Not Started
                              </SelectItem>
                              <SelectItem value="in_progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="waiting_for_client">
                                Waiting for Client
                              </SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <div className="relative">
                            {updateAssignmentMutation.isPending && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                              </div>
                            )}
                            <MultiTeamSelect
                              teamMembers={teamMembers}
                              selectedIds={
                                task.task_assignments?.map(
                                  (a) => a.team_member_id,
                                ) || []
                              }
                              onChange={(memberIds) =>
                                handleTaskAssignment(task.id, memberIds)
                              }
                              className="h-8 text-xs"
                              disabled={updateAssignmentMutation.isPending}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "clients" ? (
        <div className="space-y-4">
          {filteredClientGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center gap-3 px-1">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  {group.name === "Internal Tasks" ? "🔒" : "🏢"} {" "}
                  {group.name}
                </h3>
                <Badge variant="outline" className="text-slate-400 text-xs">
                  {group.count}
                </Badge>
              </div>

              {/* Tasks Grid */}
              <div className="grid gap-3">
                {group.tasks
                  .filter((task) => filteredTasks.includes(task))
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`group relative border-l-4 ${getPriorityColor(task.priority)} bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 transition-all duration-200 ${selectedTasks.includes(task.id) ? 'ring-2 ring-cyan-500/50 bg-slate-800/60' : ''}`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            className="data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">
                              {task.name}
                            </h4>
                            <Badge
                              className={`${getStatusColor(task.status)} text-xs px-2 py-1`}
                            >
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-slate-300 text-sm line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>{getStageDisplayName(task.stage)}</span>
                            <span>•</span>
                            <span>{task.type}</span>
                            <span>•</span>
                            <span className="capitalize">{task.priority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id, task.name)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          disabled={deletingTasks.includes(task.id)}
                        >
                          {deletingTasks.includes(task.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Select
                            value={task.status}
                            onValueChange={(value: TaskStatus) =>
                              handleTaskStatusUpdate(task.id, value)
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-600 hover:bg-slate-900/70">
                              {updateStatusMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">
                                Not Started
                              </SelectItem>
                              <SelectItem value="in_progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="waiting_for_client">
                                Waiting for Client
                              </SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <Select
                            value={task.priority}
                            onValueChange={(value: TaskPriority) => handleTaskPriorityUpdate(task.id, value)}
                            disabled={updatePriorityMutation.isPending}
                          >
                            <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-600 hover:bg-slate-900/70">
                              {updatePriorityMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">🟢 Low</SelectItem>
                              <SelectItem value="medium">🟡 Medium</SelectItem>
                              <SelectItem value="high">🟠 High</SelectItem>
                              <SelectItem value="urgent">🔴 Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <div className="relative">
                            {updateAssignmentMutation.isPending && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                              </div>
                            )}
                            <MultiTeamSelect
                              teamMembers={teamMembers}
                              selectedIds={
                                task.task_assignments?.map(
                                  (a) => a.team_member_id,
                                ) || []
                              }
                              onChange={(memberIds) =>
                                handleTaskAssignment(task.id, memberIds)
                              }
                              className="h-8 text-xs"
                              disabled={updateAssignmentMutation.isPending}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssigneeGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center gap-3 px-1">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  {group.name === "Unassigned" ? "👤 " : "👨‍💼 "}
                  {group.name}
                </h3>
                <Badge variant="outline" className="text-slate-400 text-xs">
                  {group.count}
                </Badge>
              </div>

              {/* Tasks Grid */}
              <div className="grid gap-3">
                {group.tasks
                  .filter((task) => filteredTasks.includes(task))
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`group relative border-l-4 ${getPriorityColor(task.priority)} bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 transition-all duration-200 ${selectedTasks.includes(task.id) ? 'ring-2 ring-cyan-500/50 bg-slate-800/60' : ''}`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            className="data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">
                                {task.name}
                              </h4>
                              <Badge
                                className={`${getStatusColor(task.status)} text-xs px-2 py-1`}
                              >
                                {task.status.replace("_", " ")}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-slate-300 text-sm line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                              <span>{getStageDisplayName(task.stage)}</span>
                              <span>•</span>
                              <span>{task.type}</span>
                              <span>•</span>
                              <span className="capitalize">{task.priority}</span>
                              {task.clients && (
                                <>
                                  <span>•</span>
                                  <span className="text-cyan-300">{task.clients.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id, task.name)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          disabled={deletingTasks.includes(task.id)}
                        >
                          {deletingTasks.includes(task.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Select
                            value={task.status}
                            onValueChange={(value: TaskStatus) => handleTaskStatusUpdate(task.id, value)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-600 hover:bg-slate-900/70">
                              {updateStatusMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Not Started</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <Select
                            value={task.priority}
                            onValueChange={(value: TaskPriority) => handleTaskPriorityUpdate(task.id, value)}
                            disabled={updatePriorityMutation.isPending}
                          >
                            <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-slate-600 hover:bg-slate-900/70">
                              {updatePriorityMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">🟢 Low</SelectItem>
                              <SelectItem value="medium">🟡 Medium</SelectItem>
                              <SelectItem value="high">🟠 High</SelectItem>
                              <SelectItem value="urgent">🔴 Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <div className="relative">
                            {updateAssignmentMutation.isPending && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                              </div>
                            )}
                            <MultiTeamSelect
                              teamMembers={teamMembers}
                              selectedIds={task.task_assignments?.map(a => a.team_member_id) || []}
                              onChange={(memberIds) => handleTaskAssignment(task.id, memberIds)}
                              className="h-8 text-xs"
                              disabled={updateAssignmentMutation.isPending}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
