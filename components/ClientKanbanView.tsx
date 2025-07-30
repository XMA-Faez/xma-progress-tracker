"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { TeamMember, Client } from "@/types";
import { ClientCard } from "./kanban/ClientCard";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { getUniqueColorsForTeam } from "@/lib/colors";

interface ClientKanbanViewProps {
  clients: Client[];
  teamMembers: TeamMember[];
  onClientAssignmentChange: (
    clientId: string,
    teamMemberId: string | null,
  ) => void;
}

export default function ClientKanbanView({
  clients,
  teamMembers,
  onClientAssignmentChange,
}: ClientKanbanViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"client" | "column" | null>(
    null,
  );
  const [overId, setOverId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    // Load column order from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanbanColumnOrder");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return ["unassigned", ...teamMembers.map((m) => m.id)];
  });
  const [clientsByMember, setClientsByMember] = useState<
    Record<string, Client[]>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Save column order to localStorage
  useEffect(() => {
    localStorage.setItem("kanbanColumnOrder", JSON.stringify(columnOrder));
  }, [columnOrder]);


  useEffect(() => {
    // Group clients by assigned team member
    const grouped: Record<string, Client[]> = {
      unassigned: [],
    };

    // Initialize columns for each team member
    teamMembers.forEach((member) => {
      grouped[member.id] = [];
    });

    // Group clients
    clients.forEach((client) => {
      if (!client.assigned_to) {
        grouped.unassigned.push(client);
      } else {
        if (grouped[client.assigned_to]) {
          grouped[client.assigned_to].push(client);
        } else {
          grouped.unassigned.push(client);
        }
      }
    });

    setClientsByMember(grouped);
  }, [clients, teamMembers]);

  // Generate unique colors for all team members
  const teamColorMap = useMemo(() => {
    return getUniqueColorsForTeam(teamMembers.map(m => ({ id: m.id, name: m.name })))
  }, [teamMembers]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { type } = active.data.current || {};

    setActiveId(active.id as string);
    setActiveType(type || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (over) {
      setOverId(over.id as string);
      
      // For columns, trigger reordering during drag for immediate feedback
      const activeType = active.data.current?.type;
      const activeId = active.id as string;
      const overId = over.id as string;
      
      if (activeType === 'column' && activeId !== overId && columnOrder.includes(overId)) {
        setColumnOrder((items) => {
          const oldIndex = items.indexOf(activeId);
          const newIndex = items.indexOf(overId);
          
          // Only reorder if crossing to the other side
          if (Math.abs(oldIndex - newIndex) >= 1) {
            return arrayMove(items, oldIndex, newIndex);
          }
          return items;
        });
      }
    } else {
      setOverId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);
    setOverId(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeType === "client") {
      // Handle client assignment
      const clientId = activeId;
      let targetMemberId: string | null = null;

      if (overId === "unassigned") {
        targetMemberId = null;
      } else if (teamMembers.find((m) => m.id === overId)) {
        targetMemberId = overId;
      } else {
        // Dropped on a client, find its column
        for (const [memberId, memberClients] of Object.entries(
          clientsByMember,
        )) {
          if (memberClients.find((c) => c.id === overId)) {
            targetMemberId = memberId === "unassigned" ? null : memberId;
            break;
          }
        }
      }

      // Only update if the assignment actually changed
      const client = clients.find((c) => c.id === clientId);
      if (client && client.assigned_to !== targetMemberId) {
        onClientAssignmentChange(clientId, targetMemberId);
      }
    }
  };

  const activeClient =
    activeType === "client" && activeId
      ? clients.find((c) => c.id === activeId)
      : null;

  const activeColumn =
    activeType === "column" && activeId
      ? activeId === "unassigned"
        ? null
        : teamMembers.find((m) => m.id === activeId)
      : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columnOrder.map((columnId) => {
            const isOverThisColumn = overId === columnId;

            if (columnId === "unassigned") {
              return (
                <KanbanColumn
                  key="unassigned"
                  id="unassigned"
                  teamMember={null}
                  clients={clientsByMember.unassigned || []}
                  onAssignClient={onClientAssignmentChange}
                  isOverColumn={isOverThisColumn}
                  activeType={activeType}
                  colorMap={teamColorMap}
                />
              );
            }

            const member = teamMembers.find((m) => m.id === columnId);
            if (!member) return null;

            return (
              <KanbanColumn
                key={member.id}
                id={member.id}
                teamMember={member}
                clients={clientsByMember[member.id] || []}
                onAssignClient={onClientAssignmentChange}
                isOverColumn={isOverThisColumn}
                activeType={activeType}
                colorMap={teamColorMap}
              />
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeType === "client" && activeClient ? (
          <ClientCard client={activeClient} isDragging />
        ) : activeType === "column" ? (
          <div className="w-80 opacity-80">
            <div className="glass-card rounded-lg p-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-foreground">
                  {activeColumn ? activeColumn.name : "Unassigned"}
                </h3>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
