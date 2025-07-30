'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Palette } from 'lucide-react'
import { TeamMember } from '@/types'
import { getPresetColors } from '@/lib/colors'

export default function ColorsManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const presetColors = getPresetColors()

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (error) throw error
      setTeamMembers(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = async (memberId: string, colorIndex: number | null) => {
    setSaving(memberId)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('team_members')
        .update({ color_index: colorIndex })
        .eq('id', memberId)

      if (error) throw error

      // Update local state
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, color_index: colorIndex }
            : member
        )
      )
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(null)
    }
  }

  const getUsedColorIndices = () => {
    return teamMembers
      .filter(member => member.color_index !== null && member.color_index !== undefined)
      .map(member => member.color_index!)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading team members...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/40 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-accent" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold gradient-text">Team Color Management</h1>
          <p className="text-muted-foreground">Assign colors to team members for visual identification</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-accent" />
                {member.name}
              </CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color, index) => {
                  const isUsed = getUsedColorIndices().includes(index) && member.color_index !== index
                  const isSelected = member.color_index === index
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleColorChange(member.id, index)}
                      disabled={isUsed || saving === member.id}
                      className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected 
                          ? `${color.bg} ${color.border} ring-2 ring-accent/50 scale-110` 
                          : isUsed
                            ? 'bg-slate-700/50 border-slate-600/50 cursor-not-allowed opacity-50'
                            : `${color.bg} ${color.border} hover:scale-105 hover:ring-1 hover:ring-accent/30`
                      }`}
                      title={isUsed ? `${color.name} (In Use)` : color.name}
                    >
                      {isSelected && (
                        <div className={`w-2 h-2 rounded-full ${color.accent}`} />
                      )}
                    </button>
                  )
                })}
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-border/20">
                <span className="text-sm text-muted-foreground">
                  Current: {member.color_index !== null ? presetColors[member.color_index]?.name || 'Unknown' : 'None'}
                </span>
                {member.color_index !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleColorChange(member.id, null)}
                    disabled={saving === member.id}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              
              {saving === member.id && (
                <div className="text-xs text-accent animate-pulse">
                  Saving...
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-secondary/20 border border-border/30">
        <h3 className="text-sm font-semibold mb-2">Color Assignment Tips:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Each team member can have only one color assigned</li>
          <li>• Colors help identify team members in the Kanban view</li>
          <li>• Used colors are disabled for other team members</li>
          <li>• You can clear a color assignment to make it available for others</li>
        </ul>
      </div>
    </div>
  )
}
