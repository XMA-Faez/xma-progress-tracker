"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  FileText,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import Logo from "@/public/XMA-White.svg";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/UserDropdown";

interface Client {
  id: string;
  name: string;
  unique_link: string;
}

interface AdminSidebarProps {
  userEmail: string;
  userName: string;
  profileImage?: string;
  isAdmin?: boolean;
}

export function AdminSidebar({ userEmail, userName, profileImage, isAdmin = false }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isClientsExpanded, setIsClientsExpanded] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Auto-hide sidebar on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchClients = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, unique_link")
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const navigationItems = [
    {
      href: "/admin",
      icon: Home,
      label: "Dashboard",
      active: pathname === "/admin",
    },
    {
      href: "/admin/my-tasks",
      icon: FileText,
      label: "My Tasks",
      active: pathname === "/admin/my-tasks",
    },
    {
      href: "/admin/task-management",
      icon: Calendar,
      label: "Task Management",
      active: pathname === "/admin/task-management",
      adminOnly: true,
    },
    {
      href: "/admin/team",
      icon: Users,
      label: "Team",
      active: pathname === "/admin/team",
    },
    {
      href: "/admin/overview",
      icon: BarChart3,
      label: "Overview",
      active: pathname === "/admin/overview",
    },
  ];

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="glass-card p-2"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        className={`
          fixed left-0 top-0 h-full glass-card backdrop-blur-lg border-r !border-l-0 !border-y-0 !border-border/20 z-40
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          transition-transform duration-300 md:transition-none
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex items-center space-x-3"
                >
                  <Image
                    src={Logo}
                    alt="XMA Progress Logo"
                    className="h-8 w-auto"
                    width={32}
                    height={32}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 hover:bg-accent/10"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-200 ${
                  isCollapsed ? "" : "rotate-180"
                }`}
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigationItems
              .filter(item => !item.adminOnly || isAdmin)
              .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    item.active
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}

            {/* Clients Section */}
            <div className="pt-4">
              <button
                onClick={() => setIsClientsExpanded(!isClientsExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="font-medium"
                      >
                        Clients
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isClientsExpanded ? "" : "-rotate-90"
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence>
                {isClientsExpanded && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-2 space-y-1 max-h-64 overflow-y-auto"
                  >
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center gap-2">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          onClick={() => setIsMobileOpen(false)}
                          className={`
                            flex-1 px-3 py-2 rounded-md text-sm transition-colors
                            ${
                              pathname === `/admin/clients/${client.id}`
                                ? "bg-accent/10 text-accent"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }
                          `}
                        >
                          <span className="truncate">{client.name}</span>
                        </Link>
                        <Link
                          href={`/client/${client.unique_link}`}
                          target="_blank"
                          className="p-1 rounded-md text-slate-400 hover:text-accent hover:bg-accent/10 transition-colors"
                          title="View client page"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No clients yet
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* User Dropdown at Bottom */}
          <div className="mt-auto pt-4 border-t border-border/20">
            <AnimatePresence>
              {!isCollapsed ? (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  <UserDropdown
                    userEmail={userEmail}
                    userName={userName}
                    profileImage={profileImage}
                  />
                </motion.div>
              ) : (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex justify-center"
                >
                  <UserDropdown
                    userEmail={userEmail}
                    userName={userName}
                    profileImage={profileImage}
                    compact={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
