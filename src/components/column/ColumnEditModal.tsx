import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { updateColumn } from '../../store/slices/columnSlice';
import { Column } from '../../types';
import { debugLog } from '../../utils/debug';

interface ColumnEditModalProps {
  column: Column;
  onClose: () => void;
}

const ColumnEditModal: React.FC<ColumnEditModalProps> = ({ column, onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(column.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Column name is required');
      return;
    }

    if (name.trim() === column.name) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      debugLog.general('Updating column', { 
        columnId: column.id, 
        oldName: column.name, 
        newName: name.trim() 
      });
      
      const result = await dispatch(updateColumn({
        id: column.id,
        name: name.trim(),
      }));

      if (updateColumn.fulfilled.match(result)) {
        debugLog.general('Column updated successfully', { columnId: column.id });
        onClose();
      } else {
        setError('Failed to update column');
      }
    } catch (err) {
      debugLog.general('Error updating column', { error: err });
      setError('Failed to update column');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Edit Column</h3>
        <p className="text-sm text-gray-600">Update the column name and settings.</p>
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
            disabled={isSubmitting || !name.trim() || name.trim() === column.name}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Updating...' : 'Update Column'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ColumnEditModal;
