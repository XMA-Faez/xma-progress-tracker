import { useMemo } from "react";
import { ClientTask } from "@/types";
import { TaskFilters } from "./useTaskFilters";

export function useFilteredTasks(tasks: ClientTask[], filters: TaskFilters) {
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      const matchesSearch =
        filters.searchTerm === "" ||
        task.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        task.clients?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesClient =
        filters.filterClient === "all" ||
        (filters.filterClient === "none" && !task.client_id) ||
        task.client_id === filters.filterClient;

      const matchesStatus = filters.filterStatus === "all" || task.status === filters.filterStatus;

      const matchesCategory = filters.filterCategory === "all" || task.task_category === filters.filterCategory;

      const matchesAssignee =
        filters.filterAssignee === "all" ||
        (filters.filterAssignee === "unassigned"
          ? !task.task_assignments?.length
          : task.task_assignments?.some((a) => a.team_member_id === filters.filterAssignee));

      const matchesPriority = filters.filterPriority === "all" || task.priority === filters.filterPriority;

      const matchesCompleted = filters.showCompleted || task.status !== "completed";

      return (
        matchesSearch &&
        matchesClient &&
        matchesStatus &&
        matchesCategory &&
        matchesAssignee &&
        matchesPriority &&
        matchesCompleted
      );
    });
  }, [tasks, filters]);

  return filteredTasks;
}