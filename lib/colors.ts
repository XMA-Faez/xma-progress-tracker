/**
 * Preset color system for team member assignment
 */

interface ColorScheme {
  bg: string
  border: string
  text: string
  accent: string
  name: string
}

// 10 preset colors for manual assignment
const PRESET_COLORS: ColorScheme[] = [
  {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    accent: 'bg-red-500',
    name: 'Red'
  },
  {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400', 
    accent: 'bg-blue-500',
    name: 'Blue'
  },
  {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    accent: 'bg-green-500',
    name: 'Green'
  },
  {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    accent: 'bg-purple-500',
    name: 'Purple'
  },
  {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    accent: 'bg-orange-500',
    name: 'Orange'
  },
  {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    accent: 'bg-cyan-500',
    name: 'Cyan'
  },
  {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    accent: 'bg-pink-500',
    name: 'Pink'
  },
  {
    bg: 'bg-teal-500/20',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    accent: 'bg-teal-500',
    name: 'Teal'
  },
  {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    accent: 'bg-amber-500',
    name: 'Amber'
  },
  {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    accent: 'bg-emerald-500',
    name: 'Emerald'
  }
]

/**
 * Get all available preset colors
 */
export function getPresetColors(): ColorScheme[] {
  return [...PRESET_COLORS]
}

/**
 * Get color scheme by index (0-9)
 */
export function getColorByIndex(index: number): ColorScheme | null {
  if (index < 0 || index >= PRESET_COLORS.length) return null
  return PRESET_COLORS[index]
}

/**
 * Get team member color from their assigned color_index
 */
export function getTeamMemberColor(colorIndex: number | null): ColorScheme | null {
  if (colorIndex === null || colorIndex === undefined) return null
  return getColorByIndex(colorIndex)
}

/**
 * Create color map for team members based on their assigned colors
 */
export function createTeamColorMap(teamMembers: Array<{id: string, color_index?: number | null}>): Map<string, ColorScheme> {
  const colorMap = new Map<string, ColorScheme>()
  
  for (const member of teamMembers) {
    const color = getTeamMemberColor(member.color_index ?? null)
    if (color) {
      colorMap.set(member.id, color)
    }
  }
  
  return colorMap
}

/**
 * Get hex color value for inline styles
 */
export function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'Red': '#ef4444',
    'Blue': '#3b82f6', 
    'Green': '#22c55e',
    'Purple': '#a855f7',
    'Orange': '#f97316',
    'Cyan': '#06b6d4',
    'Pink': '#ec4899',
    'Teal': '#14b8a6',
    'Amber': '#f59e0b',
    'Emerald': '#10b981'
  }
  return colorMap[colorName] || '#64748b'
}

export type { ColorScheme }
