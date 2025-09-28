import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Priority } from '../../types';
import { CardProps } from '../../types';
import { useModal } from '../ui/ModalProvider';
import CardDetailModal from './CardDetailModal';
import { debugLog } from '../../utils/debug';

const Card: React.FC<CardProps> = ({ card, onEdit, onDelete, onMove: _onMove }) => {
  const { openModal } = useModal();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [titleValue, setTitleValue] = useState(card.title);
  const [descriptionValue, setDescriptionValue] = useState(card.description || '');
  const [dueDateValue, setDueDateValue] = useState(card.due_date || '');
  const [priorityValue, setPriorityValue] = useState(card.priority);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const prioritySelectRef = useRef<HTMLSelectElement>(null);
  
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

  // Update values when card prop changes
  useEffect(() => {
    setTitleValue(card.title);
    setDescriptionValue(card.description || '');
    setDueDateValue(card.due_date || '');
    setPriorityValue(card.priority);
  }, [card.title, card.description, card.due_date, card.priority]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
      descriptionTextareaRef.current.select();
    }
  }, [isEditingDescription]);

  useEffect(() => {
    if (isEditingDueDate && dueDateInputRef.current) {
      dueDateInputRef.current.focus();
      dueDateInputRef.current.select();
    }
  }, [isEditingDueDate]);

  useEffect(() => {
    if (isEditingPriority && prioritySelectRef.current) {
      prioritySelectRef.current.focus();
    }
  }, [isEditingPriority]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleSubmit = () => {
    if (titleValue.trim() && titleValue.trim() !== card.title) {
      onEdit({ ...card, title: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleValue(card.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    }
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDescription(true);
  };

  const handleDescriptionSubmit = () => {
    if (descriptionValue.trim() !== (card.description || '')) {
      onEdit({ ...card, description: descriptionValue.trim() || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setDescriptionValue(card.description || '');
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleDescriptionCancel();
    }
  };

  const handleDueDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDueDate(true);
  };

  const handleDueDateSubmit = () => {
    const newDueDate = dueDateValue.trim() || undefined;
    if (newDueDate !== card.due_date) {
      onEdit({ ...card, due_date: newDueDate });
    }
    setIsEditingDueDate(false);
  };

  const handleDueDateCancel = () => {
    setDueDateValue(card.due_date || '');
    setIsEditingDueDate(false);
  };

  const handleDueDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDueDateSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleDueDateCancel();
    }
  };

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingPriority(true);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as Priority;
    setPriorityValue(newPriority);
    onEdit({ ...card, priority: newPriority });
    setIsEditingPriority(false);
  };

  const handlePriorityCancel = () => {
    setPriorityValue(card.priority);
    setIsEditingPriority(false);
  };

  const handlePriorityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handlePriorityCancel();
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'started':
        return { label: 'Started', className: 'status-started' };
      case 'ongoing':
        return { label: 'Ongoing', className: 'status-ongoing' };
      case 'in_progress':
        return { label: 'In Progress', className: 'status-in-progress' };
      case 'completed':
        return { label: 'Completed', className: 'status-completed' };
      case 'not_started':
      default:
        return { label: 'Not Started', className: 'status-not-started' };
    }
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();
  const priorityBadge = getPriorityBadge(card.priority);
  const statusBadge = getStatusBadge(card.status);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open detail view if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('textarea') ||
      (e.target as HTMLElement).closest('select')
    ) {
      return;
    }
    
    debugLog.modal.open('card-detail', { cardId: card.id, cardTitle: card.title });
    openModal(
      <CardDetailModal card={card} />,
      { title: 'Card Details', size: 'lg' }
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card group cursor-pointer ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      {...attributes}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="font-semibold text-gray-900 text-sm leading-tight flex-1 pr-2 bg-transparent border-none outline-none resize-none"
            style={{ minHeight: '1.25rem' }}
          />
        ) : (
          <h4 
            className="font-semibold text-gray-900 text-sm leading-tight flex-1 pr-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1 -my-0.5"
            onClick={handleTitleClick}
            title="Click to edit title"
          >
            {card.title}
          </h4>
        )}
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
      {isEditingDescription ? (
        <textarea
          ref={descriptionTextareaRef}
          value={descriptionValue}
          onChange={(e) => setDescriptionValue(e.target.value)}
          onBlur={handleDescriptionSubmit}
          onKeyDown={handleDescriptionKeyDown}
          className="w-full text-sm text-gray-600 mb-3 bg-transparent border-none outline-none resize-none min-h-[2rem]"
          placeholder="Add a description..."
          rows={2}
        />
      ) : (
        <div 
          className="text-sm text-gray-600 mb-3 line-clamp-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1 -my-0.5 min-h-[1.5rem]"
          onClick={handleDescriptionClick}
          title="Click to edit description"
        >
          {card.description || (
            <span className="text-gray-400 italic">Add a description...</span>
          )}
        </div>
      )}

      {/* Status and Priority Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`status-badge ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
        {isEditingPriority ? (
          <select
            ref={prioritySelectRef}
            value={priorityValue}
            onChange={handlePriorityChange}
            onBlur={handlePriorityCancel}
            onKeyDown={handlePriorityKeyDown}
            className="text-xs px-2 py-1 rounded border border-gray-300 bg-white"
            style={{ minHeight: '1.5rem' }}
          >
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>
        ) : (
          <span 
            className={`priority-badge ${priorityBadge.className} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={handlePriorityClick}
            title="Click to change priority"
          >
            {priorityBadge.label}
          </span>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        {/* Due Date */}
        {isEditingDueDate ? (
          <input
            ref={dueDateInputRef}
            type="date"
            value={dueDateValue}
            onChange={(e) => setDueDateValue(e.target.value)}
            onBlur={handleDueDateSubmit}
            onKeyDown={handleDueDateKeyDown}
            className="text-xs px-2 py-1 rounded border border-gray-300 bg-white"
            style={{ minHeight: '1.5rem' }}
          />
        ) : (
          <div
            className={`text-xs px-2 py-1 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
              card.due_date
                ? isOverdue
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
            onClick={handleDueDateClick}
            title="Click to edit due date"
          >
            {card.due_date ? (
              new Date(card.due_date).toLocaleDateString()
            ) : (
              <span className="italic">Add due date...</span>
            )}
          </div>
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
