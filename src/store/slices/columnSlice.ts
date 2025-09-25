import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Board, CreateColumnRequest, UpdateColumnRequest } from '../../types';
import { supabase, TABLES, handleSupabaseError } from '../../services/supabase';

// Initial state
interface ColumnState {
  columns: Column[];
  loading: boolean;
  error: string | null;
}

const initialState: ColumnState = {
  columns: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchColumns = createAsyncThunk(
  'columns/fetchColumns',
  async (boardId: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.COLUMNS)
        .select('*')
        .eq('board_id', boardId)
        .order('position');

      if (error) throw error;
      return data;
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
);

export const createColumn = createAsyncThunk(
  'columns/createColumn',
  async (request: CreateColumnRequest) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.COLUMNS)
        .insert([{
          board_id: request.boardId,
          name: request.name,
          position: request.position,
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

export const updateColumn = createAsyncThunk(
  'columns/updateColumn',
  async (request: UpdateColumnRequest) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.COLUMNS)
        .update({
          ...(request.name && { name: request.name }),
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

export const deleteColumn = createAsyncThunk(
  'columns/deleteColumn',
  async (columnId: string) => {
    try {
      const { error } = await supabase
        .from(TABLES.COLUMNS)
        .delete()
        .eq('id', columnId);

      if (error) throw error;
      return columnId;
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
);

// Slice
const columnSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reorderColumns: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const columns = [...state.columns];
      const [movedColumn] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, movedColumn);
      
      // Update positions
      columns.forEach((column, index) => {
        column.position = index;
      });
      
      state.columns = columns;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch columns
      .addCase(fetchColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.columns = action.payload;
        } else {
          state.error = action.payload.error || 'Failed to fetch columns';
        }
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch columns';
      })
      // Create column
      .addCase(createColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !action.payload.error) {
          state.columns.push(action.payload);
        } else {
          state.error = action.payload?.error || 'Failed to create column';
        }
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create column';
      })
      // Update column
      .addCase(updateColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !action.payload.error) {
          const index = state.columns.findIndex(col => col.id === action.payload.id);
          if (index !== -1) {
            state.columns[index] = action.payload;
          }
        } else {
          state.error = action.payload?.error || 'Failed to update column';
        }
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update column';
      })
      // Delete column
      .addCase(deleteColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = state.columns.filter(col => col.id !== action.payload);
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete column';
      });
  },
});

export const { clearError, reorderColumns } = columnSlice.actions;
export default columnSlice.reducer;
