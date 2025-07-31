"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ExternalLink,
  FolderOpen,
  Search,
  Pin,
  Grid,
  Columns,
  Users,
  Check,
  User,
  Palette,
} from "lucide-react";
import ClientKanbanView from "@/components/ClientKanbanView";
import { createClient } from "@/lib/supabase";
import { createTeamColorMap, getColorHex } from "@/lib/colors";
import { AssignedMemberAvatar } from "@/components/AssignedMemberAvatar";

interface Client {
  id: string;
  name: string;
  frame_link?: string;
  google_drive_link?: string;
  launch_date?: string;
  created_at: string;
  unique_link: string;
  assigned_to?: string;
  assigned_member?: TeamMember;
}

interface AdminDashboardContentProps {
  clients: Client[] | null;
  pinnedClientIds: string[];
  userId?: string;
  teamMembers: any[];
}

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

export default function AdminDashboardContent({
  clients: initialClients,
  pinnedClientIds,
  userId,
  teamMembers,
}: AdminDashboardContentProps) {
  const [clients, setClients] = useState(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>(pinnedClientIds);
  const [loadingPins, setLoadingPins] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    () => {
      // Load from localStorage on mount
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("selectedTeamMembers");
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    },
  );
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const teamSelectorRef = useRef<HTMLDivElement>(null);

  // Save selected team members to localStorage
  useEffect(() => {
    localStorage.setItem(
      "selectedTeamMembers",
      JSON.stringify(selectedTeamMembers),
    );
  }, [selectedTeamMembers]);

  // Close team selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teamSelectorRef.current &&
        !teamSelectorRef.current.contains(event.target as Node)
      ) {
        setShowTeamSelector(false);
      }
    };

    if (showTeamSelector) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTeamSelector]);

  const handleClientAssignmentChange = async (
    clientId: string,
    teamMemberId: string | null,
  ) => {
    // Optimistically update the local state
    const previousClients = [...(clients || [])];

    // Update the clients array with new assignment
    const updatedClients = clients?.map((client) => {
      if (client.id === clientId) {
        const assignedMember = teamMemberId
          ? teamMembers.find((m) => m.id === teamMemberId)
          : null;
        return {
          ...client,
          assigned_to: teamMemberId,
          assigned_member: assignedMember,
        };
      }
      return client;
    });

    setClients(updatedClients);

    try {
      const supabase = createClient();

      // Update the client's assigned_to field
      const { error } = await supabase
        .from("clients")
        .update({ assigned_to: teamMemberId })
        .eq("id", clientId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating client assignment:", error);
      // Revert on error
      setClients(previousClients);
      alert("Failed to update assignment. Please try again.");
    }
  };

  // Generate color map for team members
  const teamColorMap = useMemo(() => {
    return createTeamColorMap(
      teamMembers.map((m) => ({ id: m.id, color_index: m.color_index })),
    );
  }, [teamMembers]);

  const filteredClients = useMemo(() => {
    if (!clients) return null;

    let filtered = clients;
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(lowerSearchTerm),
      );
    }

    // Sort by pinned status, then by creation date
    return filtered.sort((a, b) => {
      const aIsPinned = pinnedIds.includes(a.id);
      const bIsPinned = pinnedIds.includes(b.id);

      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;

      // If both have same pin status, sort by creation date
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [clients, searchTerm, pinnedIds]);

  const togglePin = async (clientId: string) => {
    if (!userId || loadingPins.has(clientId)) return;

    const isPinned = pinnedIds.includes(clientId);

    // Add to loading state
    setLoadingPins(new Set(loadingPins).add(clientId));

    // Optimistic update - update UI immediately
    if (isPinned) {
      setPinnedIds(pinnedIds.filter((id) => id !== clientId));
    } else {
      setPinnedIds([...pinnedIds, clientId]);
    }

    try {
      const response = await fetch("/api/pins", {
        method: isPinned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, userId }),
      });

      if (!response.ok) {
        // Revert on error
        if (isPinned) {
          setPinnedIds([...pinnedIds, clientId]);
        } else {
          setPinnedIds(pinnedIds.filter((id) => id !== clientId));
        }
        console.error("Failed to update pin status");
      }
    } catch (error) {
      // Revert on error
      if (isPinned) {
        setPinnedIds([...pinnedIds, clientId]);
      } else {
        setPinnedIds(pinnedIds.filter((id) => id !== clientId));
      }
      console.error("Error toggling pin:", error);
    } finally {
      // Remove from loading state
      setLoadingPins((prev) => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 relative"
    >
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-xl p-6 backdrop-blur-lg relative z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold gradient-text">All Clients</h2>
            <p className="text-muted-foreground">
              Manage your client projects and track progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border/50 p-1 bg-secondary/20">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "kanban"
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Columns className="h-4 w-4" />
                Kanban
              </button>
            </div>

            {viewMode === "kanban" && (
              <div className="relative" ref={teamSelectorRef}>
                <button
                  onClick={() => setShowTeamSelector(!showTeamSelector)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedTeamMembers.length === 0
                      ? "Select Team Members"
                      : `${selectedTeamMembers.length} Selected`}
                  </span>
                </button>

                {showTeamSelector && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-slate-700">
                        <h3 className="text-sm font-semibold text-white">
                          Select Team Members
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Choose who to show in Kanban view
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        {teamMembers.map((member) => {
                          const isSelected = selectedTeamMembers.includes(
                            member.id,
                          );
                          return (
                            <button
                              key={member.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedTeamMembers(
                                    selectedTeamMembers.filter(
                                      (id) => id !== member.id,
                                    ),
                                  );
                                } else {
                                  setSelectedTeamMembers([
                                    ...selectedTeamMembers,
                                    member.id,
                                  ]);
                                }
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                                isSelected
                                  ? "bg-accent/20 text-white"
                                  : "hover:bg-slate-700 text-slate-300"
                              }`}
                            >
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-xs text-slate-400">
                                  {member.role}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-accent" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {selectedTeamMembers.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <button
                            onClick={() => setSelectedTeamMembers([])}
                            className="w-full px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <Link href="/admin/colors">
              <Button variant="outline" className="btn-glass h-12 px-4 gap-2">
                <Palette className="h-5 w-5" />
                <span className="font-semibold">Colors</span>
              </Button>
            </Link>
            <Link href="/admin/clients/new">
              <Button className="btn-glass h-12 px-6 gap-2">
                <Plus className="h-5 w-5" />
                <span className="font-semibold">Add New Client</span>
              </Button>
            </Link>
          </div>
        </div>

        {clients && clients.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 placeholder:text-muted-foreground/70"
            />
          </div>
        )}
      </motion.div>

      {!clients || clients.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-12 text-center backdrop-blur-lg"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-accent/10 border border-accent/20">
              <FolderOpen className="h-12 w-12 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No clients yet</h3>
              <p className="text-muted-foreground">
                Create your first client to get started tracking progress
              </p>
            </div>
            <Link href="/admin/clients/new">
              <Button className="btn-glass mt-4 h-12 px-6">
                <Plus className="mr-2 h-4 w-4" /> Create First Client
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredClients && filteredClients.length > 0 ? (
            <>
              {pinnedIds.length > 0 &&
                filteredClients.some((c) => pinnedIds.includes(c.id)) && (
                  <div className="col-span-full flex items-center gap-4 mb-2">
                    <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-yellow-500 font-medium">
                      Pinned Clients
                    </span>
                    <div className="flex-1 h-px bg-yellow-500/30" />
                  </div>
                )}
              {filteredClients.map((client, index) => {
                const isPinned = pinnedIds.includes(client.id);
                const prevClient =
                  index > 0 ? filteredClients[index - 1] : null;
                const prevIsPinned = prevClient
                  ? pinnedIds.includes(prevClient.id)
                  : false;
                const showDivider =
                  isPinned !== prevIsPinned &&
                  index > 0 &&
                  pinnedIds.length > 0;

                return (
                  <>
                    {showDivider && (
                      <div className="col-span-full flex items-center gap-4 my-2">
                        <div className="flex-1 h-px bg-border/30" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Other Clients
                        </span>
                        <div className="flex-1 h-px bg-border/30" />
                      </div>
                    )}
                    <motion.div
                      key={client.id}
                      variants={itemVariants}
                      className="glass-card rounded-xl p-6 hover:glass-card-active group border-l-4"
                      style={{
                        borderLeftColor:
                          client.assigned_member &&
                          teamColorMap.get(client.assigned_member.id)
                            ? getColorHex(
                                teamColorMap.get(client.assigned_member.id)!
                                  .name,
                              )
                            : "#64748b",
                        backgroundColor:
                          client.assigned_member &&
                          teamColorMap.get(client.assigned_member.id)
                            ? `${getColorHex(teamColorMap.get(client.assigned_member.id)!.name)}15`
                            : undefined,
                      }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3
                              className={`text-lg font-semibold truncate transition-all duration-300 ${
                                client.assigned_member &&
                                teamColorMap.get(client.assigned_member.id)
                                  ? `group-hover:${teamColorMap.get(client.assigned_member.id)!.text}`
                                  : "group-hover:gradient-text"
                              }`}
                            >
                              {client.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                Created{" "}
                                {new Date(
                                  client.created_at,
                                ).toLocaleDateString()}
                              </p>
                              {client.launch_date && (
                                <p className="text-xs text-accent font-medium">
                                  Launch:{" "}
                                  {new Date(
                                    client.launch_date,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {client.assigned_member && (
                                <div className="flex items-center gap-1.5">
                                  <AssignedMemberAvatar
                                    member={client.assigned_member}
                                    colorMap={teamColorMap}
                                    size="xs"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                togglePin(client.id);
                              }}
                              disabled={loadingPins.has(client.id)}
                              className={`p-1.5 rounded-md hover:bg-secondary/50 transition-all duration-200 ${
                                pinnedIds.includes(client.id)
                                  ? "opacity-100"
                                  : ""
                              } ${
                                loadingPins.has(client.id)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title={
                                pinnedIds.includes(client.id)
                                  ? "Unpin client"
                                  : "Pin client"
                              }
                            >
                              <Pin
                                className={`h-3.5 w-3.5 transition-all duration-200 ${
                                  pinnedIds.includes(client.id)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground hover:text-foreground"
                                } ${
                                  loadingPins.has(client.id)
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />
                            </button>
                            <Link
                              href={`/client/${client.unique_link}`}
                              target="_blank"
                              className="p-1.5 rounded-md hover:bg-secondary/50 transition-all duration-200 group/link"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-accent group-hover/link:text-accent transition-colors duration-200" />
                            </Link>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/20">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="block text-sm text-muted-foreground hover:text-accent transition-colors duration-200 font-medium"
                          >
                            Manage Tasks →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </>
                );
              })}
            </>
          ) : (
            <motion.div
              variants={itemVariants}
              className="col-span-full glass-card rounded-xl p-12 text-center backdrop-blur-lg"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-accent/10 border border-accent/20">
                  <Search className="h-12 w-12 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No clients found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search term
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <ClientKanbanView
            clients={
              selectedTeamMembers.length > 0
                ? (filteredClients || []).filter(
                    (client) =>
                      !client.assigned_to ||
                      selectedTeamMembers.includes(client.assigned_to),
                  )
                : filteredClients || []
            }
            teamMembers={
              selectedTeamMembers.length > 0
                ? teamMembers.filter((m) => selectedTeamMembers.includes(m.id))
                : teamMembers
            }
            onClientAssignmentChange={handleClientAssignmentChange}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
