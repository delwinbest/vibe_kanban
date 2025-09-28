import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Card, CreateCardRequest, UpdateCardRequest } from '../../types';
import { supabase, TABLES, handleSupabaseError, subscribeToCards, subscriptionManager } from '../../services/supabase';

// Initial state
interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
  isSubscribed: boolean;
}

const initialState: CardState = {
  cards: [],
  loading: false,
  error: null,
  isSubscribed: false,
};

// Helper function to transform database response to frontend format
const transformCard = (dbCard: any) => ({
  id: dbCard.id,
  columnId: dbCard.column_id,
  title: dbCard.title,
  description: dbCard.description,
  dueDate: dbCard.due_date,
  priority: dbCard.priority,
  position: dbCard.position,
  createdAt: dbCard.created_at,
  updatedAt: dbCard.updated_at,
});

// Async thunks
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (boardId: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CARDS)
        .select(`
          *,
          column:columns!inner(board_id)
        `)
        .eq('column.board_id', boardId)
        .order('position');

      if (error) throw error;
      
      // Transform the data to match frontend interface
      const transformedData = data?.map(transformCard) || [];
      return transformedData;
    } catch (error) {
      throw new Error(handleSupabaseError(error).error);
    }
  }
);

export const createCard = createAsyncThunk(
  'cards/createCard',
  async (request: CreateCardRequest) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CARDS)
        .insert([{
          column_id: request.columnId,
          title: request.title,
          description: request.description,
          due_date: request.dueDate,
          priority: request.priority || 'medium',
          position: 0, // Will be updated based on existing cards
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
);

export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async (request: UpdateCardRequest) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CARDS)
        .update({
          ...(request.title && { title: request.title }),
          ...(request.description !== undefined && { description: request.description }),
          ...(request.dueDate !== undefined && { due_date: request.dueDate }),
          ...(request.priority && { priority: request.priority }),
          ...(request.columnId && { column_id: request.columnId }),
          ...(request.position !== undefined && { position: request.position }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
);

export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (cardId: string) => {
    try {
      const { error } = await supabase
        .from(TABLES.CARDS)
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      return cardId;
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
);

export const moveCard = createAsyncThunk(
  'cards/moveCard',
  async ({ cardId, newColumnId, newPosition }: { cardId: string; newColumnId: string; newPosition: number }) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CARDS)
        .update({
          column_id: newColumnId,
          position: newPosition,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
);

// Real-time subscription actions
export const subscribeToCardChanges = createAsyncThunk(
  'cards/subscribeToCardChanges',
  async (boardId: string, { dispatch }) => {
    const subscription = subscribeToCards(boardId, (payload) => {
      console.log('Card change received:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          dispatch(addCard(transformCard(payload.new)));
          break;
        case 'UPDATE':
          dispatch(updateCardInState(transformCard(payload.new)));
          break;
        case 'DELETE':
          dispatch(removeCard(payload.old.id));
          break;
        default:
          break;
      }
    });

    subscriptionManager.subscribe(`cards_${boardId}`, subscription);
    return true;
  }
);

export const unsubscribeFromCardChanges = createAsyncThunk(
  'cards/unsubscribeFromCardChanges',
  async (boardId: string) => {
    subscriptionManager.unsubscribe(`cards_${boardId}`);
    return true;
  }
);

// Slice
const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reorderCardsInColumn: (state, action: PayloadAction<{ columnId: string; fromIndex: number; toIndex: number }>) => {
      const { columnId, fromIndex, toIndex } = action.payload;
      const columnCards = [...state.cards.filter(card => card.columnId === columnId)];
      const otherCards = state.cards.filter(card => card.columnId !== columnId);
      
      const [movedCard] = columnCards.splice(fromIndex, 1);
      columnCards.splice(toIndex, 0, movedCard);
      
      // Update positions
      const updatedColumnCards = columnCards.map((card, index) => ({
        ...card,
        position: index
      }));
      
      state.cards = [...otherCards, ...updatedColumnCards];
    },
    moveCardBetweenColumns: (state, action: PayloadAction<{ cardId: string; newColumnId: string; newPosition: number }>) => {
      const { cardId, newColumnId, newPosition } = action.payload;
      const cardIndex = state.cards.findIndex(card => card.id === cardId);
      
      if (cardIndex !== -1) {
        state.cards[cardIndex] = {
          ...state.cards[cardIndex],
          columnId: newColumnId,
          position: newPosition
        };
      }
    },
    addCard: (state, action: PayloadAction<Card>) => {
      state.cards.push(action.payload);
    },
    updateCardInState: (state, action: PayloadAction<Card>) => {
      const index = state.cards.findIndex(card => card.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    removeCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter(card => card.id !== action.payload);
    },
    setSubscribed: (state, action: PayloadAction<boolean>) => {
      state.isSubscribed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cards
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cards';
      })
      // Create card
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !action.payload.error) {
          state.cards.push(action.payload);
        } else {
          state.error = action.payload?.error || 'Failed to create card';
        }
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create card';
      })
      // Update card
      .addCase(updateCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !action.payload.error) {
          const index = state.cards.findIndex(card => card.id === action.payload.id);
          if (index !== -1) {
            state.cards[index] = action.payload;
          }
        } else {
          state.error = action.payload?.error || 'Failed to update card';
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update card';
      })
      // Delete card
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = state.cards.filter(card => card.id !== action.payload);
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete card';
      })
      // Move card
      .addCase(moveCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !action.payload.error) {
          const index = state.cards.findIndex(card => card.id === action.payload.id);
          if (index !== -1) {
            state.cards[index] = action.payload;
          }
        } else {
          state.error = action.payload?.error || 'Failed to move card';
        }
      })
      .addCase(moveCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to move card';
      })
      // Subscribe to card changes
      .addCase(subscribeToCardChanges.fulfilled, (state) => {
        state.isSubscribed = true;
      })
      .addCase(subscribeToCardChanges.rejected, (state) => {
        state.isSubscribed = false;
        state.error = 'Failed to subscribe to card changes';
      })
      // Unsubscribe from card changes
      .addCase(unsubscribeFromCardChanges.fulfilled, (state) => {
        state.isSubscribed = false;
      });
  },
});

export const { clearError, reorderCardsInColumn, moveCardBetweenColumns, addCard, updateCardInState, removeCard, setSubscribed } = cardSlice.actions;
export default cardSlice.reducer;
