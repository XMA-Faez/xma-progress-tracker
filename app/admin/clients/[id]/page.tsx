"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Info,
  Phone,
  Briefcase,
  Edit3,
  ExternalLink,
  Check,
} from "lucide-react";
import { Client, ClientTask, Stage, TaskType } from "@/types";

const stageOrder: Stage[] = [
  "onboarding",
  "pre-production",
  "production",
  "launch",
];
const stageLabels = {
  onboarding: "ONBOARDING",
  "pre-production": "PRE-PRODUCTION",
  production: "PRODUCTION",
  launch: "LAUNCH",
};

export default function ManageClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [clientId, setClientId] = useState<string>("");
  const [client, setClient] = useState<Client | null>(null);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditLinksModalOpen, setIsEditLinksModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    name: "",
    type: "project" as TaskType,
    stage: "onboarding" as Stage,
    description: "",
  });
  const [linksForm, setLinksForm] = useState({
    frame_link: "",
    google_drive_link: "",
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setClientId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (clientId) {
      fetchClientAndTasks();
    }
  }, [clientId]);

  const fetchClientAndTasks = async () => {
    try {
      const supabase = createClient();

      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);
      setLinksForm({
        frame_link: clientData.frame_link || "",
        google_drive_link: clientData.google_drive_link || "",
      });

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("client_tasks")
        .select("*")
        .eq("client_id", clientId)
        .order("order_index", { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("client_tasks")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
              }
            : task,
        ),
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("client_tasks")
        .update({
          name: taskForm.name,
          type: taskForm.type,
          stage: taskForm.stage,
          description: taskForm.description,
        })
        .eq("id", selectedTask.id);

      if (error) throw error;

      fetchClientAndTasks();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleAddTask = async () => {
    if (!client) return;

    try {
      const maxOrder = Math.max(...tasks.map((t) => t.order_index), 0);
      const nextTouchpoint = Math.max(...tasks.map((t) => t.touchpoint), 0) + 1;

      const supabase = createClient();
      const { error } = await supabase.from("client_tasks").insert({
        client_id: client.id,
        name: taskForm.name,
        type: taskForm.type,
        stage: taskForm.stage,
        description: taskForm.description,
        touchpoint: nextTouchpoint,
        order_index: maxOrder + 1,
        completed: false,
      });

      if (error) throw error;

      fetchClientAndTasks();
      setIsAddModalOpen(false);
      setTaskForm({
        name: "",
        type: "project",
        stage: "onboarding",
        description: "",
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("client_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      fetchClientAndTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdateLinks = async () => {
    if (!client) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("clients")
        .update({
          frame_link: linksForm.frame_link || null,
          google_drive_link: linksForm.google_drive_link || null,
        })
        .eq("id", client.id);

      if (error) throw error;

      fetchClientAndTasks();
      setIsEditLinksModalOpen(false);
    } catch (error) {
      console.error("Error updating links:", error);
    }
  };

  const openEditModal = (task: ClientTask) => {
    setSelectedTask(task);
    setTaskForm({
      name: task.name,
      type: task.type,
      stage: task.stage,
      description: task.description || "",
    });
    setIsEditModalOpen(true);
  };

  const openInfoModal = (task: ClientTask) => {
    setSelectedTask(task);
    setIsInfoModalOpen(true);
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "revision":
        return <Edit3 className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getTaskColor = (type: TaskType) => {
    switch (type) {
      case "call":
        return "text-red-400";
      case "revision":
        return "text-amber-400";
      default:
        return "text-blue-400";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">Loading...</div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-64 items-center justify-center">
        Client not found
      </div>
    );
  }

  // Group tasks by stage
  const tasksByStage = tasks.reduce(
    (acc, task) => {
      if (!acc[task.stage]) acc[task.stage] = [];
      acc[task.stage].push(task);
      return acc;
    },
    {} as Record<Stage, ClientTask[]>,
  );

  return (
    <div className="space-y-6 relative">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/40 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-accent" />
              </Link>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold gradient-text">{client.name}</h2>
                <p className="text-muted-foreground">Task Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditLinksModalOpen(true)}
                className="btn-glass"
              >
                Edit Links
              </Button>
              <Link
                href={`/client/${client.unique_link}`}
                target="_blank"
                className="inline-flex items-center"
              >
                <Button variant="outline" size="sm" className="btn-glass">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Client Page
                </Button>
              </Link>
              <Button onClick={() => setIsAddModalOpen(true)} className="btn-glass">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Minimal Tasks by Stage */}
        <div className="space-y-6">
          {stageOrder.map((stage, stageIndex) => (
            <motion.div 
              key={stage} 
              variants={itemVariants}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-border/20">
                <div className="w-1 h-6 bg-accent rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">{stageLabels[stage]}</h3>
                <div className="text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md">
                  {tasksByStage[stage]?.filter(t => t.completed).length || 0} / {tasksByStage[stage]?.length || 0}
                </div>
              </div>
              
              <div className="space-y-0.5">
                {tasksByStage[stage]?.map((task, taskIndex) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: (stageIndex * 0.1) + (taskIndex * 0.05),
                      ease: "easeOut"
                    }}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 group hover:bg-secondary/20 ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id, !task.completed)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-border group-hover:border-accent/50'
                      }`}
                    >
                      {task.completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    
                    <div className={`p-1.5 rounded-md transition-all duration-200 ${getTaskColor(task.type)} ${
                      task.completed ? 'opacity-50' : ''
                    }`}>
                      {getTaskIcon(task.type)}
                    </div>
                    
                    <span
                      className={`flex-1 transition-all duration-200 ${
                        task.completed 
                          ? 'text-muted-foreground line-through' 
                          : 'text-foreground'
                      }`}
                    >
                      {task.name}
                    </span>
                    
                    <span className="text-xs text-muted-foreground font-medium">
                      #{task.touchpoint}
                    </span>

                    {/* Admin Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openInfoModal(task)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200"
                        title="View Info"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200"
                        title="Edit Task"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {(!tasksByStage[stage] || tasksByStage[stage].length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks in this stage yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Name</label>
              <Input
                value={taskForm.name}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={taskForm.type}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, type: e.target.value as TaskType })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2"
              >
                <option value="project">Project Task (Blue)</option>
                <option value="call">Call (Red)</option>
                <option value="revision">Revision (Yellow)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Stage</label>
              <select
                value={taskForm.stage}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, stage: e.target.value as Stage })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2"
              >
                {stageOrder.map((stage) => (
                  <option key={stage} value={stage}>
                    {stageLabels[stage]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEditTask} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Name</label>
              <Input
                value={taskForm.name}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, name: e.target.value })
                }
                placeholder="Enter task name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={taskForm.type}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, type: e.target.value as TaskType })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2"
              >
                <option value="project">Project Task (Blue)</option>
                <option value="call">Call (Red)</option>
                <option value="revision">Revision (Yellow)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Stage</label>
              <select
                value={taskForm.stage}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, stage: e.target.value as Stage })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2"
              >
                {stageOrder.map((stage) => (
                  <option key={stage} value={stage}>
                    {stageLabels[stage]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2"
                rows={3}
                placeholder="Enter task description"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddTask}
                className="flex-1"
                disabled={!taskForm.name}
              >
                Add Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Information</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Task Name
                </p>
                <p className="text-foreground">{selectedTask.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p className={getTaskColor(selectedTask.type)}>
                  {selectedTask.type.charAt(0).toUpperCase() +
                    selectedTask.type.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stage
                </p>
                <p className="text-foreground">
                  {stageLabels[selectedTask.stage]}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Touchpoint
                </p>
                <p className="text-foreground">{selectedTask.touchpoint}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p
                  className={
                    selectedTask.completed
                      ? "text-green-500"
                      : "text-yellow-500"
                  }
                >
                  {selectedTask.completed ? "Completed" : "Pending"}
                </p>
              </div>
              {selectedTask.completed_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed At
                  </p>
                  <p className="text-foreground">
                    {new Date(selectedTask.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-foreground">
                  {selectedTask.description || "No description available"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Links Modal */}
      <Dialog
        open={isEditLinksModalOpen}
        onOpenChange={setIsEditLinksModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Frame Link</label>
              <Input
                type="url"
                value={linksForm.frame_link}
                onChange={(e) =>
                  setLinksForm({ ...linksForm, frame_link: e.target.value })
                }
                placeholder="https://frame.io/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Google Drive Link</label>
              <Input
                type="url"
                value={linksForm.google_drive_link}
                onChange={(e) =>
                  setLinksForm({
                    ...linksForm,
                    google_drive_link: e.target.value,
                  })
                }
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateLinks} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditLinksModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

