import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Card, CreateCardRequest, UpdateCardRequest } from '../../types';
import { supabase, TABLES, handleSupabaseError } from '../../services/supabase';

// Initial state
interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

const initialState: CardState = {
  cards: [],
  loading: false,
  error: null,
};

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
      return data;
    } catch (error) {
      return handleSupabaseError(error);
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
      const columnCards = state.cards.filter(card => card.columnId === columnId);
      const otherCards = state.cards.filter(card => card.columnId !== columnId);
      
      const [movedCard] = columnCards.splice(fromIndex, 1);
      columnCards.splice(toIndex, 0, movedCard);
      
      // Update positions
      columnCards.forEach((card, index) => {
        card.position = index;
      });
      
      state.cards = [...otherCards, ...columnCards];
    },
    moveCardBetweenColumns: (state, action: PayloadAction<{ cardId: string; newColumnId: string; newPosition: number }>) => {
      const { cardId, newColumnId, newPosition } = action.payload;
      const cardIndex = state.cards.findIndex(card => card.id === cardId);
      
      if (cardIndex !== -1) {
        state.cards[cardIndex].columnId = newColumnId;
        state.cards[cardIndex].position = newPosition;
      }
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
        if (Array.isArray(action.payload)) {
          state.cards = action.payload;
        } else {
          state.error = action.payload.error || 'Failed to fetch cards';
        }
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
      });
  },
});

export const { clearError, reorderCardsInColumn, moveCardBetweenColumns } = cardSlice.actions;
export default cardSlice.reducer;
