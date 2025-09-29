import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { updateColumn } from '../../store/slices/columnSlice';
import { Column } from '../../types';
import { debugLog } from '../../utils/debug';

interface ColumnSettingsModalProps {
  column: Column;
  onClose: () => void;
}

const COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Gray', value: '#6B7280' },
];

const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({ column, onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(column.name);
  const [color, setColor] = useState(column.color || '#3B82F6');
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

    if (name.trim() === column.name && color === column.color) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      debugLog.general('Updating column settings', { 
        columnId: column.id, 
        oldName: column.name, 
        newName: name.trim(),
        oldColor: column.color,
        newColor: color
      });
      
      const result = await dispatch(updateColumn({
        id: column.id,
        name: name.trim(),
        color: color,
      }));

      if (updateColumn.fulfilled.match(result)) {
        debugLog.general('Column settings updated successfully', { columnId: column.id });
        onClose();
      } else {
        setError('Failed to update column settings');
      }
    } catch (err) {
      debugLog.general('Error updating column settings', { error: err });
      setError('Failed to update column settings');
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Column Settings</h3>
        <p className="text-sm text-gray-600">Customize the column name and appearance.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="column-name" className="block text-sm font-medium text-gray-700 mb-2">
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Column Color
          </label>
          <div className="grid grid-cols-5 gap-3">
            {COLORS.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  color === colorOption.value
                    ? 'border-gray-900 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: colorOption.value }}
                title={colorOption.name}
                disabled={isSubmitting}
              >
                {color === colorOption.value && (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Custom color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              disabled={isSubmitting}
            />
            <span className="text-sm font-mono text-gray-600">{color}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
            disabled={isSubmitting || !name.trim() || (name.trim() === column.name && color === column.color)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Updating...' : 'Update Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ColumnSettingsModal;
