import { useMemo } from "react";
import { ClientTask, TeamMember } from "@/types";
import { getStageOrder, getPriorityOrder } from "@/components/task-management/utils";

export interface TaskGroup {
  name: string;
  tasks: ClientTask[];
  count: number;
  clients: string[];
  statuses: string[];
}

export interface ClientGroup {
  id: string;
  name: string;
  tasks: ClientTask[];
  count: number;
  statuses: string[];
}

export function useTaskGroups(tasks: ClientTask[]) {
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
      if (task.clients?.name && !groups[stageName].clients.includes(task.clients.name)) {
        groups[stageName].clients.push(task.clients.name);
      }

      // Collect unique statuses
      if (!groups[stageName].statuses.includes(task.status)) {
        groups[stageName].statuses.push(task.status);
      }
    });

    // Sort tasks within each group by priority, then by name
    Object.values(groups).forEach((group) => {
      group.tasks.sort((a, b) => {
        const priorityOrderA = getPriorityOrder(a.priority);
        const priorityOrderB = getPriorityOrder(b.priority);
        if (priorityOrderA !== priorityOrderB) {
          return priorityOrderA - priorityOrderB;
        }
        return a.name.localeCompare(b.name);
      });
    });

    // Sort groups by stage order
    return Object.values(groups).sort((a, b) => {
      const stageOrderA = getStageOrder(a.name);
      const stageOrderB = getStageOrder(b.name);
      if (stageOrderA !== stageOrderB) {
        return stageOrderA - stageOrderB;
      }
      return b.count - a.count;
    });
  }, [tasks]);

  return taskGroups;
}

export function useClientGroups(tasks: ClientTask[]) {
  const clientGroups = useMemo(() => {
    const groups: Record<string, ClientGroup> = {};

    tasks.forEach((task) => {
      const clientKey = task.task_category === "internal" ? "internal" : task.client_id || "unassigned";
      const clientName = task.task_category === "internal" ? "Internal Tasks" : task.clients?.name || "Unassigned";

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

  return clientGroups;
}

export function useAssigneeGroups(tasks: ClientTask[], teamMembers: TeamMember[]) {
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
          const assigneeName = teamMembers.find((m) => m.id === assignment.team_member_id)?.name || "Unknown";

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
          if (!groups[assigneeKey].tasks.find((t) => t.id === task.id)) {
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

  return assigneeGroups;
}