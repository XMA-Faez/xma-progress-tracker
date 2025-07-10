'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface UserDropdownProps {
  userEmail: string
  userName: string
  profileImage?: string
  compact?: boolean
}

export function UserDropdown({ userEmail, userName, profileImage, compact = false }: UserDropdownProps) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 w-full text-left transition-all duration-200 rounded-lg ${
          compact 
            ? 'p-2 justify-center hover:bg-white/5' 
            : 'px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={userName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {!compact && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{userName}</div>
              <div className="text-xs text-slate-400 truncate">{userEmail}</div>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className={`absolute glass-card backdrop-blur-lg border border-border/30 shadow-xl z-50 ${
          compact 
            ? 'left-full ml-3 top-0 w-52' 
            : 'right-0 bottom-full mb-2 w-full min-w-[200px]'
        } rounded-lg overflow-hidden`}>
          <div className="p-2 space-y-1">
            {compact && (
              <div className="px-3 py-2 border-b border-border/20 mb-2">
                <div className="text-sm font-medium text-white truncate">{userName}</div>
                <div className="text-xs text-slate-400 truncate">{userEmail}</div>
              </div>
            )}
            <Link 
              href="/admin/profile" 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span>Profile Settings</span>
            </Link>
            <form action="/api/auth/signout" method="post">
              <button 
                type="submit" 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
