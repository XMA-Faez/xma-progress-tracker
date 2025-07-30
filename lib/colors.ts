/**
 * Utility functions for generating consistent colors for team members
 */

interface ColorScheme {
  bg: string
  border: string
  text: string
  accent: string
}

const colorPalette: ColorScheme[] = [
  {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    accent: 'bg-red-500'
  },
  {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400', 
    accent: 'bg-green-500'
  },
  {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    accent: 'bg-purple-500'
  },
  {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    accent: 'bg-orange-500'
  },
  {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    accent: 'bg-cyan-500'
  },
  {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    accent: 'bg-yellow-500'
  },
  {
    bg: 'bg-teal-500/20',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    accent: 'bg-teal-500'
  },
  {
    bg: 'bg-lime-500/20',
    border: 'border-lime-500/30',
    text: 'text-lime-400',
    accent: 'bg-lime-500'
  },
  {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    accent: 'bg-amber-500'
  },
  {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    accent: 'bg-rose-500'
  },
  {
    bg: 'bg-violet-500/20',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    accent: 'bg-violet-500'
  },
  {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    accent: 'bg-emerald-500'
  },
]

/**
 * Generate a simple hash from a string
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

/**
 * Get consistent color scheme for a team member, with collision avoidance
 */
export function getPersonColor(memberId: string, memberName?: string, usedIndices: number[] = []): ColorScheme {
  // Try multiple hash inputs to avoid collisions
  const hashInputs = [
    memberId,
    memberName ? `${memberName}-${memberId}` : `${memberId}-primary`,
    memberName ? `${memberId}-${memberName}` : `${memberId}-secondary`, 
    memberName ? `${memberName.split(' ')[0]}-${memberId}` : `${memberId}-tertiary`,
    `${memberId}-${Date.now().toString().slice(-6)}` // Last resort with timestamp
  ]
  
  for (const input of hashInputs) {
    const hash = simpleHash(input)
    const index = Math.abs(hash) % colorPalette.length
    
    // If no collision avoidance needed, or this index is available
    if (usedIndices.length === 0 || !usedIndices.includes(index)) {
      return colorPalette[index]
    }
  }
  
  // Fallback: find first unused color, or just use the basic hash
  for (let i = 0; i < colorPalette.length; i++) {
    if (!usedIndices.includes(i)) {
      return colorPalette[i]
    }
  }
  
  // Ultimate fallback
  const hash = simpleHash(memberId)
  const index = Math.abs(hash) % colorPalette.length
  return colorPalette[index]
}

/**
 * Get unique colors for multiple team members to avoid collisions
 */
export function getUniqueColorsForTeam(teamMembers: Array<{id: string, name: string}>): Map<string, ColorScheme> {
  const colorMap = new Map<string, ColorScheme>()
  const usedIndices: number[] = []
  
  for (const member of teamMembers) {
    const color = getPersonColor(member.id, member.name, usedIndices)
    colorMap.set(member.id, color)
    
    // Track which color index was used
    const colorIndex = colorPalette.findIndex(c => 
      c.bg === color.bg && c.border === color.border && c.text === color.text
    )
    if (colorIndex !== -1) {
      usedIndices.push(colorIndex)
    }
  }
  
  return colorMap
}

/**
 * Get color classes as a single string for easier use
 */
export function getPersonColorClasses(memberId: string, memberName?: string): string {
  const colors = getPersonColor(memberId, memberName)
  return `${colors.bg} ${colors.border} ${colors.text}`
}

/**
 * Get just the accent color (solid color for avatars, etc.)
 */
export function getPersonAccentColor(memberId: string, memberName?: string): string {
  const colors = getPersonColor(memberId, memberName)
  return colors.accent
}

export type { ColorScheme }
