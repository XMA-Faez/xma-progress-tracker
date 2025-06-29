'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ExternalLink, FolderOpen } from 'lucide-react'

interface Client {
  id: string
  name: string
  frame_link?: string
  google_drive_link?: string
  created_at: string
  unique_link: string
}

interface AdminDashboardContentProps {
  clients: Client[] | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function AdminDashboardContent({ clients }: AdminDashboardContentProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 relative"
    >
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 backdrop-blur-lg relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold gradient-text">All Clients</h2>
            <p className="text-muted-foreground">Manage your client projects and track progress</p>
          </div>
          <Link href="/admin/clients/new">
            <Button className="btn-glass h-12 px-6 gap-2">
              <Plus className="h-5 w-5" /> 
              <span className="font-semibold">Add New Client</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {(!clients || clients.length === 0) ? (
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-12 text-center backdrop-blur-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-accent/10 border border-accent/20">
              <FolderOpen className="h-12 w-12 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No clients yet</h3>
              <p className="text-muted-foreground">Create your first client to get started tracking progress</p>
            </div>
            <Link href="/admin/clients/new">
              <Button className="btn-glass mt-4 h-12 px-6">
                <Plus className="mr-2 h-4 w-4" /> Create First Client
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {clients.map((client, index) => (
            <motion.div
              key={client.id} 
              variants={itemVariants}
              className="glass-card rounded-xl p-6 hover:glass-card-active transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate group-hover:gradient-text transition-all duration-300">
                      {client.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/client/${client.unique_link}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/40 transition-all duration-200 group/link"
                  >
                    <ExternalLink className="h-4 w-4 text-accent group-hover/link:scale-110 transition-transform duration-200" />
                  </Link>
                </div>
                
                <div className="accent-border pl-4 space-y-3">
                  <div className="space-y-2">
                    <Link href={`/admin/clients/${client.id}`} className="block">
                      <Button variant="outline" className="w-full h-10 btn-glass">
                        <span className="font-semibold">Manage Tasks</span>
                      </Button>
                    </Link>
                    
                    {(client.frame_link || client.google_drive_link) && (
                      <div className="flex gap-2">
                        {client.frame_link && (
                          <a
                            href={client.frame_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full btn-glass">
                              Frame
                            </Button>
                          </a>
                        )}
                        {client.google_drive_link && (
                          <a
                            href={client.google_drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full btn-glass">
                              Drive
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}