'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Upload, User as UserIcon, Save, X } from 'lucide-react'
import Image from 'next/image'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  created_at: string
  updated_at: string
}

interface ProfileFormProps {
  user: User
  teamMember: TeamMember | null
}

export function ProfileForm({ user, teamMember }: ProfileFormProps) {
  const [name, setName] = useState(teamMember?.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'Image must be less than 5MB' })
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' })
        return
      }

      setProfileImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Handle profile image upload if there's a new image
      let imageUrl = null
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, profileImage, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }

      // Update or insert team member record
      if (teamMember) {
        const updateData: any = { name }
        if (imageUrl) updateData.profile_image = imageUrl

        const { error } = await supabase
          .from('team_members')
          .update(updateData)
          .eq('id', teamMember.id)

        if (error) throw error
      } else {
        // Create new team member record
        const insertData: any = {
          name,
          email: user.email,
          role: 'Team Member'
        }
        if (imageUrl) insertData.profile_image = imageUrl

        const { error } = await supabase
          .from('team_members')
          .insert([insertData])

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      setProfileImage(null)
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearImage = () => {
    setProfileImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-300' 
            : 'bg-red-500/10 border border-red-500/20 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Image Section */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
        
        <div className="flex items-start gap-6">
          {/* Current/Preview Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : teamMember?.profile_image ? (
                <Image 
                  src={teamMember.profile_image} 
                  alt={teamMember.name} 
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              ) : (
                <UserIcon className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </div>
              </label>
              
              {profileImage && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-slate-400">
              Choose a square image (max 5MB). Supported formats: JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Enter your display name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed. Contact admin if you need to update it.
            </p>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <input
              type="text"
              id="role"
              value={teamMember?.role || 'Team Member'}
              disabled
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              Role is managed by administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
