import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, Priority } from '../../types';
import { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({ card, onEdit, onDelete, onMove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-800 text-sm leading-tight flex-1 pr-2">
          {card.title}
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Edit card"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete card"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card Description */}
      {card.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        {/* Priority Badge */}
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
            card.priority
          )}`}
        >
          {card.priority}
        </span>

        {/* Due Date */}
        {card.dueDate && (
          <span
            className={`text-xs px-2 py-1 rounded ${
              isOverdue
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {new Date(card.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Card Metadata */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {new Date(card.createdAt).toLocaleDateString()}</span>
          {card.updatedAt !== card.createdAt && (
            <span>Updated {new Date(card.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
