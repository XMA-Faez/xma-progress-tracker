'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check, X, ChevronDown } from 'lucide-react'
import { TeamMember } from '@/types'

interface MultiTeamSelectProps {
  teamMembers: TeamMember[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  className?: string
  disabled?: boolean
}

export function MultiTeamSelect({ teamMembers, selectedIds, onChange, className = '', disabled = false }: MultiTeamSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down')

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current || !isOpen) return

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 256 // max-h-64 = 16rem = 256px
    const spaceBelow = viewportHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top

    // Determine if dropdown should open upward or downward
    const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

    // Get absolute position from the document top/left
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (shouldOpenUpward) {
      setDropdownDirection('up')
      setDropdownPosition({
        top: buttonRect.top + scrollTop - dropdownHeight - 4,
        left: buttonRect.left + scrollLeft,
        width: buttonRect.width
      })
    } else {
      setDropdownDirection('down')
      setDropdownPosition({
        top: buttonRect.bottom + scrollTop + 4,
        left: buttonRect.left + scrollLeft,
        width: buttonRect.width
      })
    }
  }, [isOpen])

  useEffect(() => {
    calculatePosition()
  }, [calculatePosition])

  useEffect(() => {
    if (isOpen) {
      // Recalculate position on scroll or resize
      const handlePositionUpdate = () => calculatePosition()
      window.addEventListener('scroll', handlePositionUpdate, true)
      window.addEventListener('resize', handlePositionUpdate)
      
      return () => {
        window.removeEventListener('scroll', handlePositionUpdate, true)
        window.removeEventListener('resize', handlePositionUpdate)
      }
    }
  }, [isOpen, calculatePosition])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-9 px-3 text-left bg-slate-900/50 border border-slate-600/50 rounded-md flex items-center justify-between transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-slate-800/70 hover:border-cyan-500/50 cursor-pointer'
        }`}
      >
        <span className={`text-sm truncate ${disabled ? 'animate-pulse' : ''}`}>
          {disabled ? 'Updating...' : getSelectedNames()}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'animate-pulse' : ''}`} />
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className={`absolute bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-[9999] overflow-hidden ${
            dropdownDirection === 'up' ? 'animate-slide-up' : 'animate-slide-down'
          }`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: '256px'
          }}
        >
          <div className="max-h-64 overflow-y-auto">
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
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700/70 transition-all duration-200 flex items-center justify-between ${
                      isSelected ? 'text-white bg-slate-700/50 border-l-2 border-cyan-500' : 'text-slate-300'
                    }`}
                  >
                    <span className={isSelected ? 'font-medium' : ''}>{member.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
