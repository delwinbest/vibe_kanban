'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { Column } from './column'
import { Card } from './card'
import { Board as BoardType, Column as ColumnType, Card as CardType } from '@/lib/types'
import { Plus } from 'lucide-react'

const initialBoard: BoardType = {
  id: 'board-1',
  title: 'Kanban Board',
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      cards: [
        {
          id: 'card-1',
          title: 'Create design',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'card-2',
          title: 'Create To Do list',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      cards: [
        {
          id: 'card-3',
          title: 'Create PRD',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [],
    },
  ],
}

export function Board() {
  const [board, setBoard] = useState<BoardType>(initialBoard)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const card = board.columns
      .flatMap(col => col.cards)
      .find(card => card.id === active.id)
    
    if (card) {
      setActiveCard(card)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeCardId = active.id as string
    const overId = over.id as string

    // Find the source column and card
    const sourceColumn = board.columns.find(col =>
      col.cards.some(card => card.id === activeCardId)
    )
    const activeCard = sourceColumn?.cards.find(card => card.id === activeCardId)

    if (!sourceColumn || !activeCard) return

    // Check if dropping on a column
    const targetColumn = board.columns.find(col => col.id === overId)
    
    if (targetColumn) {
      // Moving card to a different column
      if (sourceColumn.id !== targetColumn.id) {
        setBoard(prevBoard => ({
          ...prevBoard,
          columns: prevBoard.columns.map(col => {
            if (col.id === sourceColumn.id) {
              return {
                ...col,
                cards: col.cards.filter(card => card.id !== activeCardId),
              }
            }
            if (col.id === targetColumn.id) {
              return {
                ...col,
                cards: [...col.cards, { ...activeCard, updatedAt: new Date() }],
              }
            }
            return col
          }),
        }))
      }
      return
    }

    // Check if dropping on another card
    const targetCard = board.columns
      .flatMap(col => col.cards)
      .find(card => card.id === overId)

    if (targetCard) {
      const targetColumn = board.columns.find(col =>
        col.cards.some(card => card.id === overId)
      )

      if (targetColumn && sourceColumn.id !== targetColumn.id) {
        // Moving between different columns
        setBoard(prevBoard => ({
          ...prevBoard,
          columns: prevBoard.columns.map(col => {
            if (col.id === sourceColumn.id) {
              return {
                ...col,
                cards: col.cards.filter(card => card.id !== activeCardId),
              }
            }
            if (col.id === targetColumn.id) {
              const targetIndex = col.cards.findIndex(card => card.id === overId)
              const newCards = [...col.cards]
              newCards.splice(targetIndex, 0, { ...activeCard, updatedAt: new Date() })
              return {
                ...col,
                cards: newCards,
              }
            }
            return col
          }),
        }))
      }
    }
  }

  function handleAddCard(columnId: string) {
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      title: 'New card',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, newCard],
          }
        }
        return col
      }),
    }))
  }

  function handleAddColumn() {
    const newColumn: ColumnType = {
      id: `column-${Date.now()}`,
      title: 'New List',
      cards: [],
    }

    setBoard(prevBoard => ({
      ...prevBoard,
      columns: [...prevBoard.columns, newColumn],
    }))
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Board Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{board.title}</h1>
        </div>

        {/* Board Content */}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-6">
            {board.columns.map(column => (
              <Column
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
              />
            ))}
            
            {/* Add Column Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleAddColumn}
                className="w-72 h-12 bg-gray-800/50 hover:bg-gray-700/50 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add another list</span>
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
                <h3 className="text-white text-sm font-medium">
                  {activeCard.title}
                </h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
