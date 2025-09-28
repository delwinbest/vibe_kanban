import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Priority } from '../../types';
import { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({ card, onEdit, onDelete, onMove: _onMove }) => {
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

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'P1':
        return { label: 'P1', className: 'priority-p1' };
      case 'P2':
        return { label: 'P2', className: 'priority-p2' };
      case 'P3':
        return { label: 'P3', className: 'priority-p3' };
      default:
        return { label: 'P3', className: 'priority-p3' };
    }
  };

  const getStatusBadge = () => {
    // This would come from card status in a real app
    const statuses = ['Started', 'Ongoing', 'In Progress', 'Completed', 'Not Started'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    switch (randomStatus) {
      case 'Started':
        return { label: 'Started', className: 'status-started' };
      case 'Ongoing':
        return { label: 'Ongoing', className: 'status-ongoing' };
      case 'In Progress':
        return { label: 'In Progress', className: 'status-in-progress' };
      case 'Completed':
        return { label: 'Completed', className: 'status-completed' };
      case 'Not Started':
        return { label: 'Not Started', className: 'status-not-started' };
      default:
        return { label: 'Not Started', className: 'status-not-started' };
    }
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();
  const priorityBadge = getPriorityBadge(card.priority);
  const statusBadge = getStatusBadge();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card group ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      {...attributes}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1 pr-2">
          {card.title}
        </h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete card"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to move"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
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

      {/* Status and Priority Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`status-badge ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
        <span className={`priority-badge ${priorityBadge.className}`}>
          {priorityBadge.label}
        </span>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        {/* Due Date */}
        {card.due_date && (
          <span
            className={`text-xs px-2 py-1 rounded ${
              isOverdue
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {new Date(card.due_date).toLocaleDateString()}
          </span>
        )}

        {/* User Avatar Placeholder */}
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-600 font-medium">U</span>
          </div>
          <span className="text-xs text-gray-500">2</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
