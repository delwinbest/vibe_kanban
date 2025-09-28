import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

export interface Label {
  id: string;
  name: string;
  color: string;
  board_id: string;
  created_at: string;
  updated_at: string;
}

export interface CardLabel {
  id: string;
  card_id: string;
  label_id: string;
  created_at: string;
}

interface LabelState {
  labels: Label[];
  cardLabels: CardLabel[];
  loading: boolean;
  error: string | null;
  isSubscribed: boolean;
}

const initialState: LabelState = {
  labels: [],
  cardLabels: [],
  loading: false,
  error: null,
  isSubscribed: false,
};

// Async thunks for API calls
export const fetchLabels = createAsyncThunk(
  'labels/fetchLabels',
  async (boardId: string) => {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('board_id', boardId)
      .order('name');

    if (error) throw error;
    return data as Label[];
  }
);

export const fetchCardLabels = createAsyncThunk(
  'labels/fetchCardLabels',
  async (boardId: string) => {
    const { data, error } = await supabase
      .from('card_labels')
      .select(`
        *,
        labels!inner(board_id)
      `)
      .eq('labels.board_id', boardId);

    if (error) throw error;
    return data as CardLabel[];
  }
);

export const createLabel = createAsyncThunk(
  'labels/createLabel',
  async (label: Omit<Label, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('labels')
      .insert([label])
      .select()
      .single();

    if (error) throw error;
    return data as Label;
  }
);

