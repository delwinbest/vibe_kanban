'use client'

import { useState, useRef, useEffect } from 'react'
import { Card as CardType } from '@/lib/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardProps {
  card: CardType
  onUpdateCard?: (cardId: string, updates: Partial<CardType>) => void
}

export function Card({ card, onUpdateCard }: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const titleInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditing])

  function handleTitleClick(e: React.MouseEvent) {
    e.stopPropagation()
    setIsEditing(true)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  function handleSave() {
    if (onUpdateCard) {
      onUpdateCard(card.id, {
        title: title.trim(),
        updatedAt: new Date(),
      })
    }
    setIsEditing(false)
  }

  function handleCancel() {
    setTitle(card.title)
    setIsEditing(false)
  }

  function handleBlur() {
    setTimeout(() => {
      if (isEditing) {
        handleSave()
      }
    }, 100)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors',
        isDragging && 'opacity-50'
      )}
      {...attributes}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleBlur}
              className="w-full bg-transparent text-white text-sm font-medium leading-tight border-none outline-none resize-none"
              placeholder="Card title..."
            />
          ) : (
            <h3 
              className="text-white text-sm font-medium leading-tight cursor-text hover:bg-gray-700/50 rounded px-1 -mx-1"
              onClick={handleTitleClick}
            >
              {card.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <div 
            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-grab hover:bg-gray-600"
            {...listeners}
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all">
            <MoreHorizontal className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}