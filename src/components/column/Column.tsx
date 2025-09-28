import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column as ColumnType, Card } from '../../types';
import CardComponent from '../card/Card';
import { ColumnProps } from '../../types';

const Column: React.FC<ColumnProps> = ({ 
  column, 
  cards, 
  onAddCard, 
  onEditColumn, 
  onDeleteColumn, 
  onMoveCard 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const columnCards = [...cards]
    .filter(card => card.columnId === column.id)
    .sort((a, b) => a.position - b.position);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-column ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 text-sm">{column.name}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {columnCards.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditColumn(column)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit column"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDeleteColumn(column.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete column"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              {...listeners}
              className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
              title="Drag to reorder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4 min-h-96">
        {columnCards.length === 0 ? (
          <div className="kanban-dropzone text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500 mb-4">No cards yet</p>
            <p className="text-xs text-gray-400">Drop cards here or add a new one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {columnCards.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                onEdit={(card) => {
                  // TODO: Implement card editing
                  console.log('Edit card:', card);
                }}
                onDelete={(cardId) => {
                  // TODO: Implement card deletion
                  console.log('Delete card:', cardId);
                }}
                onMove={(cardId, newColumnId, newPosition) => {
                  onMoveCard(cardId, newColumnId, newPosition);
                }}
              />
            ))}
          </div>
        )}

        {/* Add Card Button */}
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Task
        </button>
      </div>
    </div>
  );
};

export default Column;
