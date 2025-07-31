import { TaskStatus, TaskPriority } from "@/types";
import { Target, Settings, Factory, Rocket, Phone, RefreshCw, Eye, Lock, Minus, AlertCircle, AlertTriangle, Zap } from "lucide-react";

// Stage configuration
export const STAGE_CONFIG = {
  onboarding: {
    order: 1,
    displayName: "Onboarding",
    icon: Target,
    value: "onboarding",
  },
  "pre-production": {
    order: 2,
    displayName: "Pre-Production",
    icon: Settings,
    value: "pre-production",
  },
  production: {
    order: 3,
    displayName: "Production",
    icon: Factory,
    value: "production",
  },
  launch: {
    order: 4,
    displayName: "Launch",
    icon: Rocket,
    value: "launch",
  },
} as const;

// Priority configuration
export const PRIORITY_CONFIG = {
  urgent: {
    order: 1,
    displayName: "Urgent",
    icon: Zap,
    color: "border-l-red-400 bg-red-50/5",
  },
  high: {
    order: 2,
    displayName: "High",
    icon: AlertTriangle,
    color: "border-l-orange-400 bg-orange-50/5",
  },
  medium: {
    order: 3,
    displayName: "Medium",
    icon: AlertCircle,
    color: "border-l-amber-400 bg-amber-50/5",
  },
  low: {
    order: 4,
    displayName: "Low",
    icon: Minus,
    color: "border-l-emerald-400 bg-emerald-50/5",
  },
} as const;

// Status colors configuration
export const STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
  in_progress: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
  waiting_for_client: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
  waiting_for_team: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
  review_required: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
  client_review: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
  revision_needed: "bg-gradient-to-r from-pink-500 to-pink-600 text-white",
  completed: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
  blocked: "bg-gradient-to-r from-red-500 to-red-600 text-white",
  on_hold: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
};

// Task type configuration
export const TASK_TYPE_CONFIG = {
  call: {
    displayName: "Call",
    icon: Phone,
    value: "call",
  },
  project: {
    displayName: "Project",
    icon: Rocket,
    value: "project",
  },
  revision: {
    displayName: "Revision",
    icon: RefreshCw,
    value: "revision",
  },
} as const;

// Task category configuration
export const TASK_CATEGORY_CONFIG = {
  client_facing: {
    displayName: "Client Visible",
    icon: Eye,
    value: "client_facing",
  },
  internal: {
    displayName: "Internal Only",
    icon: Lock,
    value: "internal",
  },
} as const;

// View mode configuration
export const VIEW_MODE_CONFIG = {
  tasks: {
    icon: "Filter",
    title: "Group by Task Type",
  },
  clients: {
    icon: "Calendar",
    title: "Group by Client",
  },
  assignees: {
    icon: "Users",
    title: "Group by Assignee",
  },
} as const;

// Default new task
export const DEFAULT_NEW_TASK = {
  name: "",
  description: "",
  client_id: "",
  type: "project" as const,
  stage: "onboarding" as const,
  priority: "medium" as TaskPriority,
  due_date: "",
  assigned_to: [] as string[],
  task_category: "client_facing" as const,
};