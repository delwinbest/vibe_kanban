import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';

// Custom hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  return useSelector(selector);
};

// Custom hook for board data
export const useBoard = () => {
  return useAppSelector((state) => ({
    board: state.board.board,
    columns: state.columns.columns,
    cards: state.cards.cards,
    loading: state.board.loading || state.columns.loading || state.cards.loading,
    error: state.board.error || state.columns.error || state.cards.error,
  }));
};

// Custom hook for UI state
export const useUI = () => {
  return useAppSelector((state) => state.ui);
};

// Custom hook for cards in a specific column
export const useCardsInColumn = (columnId: string) => {
  return useAppSelector((state) => 
    state.cards.cards
      .filter((card) => card.column_id === columnId)
      .sort((a, b) => a.position - b.position)
  );
};
