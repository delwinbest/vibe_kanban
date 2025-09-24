'use client'

import { Column as ColumnType, Card as CardType } from '@/lib/types'
import { useDroppable } from '@dnd-kit/core'
import { Card } from './card'
import { MoreHorizontal, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColumnProps {
  column: ColumnType
  onAddCard: (columnId: string) => void
  onUpdateCard?: (cardId: string, updates: Partial<CardType>) => void
}

export function Column({ column, onAddCard, onUpdateCard }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex flex-col w-72 bg-gray-900/50 rounded-lg p-3">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-sm">{column.title}</h2>
        <button className="p-1 hover:bg-gray-700 rounded transition-colors">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 min-h-0 space-y-2"
      >
        {column.cards.map(card => (
          <Card key={card.id} card={card} onUpdateCard={onUpdateCard} />
        ))}
      </div>

      {/* Add Card Button */}
      <div className="mt-3">
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add a card</span>
          <Calendar className="h-3 w-3 ml-auto" />
        </button>
      </div>
    </div>
  )
}
