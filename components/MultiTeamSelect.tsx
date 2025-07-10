'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X, ChevronDown } from 'lucide-react'
import { TeamMember } from '@/types'

interface MultiTeamSelectProps {
  teamMembers: TeamMember[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  className?: string
}

export function MultiTeamSelect({ teamMembers, selectedIds, onChange, className = '' }: MultiTeamSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter(id => id !== memberId))
    } else {
      onChange([...selectedIds, memberId])
    }
  }

  const getSelectedNames = () => {
    const names = selectedIds
      .map(id => teamMembers.find(m => m.id === id)?.name)
      .filter(Boolean)
    
    if (names.length === 0) return 'Unassigned'
    if (names.length === 1) return names[0]
    if (names.length === 2) return names.join(' & ')
    return `${names[0]} +${names.length - 1}`
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 text-left bg-background/50 border border-input rounded-md flex items-center justify-between hover:bg-background/70 transition-colors glass-card"
      >
        <span className="text-sm truncate">{getSelectedNames()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 max-h-64 overflow-y-auto">
          <div className="p-1">
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={() => onChange([])}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 text-slate-300"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
                <div className="h-px bg-slate-700 my-1" />
              </>
            )}
            
            {teamMembers.map(member => {
              const isSelected = selectedIds.includes(member.id)
              return (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors flex items-center justify-between ${
                    isSelected ? 'text-white bg-slate-700/50' : 'text-slate-300'
                  }`}
                >
                  <span>{member.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-green-400" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
