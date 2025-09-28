import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Board } from '../../types';
import { supabase, TABLES, handleSupabaseError, subscribeToBoards, subscriptionManager } from '../../services/supabase';

// Initial state
interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;
  isSubscribed: boolean;
}

const initialState: BoardState = {
  board: null,
  loading: false,
  error: null,
  isSubscribed: false,
};

// Helper function to transform database response to frontend format
const transformBoard = (dbBoard: any) => ({
  id: dbBoard.id,
  name: dbBoard.name,
  created_at: dbBoard.created_at,
  updated_at: dbBoard.updated_at,
});

// Async thunks
export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (boardId: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOARDS)
        .select('*')
        .eq('id', boardId)
        .single();

      if (error) throw error;
      
      // Transform the data to match frontend interface
      return transformBoard(data);
    } catch (error) {
      throw new Error(handleSupabaseError(error).error);
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (name: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOARDS)
        .insert([{
          name,
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

export const updateBoard = createAsyncThunk(
  'board/updateBoard',
  async ({ id, name }: { id: string; name: string }) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.BOARDS)
        .update({
          name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
export const subscribeToBoardChanges = createAsyncThunk(
  'board/subscribeToBoardChanges',
  async (boardId: string, { dispatch }) => {
    const subscription = subscribeToBoards((payload) => {
      console.log('Board change received:', payload);
      
      switch (payload.eventType) {
        case 'UPDATE':
          if (payload.new.id === boardId) {
            dispatch(setBoard(transformBoard(payload.new)));
          }
          break;
        case 'DELETE':
          if (payload.old.id === boardId) {
            dispatch(clearBoard());
          }
          break;
        default:
          break;
      }
    });

    subscriptionManager.subscribe(`board_${boardId}`, subscription);
    return true;
  }
);

export const unsubscribeFromBoardChanges = createAsyncThunk(
  'board/unsubscribeFromBoardChanges',
  async (boardId: string) => {
    subscriptionManager.unsubscribe(`board_${boardId}`);
    return true;
  }
);

// Slice
const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setBoard: (state, action: PayloadAction<Board>) => {
      state.board = action.payload;
    },
    clearBoard: (state) => {
      state.board = null;
    },
    setSubscribed: (state, action: PayloadAction<boolean>) => {
      state.isSubscribed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch board
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.board = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      })
      // Create board
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !action.payload.error) {
          state.board = action.payload;
        } else {
          state.error = action.payload?.error || 'Failed to create board';
        }
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create board';
      })
      // Update board
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !action.payload.error) {
          state.board = action.payload;
        } else {
          state.error = action.payload?.error || 'Failed to update board';
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update board';
      })
      // Subscribe to board changes
      .addCase(subscribeToBoardChanges.fulfilled, (state) => {
        state.isSubscribed = true;
      })
      .addCase(subscribeToBoardChanges.rejected, (state) => {
        state.isSubscribed = false;
        state.error = 'Failed to subscribe to board changes';
      })
      // Unsubscribe from board changes
      .addCase(unsubscribeFromBoardChanges.fulfilled, (state) => {
        state.isSubscribed = false;
      });
  },
});

export const { clearError, setBoard, clearBoard, setSubscribed } = boardSlice.actions;
export default boardSlice.reducer;
