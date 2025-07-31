"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Search, Filter, Calendar, Users } from "lucide-react";
import { TeamMember } from "@/types";
import { TaskFilters as TaskFiltersType } from "@/hooks/useTaskFilters";
import { TASK_CATEGORY_CONFIG, PRIORITY_CONFIG, VIEW_MODE_CONFIG } from "./constants";

interface Client {
  id: string;
  name: string;
}

interface TaskFiltersProps {
  filters: TaskFiltersType;
  teamMembers: TeamMember[];
  clients: Client[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClientChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onViewModeChange: (value: "tasks" | "clients" | "assignees") => void;
  onShowCompletedChange: (value: boolean) => void;
  onShowAdvancedFiltersChange: (value: boolean) => void;
}

export function TaskFilters({
  filters,
  teamMembers,
  clients,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onClientChange,
  onAssigneeChange,
  onPriorityChange,
  onViewModeChange,
  onShowCompletedChange,
  onShowAdvancedFiltersChange,
}: TaskFiltersProps) {
  return (
    <>
      {/* Search and Quick Filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 form-input"
          />
        </div>

        {/* Quick Status Filter */}
        <Select value={filters.filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40 form-input">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
            <SelectItem value="waiting_for_team">Waiting for Team</SelectItem>
            <SelectItem value="review_required">Review Required</SelectItem>
            <SelectItem value="client_review">Client Review</SelectItem>
            <SelectItem value="revision_needed">Revision Needed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowAdvancedFiltersChange(!filters.showAdvancedFilters)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
          <Button
            variant={filters.viewMode === "tasks" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("tasks")}
            className="h-8 px-3"
            title={VIEW_MODE_CONFIG.tasks.title}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant={filters.viewMode === "clients" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("clients")}
            className="h-8 px-3"
            title={VIEW_MODE_CONFIG.clients.title}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={filters.viewMode === "assignees" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("assignees")}
            className="h-8 px-3"
            title={VIEW_MODE_CONFIG.assignees.title}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {filters.showAdvancedFilters && (
        <Card className="glass-card-secondary !border-none !bg-transparent border-slate-700/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Visibility</label>
                <Select value={filters.filterCategory} onValueChange={onCategoryChange}>
                  <SelectTrigger className="form-input h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    {Object.entries(TASK_CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={config.value}>
                        {config.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Client</label>
                <SearchableSelect
                  value={filters.filterClient}
                  onValueChange={onClientChange}
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
                <label className="text-xs text-slate-400 mb-2 block">Assignee</label>
                <Select value={filters.filterAssignee} onValueChange={onAssigneeChange}>
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
                <label className="text-xs text-slate-400 mb-2 block">Priority</label>
                <Select value={filters.filterPriority} onValueChange={onPriorityChange}>
                  <SelectTrigger className="form-input h-9">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-completed"
                    checked={filters.showCompleted}
                    onCheckedChange={(checked) => onShowCompletedChange(checked === true)}
                  />
                  <label htmlFor="show-completed" className="text-xs text-slate-400">
                    Show completed
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
