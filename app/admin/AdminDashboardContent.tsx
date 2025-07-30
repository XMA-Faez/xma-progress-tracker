'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ExternalLink, FolderOpen, Search, Pin } from 'lucide-react'

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
  pinnedClientIds: string[]
  userId?: string
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

export default function AdminDashboardContent({ clients, pinnedClientIds, userId }: AdminDashboardContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [pinnedIds, setPinnedIds] = useState<string[]>(pinnedClientIds)
  const [loadingPins, setLoadingPins] = useState<Set<string>>(new Set())

  const filteredClients = useMemo(() => {
    if (!clients) return null
    
    let filtered = clients
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = clients.filter(client => 
        client.name.toLowerCase().includes(lowerSearchTerm)
      )
    }
    
    // Sort by pinned status, then by creation date
    return filtered.sort((a, b) => {
      const aIsPinned = pinnedIds.includes(a.id)
      const bIsPinned = pinnedIds.includes(b.id)
      
      if (aIsPinned && !bIsPinned) return -1
      if (!aIsPinned && bIsPinned) return 1
      
      // If both have same pin status, sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [clients, searchTerm, pinnedIds])

  const togglePin = async (clientId: string) => {
    if (!userId || loadingPins.has(clientId)) return
    
    const isPinned = pinnedIds.includes(clientId)
    
    // Add to loading state
    setLoadingPins(new Set(loadingPins).add(clientId))
    
    // Optimistic update - update UI immediately
    if (isPinned) {
      setPinnedIds(pinnedIds.filter(id => id !== clientId))
    } else {
      setPinnedIds([...pinnedIds, clientId])
    }
    
    try {
      const response = await fetch('/api/pins', {
        method: isPinned ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, userId })
      })
      
      if (!response.ok) {
        // Revert on error
        if (isPinned) {
          setPinnedIds([...pinnedIds, clientId])
        } else {
          setPinnedIds(pinnedIds.filter(id => id !== clientId))
        }
        console.error('Failed to update pin status')
      }
    } catch (error) {
      // Revert on error
      if (isPinned) {
        setPinnedIds([...pinnedIds, clientId])
      } else {
        setPinnedIds(pinnedIds.filter(id => id !== clientId))
      }
      console.error('Error toggling pin:', error)
    } finally {
      // Remove from loading state
      setLoadingPins(prev => {
        const newSet = new Set(prev)
        newSet.delete(clientId)
        return newSet
      })
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 relative"
    >
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 backdrop-blur-lg relative z-10">
        <div className="flex items-center justify-between mb-4">
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
          {filteredClients && filteredClients.length > 0 ? (
            <>
              {pinnedIds.length > 0 && filteredClients.some(c => pinnedIds.includes(c.id)) && (
                <div className="col-span-full flex items-center gap-4 mb-2">
                  <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-yellow-500 font-medium">Pinned Clients</span>
                  <div className="flex-1 h-px bg-yellow-500/30" />
                </div>
              )}
              {filteredClients.map((client, index) => {
                const isPinned = pinnedIds.includes(client.id)
                const prevClient = index > 0 ? filteredClients[index - 1] : null
                const prevIsPinned = prevClient ? pinnedIds.includes(prevClient.id) : false
                const showDivider = isPinned !== prevIsPinned && index > 0 && pinnedIds.length > 0
                
                return (
                  <>
                    {showDivider && (
                    <div className="col-span-full flex items-center gap-4 my-2">
                      <div className="flex-1 h-px bg-border/30" />
                      <span className="text-xs text-muted-foreground font-medium">Other Clients</span>
                      <div className="flex-1 h-px bg-border/30" />
                    </div>
                  )}
            <motion.div
              key={client.id} 
              variants={itemVariants}
              className="glass-card rounded-xl p-6 hover:glass-card-active group"
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        togglePin(client.id)
                      }}
                      disabled={loadingPins.has(client.id)}
                      className={`p-2 rounded-lg border transition-all duration-200 relative ${
                        pinnedIds.includes(client.id)
                          ? 'bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30'
                          : 'bg-secondary/30 border-border/50 hover:bg-secondary/50'
                      } ${
                        loadingPins.has(client.id) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={pinnedIds.includes(client.id) ? 'Unpin client' : 'Pin client'}
                    >
                      <Pin className={`h-4 w-4 transition-all duration-200 ${
                        pinnedIds.includes(client.id)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground'
                      } ${
                        loadingPins.has(client.id) ? 'animate-pulse' : ''
                      }`} />
                    </button>
                    <Link
                      href={`/client/${client.unique_link}`}
                      target="_blank"
                      className="p-2 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/40 transition-all duration-200 group/link"
                    >
                      <ExternalLink className="h-4 w-4 text-accent group-hover/link:scale-110 transition-transform duration-200" />
                    </Link>
                  </div>
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
                </>
                )
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
                  <p className="text-muted-foreground">Try adjusting your search term</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