export const updateLabel = createAsyncThunk(
  'labels/updateLabel',
  async ({ id, updates }: { id: string; updates: Partial<Label> }) => {
    const { data, error } = await supabase
      .from('labels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Label;
  }
);

export const deleteLabel = createAsyncThunk(
  'labels/deleteLabel',
  async (id: string) => {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  }
);

export const assignLabelToCard = createAsyncThunk(
  'labels/assignLabelToCard',
  async ({ cardId, labelId }: { cardId: string; labelId: string }) => {
    const { data, error } = await supabase
      .from('card_labels')
      .insert([{ card_id: cardId, label_id: labelId }])
      .select()
      .single();

    if (error) throw error;
    return data as CardLabel;
  }
);

export const removeLabelFromCard = createAsyncThunk(
  'labels/removeLabelFromCard',
  async ({ cardId, labelId }: { cardId: string; labelId: string }) => {
    const { error } = await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', cardId)
      .eq('label_id', labelId);

    if (error) throw error;
    return { cardId, labelId };
  }
);

// Real-time subscription thunks
export const subscribeToLabelChanges = createAsyncThunk(
  'labels/subscribeToLabelChanges',
  async (boardId: string, { dispatch }) => {
    const subscription = supabase
      .channel('labels_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'labels',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log('Label change received:', payload);
          if (payload.eventType === 'INSERT') {
            dispatch(addLabel(payload.new as Label));
          } else if (payload.eventType === 'UPDATE') {
            dispatch(updateLabelInState(payload.new as Label));
          } else if (payload.eventType === 'DELETE') {
            dispatch(removeLabel(payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_labels',
        },
        (payload) => {
          console.log('Card label change received:', payload);
          if (payload.eventType === 'INSERT') {
            dispatch(addCardLabel(payload.new as CardLabel));
          } else if (payload.eventType === 'DELETE') {
            dispatch(removeCardLabel(payload.old.id));
          }
        }
      )
      .subscribe();

    return subscription;
  }
);

export const unsubscribeFromLabelChanges = createAsyncThunk(
  'labels/unsubscribeFromLabelChanges',
  async (_, { getState }) => {
    const state = getState() as any;
    const subscription = state.labels.subscription;
    if (subscription) {
      await supabase.removeChannel(subscription);
    }
  }
);

const labelSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {
    // Optimistic updates
    addLabel: (state, action: PayloadAction<Label>) => {
      state.labels.push(action.payload);
    },
    updateLabelInState: (state, action: PayloadAction<Label>) => {
      const index = state.labels.findIndex(label => label.id === action.payload.id);
      if (index !== -1) {
        state.labels[index] = action.payload;
      }
    },
    removeLabel: (state, action: PayloadAction<string>) => {
      state.labels = state.labels.filter(label => label.id !== action.payload);
      // Also remove all card labels for this label
      state.cardLabels = state.cardLabels.filter(
        cardLabel => !state.labels.find(label => label.id === cardLabel.label_id)
      );
    },
    addCardLabel: (state, action: PayloadAction<CardLabel>) => {
      state.cardLabels.push(action.payload);
    },
    removeCardLabel: (state, action: PayloadAction<string>) => {
      state.cardLabels = state.cardLabels.filter(cardLabel => cardLabel.id !== action.payload);
    },
    setSubscribed: (state, action: PayloadAction<boolean>) => {
      state.isSubscribed = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for label assignment
    optimisticAssignLabel: (state, action: PayloadAction<{ cardId: string; labelId: string }>) => {
      const { cardId, labelId } = action.payload;
      const existing = state.cardLabels.find(
        cl => cl.card_id === cardId && cl.label_id === labelId
      );
      if (!existing) {
        const tempCardLabel: CardLabel = {
          id: `temp-${Date.now()}`,
          card_id: cardId,
          label_id: labelId,
          created_at: new Date().toISOString(),
        };
        state.cardLabels.push(tempCardLabel);
      }
    },
    // Optimistic update for label removal
    optimisticRemoveLabel: (state, action: PayloadAction<{ cardId: string; labelId: string }>) => {
      const { cardId, labelId } = action.payload;
      state.cardLabels = state.cardLabels.filter(
        cl => !(cl.card_id === cardId && cl.label_id === labelId)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch labels
      .addCase(fetchLabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.labels = action.payload;
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch labels';
      })
      // Fetch card labels
      .addCase(fetchCardLabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.cardLabels = action.payload;
      })
      .addCase(fetchCardLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch card labels';
      })
      // Create label
      .addCase(createLabel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLabel.fulfilled, (state, action) => {
        state.loading = false;
        state.labels.push(action.payload);
      })
      .addCase(createLabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create label';
      })
      // Update label
      .addCase(updateLabel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLabel.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.labels.findIndex(label => label.id === action.payload.id);
        if (index !== -1) {
          state.labels[index] = action.payload;
        }
      })
      .addCase(updateLabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update label';
      })
      // Delete label
      .addCase(deleteLabel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLabel.fulfilled, (state, action) => {
        state.loading = false;
        state.labels = state.labels.filter(label => label.id !== action.payload);
        // Also remove all card labels for this label
        state.cardLabels = state.cardLabels.filter(
          cardLabel => !state.labels.find(label => label.id === cardLabel.label_id)
        );
      })
      .addCase(deleteLabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete label';
      })
      // Assign label to card
      .addCase(assignLabelToCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignLabelToCard.fulfilled, (state, action) => {
        state.loading = false;
        // Remove temporary card label if it exists
        state.cardLabels = state.cardLabels.filter(
          cl => !(cl.card_id === action.payload.card_id && cl.label_id === action.payload.label_id && cl.id.startsWith('temp-'))
        );
        state.cardLabels.push(action.payload);
      })
      .addCase(assignLabelToCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to assign label to card';
      })
      // Remove label from card
      .addCase(removeLabelFromCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeLabelFromCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cardLabels = state.cardLabels.filter(
          cl => !(cl.card_id === action.payload.cardId && cl.label_id === action.payload.labelId)
        );
      })
      .addCase(removeLabelFromCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove label from card';
      })
      // Subscription management
      .addCase(subscribeToLabelChanges.fulfilled, (state) => {
        state.isSubscribed = true;
      })
      .addCase(unsubscribeFromLabelChanges.fulfilled, (state) => {
        state.isSubscribed = false;
      });
  },
});

export const {
  addLabel,
  updateLabelInState,
  removeLabel,
  addCardLabel,
  removeCardLabel,
  setSubscribed,
  clearError,
  optimisticAssignLabel,
  optimisticRemoveLabel,
} = labelSlice.actions;

export default labelSlice.reducer;
