"use client";

import { useState, useEffect } from "react";
import { Client, ClientTask, Stage } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";

interface ProductionOverviewProps {
  clients: (Client & { client_tasks: ClientTask[] })[];
}

export function ProductionOverview({ clients }: ProductionOverviewProps) {
  const [filteredClients, setFilteredClients] = useState(clients);
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");

  const stages: Stage[] = [
    "onboarding",
    "pre-production",
    "production",
    "launch",
  ];

  useEffect(() => {
    if (stageFilter === "all") {
      setFilteredClients(clients);
    } else {
      setFilteredClients(
        clients.filter(
          (client) => getCurrentStage(client.client_tasks) === stageFilter,
        ),
      );
    }
  }, [stageFilter, clients]);

  const getCurrentStage = (tasks: ClientTask[]): Stage => {
    const stageOrder = ["onboarding", "pre-production", "production", "launch"];

    // Debug logging
    if (tasks.length > 0) {
      console.log('Debug - Task analysis for client:', {
        totalTasks: tasks.length,
        tasksByStage: stageOrder.map(stage => ({
          stage,
          tasks: tasks.filter(t => t.stage === stage).map(t => ({
            name: t.name,
            status: t.status,
            completed: t.completed
          }))
        }))
      });
    }

    // Find the FIRST stage that has incomplete tasks (not the last one)
    for (let i = 0; i < stageOrder.length; i++) {
      const stage = stageOrder[i] as Stage;
      const stageTasks = tasks.filter((task) => task.stage === stage);
      
      // If this stage has tasks and any are incomplete, client is in this stage
      if (stageTasks.length > 0 && 
          stageTasks.some((task) => {
            // Handle both new status field and old completed field
            const isIncomplete = task.status ? 
              task.status !== "completed" : 
              !task.completed;
            
            console.log(`Task ${task.name} in ${stage}: status=${task.status}, completed=${task.completed}, isIncomplete=${isIncomplete}`);
            return isIncomplete;
          })
      ) {
        console.log(`Client determined to be in stage: ${stage}`);
        return stage;
      }
    }

    console.log('All tasks completed - client in launch stage');
    return "launch"; // All tasks completed
  };

  const getStageProgress = (tasks: ClientTask[], stage: Stage) => {
    const stageTasks = tasks.filter((task) => task.stage === stage);
    if (stageTasks.length === 0) return 0;
    const completedTasks = stageTasks.filter((task) => {
      // Handle both new status field and old completed field
      if (task.status) {
        return task.status === "completed";
      } else {
        return task.completed;
      }
    }).length;
    return Math.round((completedTasks / stageTasks.length) * 100);
  };

  const getOverallProgress = (tasks: ClientTask[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => {
      // Handle both new status field and old completed field
      if (task.status) {
        return task.status === "completed";
      } else {
        return task.completed;
      }
    }).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getClientsByStage = (stage: Stage) => {
    return filteredClients.filter(
      (client) => getCurrentStage(client.client_tasks) === stage,
    );
  };

  const getBlockedTasks = (tasks: ClientTask[]) => {
    return tasks.filter(
      (task) =>
        task.status === "blocked" ||
        task.status === "waiting_for_client" ||
        task.status === "revision_needed",
    );
  };

  const getStageColor = (stage: Stage) => {
    const colors = {
      onboarding: "bg-blue-500",
      "pre-production": "bg-yellow-500",
      production: "bg-purple-500",
      launch: "bg-green-500",
    };
    return colors[stage];
  };

  return (
    <div className="space-y-6">
      {/* Stage Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStageFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            stageFilter === "all"
              ? "bg-cyan-500 text-white"
              : "glass-card text-slate-300 hover:bg-slate-600"
          }`}
        >
          All Stages ({clients.length})
        </button>
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              stageFilter === stage
                ? "bg-cyan-500 text-white"
                : "glass-card text-slate-300 hover:bg-slate-600"
            }`}
          >
            {stage} ({getClientsByStage(stage).length})
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => (
          <div
            key={stage}
            className="glass-card rounded-xl border border-slate-700 p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${getStageColor(stage)}`} />
              <h3 className="text-lg font-semibold text-white capitalize">
                {stage}
              </h3>
              <span className="text-sm text-slate-400">
                ({getClientsByStage(stage).length})
              </span>
            </div>

            <div className="space-y-3">
              {getClientsByStage(stage).map((client) => {
                const overallProgress = getOverallProgress(client.client_tasks);
                const blockedTasks = getBlockedTasks(client.client_tasks);
                const currentStageTasks = client.client_tasks.filter(
                  (task) => task.stage === stage,
                );

                return (
                  <div
                    key={client.id}
                    className="glass-card-primary rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">
                        {client.name}
                      </h4>
                      <span className="text-xs text-slate-400">{overallProgress}%</span>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStageColor(stage)}`}
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>

                    {/* Current Tasks */}
                    <div className="space-y-2">
                      {currentStageTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-slate-300 truncate mr-2">
                            {task.name}
                          </span>
                          <TaskStatusBadge
                            status={task.status}
                            className="text-xs"
                          />
                        </div>
                      ))}
                      {currentStageTasks.length > 3 && (
                        <div className="text-xs text-slate-400 text-center">
                          +{currentStageTasks.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Blocked Tasks Alert */}
                    {blockedTasks.length > 0 && (
                      <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300">
                        ⚠️ {blockedTasks.length} blocked task
                        {blockedTasks.length > 1 ? "s" : ""}
                      </div>
                    )}

                    {/* Assigned Team Members */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Array.from(
                        new Set(
                          currentStageTasks
                            .flatMap(
                              (task) =>
                                task.task_assignments?.map(
                                  (a) => a.team_members?.name,
                                ) || [],
                            )
                            .filter(Boolean),
                        ),
                      ).map((memberName) => (
                        <span
                          key={memberName}
                          className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          {memberName}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

