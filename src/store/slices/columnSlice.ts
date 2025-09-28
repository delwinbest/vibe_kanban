import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Column, CreateColumnRequest, UpdateColumnRequest } from '../../types';
import { supabase, TABLES, handleSupabaseError, subscribeToColumns, subscriptionManager } from '../../services/supabase';

// Initial state
interface ColumnState {
  columns: Column[];
  loading: boolean;
  error: string | null;
  isSubscribed: boolean;
}

const initialState: ColumnState = {
  columns: [],
  loading: false,
  error: null,
  isSubscribed: false,
};

// Helper function to transform database response to frontend format
const transformColumn = (dbColumn: any) => ({
  id: dbColumn.id,
  board_id: dbColumn.board_id,
  name: dbColumn.name,
  position: dbColumn.position,
  created_at: dbColumn.created_at,
  updated_at: dbColumn.updated_at,
});

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
      
      // Transform the data to match frontend interface
      const transformedData = data?.map(transformColumn) || [];
      return transformedData;
    } catch (error) {
      throw new Error(handleSupabaseError(error).error);
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
          board_id: request.board_id,
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

// Real-time subscription actions
export const subscribeToColumnChanges = createAsyncThunk(
  'columns/subscribeToColumnChanges',
  async (boardId: string, { dispatch }) => {
    const subscription = subscribeToColumns(boardId, (payload) => {
      console.log('Column change received:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          dispatch(addColumn(transformColumn(payload.new)));
          break;
        case 'UPDATE':
          dispatch(updateColumnInState(transformColumn(payload.new)));
          break;
        case 'DELETE':
          dispatch(removeColumn(payload.old.id));
          break;
        default:
          break;
      }
    });

    subscriptionManager.subscribe(`columns_${boardId}`, subscription);
    return true;
  }
);

export const unsubscribeFromColumnChanges = createAsyncThunk(
  'columns/unsubscribeFromColumnChanges',
  async (boardId: string) => {
    subscriptionManager.unsubscribe(`columns_${boardId}`);
    return true;
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
      const updatedColumns = columns.map((column, index) => ({
        ...column,
        position: index
      }));
      
      state.columns = updatedColumns;
    },
    addColumn: (state, action: PayloadAction<Column>) => {
      state.columns.push(action.payload);
    },
    updateColumnInState: (state, action: PayloadAction<Column>) => {
      const index = state.columns.findIndex(col => col.id === action.payload.id);
      if (index !== -1) {
        state.columns[index] = action.payload;
      }
    },
    removeColumn: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(col => col.id !== action.payload);
    },
    setSubscribed: (state, action: PayloadAction<boolean>) => {
      state.isSubscribed = action.payload;
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
        state.columns = action.payload.map(transformColumn);
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
          const index = state.columns.findIndex((col: Column) => col.id === action.payload.id);
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
        state.columns = state.columns.filter((col: Column) => col.id !== action.payload);
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete column';
      })
      // Subscribe to column changes
      .addCase(subscribeToColumnChanges.fulfilled, (state) => {
        state.isSubscribed = true;
      })
      .addCase(subscribeToColumnChanges.rejected, (state) => {
        state.isSubscribed = false;
        state.error = 'Failed to subscribe to column changes';
      })
      // Unsubscribe from column changes
      .addCase(unsubscribeFromColumnChanges.fulfilled, (state) => {
        state.isSubscribed = false;
      });
  },
});

export const { clearError, reorderColumns, addColumn, updateColumnInState, removeColumn, setSubscribed } = columnSlice.actions;
export default columnSlice.reducer;
