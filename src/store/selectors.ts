import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Card, Label, CardLabel } from '../types';

// Basic selectors
export const selectBoard = (state: RootState) => state.board.board;
export const selectColumns = (state: RootState) => state.columns.columns;
export const selectCards = (state: RootState) => state.cards.cards;
export const selectLabels = (state: RootState) => state.labels.labels;
export const selectCardLabels = (state: RootState) => state.labels.cardLabels;
export const selectUI = (state: RootState) => state.ui;

// Loading states
export const selectBoardLoading = (state: RootState) => state.board.loading;
export const selectColumnsLoading = (state: RootState) => state.columns.loading;
export const selectCardsLoading = (state: RootState) => state.cards.loading;
export const selectLabelsLoading = (state: RootState) => state.labels.loading;

// Error states
export const selectBoardError = (state: RootState) => state.board.error;
export const selectColumnsError = (state: RootState) => state.columns.error;
export const selectCardsError = (state: RootState) => state.cards.error;
export const selectLabelsError = (state: RootState) => state.labels.error;

// Subscription states
export const selectBoardSubscribed = (state: RootState) => state.board.isSubscribed;
export const selectColumnsSubscribed = (state: RootState) => state.columns.isSubscribed;
export const selectCardsSubscribed = (state: RootState) => state.cards.isSubscribed;
export const selectLabelsSubscribed = (state: RootState) => state.labels.isSubscribed;

// Derived selectors
export const selectColumnsSorted = createSelector(
  [selectColumns],
  (columns) => [...columns].sort((a, b) => a.position - b.position)
);

export const selectCardsByColumn = createSelector(
  [selectCards],
  (cards) => {
    const cardsByColumn: Record<string, Card[]> = {};
    cards.forEach(card => {
      if (!cardsByColumn[card.column_id]) {
        cardsByColumn[card.column_id] = [];
      }
      cardsByColumn[card.column_id].push(card);
    });
    
    // Sort cards within each column by position
    Object.keys(cardsByColumn).forEach(columnId => {
      cardsByColumn[columnId].sort((a, b) => a.position - b.position);
    });
    
    return cardsByColumn;
  }
);

export const selectCardsSorted = createSelector(
  [selectCards],
  (cards) => [...cards].sort((a, b) => a.position - b.position)
);

export const selectLabelsByBoard = createSelector(
  [selectLabels, selectBoard],
  (labels, board) => {
    if (!board) return [];
    return labels.filter(label => label.board_id === board.id);
  }
);

export const selectCardLabelsByCard = createSelector(
  [selectCardLabels],
  (cardLabels) => {
    const cardLabelsByCard: Record<string, CardLabel[]> = {};
    cardLabels.forEach(cardLabel => {
      if (!cardLabelsByCard[cardLabel.card_id]) {
        cardLabelsByCard[cardLabel.card_id] = [];
      }
      cardLabelsByCard[cardLabel.card_id].push(cardLabel);
    });
    return cardLabelsByCard;
  }
);

export const selectLabelsForCard = createSelector(
  [selectLabels, selectCardLabelsByCard],
  (labels, cardLabelsByCard) => (cardId: string) => {
    const cardLabels = cardLabelsByCard[cardId] || [];
    return cardLabels.map(cardLabel => 
      labels.find(label => label.id === cardLabel.label_id)
    ).filter(Boolean) as Label[];
  }
);

export const selectColumnWithCards = createSelector(
  [selectColumnsSorted, selectCardsByColumn],
  (columns, cardsByColumn) => (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return null;
    
    return {
      ...column,
      cards: cardsByColumn[columnId] || []
    };
  }
);

export const selectBoardWithColumnsAndCards = createSelector(
  [selectBoard, selectColumnsSorted, selectCardsByColumn],
  (board, columns, cardsByColumn) => {
    if (!board) return null;
    
    return {
      ...board,
      columns: columns.map(column => ({
        ...column,
        cards: cardsByColumn[column.id] || []
      }))
    };
  }
);

export const selectCardWithLabels = createSelector(
  [selectCards, selectLabelsForCard],
  (cards, getLabelsForCard) => (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return null;
    
    return {
      ...card,
      labels: getLabelsForCard(cardId)
    };
  }
);

