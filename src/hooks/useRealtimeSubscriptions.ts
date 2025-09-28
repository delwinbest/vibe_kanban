import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  subscribeToBoardChanges, 
  unsubscribeFromBoardChanges 
} from '../store/slices/boardSlice';
import { 
  subscribeToColumnChanges, 
  unsubscribeFromColumnChanges 
} from '../store/slices/columnSlice';
import { 
  subscribeToCardChanges, 
  unsubscribeFromCardChanges 
} from '../store/slices/cardSlice';

export function useRealtimeSubscriptions(boardId: string) {
  const dispatch = useAppDispatch();
  const { board } = useAppSelector((state) => state.board);
  const { columns } = useAppSelector((state) => state.columns);
  const { cards } = useAppSelector((state) => state.cards);

  useEffect(() => {
    if (!boardId) return;

    console.log('Setting up real-time subscriptions for board:', boardId);

    // Subscribe to all real-time changes
    dispatch(subscribeToBoardChanges(boardId));
    dispatch(subscribeToColumnChanges(boardId));
    dispatch(subscribeToCardChanges(boardId));

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscriptions for board:', boardId);
      dispatch(unsubscribeFromBoardChanges(boardId));
      dispatch(unsubscribeFromColumnChanges(boardId));
      dispatch(unsubscribeFromCardChanges(boardId));
    };
  }, [dispatch, boardId]);

  return {
    board,
    columns,
    cards,
    isSubscribed: {
      board: useAppSelector((state) => state.board.isSubscribed),
      columns: useAppSelector((state) => state.columns.isSubscribed),
      cards: useAppSelector((state) => state.cards.isSubscribed),
    }
  };
}
