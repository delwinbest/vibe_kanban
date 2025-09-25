import React from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { startDrag, endDrag, setDragOverColumn } from './store/slices/uiSlice';
import Header from './components/ui/Header';
import Board from './components/board/Board';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './styles/globals.css';

function App() {
  const dispatch = useAppDispatch();
  const { board, columns, cards, loading, error } = useAppSelector((state) => ({
    board: state.board.board,
    columns: state.columns.columns,
    cards: state.cards.cards,
    loading: state.board.loading || state.columns.loading || state.cards.loading,
    error: state.board.error || state.columns.error || state.cards.error,
  }));

  const handleDragStart = (event: DragStartEvent) => {
    dispatch(startDrag(event.active.id as string));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    dispatch(setDragOverColumn(over?.id as string || null));
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
      <div className="kanban-board min-h-screen">
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Header board={board} />
          <main className="container mx-auto px-4 py-8">
            <SortableContext items={columns.map(col => col.id)} strategy={verticalListSortingStrategy}>
              <Board 
                board={board}
                columns={columns}
                cards={cards}
              />
            </SortableContext>
          </main>
        </DndContext>
      </div>
    </ErrorBoundary>
  );
}

export default App;
