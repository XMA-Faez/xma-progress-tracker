'use client'

import { useDroppable } from '@dnd-kit/core'

interface DropZoneProps {
  id: string
  isActive: boolean
  position: 'start' | 'between' | 'end'
}

export function DropZone({ id, isActive, position }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  })

  const positionClasses = position === 'start' 
    ? 'absolute left-0 top-0 bottom-0 -translate-x-full w-8'
    : 'absolute right-0 top-0 bottom-0 translate-x-full w-8'

  return (
    <div
      ref={setNodeRef}
      className={`${positionClasses} transition-all duration-200 flex items-center justify-center z-10 ${
        isActive 
          ? 'bg-blue-500/30 border-2 border-dashed border-blue-500 rounded-lg scale-105' 
          : isOver
          ? 'bg-blue-500/15 border-2 border-dashed border-blue-400 rounded-lg'
          : ''
      }`}
    >
      {isActive ? (
        <div className="w-3 bg-blue-500 rounded-full h-32 animate-pulse shadow-lg" />
      ) : isOver ? (
        <div className="w-2 bg-blue-400 rounded-full h-24" />
      ) : null}
    </div>
  )
}

export type { DropZoneProps }