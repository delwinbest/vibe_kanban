import { useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { useRealtimeSubscriptions } from './hooks/useRealtimeSubscriptions';
import { startDrag, endDrag, setDragOverColumn } from './store/slices/uiSlice';
import { fetchBoard } from './store/slices/boardSlice';
import { fetchColumns, reorderColumns, reorderColumnsInDatabase, createColumn, updateColumn, deleteColumn } from './store/slices/columnSlice';
import { fetchCards, moveCardBetweenColumns, reorderCardsInColumn, updateCard } from './store/slices/cardSlice';
import Board from './components/board/Board';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ModalProvider, useModal } from './components/ui/ModalProvider';
import CardCreateModal from './components/card/CardCreateModal';
import CardDeleteModal from './components/card/CardDeleteModal';
import ColumnCreateModal from './components/column/ColumnCreateModal';
import ColumnEditModal from './components/column/ColumnEditModal';
import ColumnDeleteModal from './components/column/ColumnDeleteModal';
import { debugLog } from './utils/debug';
import './styles/globals.css';

function AppContent() {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();
  
  // Board ID - you can change this as needed
  const boardId = '550e8400-e29b-41d4-a716-446655440000';
  
  // Set up real-time subscriptions
  const { board, columns, cards, isSubscribed } = useRealtimeSubscriptions(boardId);
  
  const { loading, error } = useAppSelector((state) => ({
    // Only show loading for initial data fetch, not for card operations
    loading: (state.board.loading && !state.board.board) || 
             (state.columns.loading && state.columns.columns.length === 0) || 
             (state.cards.loading && state.cards.cards.length === 0),
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
    const activeId = event.active.id as string;
    const activeCard = cards.find(card => card.id === activeId);
    const activeColumn = columns.find(column => column.id === activeId);
    
    if (activeCard) {
      debugLog.drag.start(activeId, 'card');
    } else if (activeColumn) {
      debugLog.drag.start(activeId, 'column');
    }
    
    dispatch(startDrag(activeId));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    dispatch(setDragOverColumn(over?.id as string || null));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      dispatch(endDrag());
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active item (card or column)
    const activeCard = cards.find(card => card.id === activeId);
    const activeColumn = columns.find(column => column.id === activeId);

    if (activeCard) {
      // Handle card drag
      const overColumn = columns.find(column => column.id === overId);
      const overCard = cards.find(card => card.id === overId);
      
      if (overColumn) {
        // Card dropped on a column
        if (activeCard.column_id === overColumn.id) {
          // Same column - reorder within column
          const columnCards = cards.filter(card => card.column_id === overColumn.id).sort((a, b) => a.position - b.position);
          const activeIndex = columnCards.findIndex(card => card.id === activeCard.id);
          const newPosition = columnCards.length - 1; // Move to end
          
          if (activeIndex !== newPosition) {
            debugLog.card.reorder(activeCard.id, overColumn.id, activeIndex, newPosition);
            dispatch(reorderCardsInColumn({
              columnId: overColumn.id,
              fromIndex: activeIndex,
              toIndex: newPosition
            }));
          }
        } else {
          // Different column - move between columns
          const newPosition = cards.filter(card => card.column_id === overColumn.id).length;
          debugLog.card.move(activeCard.id, activeCard.column_id, overColumn.id, newPosition);
          dispatch(moveCardBetweenColumns({
            cardId: activeCard.id,
            newColumnId: overColumn.id,
            newPosition
          }));
        }
      } else if (overCard) {
        // Card dropped on another card
        const targetColumnId = overCard.column_id;
        const targetColumnCards = cards.filter(card => card.column_id === targetColumnId).sort((a, b) => a.position - b.position);
        const targetPosition = targetColumnCards.findIndex(card => card.id === overCard.id);
        
        if (activeCard.column_id === targetColumnId) {
          // Same column - reorder within column
          const activeIndex = targetColumnCards.findIndex(card => card.id === activeCard.id);
          if (activeIndex !== targetPosition) {
            debugLog.card.reorder(activeCard.id, targetColumnId, activeIndex, targetPosition);
            dispatch(reorderCardsInColumn({
              columnId: targetColumnId,
              fromIndex: activeIndex,
              toIndex: targetPosition
            }));
          }
        } else {
          // Different column - move between columns
          debugLog.card.move(activeCard.id, activeCard.column_id, targetColumnId, targetPosition);
          dispatch(moveCardBetweenColumns({
            cardId: activeCard.id,
            newColumnId: targetColumnId,
            newPosition: targetPosition
          }));
        }
      }
    } else if (activeColumn) {
      // Handle column drag
      const overColumn = columns.find(column => column.id === overId);
      if (overColumn && activeColumn.id !== overColumn.id) {
        const activeIndex = columns.findIndex(col => col.id === activeColumn.id);
        const overIndex = columns.findIndex(col => col.id === overColumn.id);
        
        // Create new positions array
        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(activeIndex, 1);
        newColumns.splice(overIndex, 0, movedColumn);
        
        // Update positions optimistically
        dispatch(reorderColumns({
          fromIndex: activeIndex,
          toIndex: overIndex
        }));

        // Update positions in database
        const reorderedColumns = newColumns.map((column, index) => ({
          ...column,
          position: index
        }));
        dispatch(reorderColumnsInDatabase(reorderedColumns));
      }
    }

    dispatch(endDrag());
  };

  const handleAddCard = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column) {
      debugLog.modal.open('create-card', { columnId, columnName: column.name });
      openModal(
        <CardCreateModal columnId={columnId} columnName={column.name} />,
        { title: 'Create New Card', size: 'md' }
      );
    }
  };

  const handleEditCard = (card: any) => {
    debugLog.card.edit(card.id, {
      title: card.title,
      description: card.description,
      due_date: card.due_date,
      priority: card.priority,
      status: card.status
    });
    dispatch(updateCard({
      id: card.id,
      title: card.title,
      description: card.description,
      due_date: card.due_date,
      priority: card.priority,
      status: card.status,
      column_id: card.column_id,
      position: card.position,
      assignee_id: card.assignee_id,
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      debugLog.modal.open('delete-card', { cardId, cardTitle: card.title });
      openModal(
        <CardDeleteModal cardId={cardId} cardTitle={card.title} />,
        { title: 'Delete Card', size: 'sm' }
      );
    }
  };

  const handleAddColumn = () => {
    debugLog.modal.open('create-column', { boardId });
    openModal(
      <ColumnCreateModal boardId={boardId} onClose={() => {}} />,
      { title: 'Create New Column', size: 'md' }
    );
  };

  const handleEditColumn = (column: any) => {
    debugLog.modal.open('edit-column', { columnId: column.id, columnName: column.name });
    openModal(
      <ColumnEditModal column={column} onClose={() => {}} />,
      { title: 'Edit Column', size: 'md' }
    );
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (column) {
      debugLog.modal.open('delete-column', { columnId, columnName: column.name });
      openModal(
        <ColumnDeleteModal columnId={columnId} columnName={column.name} onClose={() => {}} />,
        { title: 'Delete Column', size: 'md' }
      );
    }
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
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Board 
        board={board}
        columns={columns}
        cards={cards}
        onAddColumn={handleAddColumn}
        onEditColumn={handleEditColumn}
        onDeleteColumn={handleDeleteColumn}
        onAddCard={handleAddCard}
            onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
        onMoveCard={(cardId, newColumnId, newPosition) => console.log('Move card:', cardId, newColumnId, newPosition)}
        onMoveColumn={(columnId, newPosition) => console.log('Move column:', columnId, newPosition)}
      />
    </DndContext>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </ErrorBoundary>
  );
}

export default App;
