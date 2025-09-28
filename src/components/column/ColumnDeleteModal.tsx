import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { deleteColumn } from '../../store/slices/columnSlice';
import { deleteCard } from '../../store/slices/cardSlice';
import { debugLog } from '../../utils/debug';

interface ColumnDeleteModalProps {
  columnId: string;
  columnName: string;
  onClose: () => void;
}

const ColumnDeleteModal: React.FC<ColumnDeleteModalProps> = ({ columnId, columnName, onClose }) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteCards, setDeleteCards] = useState(true);

  // Get cards in this column
  const cards = useAppSelector((state) => 
    state.cards.cards.filter(card => card.column_id === columnId)
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      debugLog.general('Deleting column', { 
        columnId, 
        columnName, 
        cardCount: cards.length,
        deleteCards 
      });

      // If we're deleting cards, delete them first
      if (deleteCards && cards.length > 0) {
        for (const card of cards) {
          await dispatch(deleteCard(card.id));
        }
      }

      // Delete the column
      const result = await dispatch(deleteColumn(columnId));

      if (deleteColumn.fulfilled.match(result)) {
        debugLog.general('Column deleted successfully', { columnId });
        onClose();
      } else {
        setError('Failed to delete column');
      }
    } catch (err) {
      debugLog.general('Error deleting column', { error: err });
      setError('Failed to delete column');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Column</h3>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the column <strong>"{columnName}"</strong>?
        </p>
      </div>

      {cards.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                This column contains {cards.length} card{cards.length === 1 ? '' : 's'}
              </h4>
              <div className="mt-2">
                <div className="text-sm text-yellow-700">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={deleteCards}
                      onChange={(e) => setDeleteCards(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">
                      Delete all cards in this column ({cards.length} card{cards.length === 1 ? '' : 's'})
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDeleting ? 'Deleting...' : 'Delete Column'}
        </button>
      </div>
    </div>
  );
};

export default ColumnDeleteModal;
