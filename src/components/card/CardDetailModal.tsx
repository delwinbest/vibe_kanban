import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { updateCard } from '../../store/slices/cardSlice';
import { useModal } from '../ui/ModalProvider';
import { Card, Priority, Status } from '../../types';
import { debugLog } from '../../utils/debug';

interface CardDetailModalProps {
  card: Card;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card }) => {
  const dispatch = useAppDispatch();
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    title: card.title,
    description: card.description || '',
    due_date: card.due_date || '',
    priority: card.priority,
    status: card.status,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Card title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        id: card.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        due_date: formData.due_date || undefined,
        priority: formData.priority,
        status: formData.status,
        column_id: card.column_id,
        position: card.position,
        assignee_id: card.assignee_id,
      };
      
      debugLog.api.request('updateCard', updateData);
      const result = await dispatch(updateCard(updateData)).unwrap();
      debugLog.api.success('updateCard', result);
      debugLog.card.edit(card.id, updateData);
      
      // Close modal immediately - no delay needed with optimistic updates
      closeModal();
    } catch (err) {
      debugLog.api.error('updateCard', err);
      setError(err instanceof Error ? err.message : 'Failed to update card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const isOverdue = formData.due_date && new Date(formData.due_date) < new Date();

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Details</h2>
      
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="input-field"
                placeholder="Card title"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input-field"
                rows={4}
                placeholder="Card description"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className={`input-field ${isOverdue ? 'border-red-300' : ''}`}
                disabled={isSubmitting}
              />
              {isOverdue && (
                <p className="text-red-500 text-xs mt-1">This card is overdue</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                className="input-field"
                disabled={isSubmitting}
              >
                <option value="P1">P1 - High Priority</option>
                <option value="P2">P2 - Medium Priority</option>
                <option value="P3">P3 - Low Priority</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Status)}
                className="input-field"
                disabled={isSubmitting}
              >
                <option value="not_started">Not Started</option>
                <option value="started">Started</option>
                <option value="in_progress">In Progress</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Card Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Card Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span> {new Date(card.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(card.updated_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {card.position + 1}
                </div>
                {card.assignee_id && (
                  <div>
                    <span className="font-medium">Assignee:</span> {card.assignee_id}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              closeModal();
              debugLog.modal.close('card-detail');
            }}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardDetailModal;