// Statistics selectors
export const selectBoardStats = createSelector(
  [selectBoard, selectColumns, selectCards],
  (board, columns, cards) => {
    if (!board) return null;
    
    const totalCards = cards.length;
    const totalColumns = columns.length;
    const completedCards = cards.filter(card => card.status === 'completed').length;
    const inProgressCards = cards.filter(card => 
      ['started', 'ongoing', 'in_progress'].includes(card.status)
    ).length;
    
    return {
      totalCards,
      totalColumns,
      completedCards,
      inProgressCards,
      completionRate: totalCards > 0 ? (completedCards / totalCards) * 100 : 0
    };
  }
);

export const selectColumnStats = createSelector(
  [selectColumns, selectCards],
  (columns, cards) => (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return null;
    
    const columnCards = cards.filter(card => card.column_id === columnId);
    const completedCards = columnCards.filter(card => card.status === 'completed').length;
    
    return {
      totalCards: columnCards.length,
      completedCards,
      completionRate: columnCards.length > 0 ? (completedCards / columnCards.length) * 100 : 0
    };
  }
);

// Priority and status selectors
export const selectCardsByPriority = createSelector(
  [selectCards],
  (cards) => {
    const cardsByPriority: Record<string, Card[]> = {
      'P1': [],
      'P2': [],
      'P3': [],
      'unassigned': []
    };
    
    cards.forEach(card => {
      const priority = card.priority || 'unassigned';
      if (cardsByPriority[priority]) {
        cardsByPriority[priority].push(card);
      } else {
        cardsByPriority.unassigned.push(card);
      }
    });
    
    return cardsByPriority;
  }
);

export const selectCardsByStatus = createSelector(
  [selectCards],
  (cards) => {
    const cardsByStatus: Record<string, Card[]> = {
      'not_started': [],
      'started': [],
      'ongoing': [],
      'in_progress': [],
      'completed': []
    };
    
    cards.forEach(card => {
      const status = card.status || 'not_started';
      if (cardsByStatus[status]) {
        cardsByStatus[status].push(card);
      } else {
        cardsByStatus.not_started.push(card);
      }
    });
    
    return cardsByStatus;
  }
);

// Search and filter selectors
export const selectFilteredCards = createSelector(
  [selectCards, selectLabelsForCard],
  (cards, getLabelsForCard) => (filters: {
    search?: string;
    priority?: string;
    status?: string;
    labels?: string[];
    assignee?: string;
  }) => {
    let filteredCards = [...cards];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCards = filteredCards.filter(card =>
        card.title.toLowerCase().includes(searchLower) ||
        (card.description && card.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.priority) {
      filteredCards = filteredCards.filter(card => card.priority === filters.priority);
    }
    
    if (filters.status) {
      filteredCards = filteredCards.filter(card => card.status === filters.status);
    }
    
    if (filters.labels && filters.labels.length > 0) {
      filteredCards = filteredCards.filter(card => {
        const cardLabels = getLabelsForCard(card.id);
        return filters.labels!.some(labelId => 
          cardLabels.some(label => label.id === labelId)
        );
      });
    }
    
    if (filters.assignee) {
      filteredCards = filteredCards.filter(card => card.assignee_id === filters.assignee);
    }
    
    return filteredCards;
  }
);

// UI state selectors
export const selectDragState = createSelector(
  [selectUI],
  (ui) => ({
    isDragging: ui.isDragging,
    draggedItem: ui.draggedItem,
    dragOverColumn: ui.dragOverColumn
  })
);

export const selectModalState = createSelector(
  [selectUI],
  (ui) => ({
    isOpen: ui.modal.isOpen,
    type: ui.modal.type,
    data: ui.modal.data
  })
);

// Combined loading state
export const selectIsLoading = createSelector(
  [selectBoardLoading, selectColumnsLoading, selectCardsLoading, selectLabelsLoading],
  (boardLoading, columnsLoading, cardsLoading, labelsLoading) =>
    boardLoading || columnsLoading || cardsLoading || labelsLoading
);

// Combined error state
export const selectHasError = createSelector(
  [selectBoardError, selectColumnsError, selectCardsError, selectLabelsError],
  (boardError, columnsError, cardsError, labelsError) =>
    !!(boardError || columnsError || cardsError || labelsError)
);

// Combined subscription state
export const selectIsSubscribed = createSelector(
  [selectBoardSubscribed, selectColumnsSubscribed, selectCardsSubscribed, selectLabelsSubscribed],
  (boardSubscribed, columnsSubscribed, cardsSubscribed, labelsSubscribed) =>
    boardSubscribed && columnsSubscribed && cardsSubscribed && labelsSubscribed
);
