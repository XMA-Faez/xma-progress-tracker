import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface TaskFilters {
  searchTerm: string;
  filterClient: string;
  filterStatus: string;
  filterCategory: string;
  filterAssignee: string;
  filterPriority: string;
  viewMode: "tasks" | "clients" | "assignees";
  showCompleted: boolean;
  showAdvancedFilters: boolean;
}

export interface UseTaskFiltersReturn extends TaskFilters {
  updateSearchTerm: (value: string) => void;
  updateFilterClient: (value: string) => void;
  updateFilterStatus: (value: string) => void;
  updateFilterCategory: (value: string) => void;
  updateFilterAssignee: (value: string) => void;
  updateFilterPriority: (value: string) => void;
  updateViewMode: (value: "tasks" | "clients" | "assignees") => void;
  updateShowCompleted: (value: boolean) => void;
  updateShowAdvancedFilters: (value: boolean) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TaskFilters = {
  searchTerm: "",
  filterClient: "all",
  filterStatus: "all",
  filterCategory: "all",
  filterAssignee: "all",
  filterPriority: "all",
  viewMode: "tasks",
  showCompleted: false,
  showAdvancedFilters: false,
};

export function useTaskFilters(): UseTaskFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState<TaskFilters>(() => ({
    searchTerm: searchParams.get("search") || DEFAULT_FILTERS.searchTerm,
    filterClient: searchParams.get("client") || DEFAULT_FILTERS.filterClient,
    filterStatus: searchParams.get("status") || DEFAULT_FILTERS.filterStatus,
    filterCategory: searchParams.get("category") || DEFAULT_FILTERS.filterCategory,
    filterAssignee: searchParams.get("assignee") || DEFAULT_FILTERS.filterAssignee,
    filterPriority: searchParams.get("priority") || DEFAULT_FILTERS.filterPriority,
    viewMode: (searchParams.get("view") as "tasks" | "clients" | "assignees") || DEFAULT_FILTERS.viewMode,
    showCompleted: searchParams.get("completed") === "true",
    showAdvancedFilters: searchParams.get("advanced") === "true",
  }));

  // Function to update URL with current filter state
  const updateURL = useCallback(
    (updates: Partial<TaskFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = key
          .replace("filter", "")
          .replace(/([A-Z])/g, (match) => match.toLowerCase())
          .replace("searchterm", "search")
          .replace("viewmode", "view")
          .replace("showcompleted", "completed")
          .replace("showadvancedfilters", "advanced");

        if (value === "" || value === "all" || value === false || value === DEFAULT_FILTERS[key as keyof TaskFilters]) {
          params.delete(paramKey);
        } else {
          params.set(paramKey, value.toString());
        }
      });

      const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.push(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  // Create update functions
  const updateFilter = useCallback(
    <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      updateURL({ [key]: value });
    },
    [updateURL]
  );

  const updateSearchTerm = useCallback((value: string) => updateFilter("searchTerm", value), [updateFilter]);
  const updateFilterClient = useCallback((value: string) => updateFilter("filterClient", value), [updateFilter]);
  const updateFilterStatus = useCallback((value: string) => updateFilter("filterStatus", value), [updateFilter]);
  const updateFilterCategory = useCallback((value: string) => updateFilter("filterCategory", value), [updateFilter]);
  const updateFilterAssignee = useCallback((value: string) => updateFilter("filterAssignee", value), [updateFilter]);
  const updateFilterPriority = useCallback((value: string) => updateFilter("filterPriority", value), [updateFilter]);
  const updateViewMode = useCallback((value: "tasks" | "clients" | "assignees") => updateFilter("viewMode", value), [updateFilter]);
  const updateShowCompleted = useCallback((value: boolean) => updateFilter("showCompleted", value), [updateFilter]);
  const updateShowAdvancedFilters = useCallback((value: boolean) => updateFilter("showAdvancedFilters", value), [updateFilter]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  return {
    ...filters,
    updateSearchTerm,
    updateFilterClient,
    updateFilterStatus,
    updateFilterCategory,
    updateFilterAssignee,
    updateFilterPriority,
    updateViewMode,
    updateShowCompleted,
    updateShowAdvancedFilters,
    resetFilters,
  };
}