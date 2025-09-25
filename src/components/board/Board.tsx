import React from 'react';
import { Board as BoardType, Column, Card } from '../../types';

interface BoardProps {
  board: BoardType | null;
  columns: Column[];
  cards: Card[];
}

const Board: React.FC<BoardProps> = ({ board, columns, cards }) => {
  if (!board) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">No Board Found</h2>
        <p className="text-gray-500">Create a new board to get started.</p>
      </div>
    );
  }

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
            <button className="btn-primary">
              Add First Column
            </button>
          </div>
        ) : (
          columns.map((column) => (
            <div key={column.id} className="kanban-column flex-shrink-0">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">{column.name}</h3>
                <span className="text-sm text-gray-500">
                  {cards.filter(card => card.columnId === column.id).length} cards
                </span>
              </div>
              <div className="p-4">
                {cards.filter(card => card.columnId === column.id).length === 0 ? (
                  <div className="kanban-dropzone">
                    <p className="text-sm">Drop cards here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cards
                      .filter(card => card.columnId === column.id)
                      .sort((a, b) => a.position - b.position)
                      .map((card) => (
                        <div key={card.id} className="kanban-card">
                          <h4 className="font-medium text-gray-800">{card.title}</h4>
                          {card.description && (
                            <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                          )}
                          {card.dueDate && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">
                                Due: {new Date(card.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
                <button className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                  + Add Card
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
