"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultiTeamSelect } from "@/components/MultiTeamSelect";
import { X, Loader2 } from "lucide-react";
import { TeamMember, TaskPriority, TaskCategory } from "@/types";
import { DEFAULT_NEW_TASK, TASK_CATEGORY_CONFIG, TASK_TYPE_CONFIG, STAGE_CONFIG, PRIORITY_CONFIG } from "./constants";

interface Client {
  id: string;
  name: string;
}

interface CreateTaskFormProps {
  teamMembers: TeamMember[];
  clients: Client[];
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (task: typeof DEFAULT_NEW_TASK) => void;
}

export function CreateTaskForm({ teamMembers, clients, isCreating, onClose, onSubmit }: CreateTaskFormProps) {
  const [newTask, setNewTask] = useState(DEFAULT_NEW_TASK);

  const handleSubmit = () => {
    if (!newTask.name) return;
    onSubmit(newTask);
  };

  return (
    <Card className="glass-card border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">Create New Task</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            disabled={isCreating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Visibility */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
          <Select
            value={newTask.task_category}
            onValueChange={(value: TaskCategory) => setNewTask((prev) => ({ ...prev, task_category: value }))}
          >
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TASK_CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={config.value}>
                  {config.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Task Name</label>
          <Input
            value={newTask.name}
            onChange={(e) => setNewTask((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter task name"
            className="form-input"
          />
        </div>

        {/* Client */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
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

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <Textarea
            value={newTask.description}
            onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Enter task description"
            rows={3}
            className="form-input"
          />
        </div>

        {/* Grid of selects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <Select
              value={newTask.type}
              onValueChange={(value: any) => setNewTask((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="form-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={config.value}>
                    {config.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Stage</label>
            <Select
              value={newTask.stage}
              onValueChange={(value: any) => setNewTask((prev) => ({ ...prev, stage: value }))}
            >
              <SelectTrigger className="form-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={config.value}>
                    {config.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
            <Select
              value={newTask.priority}
              onValueChange={(value: TaskPriority) => setNewTask((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="form-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
            <Input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask((prev) => ({ ...prev, due_date: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>

        {/* Assign To */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Assign To</label>
          <MultiTeamSelect
            teamMembers={teamMembers}
            selectedIds={newTask.assigned_to}
            onChange={(selectedIds) => setNewTask((prev) => ({ ...prev, assigned_to: selectedIds }))}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="btn-glass" disabled={isCreating || !newTask.name}>
            {isCreating ? (
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
  );
}