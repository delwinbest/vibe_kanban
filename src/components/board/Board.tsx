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
    <div className="board-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{board.name}</h1>
        <p className="text-gray-600 mt-2">Manage your tasks with drag and drop</p>
      </div>
      
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
  );
};

export default Board;
