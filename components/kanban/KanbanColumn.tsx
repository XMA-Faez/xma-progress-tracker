"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TeamMember, Client } from "@/types";
import { User, GripVertical } from "lucide-react";
import { ClientCard } from "./ClientCard";
import { getPersonColor, ColorScheme } from "@/lib/colors";

interface KanbanColumnProps {
  id: string;
  teamMember: TeamMember | null;
  clients: Client[];
  onAssignClient: (clientId: string, teamMemberId: string | null) => void;
  isOverColumn: boolean;
  activeType: "client" | "column" | null;
  colorMap?: Map<string, ColorScheme>;
}

export function KanbanColumn({
  id,
  teamMember,
  clients,
  isOverColumn,
  activeType,
  colorMap,
}: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "column",
      teamMember,
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: id,
  });

  // Determine if this is a valid drop zone
  const isValidDropZone = activeType === "client";
  const shouldHighlight = isOverColumn && isValidDropZone;
  
  // Get color scheme for this team member from color map or fallback
  const colorScheme = teamMember 
    ? (colorMap?.get(teamMember.id) || getPersonColor(teamMember.id, teamMember.name))
    : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-80">
      <div
        ref={setDroppableRef}
        className={`glass-card rounded-xl p-4 h-full transition-all duration-200 ${
          shouldHighlight
            ? "ring-2 ring-accent ring-opacity-50 bg-accent/5 scale-[1.02] shadow-lg"
            : isOverColumn && activeType === "column"
              ? colorScheme 
                ? `ring-2 ${colorScheme.border} ring-opacity-50 ${colorScheme.bg}/50`
                : "ring-2 ring-blue-500 ring-opacity-50 bg-blue-500/5"
              : colorScheme
                ? `border-t-2 ${colorScheme.border}`
                : ""
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className={`flex items-center gap-2 mb-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            shouldHighlight ? "text-accent" : ""
          } ${activeType === "column" && isOverColumn 
            ? colorScheme ? colorScheme.text : "text-blue-500" 
            : ""
          }`}
          title="Drag to reorder columns"
        >
          <div className="opacity-100 transition-colors group-hover:opacity-100">
            <GripVertical className={`h-4 w-4 transition-colors ${
              colorScheme ? colorScheme.text : "text-muted-foreground hover:text-foreground"
            }`} />
          </div>
          <h3 className={`text-base font-medium flex-1 ${
            colorScheme ? colorScheme.text : "text-foreground"
          }`}>
            {teamMember ? teamMember.name : "Unassigned"}
          </h3>
          <div
            className={`text-xs px-1.5 py-0.5 rounded transition-all duration-200 ${
              shouldHighlight
                ? "bg-accent/20 text-accent"
                : colorScheme
                  ? `${colorScheme.bg} ${colorScheme.text}`
                  : "text-muted-foreground bg-secondary/20"
            }`}
          >
            {clients.length}
          </div>
          {shouldHighlight && (
            <div className="text-xs text-accent font-medium animate-pulse">
              Drop here
            </div>
          )}
        </div>

        <SortableContext
          items={clients.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={`space-y-2 min-h-24 transition-all duration-200 ${
              shouldHighlight
                ? "bg-accent/5 rounded-lg border-2 border-dashed border-accent/30 p-2"
                : ""
            }`}
          >
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} colorMap={colorMap} />
            ))}
            {clients.length === 0 && (
              <div
                className={`text-center py-8 transition-all duration-200 ${
                  shouldHighlight ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <User
                  className={`h-8 w-8 mx-auto mb-2 transition-all duration-200 ${
                    shouldHighlight ? "text-accent opacity-80" : "opacity-30"
                  }`}
                />
                <p className="text-xs">
                  {shouldHighlight ? "Drop client here" : "No clients"}
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export type { KanbanColumnProps };

