"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Phone, Briefcase, Edit3, Check } from "lucide-react";
import { TaskType, Stage, TaskStatus } from "@/types";
import Logo from "@/public/XMA-White.svg";
import { TaskStatusBadge } from "@/components/TaskStatusBadge";

interface Task {
  id: string;
  name: string;
  type: TaskType;
  stage: Stage;
  completed: boolean;
  status: TaskStatus;
  touchpoint: number;
  order_index: number;
  description?: string;
}

interface Client {
  id: string;
  name: string;
  frame_link?: string;
  google_drive_link?: string;
}

interface ClientPageContentProps {
  client: Client;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
  milestone1: number;
  milestone2: number;
  milestone3: number;
  tasksByStage: Record<Stage, Task[]>;
}

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
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function ClientPageContent({
  client,
  tasks,
  completedTasks,
  totalTasks,
  progressPercentage,
  milestone1,
  milestone2,
  milestone3,
  tasksByStage,
}: ClientPageContentProps) {
  return (
    <div className="min-h-screen relative">
      {/* Header like admin page */}
      <nav className="sticky top-0 z-50 p-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-card rounded-xl backdrop-blur-lg">
          <div className="px-6 py-4">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src={Logo}
                  alt="XMA Progress Logo"
                  className="h-8 w-auto"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header Section like admin */}
          <motion.div variants={itemVariants} className="rounded-xl py-6 backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold gradient-text">{client.name}</h2>
                <p className="text-muted-foreground">Project Progress Tracker</p>
              </div>
              {(client.frame_link || client.google_drive_link) && (
                <div className="flex items-center gap-3">
                  {client.frame_link && (
                    <a
                      href={client.frame_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-glass inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold group"
                    >
                      <ExternalLink className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-200" />
                      View Frame
                    </a>
                  )}
                  {client.google_drive_link && (
                    <a
                      href={client.google_drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-glass inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold group"
                    >
                      <ExternalLink className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-200" />
                      View Google Drive
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div variants={itemVariants} className="rounded-xl pt-6 pb-16 backdrop-blur-lg">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Overall Progress
                </h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {completedTasks} of {totalTasks} tasks
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative h-6 w-full overflow-hidden rounded-full bg-secondary/50 backdrop-blur-sm border border-accent/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent via-accent to-accent/80 shadow-lg relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  >
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-full"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      }}
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  </motion.div>

                  {/* Stage milestone marks */}
                  {[
                    { position: milestone1, label: "Onboarding" },
                    { position: milestone2, label: "Pre-production" },
                    { position: milestone3, label: "Production" },
                  ].map((milestone, index) => (
                    <div
                      key={index}
                      className="absolute top-0 h-full w-1 bg-accent/60 shadow-lg"
                      style={{ left: `${milestone.position}%` }}
                      title={`End of ${milestone.label}`}
                    />
                  ))}
                </div>

                {/* Stage labels */}
                <div className="flex justify-between text-xs font-semibold tracking-wide text-muted-foreground">
                  <span>Onboarding</span>
                  <span>Pre-production</span>
                  <span>Production</span>
                  <span>Launch</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tasks by Stage */}
          <div className="space-y-6">
            {stageOrder.map((stage, stageIndex) => (
              <motion.div
                key={stage}
                variants={itemVariants}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-border/20">
                  <div className="w-1 h-6 bg-accent rounded-full" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {stageLabels[stage]}
                  </h3>
                  <div className="text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md">
                    {tasksByStage[stage]?.filter((t) => t.completed).length ||
                      0}{" "}
                    / {tasksByStage[stage]?.length || 0}
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
                        delay: stageIndex * 0.1 + taskIndex * 0.05,
                        ease: "easeOut",
                      }}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 group hover:bg-secondary/20 ${
                        task.completed ? "opacity-60" : ""
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          task.completed
                            ? "border-green-500 bg-green-500"
                            : "border-slate-700 group-hover:border-accent/50"
                        }`}
                      >
                        {task.completed && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>

                      <div
                        className={`p-1.5 rounded-md transition-all duration-200 ${getTaskColor(task.type)} ${
                          task.completed ? "opacity-50" : ""
                        }`}
                      >
                        {getTaskIcon(task.type)}
                      </div>

                      <div className="flex-1">
                        <span
                          className={`block transition-all duration-200 ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.name}
                        </span>
                        {task.description && (
                          <p className={`text-sm mt-1 transition-all duration-200 ${
                            task.completed
                              ? "text-muted-foreground/70"
                              : "text-muted-foreground"
                          }`}>
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <TaskStatusBadge status={task.status} />
                        <span className="text-xs text-muted-foreground font-medium">
                          #{task.touchpoint}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {(!tasksByStage[stage] ||
                    tasksByStage[stage].length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No tasks in this stage yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

