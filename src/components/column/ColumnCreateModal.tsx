import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { createColumn } from '../../store/slices/columnSlice';
import { debugLog } from '../../utils/debug';

interface ColumnCreateModalProps {
  boardId: string;
  onClose: () => void;
}

const ColumnCreateModal: React.FC<ColumnCreateModalProps> = ({ boardId, onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Column name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      debugLog.general('Creating new column', { boardId, name: name.trim() });
      
      const result = await dispatch(createColumn({
        board_id: boardId,
        name: name.trim(),
        position: 0, // Will be set to the end by the backend
      }));

      if (createColumn.fulfilled.match(result)) {
        debugLog.general('Column created successfully', { columnId: result.payload.id });
        onClose();
      } else {
        setError('Failed to create column');
      }
    } catch (err) {
      debugLog.general('Error creating column', { error: err });
      setError('Failed to create column');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Column</h3>
        <p className="text-sm text-gray-600">Add a new column to organize your tasks.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="column-name" className="block text-sm font-medium text-gray-700 mb-1">
            Column Name
          </label>
          <input
            ref={inputRef}
            id="column-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter column name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
            maxLength={100}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Column'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ColumnCreateModal;
