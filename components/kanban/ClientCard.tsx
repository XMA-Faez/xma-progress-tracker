"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TeamMember } from "@/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  unique_link: string;
  frame_link?: string;
  google_drive_link?: string;
  created_at: string;
  assigned_to?: string;
  assigned_member?: TeamMember;
}

interface ClientCardProps {
  client: Client;
  isDragging?: boolean;
}

export function ClientCard({ client, isDragging = false }: ClientCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: client.id,
    data: {
      type: "client",
      client,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass-card rounded-lg p-3 hover:shadow-md group cursor-grab active:cursor-grabbing border border-border/30 hover:border-border/50 transition-all duration-200 ${
        isDragging ? "rotate-1 scale-105 shadow-lg" : ""
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate text-foreground group-hover:text-accent transition-colors duration-200">
              {client.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(client.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              href={`/client/${client.unique_link}`}
              target="_blank"
              className="p-1 rounded hover:bg-secondary/50 transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
              title="View client page"
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-accent transition-colors duration-200" />
            </Link>
          </div>
        </div>

        <Link
          href={`/admin/clients/${client.id}`}
          className="block text-xs text-muted-foreground hover:text-accent transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          Manage tasks →
        </Link>

        {client.assigned_member && (
          <div className="flex items-center gap-1.5 pt-1">
            <div
              className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center"
              title={client.assigned_member.name}
            >
              <span className="text-xs font-medium text-accent">
                {client.assigned_member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {client.assigned_member.name.split(" ")[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export type { Client, ClientCardProps };

