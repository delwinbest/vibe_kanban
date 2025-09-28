import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './slices/boardSlice';
import columnReducer from './slices/columnSlice';
import cardReducer from './slices/cardSlice';
import labelReducer from './slices/labelSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    columns: columnReducer,
    cards: cardReducer,
    labels: labelReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
