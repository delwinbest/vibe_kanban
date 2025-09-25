import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Board } from '../../types';
import { supabase, TABLES, handleSupabaseError } from '../../services/supabase';

// Initial state
interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  board: null,
  loading: false,
  error: null,
};

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
      return data;
    } catch (error) {
      return handleSupabaseError(error);
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
        if (action.payload && !action.payload.error) {
          state.board = action.payload;
        } else {
          state.error = action.payload?.error || 'Failed to fetch board';
        }
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
      });
  },
});

export const { clearError, setBoard, clearBoard } = boardSlice.actions;
export default boardSlice.reducer;
