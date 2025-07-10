'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface UserDropdownProps {
  userEmail: string
  userName: string
  profileImage?: string
}

export function UserDropdown({ userEmail, userName, profileImage }: UserDropdownProps) {
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
        className="flex glass-card-primary items-center gap-2 px-4 py-2 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
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
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-white">{userName}</div>
          <div className="text-xs text-gray-400">{userEmail}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute glass-card right-0 top-full mt-2 w-full rounded-lg shadow-xl border overflow-hidden">
          <div className="p-2">
            <Link 
              href="/admin/profile" 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
            <form action="/api/auth/signout" method="post">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-slate-700  hover:text-white transition-colors">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
