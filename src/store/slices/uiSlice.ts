import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI State types
interface UIState {
  // Modal states
  isCardModalOpen: boolean;
  isColumnModalOpen: boolean;
  isDeleteConfirmModalOpen: boolean;
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
  
  // Selected items
  selectedCard: string | null;
  selectedColumn: string | null;
  
  // Drag and drop states
  draggedItem: string | null;
  dragOverColumn: string | null;
  
  // Loading states
  isDragging: boolean;
  isReordering: boolean;
  
  // Error states
  error: string | null;
  
  // Theme
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  isCardModalOpen: false,
  isColumnModalOpen: false,
  isDeleteConfirmModalOpen: false,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  selectedCard: null,
  selectedColumn: null,
  draggedItem: null,
  dragOverColumn: null,
  isDragging: false,
  isReordering: false,
  error: null,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openCardModal: (state, action: PayloadAction<string>) => {
      state.isCardModalOpen = true;
      state.selectedCard = action.payload;
    },
    closeCardModal: (state) => {
      state.isCardModalOpen = false;
      state.selectedCard = null;
    },
    openColumnModal: (state, action: PayloadAction<string>) => {
      state.isColumnModalOpen = true;
      state.selectedColumn = action.payload;
    },
    closeColumnModal: (state) => {
      state.isColumnModalOpen = false;
      state.selectedColumn = null;
    },
    openDeleteConfirmModal: (state, action: PayloadAction<{ type: 'card' | 'column'; id: string }>) => {
      state.isDeleteConfirmModalOpen = true;
      if (action.payload.type === 'card') {
        state.selectedCard = action.payload.id;
      } else {
        state.selectedColumn = action.payload.id;
      }
    },
    closeDeleteConfirmModal: (state) => {
      state.isDeleteConfirmModalOpen = false;
      state.selectedCard = null;
      state.selectedColumn = null;
    },
    
    // Drag and drop actions
    startDrag: (state, action: PayloadAction<string>) => {
      state.draggedItem = action.payload;
      state.isDragging = true;
    },
    endDrag: (state) => {
      state.draggedItem = null;
      state.dragOverColumn = null;
      state.isDragging = false;
    },
    setDragOverColumn: (state, action: PayloadAction<string | null>) => {
      state.dragOverColumn = action.payload;
    },
    
    // Loading states
    setReordering: (state, action: PayloadAction<boolean>) => {
      state.isReordering = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Reset all UI state
    resetUI: () => initialState,
  },
});

export const {
  openCardModal,
  closeCardModal,
  openColumnModal,
  closeColumnModal,
  openDeleteConfirmModal,
  closeDeleteConfirmModal,
  startDrag,
  endDrag,
  setDragOverColumn,
  setReordering,
  setError,
  clearError,
  setTheme,
  toggleTheme,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
