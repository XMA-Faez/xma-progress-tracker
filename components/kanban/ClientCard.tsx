"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TeamMember, Client } from "@/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { ColorScheme, getColorHex } from "@/lib/colors";
import { AssignedMemberAvatar } from "@/components/AssignedMemberAvatar";

interface ClientCardProps {
  client: Client;
  isDragging?: boolean;
  colorMap?: Map<string, ColorScheme>;
}

export function ClientCard({ client, isDragging = false, colorMap }: ClientCardProps) {
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

  // Get color scheme for the assigned team member
  const memberColor = client.assigned_member && colorMap?.get(client.assigned_member.id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: memberColor ? getColorHex(memberColor.name) : undefined,
        backgroundColor: memberColor ? `${getColorHex(memberColor.name)}15` : undefined,
      }}
      {...attributes}
      {...listeners}
      className={`glass-card rounded-lg p-3 hover:shadow-md group cursor-grab active:cursor-grabbing border-l-4 border-r border-t border-b transition-all duration-200 ${
        isDragging ? "rotate-1 scale-105 shadow-lg" : ""
      } ${
        memberColor 
          ? "border-r-border/30 border-t-border/30 border-b-border/30"
          : "border-border/30 hover:border-border/50"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium truncate text-foreground transition-colors duration-200 ${
              memberColor ? `group-hover:${memberColor.text}` : "group-hover:text-accent"
            }`}>
              {client.name}
            </h3>
            <div className="space-y-0.5 mt-0.5">
              <p className="text-xs text-muted-foreground">
                Created {new Date(client.created_at).toLocaleDateString()}
              </p>
              {client.launch_date && (
                <p className="text-xs text-accent font-medium">
                  Launch: {new Date(client.launch_date).toLocaleDateString()}
                </p>
              )}
            </div>
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
            <AssignedMemberAvatar 
              member={client.assigned_member} 
              colorMap={colorMap}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export type { ClientCardProps };

