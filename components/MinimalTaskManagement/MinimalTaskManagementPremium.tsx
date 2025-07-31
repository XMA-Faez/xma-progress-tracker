/**
 * Premium Enhanced MinimalTaskManagement Component
 * 
 * Refactored to use Context API and compound component pattern to eliminate prop drilling.
 * Now uses TaskManagementProvider to manage state centrally and provides clean component interfaces.
 */

"use client";

import React from "react";
import { TaskErrorState } from "@/components/task-management";

// Internal imports
import { MinimalTaskManagementProps } from "./types";
import { TaskManagementProvider } from "./context/TaskManagementProvider";
import { TaskManagementContentPremium } from "./components";
import { useTaskManagement } from "./hooks/useTaskManagement";
import "./MinimalTaskManagement.premium.css";

/**
 * Loading component with premium styling
 */
function TaskManagementLoading() {
  return (
    <div className="minimal-task-management-premium">
      <div className="loading-shimmer h-32 rounded-xl mb-6"></div>
      <div className="loading-shimmer h-24 rounded-lg mb-6"></div>
      <div className="space-y-4">
        <div className="loading-shimmer h-48 rounded-lg"></div>
        <div className="loading-shimmer h-48 rounded-lg"></div>
      </div>
    </div>
  );
}

/**
 * Error component with premium styling
 */
function TaskManagementError() {
  return (
    <div className="minimal-task-management-premium">
      <div className="glass-card-primary rounded-xl p-8 text-center">
        <TaskErrorState />
      </div>
    </div>
  );
}

/**
 * Main content component that uses the context
 */
function TaskManagementContent() {
  const { isLoading, error } = useTaskManagement();

  // Loading state with premium styling
  if (isLoading) {
    return <TaskManagementLoading />;
  }

  // Error state with premium styling
  if (error) {
    return <TaskManagementError />;
  }

  return (
    <div className="minimal-task-management-premium">
      <TaskManagementContentPremium />
    </div>
  );
}

/**
 * Main Premium component - now much cleaner with context-based state management
 */
export function MinimalTaskManagementPremium({
  teamMembers,
  clients,
  currentUser,
}: MinimalTaskManagementProps) {
  return (
    <TaskManagementProvider
      teamMembers={teamMembers}
      clients={clients}
      currentUser={currentUser}
    >
      <TaskManagementContent />
    </TaskManagementProvider>
  );
}

// Export enhanced version as default for easy adoption
export default MinimalTaskManagementPremium;
