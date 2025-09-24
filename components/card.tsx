'use client'

import { Card as CardType } from '@/lib/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardProps {
  card: CardType
}

export function Card({ card }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors',
        isDragging && 'opacity-50'
      )}
      {...attributes}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium leading-tight">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
            {...listeners}
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </button>
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all">
            <MoreHorizontal className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
