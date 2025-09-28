import { useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { useRealtimeSubscriptions } from './hooks/useRealtimeSubscriptions';
import { startDrag, endDrag, setDragOverColumn } from './store/slices/uiSlice';
import { fetchBoard } from './store/slices/boardSlice';
import { fetchColumns } from './store/slices/columnSlice';
import { fetchCards } from './store/slices/cardSlice';
import Board from './components/board/Board';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ModalProvider } from './components/ui/ModalProvider';
import './styles/globals.css';

function App() {
  const dispatch = useAppDispatch();
  
  // Board ID - you can change this as needed
  const boardId = '550e8400-e29b-41d4-a716-446655440000';
  
  // Set up real-time subscriptions
  const { board, columns, cards, isSubscribed } = useRealtimeSubscriptions(boardId);
  
  const { loading, error } = useAppSelector((state) => ({
    loading: state.board.loading || state.columns.loading || state.cards.loading,
    error: state.board.error || state.columns.error || state.cards.error,
  }));

  // Debug logging
  console.log('App state:', { board, columns, cards, loading, error, isSubscribed });

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchBoard(boardId));
    dispatch(fetchColumns(boardId));
    dispatch(fetchCards(boardId));
  }, [dispatch, boardId]);

  const handleDragStart = (event: DragStartEvent) => {
    dispatch(startDrag(event.active.id as string));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    dispatch(setDragOverColumn(over?.id as string || null));
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    dispatch(endDrag());
    // TODO: Implement drag end logic for moving cards/columns
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ModalProvider>
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Board 
            board={board}
            columns={columns}
            cards={cards}
            onAddColumn={() => console.log('Add column')}
            onEditColumn={(column) => console.log('Edit column:', column)}
            onDeleteColumn={(columnId) => console.log('Delete column:', columnId)}
            onAddCard={(columnId) => console.log('Add card to column:', columnId)}
            onEditCard={(card) => console.log('Edit card:', card)}
            onDeleteCard={(cardId) => console.log('Delete card:', cardId)}
            onMoveCard={(cardId, newColumnId, newPosition) => console.log('Move card:', cardId, newColumnId, newPosition)}
            onMoveColumn={(columnId, newPosition) => console.log('Move column:', columnId, newPosition)}
          />
        </DndContext>
      </ModalProvider>
    </ErrorBoundary>
  );
}

export default App;
