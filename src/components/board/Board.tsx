import React from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Board as BoardType, Column, Card } from '../../types';
import ColumnComponent from '../column/Column';

interface BoardProps {
  board: BoardType | null;
  columns: Column[];
  cards: Card[];
  onAddColumn?: () => void;
  onEditColumn?: (column: Column) => void;
  onDeleteColumn?: (columnId: string) => void;
  onAddCard?: (columnId: string) => void;
  onEditCard?: (card: Card) => void;
  onDeleteCard?: (cardId: string) => void;
  onMoveCard?: (cardId: string, newColumnId: string, newPosition: number) => void;
  onMoveColumn?: (columnId: string, newPosition: number) => void;
}

const Board: React.FC<BoardProps> = ({ 
  board, 
  columns, 
  cards,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onMoveCard,
  onMoveColumn
}) => {
  if (!board) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">No Board Found</h2>
        <p className="text-gray-500">Create a new board to get started.</p>
      </div>
    );
  }

  const handleAddColumn = () => {
    if (onAddColumn) {
      onAddColumn();
    } else {
      console.log('Add column functionality not implemented');
    }
  };

  const handleEditColumn = (column: Column) => {
    if (onEditColumn) {
      onEditColumn(column);
    } else {
      console.log('Edit column functionality not implemented');
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (onDeleteColumn) {
      onDeleteColumn(columnId);
    } else {
      console.log('Delete column functionality not implemented');
    }
  };

  const handleAddCard = (columnId: string) => {
    if (onAddCard) {
      onAddCard(columnId);
    } else {
      console.log('Add card functionality not implemented');
    }
  };

  const handleEditCard = (card: Card) => {
    if (onEditCard) {
      onEditCard(card);
    } else {
      console.log('Edit card functionality not implemented');
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (onDeleteCard) {
      onDeleteCard(cardId);
    } else {
      console.log('Delete card functionality not implemented');
    }
  };

  const handleMoveCard = (cardId: string, newColumnId: string, newPosition: number) => {
    if (onMoveCard) {
      onMoveCard(cardId, newColumnId, newPosition);
    } else {
      console.log('Move card functionality not implemented');
    }
  };

  return (
    <div className="kanban-board min-h-screen bg-gray-50">
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {board.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your tasks and projects efficiently
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Public To All</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="px-3 py-1.5 text-gray-600 hover:text-gray-900 text-sm rounded-md hover:bg-gray-100 transition-colors">
              Export Board
            </button>
            <button className="px-3 py-1.5 text-gray-600 hover:text-gray-900 text-sm rounded-md hover:bg-gray-100 transition-colors">
              Import Board
            </button>
            <button 
              onClick={onAddColumn}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Column
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>

      {/* View Options */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
              List
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">
              Board
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">
              Timeline
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">
              Calendar
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">
              Progress
            </button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.length === 0 ? (
              <div className="text-center py-12 w-full">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">No Columns Yet</h3>
                <p className="text-gray-500 mb-6">Create your first column to start organizing tasks.</p>
                <button 
                  onClick={handleAddColumn}
                  className="btn-primary"
                >
                  Add First Column
                </button>
              </div>
            ) : (
              <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
                {[...columns]
                  .sort((a, b) => a.position - b.position)
                  .map((column) => (
                    <ColumnComponent
                      key={column.id}
                      column={column}
                      cards={cards}
                      onAddCard={handleAddCard}
                      onEditColumn={handleEditColumn}
                      onDeleteColumn={handleDeleteColumn}
                      onMoveCard={handleMoveCard}
                    />
                  ))}
              </SortableContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
