import React from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { deleteCard } from '../../store/slices/cardSlice';
import { useModal } from '../ui/ModalProvider';
import { debugLog } from '../../utils/debug';

interface CardDeleteModalProps {
  cardId: string;
  cardTitle: string;
}

const CardDeleteModal: React.FC<CardDeleteModalProps> = ({ cardId, cardTitle }) => {
  const dispatch = useAppDispatch();
  const { closeModal } = useModal();

  const handleDelete = async () => {
    try {
      debugLog.api.request('deleteCard', { cardId });
      const result = await dispatch(deleteCard(cardId)).unwrap();
      debugLog.api.success('deleteCard', result);
      debugLog.card.delete(cardId, cardTitle);
      
      // Close modal immediately - no delay needed with optimistic updates
      closeModal();
    } catch (error) {
      debugLog.api.error('deleteCard', error);
      console.error('Failed to delete card:', error);
      // Error handling could be improved with a toast notification
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Card</h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the card "{cardTitle}"? This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete Card
        </button>
      </div>
    </div>
  );
};

export default CardDeleteModal;
