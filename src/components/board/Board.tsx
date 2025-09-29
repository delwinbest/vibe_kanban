import React, { useState, useMemo, memo } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Board as BoardType, Column, Card } from '../../types';
import ColumnComponent from '../column/Column';
import { debugLog } from '../../utils/debug';

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
  onColumnSettings?: (column: Column) => void;
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
  onMoveColumn: _onMoveColumn,
  onColumnSettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return cards;
    }

    const query = searchQuery.toLowerCase();
    return cards.filter(card => 
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query))
    );
  }, [cards, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(value.trim().length > 0);
    
    if (value.trim().length > 0) {
      debugLog.general(`Searching cards: "${value}"`, { resultCount: filteredCards.length });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    debugLog.general('Search cleared');
  };
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

  // TODO: Implement card editing functionality
  // const handleEditCard = (_card: Card) => {
  //   if (onEditCard) {
  //     onEditCard(_card);
  //   } else {
  //     console.log('Edit card functionality not implemented');
  //   }
  // };

  // TODO: Implement card deletion functionality
  // const handleDeleteCard = (_cardId: string) => {
  //   if (onDeleteCard) {
  //     onDeleteCard(_cardId);
  //   } else {
  //     console.log('Delete card functionality not implemented');
  //   }
  // };

  const handleMoveCard = (cardId: string, newColumnId: string, newPosition: number) => {
    if (onMoveCard) {
      onMoveCard(cardId, newColumnId, newPosition);
    } else {
      console.log('Move card functionality not implemented');
    }
  };

  return (
    <div className="kanban-board min-h-screen">
      {/* Combined Board Header */}
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20 px-6 py-4">
            {/* Top Section - Board Info and Actions */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {board.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your tasks and projects efficiently
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {isSearching && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
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
            
            {/* Bottom Section - View Options */}
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
      </div>

      {/* Search Results Info */}
      {isSearching && (
        <div className="px-6 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-700">
                {filteredCards.length === 0 
                  ? `No cards found for "${searchQuery}"`
                  : `Found ${filteredCards.length} card${filteredCards.length === 1 ? '' : 's'} for "${searchQuery}"`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Board Content */}
      <div className="px-6 pb-6">
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
                    cards={filteredCards}
                    onAddCard={handleAddCard}
                    onEditColumn={handleEditColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onEditCard={onEditCard}
                    onDeleteCard={onDeleteCard}
                    onMoveCard={handleMoveCard}
                    onColumnSettings={onColumnSettings}
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

export default memo(Board);
